// src/hooks/useDualRole.js
// Logica centrale per la gestione del doppio ruolo collaboratore/leader

import { useState, useEffect, useCallback } from "react";
import {
  doc, setDoc, getDoc, collection,
  query, where, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

// ── Genera un codice invito dal nome ──────────────────────────
function generateInviteCode(name) {
  const prefix = (name || "USR").split(" ")[0].substring(0, 4).toUpperCase();
  const rand   = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${rand}`;
}

export function useDualRole() {
  const { userProfile, updateProfile } = useAuth();

  // "collaboratore" | "leader" — vista attiva
  const [activeView, setActiveView] = useState("collaboratore");
  const [teamMembers, setTeamMembers] = useState([]);
  const [promoting, setPromoting]     = useState(false);

  const isLeader      = !!userProfile?.isLeader;
  const hasBothRoles  = userProfile?.role === "collaboratore" && isLeader;
  const hasUpline     = !!userProfile?.leaderId;

  // ── Carica il team se è leader ────────────────────────────
  useEffect(() => {
    if (!isLeader || !userProfile?.uid) return;
    const q = query(
      collection(db, "users"),
      where("leaderId", "==", userProfile.uid),
    );
    const unsub = onSnapshot(q, snap => {
      setTeamMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [isLeader, userProfile?.uid]);

  // ── Genera codice invito per futura promozione ────────────
  //    Viene generato quando il collaboratore vuole iniziare a reclutare
  const generateMyInviteCode = useCallback(async () => {
    if (userProfile?.inviteCode) return userProfile.inviteCode;
    const code = generateInviteCode(userProfile?.name);
    await updateProfile({ inviteCode: code });

    // Crea il documento team
    await setDoc(doc(db, "teams", userProfile.uid), {
      leaderId:    userProfile.uid,
      leaderName:  userProfile.name,
      inviteCode:  code,
      createdAt:   serverTimestamp(),
      isSubLeader: true, // flag: questo leader è anche collaboratore di qualcun altro
      uplineId:    userProfile.leaderId || null,
    });

    return code;
  }, [userProfile, updateProfile]);

  // ── Promozione a leader (auto o manuale) ──────────────────
  const promoteToLeader = useCallback(async (targetProfile, trigger = "manual") => {
    if (!targetProfile?.uid) return;
    setPromoting(true);

    try {
      const ref  = doc(db, "users", targetProfile.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data();
      if (data.isLeader) return; // già leader

      // Genera il codice invito se non ce l'ha ancora
      let inviteCode = data.inviteCode;
      if (!inviteCode) {
        inviteCode = generateInviteCode(data.name);
      }

      // Aggiorna il profilo utente
      await setDoc(ref, {
        ...data,
        isLeader:     true,
        inviteCode,
        leaderSince:  serverTimestamp(),
        promotedBy:   trigger === "auto" ? "system" : (userProfile?.uid || "unknown"),
        promotionTrigger: trigger, // "auto" | "manual" | "self"
      });

      // Crea o aggiorna il documento team
      await setDoc(doc(db, "teams", targetProfile.uid), {
        leaderId:    targetProfile.uid,
        leaderName:  data.name,
        inviteCode,
        createdAt:   serverTimestamp(),
        isSubLeader: !!data.leaderId,
        uplineId:    data.leaderId || null,
      }, { merge: true });

    } finally {
      setPromoting(false);
    }
  }, [userProfile?.uid]);

  // ── Auto-promozione: si attiva DOPO la definizione di promoteToLeader ──
  // Quando un collaboratore riceve il primo membro nel suo team, diventa leader
  useEffect(() => {
    if (!userProfile?.uid || isLeader || !userProfile?.inviteCode) return;
    const q = query(collection(db, "users"), where("leaderId", "==", userProfile.uid));
    const unsub = onSnapshot(q, async (snap) => {
      if (!snap.empty) {
        await promoteToLeader(userProfile, "auto");
      }
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.uid, isLeader, userProfile?.inviteCode]);

  // ── Toggle vista ───────────────────────────────────────────
  const switchView = useCallback((view) => {
    if (!hasBothRoles && view === "leader") return;
    setActiveView(view);
  }, [hasBothRoles]);

  return {
    // Stato ruoli
    isLeader,
    hasBothRoles,
    hasUpline,
    activeView,
    switchView,

    // Team
    teamMembers,

    // Azioni
    generateMyInviteCode,
    promoteToLeader,
    promoting,

    // Dati utili
    myInviteCode: userProfile?.inviteCode,
    uplineId:     userProfile?.leaderId,
    uplineName:   userProfile?.leaderName,
    teamSize:     teamMembers.length,
  };
}
