// src/components/UplineConnect.jsx
// Collega un Leader esistente al proprio upline (Approccio A)
// Appare nelle impostazioni del leader come sezione opzionale
// Funziona anche durante la registrazione leader (campo opzionale)

import { useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function UplineConnect({ onClose, onConnected }) {
  const { userProfile } = useAuth();
  const { T }           = useTheme();

  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [preview, setPreview] = useState(null); // anteprima upline trovato
  const [step, setStep]       = useState("input"); // input | confirm | done

  const card = {
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 14, padding: 16,
  };

  // ── Step 1: cerca il team con quel codice invito ──────────
  const searchUpline = async () => {
    setError(null);
    if (!code.trim()) { setError("Inserisci il codice invito del tuo upline."); return; }

    setLoading(true);
    try {
      const q    = query(collection(db, "teams"), where("inviteCode", "==", code.trim().toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("Codice non trovato. Verifica con il tuo upline e riprova.");
        setLoading(false);
        return;
      }

      const teamData = snap.docs[0].data();

      // Evita auto-collegamento
      if (teamData.leaderId === userProfile?.uid) {
        setError("Non puoi collegare il tuo stesso codice invito.");
        setLoading(false);
        return;
      }

      // Evita collegamento già esistente
      if (userProfile?.leaderId) {
        setError(`Sei già collegato a ${userProfile.leaderName}. Contatta il supporto per cambiare upline.`);
        setLoading(false);
        return;
      }

      setPreview(teamData);
      setStep("confirm");
    } catch (err) {
      setError("Errore nella ricerca. Riprova tra qualche secondo.");
      console.error(err);
    }
    setLoading(false);
  };

  // ── Step 2: conferma il collegamento ─────────────────────
  const confirmConnect = async () => {
    if (!preview || !userProfile?.uid) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Aggiorna il profilo del leader con leaderId e leaderName
      await updateDoc(doc(db, "users", userProfile.uid), {
        leaderId:         preview.leaderId,
        leaderName:       preview.leaderName,
        connectedUplineAt: new Date().toISOString(),
      });

      // 2. Aggiorna (o crea) il documento team del leader
      //    segnando che è un sub-leader con upline
      await setDoc(doc(db, "teams", userProfile.uid), {
        isSubLeader: true,
        uplineId:    preview.leaderId,
        uplineName:  preview.leaderName,
        updatedAt:   serverTimestamp(),
      }, { merge: true });

      setStep("done");
      onConnected?.({ leaderId: preview.leaderId, leaderName: preview.leaderName });

    } catch (err) {
      setError("Errore nel collegamento. Riprova.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "flex-end" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: T.bg, borderRadius: "24px 24px 0 0", width: "100%", maxHeight: "80vh", overflowY: "auto", padding: 24, borderTop: `3px solid ${T.accent}` }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>🔗 Collega Upline</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: "'Playfair Display'" }}>
              {step === "done" ? "Collegamento completato!" : "Collega il tuo Upline"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, padding: "6px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 12 }}>✕</button>
        </div>

        {/* STEP: input codice */}
        {step === "input" && (
          <>
            <div style={{ ...card, background: T.surface, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.7 }}>
                Se un altro Leader ti ha invitato a far parte della sua rete, inserisci qui il suo <strong>codice invito</strong>.
                Diventerai visibile nella sua dashboard come <strong>Leader collegato</strong> e lui potrà supportarti.
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginBottom: 8 }}>Codice invito dell'upline</div>
              <input
                placeholder="Es: SARA-X4K2"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError(null); }}
                onKeyDown={e => e.key === "Enter" && searchUpline()}
                style={{ width: "100%", background: T.surface, border: `1px solid ${error ? (T.red || "#C0392B") : T.border}`, borderRadius: 12, padding: "14px 16px", color: T.text, fontFamily: "'DM Sans'", fontSize: 16, fontWeight: 700, letterSpacing: 2, textAlign: "center", outline: "none", boxSizing: "border-box" }}
              />
              {error && <div style={{ fontSize: 12, color: T.red || "#C0392B", fontFamily: "'DM Sans'", marginTop: 8 }}>{error}</div>}
            </div>

            <button
              onClick={searchUpline}
              disabled={loading || !code.trim()}
              style={{ width: "100%", background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "14px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loading || !code.trim() ? 0.6 : 1 }}
            >
              {loading ? "Ricerca in corso..." : "Cerca il mio Upline"}
            </button>

            <button onClick={onClose} style={{ width: "100%", background: "none", color: T.muted, border: "none", padding: "12px 0", fontFamily: "'DM Sans'", fontSize: 13, cursor: "pointer", marginTop: 4 }}>
              Salta per ora
            </button>
          </>
        )}

        {/* STEP: conferma */}
        {step === "confirm" && preview && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 70, height: 70, borderRadius: "50%", background: T.accentBg, border: `2px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 24, fontWeight: 900, color: T.accent, fontFamily: "'DM Sans'" }}>
                {(preview.leaderName || "?").charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.text, fontFamily: "'Playfair Display'" }}>{preview.leaderName}</div>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginTop: 4 }}>👑 Leader</div>
            </div>

            <div style={{ ...card, background: T.surface, marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.7 }}>
                Stai per collegare il tuo account a <strong>{preview.leaderName}</strong>.<br />
                Apparirà nella sua dashboard come <strong>"Leader collegato"</strong> e potrà vedere i progressi del tuo team.
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(192,57,43,0.08)", border: `1px solid rgba(192,57,43,0.25)`, borderRadius: 10, padding: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: T.red || "#C0392B", fontFamily: "'DM Sans'" }}>{error}</div>
              </div>
            )}

            <button
              onClick={confirmConnect}
              disabled={loading}
              style={{ width: "100%", background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "14px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 10, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Collegamento..." : `✓ Confermo — mi collego a ${preview.leaderName}`}
            </button>

            <button
              onClick={() => { setStep("input"); setPreview(null); }}
              style={{ width: "100%", background: "none", color: T.muted, border: `1px solid ${T.border}`, borderRadius: 50, padding: "12px 0", fontFamily: "'DM Sans'", fontSize: 13, cursor: "pointer" }}
            >
              ← Cambia codice
            </button>
          </>
        )}

        {/* STEP: completato */}
        {step === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "'Playfair Display'", marginBottom: 8 }}>
              Sei collegato a {preview?.leaderName}!
            </div>
            <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.7, marginBottom: 24 }}>
              Da ora il tuo upline potrà supportarti e vedere i progressi del tuo team nella sua dashboard.
              Il suo nome apparirà nell'header della tua app.
            </div>
            <button
              onClick={onClose}
              style={{ width: "100%", background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "14px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
            >
              Perfetto, inizia!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
