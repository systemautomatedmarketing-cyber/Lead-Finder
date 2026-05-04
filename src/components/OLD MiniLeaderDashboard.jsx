// src/components/MiniLeaderDashboard.jsx
// Dashboard leader compatta per chi ha il doppio ruolo
// Si mostra quando il collaboratore switcha a "Vista Leader"

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme, ThemeToggle } from "../context/ThemeContext";
import { useDualRole } from "../hooks/useDualRole";

const LEVEL_LABELS = {
  principiante: { icon: "🌱", label: "Principiante", color: "#1A7A4A" },
  in_crescita:  { icon: "🌿", label: "In Crescita",  color: "#1A5FA8" },
  avanzato:     { icon: "🔥", label: "Avanzato",     color: "#C05A1A" },
  pro:          { icon: "⭐", label: "Pro",           color: "#B8860B" },
};

export default function MiniLeaderDashboard({ onSwitchBack }) {
  const { userProfile, logout } = useAuth();
  const { T }                   = useTheme();
  const { teamMembers, promoteToLeader, promoting, myInviteCode,
          generateMyInviteCode, uplineName } = useDualRole();

  const [tab, setTab]           = useState("team");
  const [toast, setToast]       = useState(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  const fire = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const copyCode = async () => {
    let code = myInviteCode;
    if (!code) {
      setGeneratingCode(true);
      code = await generateMyInviteCode();
      setGeneratingCode(false);
    }
    navigator.clipboard?.writeText(code || "");
    fire("Codice invito copiato! 📋");
  };

  const handlePromote = async (member) => {
    if (member.isLeader) return;
    await promoteToLeader(member, "manual");
    fire(`${member.name} è ora leader del proprio team! 👑`);
  };

  const handleUpdateLevel = async (uid, level) => {
    await updateDoc(doc(db, "users", uid), { level });
    fire("Livello aggiornato ✅");
  };

  const totalClients  = teamMembers.reduce((s, m) => s + (m.weeklyClients || 0), 0);
  const atRisk        = teamMembers.filter(m => (m.weeklyClients || 0) < (m.currentWeek || 1) * 0.5);
  const topPerformers = teamMembers.filter(m => (m.weeklyClients || 0) >= (m.currentWeek || 1));

  const card = {
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 14, padding: 16, boxShadow: T.shadowCard,
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 90, fontFamily: "'Playfair Display', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .anim { animation: fadeIn 0.25s ease; }
        select { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 8px; color: ${T.text}; padding: 5px 10px; font-family: 'DM Sans', sans-serif; font-size: 12px; outline: none; }
        select option { background: ${T.surface}; }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: T.accent, color: "#0a0a0f", padding: "11px 24px", borderRadius: 50, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, zIndex: 999, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "24px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
            Vista Leader{uplineName && ` · Upline: ${uplineName}`}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>{userProfile?.name}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ThemeToggle />
          <button onClick={logout} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, padding: "6px 10px", borderRadius: 50, fontSize: 12, fontFamily: "'DM Sans'", cursor: "pointer" }}>↩</button>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }} className="anim">

        {/* Switch back to collab view */}
        <button onClick={onSwitchBack} style={{ display: "flex", alignItems: "center", gap: 8, background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 50, padding: "8px 16px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, color: T.accent, cursor: "pointer", marginBottom: 16 }}>
          ⚡ Torna al tuo percorso collaboratore
        </button>

        {/* Codice invito */}
        <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Il tuo codice invito</div>
            {myInviteCode ? (
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 3, color: T.accent }}>{myInviteCode}</div>
            ) : (
              <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted }}>Genera il codice per iniziare a reclutare</div>
            )}
          </div>
          <button onClick={copyCode} disabled={generatingCode} style={{ background: T.accent, border: "none", color: "#0a0a0f", padding: "9px 16px", borderRadius: 50, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
            {generatingCode ? "..." : myInviteCode ? "Copia" : "Genera"}
          </button>
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Team",     value: teamMembers.length,  icon: "👥", color: T.text   },
            { label: "Clienti",  value: totalClients,        icon: "🎯", color: T.accent },
            { label: "Top",      value: topPerformers.length,icon: "⭐", color: T.green  },
            { label: "Rischio",  value: atRisk.length,       icon: "⚠️", color: atRisk.length > 0 ? T.red : T.muted },
          ].map(k => (
            <div key={k.label} style={{ ...card, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{k.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: k.color, lineHeight: 1.2, marginTop: 3 }}>{k.value}</div>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { id: "team",    label: "👥 Team" },
            { id: "rischio", label: `⚠️ Rischio (${atRisk.length})` },
            { id: "azioni",  label: "💡 Azioni" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? T.accent : T.surface, border: `1px solid ${tab === t.id ? T.accent : T.border}`, color: tab === t.id ? "#0a0a0f" : T.muted, padding: "7px 14px", borderRadius: 50, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 700, cursor: "pointer" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TEAM */}
        {tab === "team" && (
          <div>
            {teamMembers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: T.muted, fontFamily: "'DM Sans'" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <div style={{ lineHeight: 1.8 }}>
                  Nessun collaboratore ancora.<br />
                  {myInviteCode
                    ? <>Condividi il codice <strong style={{ color: T.accent }}>{myInviteCode}</strong></>
                    : "Genera il tuo codice invito e inizia a reclutare!"}
                </div>
              </div>
            ) : teamMembers.map(m => <SubLeaderMemberCard key={m.id} m={m} T={T} card={card} onPromote={handlePromote} onUpdateLevel={handleUpdateLevel} promoting={promoting} fire={fire} />)}
          </div>
        )}

        {/* A RISCHIO */}
        {tab === "rischio" && (
          <div>
            {atRisk.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: T.green, fontFamily: "'DM Sans'" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div>Tutto il team è in linea con gli obiettivi!</div>
              </div>
            ) : atRisk.map(m => <SubLeaderMemberCard key={m.id} m={m} T={T} card={card} highlight="risk" onPromote={handlePromote} onUpdateLevel={handleUpdateLevel} promoting={promoting} fire={fire} />)}
          </div>
        )}

        {/* AZIONI */}
        {tab === "azioni" && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: T.text }}>💡 Azioni Leader questa settimana</div>
            {[
              { icon: "📞", title: "Chiama chi è indietro",         desc: "5 minuti di chiamata a un collaboratore bloccato valgono più di 10 messaggi.", urgency: "alta" },
              { icon: "🎉", title: "Celebra nel gruppo team",        desc: "Pubblica le vittorie della settimana nel gruppo WhatsApp — anche le piccole.", urgency: "media" },
              { icon: "📋", title: "Check-in nuovi (<30 giorni)",    desc: "15 minuti di check-in con tutti i collaboratori registrati nell'ultimo mese.", urgency: "alta" },
              { icon: "🔥", title: "Condividi la tua vittoria",      desc: "Racconta una tua vittoria personale — ispira con l'esempio, non con le parole.", urgency: "media" },
            ].map((a, i) => (
              <div key={i} style={{ ...card, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{a.title}</div>
                      <span style={{ background: a.urgency === "alta" ? T.redBg : T.accentBg, color: a.urgency === "alta" ? T.red : T.accent, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontFamily: "'DM Sans'", fontWeight: 700 }}>
                        {a.urgency === "alta" ? "OGGI" : "QUESTA SETT."}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.6 }}>{a.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.navBg, borderTop: `1px solid ${T.border}`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(12px)" }}>
        <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: T.muted }}>
          👑 Leader · {teamMembers.length} collaboratori
        </div>
        <button onClick={onSwitchBack} style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, padding: "7px 16px", borderRadius: 50, fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          ⚡ Vista Collaboratore
        </button>
      </div>
    </div>
  );
}

// ── Card membro per il sotto-leader ──────────────────────────
function SubLeaderMemberCard({ m, T, card, highlight, onPromote, onUpdateLevel, promoting, fire }) {
  const isRisk = highlight === "risk";
  const lvl    = LEVEL_LABELS[m.level] || LEVEL_LABELS.principiante;
  const goal   = m.currentWeek || 1;
  const actual = m.weeklyClients || 0;
  const pct    = Math.min((actual / goal) * 100, 100);

  return (
    <div style={{ ...card, marginBottom: 12, border: `1px solid ${isRisk ? T.red + "44" : m.isLeader ? T.accent + "44" : T.border}` }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: m.isLeader ? T.accentBg : T.surface, border: `2px solid ${m.isLeader ? T.accent : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: T.text, flexShrink: 0, fontFamily: "'DM Sans'" }}>
          {m.name?.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{m.name}</div>
            {m.isLeader && (
              <span style={{ background: T.accentBg, color: T.accent, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontFamily: "'DM Sans'", fontWeight: 700 }}>👑 Leader</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", marginTop: 2 }}>
            {lvl.icon} {lvl.label} · Sett. {m.currentWeek || 1} · {m.completedMissions?.length || 0} missioni
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.accent }}>{actual}</div>
          <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans'" }}>/{goal} clienti</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: T.border, borderRadius: 50, height: 5, marginBottom: 12 }}>
        <div style={{ height: 5, borderRadius: 50, background: isRisk ? T.red : `linear-gradient(90deg, ${T.accent}, ${T.accentSoft || T.accent})`, width: `${pct}%`, transition: "width 0.5s" }} />
      </div>

      {/* Azioni */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select value={m.level || "principiante"} onChange={e => onUpdateLevel(m.id, e.target.value)}>
          {Object.entries(LEVEL_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>

        {!m.isLeader && (
          <button
            onClick={() => onPromote(m)}
            disabled={promoting}
            style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, padding: "5px 12px", borderRadius: 50, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 700, cursor: "pointer", opacity: promoting ? 0.6 : 1 }}
          >
            👑 Promuovi a Leader
          </button>
        )}

        {isRisk && (
          <button
            onClick={() => { navigator.clipboard?.writeText(`Ciao ${m.name}! Come va? Sono qui per supportarti questa settimana 💪`); fire("Messaggio copiato!"); }}
            style={{ background: T.redBg, border: `1px solid ${T.red}44`, color: T.red, padding: "5px 12px", borderRadius: 50, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 700, cursor: "pointer" }}
          >
            ✉️ Supporto
          </button>
        )}
      </div>
    </div>
  );
}
