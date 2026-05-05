// src/components/AuthScreen.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const C = {
  bg: "#0a0a0f", surface: "#13131a", card: "#1a1a26",
  border: "#2a2a3d", accent: "#e8c547", text: "#f0f0f5",
  muted: "#6b6b8a", green: "#3ecf8e", red: "#f87171",
};

const LEVELS_INFO = [
  { id: "principiante", icon: "🌱", label: "Principiante", desc: "Sto iniziando ora — ho bisogno di guida passo per passo" },
  { id: "in_crescita",  icon: "🌿", label: "In Crescita",  desc: "Ho qualche esperienza — voglio espandere canali e ritmo" },
  { id: "avanzato",     icon: "🔥", label: "Avanzato",     desc: "Sono operativo — voglio scalare con eventi e team" },
  { id: "pro",          icon: "⭐", label: "Pro",          desc: "Gestisco già un team — il mio focus è la duplicazione" },
];

export default function AuthScreen() {
  const { login, registerLeader, registerCollaboratore } = useAuth();
  const [mode, setMode]     = useState("login"); // login | register_collab | register_leader
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [leaderCode, setLeaderCode]   = useState("");
  const [uplineCode, setUplineCode]   = useState("");
  const [level, setLevel]           = useState("principiante");

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else if (mode === "register_collab") {
        await registerCollaboratore({ name, email, password, inviteCode, level });
      } else if (mode === "register_leader") {
        await registerLeader({ name, email, password, leaderCode, uplineCode });
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(auth.*\)/, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Playfair Display', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select { background: #13131a; border: 1px solid #2a2a3d; border-radius: 10px; color: #f0f0f5; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; }
        input:focus, select:focus { border-color: #e8c547; }
        input::placeholder { color: #6b6b8a; }
        select option { background: #13131a; }
        .tab { flex: 1; padding: 10px; text-align: center; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #2a2a3d; transition: all 0.15s; color: #6b6b8a; }
        .tab.active { background: rgba(232,197,71,0.1); border-color: rgba(232,197,71,0.4); color: #e8c547; }
        .tab:first-child { border-radius: 10px 0 0 10px; }
        .tab:last-child { border-radius: 0 10px 10px 0; }
        .tab:not(:first-child) { border-left: none; }
        .level-card { border: 1px solid #2a2a3d; border-radius: 12px; padding: 12px 14px; cursor: pointer; transition: all 0.15s; display: flex; align-items: flex-start; gap: 10px; }
        .level-card.selected { border-color: rgba(232,197,71,0.6); background: rgba(232,197,71,0.08); }
        .btn-primary { width: 100%; background: #e8c547; color: #0a0a0f; border: none; border-radius: 50px; padding: 14px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .link-btn { background: none; border: none; color: #e8c547; font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; text-decoration: underline; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: C.accent, fontFamily: "'DM Sans'", letterSpacing: 5, textTransform: "uppercase", marginBottom: 6 }}>Crescita Network Marketing</div>
          <div style={{ fontSize: 48, fontWeight: 900, color: C.text, lineHeight: 1 }}>Lead Finder</div>
          <div style={{ fontSize: 14, color: C.muted, fontFamily: "'DM Sans'", marginTop: 6, fontStyle: "italic" }}>La tua crescita, ogni giorno</div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", marginBottom: 24 }}>
          <div className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>Accedi</div>
          <div className={`tab ${mode === "register_collab" ? "active" : ""}`} onClick={() => { setMode("register_collab"); setError(""); }}>Collaboratore</div>
          <div className={`tab ${mode === "register_leader" ? "active" : ""}`} onClick={() => { setMode("register_leader"); setError(""); }}>Leader</div>
        </div>

        {/* Card */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
          <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* LOGIN */}
            {mode === "login" && (
              <>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Bentornato/a 👋</div>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              </>
            )}

            {/* REGISTER COLLABORATORE */}
            {mode === "register_collab" && (
              <>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Registrati come Collaboratore</div>
                <input placeholder="Nome e cognome *" value={name} onChange={e => setName(e.target.value)} required />
                <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password (min. 6 caratteri) *" value={password} onChange={e => setPassword(e.target.value)} required />
                <input
                  placeholder="Codice invito del tuo leader *"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  required
                  style={{ letterSpacing: 2, fontWeight: 700 }}
                />
                <div>
                  <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: C.muted, marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                    Il tuo livello di esperienza
                  </div>
                  {LEVELS_INFO.map(l => (
                    <div key={l.id} className={`level-card ${level === l.id ? "selected" : ""}`} onClick={() => setLevel(l.id)} style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{l.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: level === l.id ? C.accent : C.text, fontFamily: "'DM Sans'" }}>{l.label}</div>
                        <div style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Sans'", marginTop: 2, lineHeight: 1.4 }}>{l.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* REGISTER LEADER */}
            {mode === "register_leader" && (
              <>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Registrati come Leader</div>
                <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: C.muted, lineHeight: 1.5, padding: "10px 14px", background: "rgba(232,197,71,0.07)", border: `1px solid rgba(232,197,71,0.2)`, borderRadius: 10 }}>
                  Per registrarti come leader ti serve il <strong style={{ color: C.accent }}>codice amministratore</strong> del network.
                </div>
                <input placeholder="Nome e cognome *" value={name} onChange={e => setName(e.target.value)} required />
                <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password (min. 6 caratteri) *" value={password} onChange={e => setPassword(e.target.value)} required />
                <input
                  placeholder="Codice amministratore *"
                  value={leaderCode}
                  onChange={e => setLeaderCode(e.target.value)}
                  required
                  type="password"
                />
                <div style={{ position: "relative" }}>
                  <input
                    placeholder="Codice upline (opzionale — se hai già un leader)"
                    value={uplineCode}
                    onChange={e => setUplineCode(e.target.value.toUpperCase())}
                    style={{ fontFamily: "'DM Sans'", letterSpacing: uplineCode ? 1 : 0 }}
                  />
                  <div style={{ fontSize: 11, color: "#6b6b8a", fontFamily: "'DM Sans'", marginTop: 4, lineHeight: 1.4 }}>
                    Lascia vuoto se non hai un upline. Potrai collegarlo anche dopo dalla dashboard.
                  </div>
                </div>
              </>
            )}

            {error && (
              <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontFamily: "'DM Sans'", color: C.red, lineHeight: 1.5 }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Caricamento..." : mode === "login" ? "Accedi" : "Crea account"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, fontFamily: "'DM Sans'", color: C.muted }}>
          {mode !== "login" && (
            <span>Hai già un account? <button className="link-btn" onClick={() => { setMode("login"); setError(""); }}>Accedi qui</button></span>
          )}
          {mode === "login" && (
            <span>Nuovo collaboratore? <button className="link-btn" onClick={() => { setMode("register_collab"); setError(""); }}>Registrati</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
