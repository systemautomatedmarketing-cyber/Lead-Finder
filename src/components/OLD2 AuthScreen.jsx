// src/components/AuthScreen.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme, ThemeToggle } from "../context/ThemeContext";

// ── Traduzione errori Firebase Auth in italiano ──────────────
function translateAuthError(code) {
  const map = {
    // Credenziali
    "auth/invalid-credential":        "Email o password non corretti. Riprova.",
    "auth/invalid-email":             "Formato email non valido.",
    "auth/user-not-found":            "Nessun account trovato con questa email.",
    "auth/wrong-password":            "Password non corretta.",
    "auth/invalid-password":          "Password non corretta.",
    // Account
    "auth/email-already-in-use":      "Questa email è già registrata. Prova ad accedere.",
    "auth/user-disabled":             "Questo account è stato disabilitato. Contatta il supporto.",
    // Password
    "auth/weak-password":             "Password troppo corta. Usa almeno 6 caratteri.",
    "auth/missing-password":          "Inserisci una password.",
    // Rete / tecnici
    "auth/network-request-failed":    "Errore di connessione. Controlla la tua rete e riprova.",
    "auth/too-many-requests":         "Troppi tentativi. Attendi qualche minuto prima di riprovare.",
    "auth/internal-error":            "Errore interno. Riprova tra qualche secondo.",
    "auth/operation-not-allowed":     "Metodo di accesso non abilitato. Contatta il supporto.",
    // Codice invito / app
    "auth/expired-action-code":       "Codice scaduto. Richiedine uno nuovo.",
    "auth/invalid-action-code":       "Codice non valido.",
  };
  // Cerca il codice esatto
  if (map[code]) return map[code];
  // Cerca per sottostringa (es. messaggio lungo con codice embedded)
  for (const [key, val] of Object.entries(map)) {
    if (code && code.includes(key)) return val;
  }
  // Messaggi custom dell'app (es. "Codice leader non valido")
  if (code && code.length < 120) return code;
  return "Si è verificato un errore. Riprova.";
}

const LEVELS_INFO = [
  { id: "principiante", icon: "🌱", label: "Principiante", desc: "Sto iniziando ora — ho bisogno di guida passo per passo" },
  { id: "in_crescita",  icon: "🌿", label: "In Crescita",  desc: "Ho qualche esperienza — voglio espandere canali e ritmo" },
  { id: "avanzato",     icon: "🔥", label: "Avanzato",     desc: "Sono operativo — voglio scalare con eventi e team" },
  { id: "pro",          icon: "⭐", label: "Pro",          desc: "Gestisco già un team — il mio focus è la duplicazione" },
];

// ── Logo SVG fedele all'immagine caricata ─────────────────────
function LeadFinderLogo({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="outerRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E4D8C"/>
          <stop offset="100%" stopColor="#2E6DB4"/>
        </linearGradient>
        <linearGradient id="innerCircle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7BB3D8"/>
          <stop offset="100%" stopColor="#4A8EC2"/>
        </linearGradient>
        <linearGradient id="handle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D2D2D"/>
          <stop offset="100%" stopColor="#555555"/>
        </linearGradient>
      </defs>
      {/* Outer crosshair ring */}
      <circle cx="95" cy="90" r="68" stroke="url(#outerRing)" strokeWidth="10" fill="none"/>
      {/* Crosshair lines */}
      <line x1="95" y1="16" x2="95" y2="36" stroke="#1E4D8C" strokeWidth="7" strokeLinecap="round"/>
      <line x1="95" y1="144" x2="95" y2="164" stroke="#1E4D8C" strokeWidth="7" strokeLinecap="round"/>
      <line x1="21" y1="90" x2="41" y2="90" stroke="#1E4D8C" strokeWidth="7" strokeLinecap="round"/>
      <line x1="149" y1="90" x2="169" y2="90" stroke="#1E4D8C" strokeWidth="7" strokeLinecap="round"/>
      {/* Middle ring */}
      <circle cx="95" cy="90" r="48" stroke="#2E6DB4" strokeWidth="6" fill="none" opacity="0.6"/>
      {/* Magnifier glass body */}
      <circle cx="88" cy="82" r="32" fill="url(#innerCircle)" opacity="0.9"/>
      <circle cx="88" cy="82" r="32" stroke="#1E4D8C" strokeWidth="4" fill="none"/>
      {/* Person silhouette */}
      <circle cx="88" cy="72" r="9" fill="white" opacity="0.85"/>
      <path d="M68 96 Q68 84 88 84 Q108 84 108 96" fill="white" opacity="0.85"/>
      {/* @ symbol */}
      <text x="80" y="95" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="#1E4D8C" opacity="0.9">@</text>
      {/* Magnifier handle */}
      <line x1="113" y1="107" x2="135" y2="130" stroke="url(#handle)" strokeWidth="10" strokeLinecap="round"/>
    </svg>
  );
}

