// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc, onSnapshot, setDoc, collection,
  query, where, getDocs, serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { getDefaultPlan } from "../data/plans";

const LEADER_SECRET_CODE = "SORGENTA-LEADER-2024";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading]         = useState(true);

  // ── Ascolta auth + profilo Firestore in tempo reale ──────────
  // Usando onSnapshot invece di getDoc, qualsiasi modifica al profilo
  // (es. isLeader: true scritta da useDualRole) aggiorna subito lo stato
  // senza bisogno di refresh manuale.
  useEffect(() => {
    let profileUnsub = null;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      // Cancella listener precedente se esisteva
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (user) {
        // Sottoscrivi al documento utente in real-time
        profileUnsub = onSnapshot(
          doc(db, "users", user.uid),
          (snap) => {
            if (snap.exists()) {
              setUserProfile(snap.data());
            } else {
              setUserProfile(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error("Profile onSnapshot error:", err);
            setLoading(false);
          }
        );
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // ── Registrazione LEADER ──────────────────────────────────
  async function registerLeader({ name, email, password, leaderCode }) {
    if (leaderCode !== LEADER_SECRET_CODE) {
      throw new Error("Codice leader non valido. Contatta l'amministratore.");
    }
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const inviteCode = generateInviteCode(name);

    const profile = {
      uid: user.uid,
      name,
      email,
      role: "leader",
      inviteCode,
      teamSize: 0,
      plan: getDefaultPlan("leader"),
      subscriptionStatus: "trial",
      trialStartedAt: new Date().toISOString(),
      companySetupDone: false,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), profile);
    await setDoc(doc(db, "teams", user.uid), {
      leaderId: user.uid,
      leaderName: name,
      inviteCode,
      createdAt: serverTimestamp(),
    });
    // onSnapshot aggiornerà userProfile automaticamente
    return user;
  }

  // ── Registrazione COLLABORATORE ───────────────────────────
  async function registerCollaboratore({ name, email, password, inviteCode, level }) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    try {
      const teamsRef = collection(db, "teams");
      const q = query(teamsRef, where("inviteCode", "==", inviteCode.toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        await user.delete();
        throw new Error("Codice invito non valido. Chiedi il codice al tuo leader.");
      }

      const teamData = snap.docs[0].data();
      const leaderId = teamData.leaderId;

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
        plan: getDefaultPlan("collaboratore"),
        subscriptionStatus: "trial",
        trialStartedAt: new Date().toISOString(),
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), profile);
      // onSnapshot aggiornerà userProfile automaticamente
      return user;

    } catch (err) {
      await user.delete();
      throw err;
    }
  }

  // ── Login ─────────────────────────────────────────────────
  async function login(email, password) {
    // onSnapshot si occuperà di caricare il profilo automaticamente
    await signInWithEmailAndPassword(auth, email, password);
  }

  // ── Logout ────────────────────────────────────────────────
  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  // ── Aggiorna profilo utente ───────────────────────────────
  // Scrive su Firestore → onSnapshot lo rileva e aggiorna userProfile
  async function updateProfile(updates) {
    if (!currentUser) return;
    const ref = doc(db, "users", currentUser.uid);
    await setDoc(ref, { ...userProfile, ...updates });
    // Non serve setUserProfile manuale: onSnapshot lo fa automaticamente
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

function generateInviteCode(name) {
  const prefix = (name || "USR").split(" ")[0].substring(0, 4).toUpperCase();
  const rand   = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${rand}`;
}
