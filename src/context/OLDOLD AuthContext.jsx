// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, collection,
  query, where, getDocs, serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { getDefaultPlan, TRIAL_DAYS } from "../data/plans";

// ── Codice segreto per registrare un LEADER ──────────────────
// Cambialo in qualcosa di sicuro prima del deploy!
const LEADER_SECRET_CODE = "SORGENTA-LEADER-2024";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile]   = useState(null);
  const [loading, setLoading]           = useState(true);

  // ── Ascolta i cambiamenti di autenticazione ───────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserProfile(snap.data());
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Registrazione LEADER ──────────────────────────────────
  async function registerLeader({ name, email, password, leaderCode }) {
    if (leaderCode !== LEADER_SECRET_CODE) {
      throw new Error("Codice leader non valido. Contatta l'amministratore.");
    }
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Genera codice invito unico per il team del leader
    const inviteCode = generateInviteCode(name);

    const profile = {
      uid: user.uid,
      name,
      email,
      role: "leader",
      inviteCode,
      teamSize: 0,
      plan: getDefaultPlan("leader"),          // "leader_starter"
      subscriptionStatus: "trial",
      trialStartedAt: new Date().toISOString(),
      companySetupDone: false,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), profile);
    // Salva anche il team con il codice invito
    await setDoc(doc(db, "teams", user.uid), {
      leaderId: user.uid,
      leaderName: name,
      inviteCode,
      createdAt: serverTimestamp(),
    });

    setUserProfile(profile);
    return user;
  }

  // ── Registrazione COLLABORATORE ───────────────────────────
  async function registerCollaboratore({ name, email, password, inviteCode, level }) {
    // Cerca il team con quel codice invito
console.log("registerCollaboratore");

    const teamsRef = collection(db, "teams");
console.log("teamsRef :", teamsRef );
    const q = query(teamsRef, where("inviteCode", "==", inviteCode.toUpperCase()));
console.log("q:", q);
    const snap = await getDocs(q);
console.log("snap :", snap);

    if (snap.empty) {
      throw new Error("Codice invito non valido. Chiedi il codice al tuo leader.");
    }

    const teamData = snap.docs[0].data();
    const leaderId = teamData.leaderId;

console.log("Start Creazione user!")
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
console.log("End Creazione user!")
    const profile = {
      uid: user.uid,
      name,
      email,
      role: "collaboratore",
      leaderId,
      leaderName: teamData.leaderName,
      level: level || "principiante",
      currentWeek: 1,
      weeklyClients: 0,
      points: 0,
      completedMissions: [],
      plan: getDefaultPlan("collaboratore"),   // "starter"
      subscriptionStatus: "trial",
      trialStartedAt: new Date().toISOString(),
      onboardingCompleted: false,
      createdAt: serverTimestamp(),
    };

console.log("User in registrazione:", user.uid);
    await setDoc(doc(db, "users", user.uid), profile);
console.log("User registrato:", user.uid);

    // Aggiorna il contatore del team leader
    const leaderRef = doc(db, "users", leaderId);
    const leaderSnap = await getDoc(leaderRef);
    if (leaderSnap.exists()) {
      await setDoc(leaderRef, {
        ...leaderSnap.data(),
        teamSize: (leaderSnap.data().teamSize || 0) + 1,
      });
    }

    setUserProfile(profile);
    return user;
  }

  // ── Login (uguale per tutti i ruoli) ─────────────────────
  async function login(email, password) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) setUserProfile(snap.data());
    return user;
  }

  // ── Logout ───────────────────────────────────────────────
  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  // ── Aggiorna profilo utente ───────────────────────────────
  async function updateProfile(updates) {
    if (!currentUser) return;
    const ref = doc(db, "users", currentUser.uid);
    await setDoc(ref, { ...userProfile, ...updates });
    setUserProfile(prev => ({ ...prev, ...updates }));
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      registerLeader,
      registerCollaboratore,
      login,
      logout,
      updateProfile,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// ── Utility: genera codice invito dal nome del leader ────────
function generateInviteCode(name) {
  const prefix = name.split(" ")[0].substring(0, 4).toUpperCase();
  const rand   = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${rand}`;
}