// ── Sezione informativa — cosa fa l'app ───────────────────────
function AppInfo({ C }) {
  const features = [
    { icon: "⚡", title: "Missioni guidate giorno per giorno", desc: "Azioni concrete calibrate sul tuo livello, dalla prima lista contatti fino alla duplicazione del team." },
    { icon: "📋", title: "CRM lead con follow-up automatico", desc: "Traccia ogni contatto e ricevi reminder nei momenti giusti: giorno 2, 5, 10 e 21 dal primo contatto." },
    { icon: "👑", title: "Dashboard leader in tempo reale", desc: "Vedi i progressi di tutto il tuo team, identifica chi è a rischio e chi eccelle — senza chiedere report." },
    { icon: "🤝", title: "Doppio ruolo Collaboratore & Leader", desc: "Puoi crescere nel tuo team e costruire il tuo contemporaneamente, senza cambiare account." },
    { icon: "🧠", title: "Profilo AI personalizzato", desc: "5 domande e l'AI crea il tuo profilo strategico con script, consigli e azioni su misura per te." },
    { icon: "📈", title: "Percorso strutturato 26 settimane", desc: "Un sistema progressivo in 3 fasi: Fondamenta, Slancio e Scalabilità — per crescere con metodo." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Titolo sezione info */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 }}>
          Perché Lead Finder
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.text, fontFamily: "'Playfair Display'", lineHeight: 1.25, marginBottom: 12 }}>
          Il metodo che mancava al tuo network marketing
        </div>
        <div style={{ fontSize: 14, fontFamily: "'DM Sans'", color: C.muted, lineHeight: 1.7 }}>
          Lead Finder è la piattaforma per collaboratori e leader del network marketing che vogliono
          smettere di improvvisare e iniziare a crescere con un sistema.
        </div>
      </div>

      {/* Feature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: C.accentBg, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {f.icon}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "'DM Sans'", marginBottom: 3 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Sans'", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* A chi è rivolto */}
      <div style={{ marginTop: 28, padding: "16px 18px", background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: 14 }}>
        <div style={{ fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          A chi è rivolto
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { emoji: "🌱", label: "Collaboratori", desc: "Che vogliono un metodo chiaro per trovare clienti e crescere." },
            { emoji: "👑", label: "Leader e Manager", desc: "Che gestiscono reti distributive e vogliono visibilità totale." },
            { emoji: "🏢", label: "Aziende di NM", desc: "Che vogliono standardizzare il metodo di tutta la rete." },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16 }}>{r.emoji}</span>
              <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: C.text, lineHeight: 1.5 }}>
                <strong>{r.label}</strong> — {r.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof / pill */}
      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["✅ Trial 14 giorni gratis", "🔒 Dati sicuri su Firebase", "🌍 Multi-settore"].map((p, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 50, padding: "5px 12px", fontSize: 11, fontFamily: "'DM Sans'", color: C.muted, fontWeight: 600 }}>
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Componente principale ─────────────────────────────────────
export default function AuthScreen() {
  const { login, registerLeader, registerCollaboratore } = useAuth();
  const { T } = useTheme();
  const C = T;

  const [mode, setMode]         = useState("login");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [leaderCode, setLeaderCode] = useState("");
  const [uplineCode, setUplineCode] = useState("");
  const [level, setLevel]       = useState("principiante");

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login")             await login(email, password);
      else if (mode === "register_collab") await registerCollaboratore({ name, email, password, inviteCode, level });
      else if (mode === "register_leader") await registerLeader({ name, email, password, leaderCode, uplineCode });
    } catch (err) {
      setError(translateAuthError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Playfair Display', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select {
          background: ${C.surface}; border: 1px solid ${C.border};
          border-radius: 10px; color: ${C.text}; padding: 12px 16px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          width: 100%; outline: none; transition: border 0.2s;
        }
        input:focus, select:focus { border-color: ${C.accent}; }
        input::placeholder { color: ${C.muted}; }
        select option { background: ${C.surface}; color: ${C.text}; }
        .tab {
          flex: 1; padding: 10px; text-align: center;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1px solid ${C.border}; background: ${C.surface};
          transition: all 0.15s; color: ${C.muted};
        }
        .tab.active { background: ${C.accentBg}; border-color: ${C.accentBorder}; color: ${C.accent}; }
        .tab:first-child { border-radius: 10px 0 0 10px; }
        .tab:last-child  { border-radius: 0 10px 10px 0; }
        .tab:not(:first-child) { border-left: none; }
        .level-card {
          border: 1px solid ${C.border}; background: ${C.surface};
          border-radius: 12px; padding: 12px 14px; cursor: pointer;
          transition: all 0.15s; display: flex; align-items: flex-start; gap: 10px;
        }
        .level-card.selected { border-color: ${C.accent}; background: ${C.accentBg}; }
        .btn-primary {
          width: 100%; background: ${C.accent}; color: #0a0a0f;
          border: none; border-radius: 50px; padding: 14px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.15s;
        }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary:hover:not(:disabled) { filter: brightness(1.08); }
        .link-btn {
          background: none; border: none; color: ${C.accent};
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          cursor: pointer; text-decoration: underline;
        }

        /* Layout responsive: due colonne su desktop, una su mobile */
        .auth-layout {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 100vh;
        }
        .auth-form-col {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 32px 24px;
        }
        .auth-info-col {
          padding: 40px 32px;
          border-top: 1px solid ${C.border};
        }
        @media (min-width: 900px) {
          .auth-layout {
            grid-template-columns: 460px 1fr;
          }
          .auth-form-col {
            padding: 48px 48px;
            border-right: 1px solid ${C.border};
            min-height: 100vh;
          }
          .auth-info-col {
            padding: 60px 52px;
            border-top: none;
            overflow-y: auto;
            max-height: 100vh;
            position: sticky;
            top: 0;
          }
        }
      `}</style>

      {/* Toggle tema */}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <div className="auth-layout">

        {/* ── COLONNA SINISTRA / TOP: Form ── */}
        <div className="auth-form-col">
          <div style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
              <LeadFinderLogo size={64} />
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1, letterSpacing: -0.5 }}>
                  Lead<span style={{ color: C.accent }}> Finder</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Sans'", marginTop: 3, letterSpacing: 0.5 }}>
                  Network Marketing Platform
                </div>
              </div>
            </div>

            {/* Tab switcher */}
            <div style={{ display: "flex", marginBottom: 24 }}>
              <div className={`tab ${mode === "login" ? "active" : ""}`}
                onClick={() => { setMode("login"); setError(""); }}>Accedi</div>
              <div className={`tab ${mode === "register_collab" ? "active" : ""}`}
                onClick={() => { setMode("register_collab"); setError(""); }}>Collaboratore</div>
              <div className={`tab ${mode === "register_leader" ? "active" : ""}`}
                onClick={() => { setMode("register_leader"); setError(""); }}>Leader</div>
            </div>

            {/* Card form */}
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
                        <div key={l.id} className={`level-card ${level === l.id ? "selected" : ""}`}
                          onClick={() => setLevel(l.id)} style={{ marginBottom: 8 }}>
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
                    <input placeholder="Codice amministratore *" value={leaderCode}
                      onChange={e => setLeaderCode(e.target.value)} required type="password" />
                    <div>
                      <input
                        placeholder="Codice upline (opzionale)"
                        value={uplineCode}
                        onChange={e => setUplineCode(e.target.value.toUpperCase())}
                        style={{ letterSpacing: uplineCode ? 1 : 0 }}
                      />
                      <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Sans'", marginTop: 4, lineHeight: 1.4 }}>
                        Lascia vuoto se non hai un upline. Potrai collegarlo dopo dalla dashboard.
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div style={{ background: C.redBg || "rgba(248,113,113,0.1)", border: `1px solid ${C.red || "#f87171"}44`, borderRadius: 10, padding: "10px 14px", fontSize: 13, fontFamily: "'DM Sans'", color: C.red || "#f87171", lineHeight: 1.5 }}>
                    ⚠️ {error}
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Caricamento..." : mode === "login" ? "Accedi" : "Crea account"}
                </button>
              </form>
            </div>

            {/* Link cambio modalità */}
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, fontFamily: "'DM Sans'", color: C.muted }}>
              {mode !== "login" && (
                <span>Hai già un account?{" "}
                  <button className="link-btn" onClick={() => { setMode("login"); setError(""); }}>Accedi qui</button>
                </span>
              )}
              {mode === "login" && (
                <span>Nuovo collaboratore?{" "}
                  <button className="link-btn" onClick={() => { setMode("register_collab"); setError(""); }}>Registrati</button>
                </span>
              )}
            </div>

            {/* Footer mobile only */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${C.border}`, display: "block" }}>
              <div className="auth-info-col-mobile">
                {/* AppInfo viene mostrata sotto su mobile tramite la colonna destra nel grid */}
              </div>
            </div>

          </div>
        </div>

        {/* ── COLONNA DESTRA / BOTTOM: Info app ── */}
        <div className="auth-info-col" style={{ background: C.surface }}>
          <AppInfo C={C} />
        </div>

      </div>
    </div>
  );
}
