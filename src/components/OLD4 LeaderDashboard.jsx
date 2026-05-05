// src/components/LeaderDashboard.jsx
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme, ThemeToggle } from "../context/ThemeContext";
import { useDualRole } from "../hooks/useDualRole";

const C = {
  bg: "#0a0a0f", surface: "#13131a", card: "#1a1a26",
  border: "#2a2a3d", accent: "#e8c547", text: "#f0f0f5",
  muted: "#6b6b8a", green: "#3ecf8e", red: "#f87171",
  blue: "#60a5fa", purple: "#a78bfa", orange: "#fb923c",
};

const LEVEL_CONFIG = {
  principiante: { icon: "🌱", color: "#1A7A4A", label: "Principiante" },
  in_crescita:  { icon: "🌿", color: "#1A5FA8", label: "In Crescita"  },
  avanzato:     { icon: "🔥", color: "#C05A1A", label: "Avanzato"     },
  pro:          { icon: "⭐", color: "#B8860B", label: "Pro"          },
};

const Card = ({ children, style = {} }) => {
  const { T } = useTheme();
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, boxShadow: T.shadowCard, ...style }}>
      {children}
    </div>
  );
};

export default function LeaderDashboard({ isEmbedded = false }) {
  const { userProfile, logout } = useAuth();
  const { T } = useTheme();
  const { promoteToLeader, promoting } = useDualRole();
  const [team, setTeam]         = useState([]);
  const [tab, setTab]           = useState("team");
  const [toast, setToast]       = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const fire = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // ── Carica i collaboratori del team in tempo reale ────────
  useEffect(() => {
    if (!userProfile?.uid) return;
    const q = query(
      collection(db, "users"),
      where("leaderId", "==", userProfile.uid),
      where("role", "==", "collaboratore")
    );
    const unsub = onSnapshot(q, (snap) => {
      setTeam(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [userProfile?.uid]);

  // ── KPI aggregati ─────────────────────────────────────────
  const totalClients  = team.reduce((s, m) => s + (m.weeklyClients || 0), 0);
  const totalMissions = team.reduce((s, m) => s + (m.completedMissions?.length || 0), 0);
  const atRisk        = team.filter(m => (m.weeklyClients || 0) < (m.currentWeek || 1) * 0.5);
  const topPerformers = team.filter(m => (m.weeklyClients || 0) >= (m.currentWeek || 1));

  // ── Aggiorna livello collaboratore ────────────────────────
  const updateLevel = async (uid, newLevel) => {
    await updateDoc(doc(db, "users", uid), { level: newLevel });
    fire(`Livello aggiornato a ${LEVEL_CONFIG[newLevel]?.label} ✅`);
  };

  const copyInviteCode = () => {
    navigator.clipboard?.writeText(userProfile.inviteCode || "");
    fire("Codice copiato! Condividilo con i tuoi collaboratori 📋");
  };

  // Contenuto comune a entrambe le modalità (standalone e embedded)
  const content = (
    <div style={{ padding: isEmbedded ? "16px 16px 0" : "20px 16px 0" }} className="anim">

        {/* Codice invito */}
        <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Il tuo codice invito</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 3, color: T.accent }}>{userProfile?.inviteCode}</div>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", marginTop: 2 }}>Condividilo con i tuoi nuovi collaboratori</div>
          </div>
          <button onClick={copyInviteCode} style={{ background: T.accent, border: "none", color: "#0a0a0f", padding: "9px 16px", borderRadius: 50, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            Copia
          </button>
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Team",      value: team.length,     icon: "👥", color: T.text },
            { label: "Clienti",   value: totalClients,    icon: "🎯", color: T.accent },
            { label: "Missioni",  value: totalMissions,   icon: "⚡", color: T.blue },
            { label: "A rischio", value: atRisk.length,   icon: "⚠️", color: atRisk.length > 0 ? T.red : T.muted },
          ].map(k => (
            <Card key={k.label} style={{ padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{k.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: k.color, lineHeight: 1.2, marginTop: 3 }}>{k.value}</div>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{k.label}</div>
            </Card>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { id: "team",    label: "👥 Team" },
            { id: "rischio", label: `⚠️ A Rischio (${atRisk.length})` },
            { id: "top",     label: `⭐ Top (${topPerformers.length})` },
            { id: "azioni",  label: "💡 Azioni" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? T.accent : T.surface, border: `1px solid ${tab === t.id ? T.accent : T.border}`, color: tab === t.id ? "#0a0a0f" : T.muted, padding: "7px 14px", borderRadius: 50, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TEAM completo */}
        {tab === "team" && (
          <div>
            {team.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: T.muted, fontFamily: "'DM Sans'" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <div style={{ lineHeight: 1.8 }}>
                  Nessun collaboratore ancora.<br />
                  Condividi il tuo codice invito <strong style={{ color: T.accent }}>{userProfile?.inviteCode}</strong><br />
                  per far registrare il tuo team!
                </div>
              </div>
            ) : team.map(m => <MemberCard key={m.id} m={m} onUpdateLevel={updateLevel} onSelect={setSelectedMember} fire={fire} onPromote={(member) => { promoteToLeader(member, "manual"); fire(`${member.name} promosso a Leader! 👑`); }} />)}
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
            ) : atRisk.map(m => <MemberCard key={m.id} m={m} highlight="risk" onUpdateLevel={updateLevel} onSelect={setSelectedMember} fire={fire} onPromote={(member) => { promoteToLeader(member, "manual"); fire(`${member.name} promosso a Leader! 👑`); }} />)}
          </div>
        )}

        {/* TOP */}
        {tab === "top" && (
          <div>
            {topPerformers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: T.muted, fontFamily: "'DM Sans'" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
                <div>Ancora nessun collaboratore ha raggiunto<br />l'obiettivo settimanale.</div>
              </div>
            ) : topPerformers.map(m => <MemberCard key={m.id} m={m} highlight="top" onUpdateLevel={updateLevel} onSelect={setSelectedMember} fire={fire} onPromote={(member) => { promoteToLeader(member, "manual"); fire(`${member.name} promosso a Leader! 👑`); }} />)}
          </div>
        )}

        {/* AZIONI LEADER */}
        {tab === "azioni" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: T.text }}>💡 Azioni Settimanali del Leader</div>
            {[
              { icon: "📞", title: "Chiama chi è indietro", desc: "5 minuti di chiamata a un collaboratore bloccato valgono più di 10 messaggi. Fallo oggi.", urgency: "alta" },
              { icon: "🎉", title: "Celebra nel gruppo team", desc: "Pubblica nel gruppo WhatsApp del team le vittorie della settimana — anche le piccole.", urgency: "media" },
              { icon: "📋", title: "Check-in nuovi (<30 giorni)", desc: "Fai un check-in di 15 minuti con tutti i collaboratori registrati nell'ultimo mese.", urgency: "alta" },
              { icon: "🔥", title: "Condividi la tua vittoria", desc: "Racconta una tua vittoria personale nel gruppo — ispira con l'esempio, non con le parole.", urgency: "media" },
              { icon: "🎓", title: "Sessione formazione mensile", desc: "Organizza una call di 45 minuti con tutto il team: risultati + 1 tecnica nuova + domande.", urgency: "mensile" },
              { icon: "🔄", title: "Rivaluta i livelli del team", desc: "Controlla se qualche collaboratore ha superato il suo livello attuale e aggiornalo.", urgency: "mensile" },
            ].map((a, i) => (
              <Card key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{a.title}</div>
                      <span style={{ background: a.urgency === "alta" ? T.redBg : a.urgency === "mensile" ? T.blueBg : T.accentBg, color: a.urgency === "alta" ? T.red : a.urgency === "mensile" ? T.purple : T.accent, padding: "3px 10px", borderRadius: 20, fontSize: 10, fontFamily: "'DM Sans'", fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                        {a.urgency === "alta" ? "OGGI" : a.urgency === "mensile" ? "MENSILE" : "QUESTA SETT."}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.6 }}>{a.desc}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
);
      {/* Bottom nav — solo in modalità standalone */}
      {!isEmbedded && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.navBg, borderTop: `1px solid ${T.border}`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(12px)" }}>
          <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: T.muted }}>Leader · {team.length} collaboratori</div>
          <button onClick={logout} style={{ background: T.redBg, border: `1px solid ${T.red}44`, color: T.red, padding: "7px 16px", borderRadius: 50, fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Logout
          </button>
        </div>
      )}
//    </div>
//  );

  // ── Modalità embedded: solo contenuto senza wrapper full-page ─
  if (isEmbedded) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
          ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
          @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
          .anim { animation: fadeIn 0.25s ease; }
          select { background: ${T.inputBg}; border: 1px solid ${T.border}; border-radius: 8px; color: ${T.text}; padding: 6px 10px; font-family: 'DM Sans', sans-serif; font-size: 12px; outline: none; }
          select option { background: ${T.surface}; }
        `}</style>
        {toast && (
          <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: T.accent, color: "#0a0a0f", padding: "11px 24px", borderRadius: 50, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, zIndex: 999, whiteSpace: "nowrap" }}>
            {toast} 
          </div>
        )}
        {/* Header compatto per la vista embedded */}
        <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", letterSpacing: 3, textTransform: "uppercase", marginBottom: 2 }}>👑 Il mio Team</div>
{/*            <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{userProfile?.name}</div> */}
          </div>
{/*          <ThemeToggle /> */}
        </div>
        {content}
      </>
    );
  } 

  // ── Modalità standalone: wrapper full-page con header completo ─
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 90, fontFamily: "'Playfair Display', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .anim { animation: fadeIn 0.25s ease; }
        select { background: ${T.inputBg}; border: 1px solid ${T.border}; border-radius: 8px; color: ${T.text}; padding: 6px 10px; font-family: 'DM Sans', sans-serif; font-size: 12px; outline: none; }
        select option { background: ${T.surface}; }
      `}</style>
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: T.accent, color: "#0a0a0f", padding: "11px 24px", borderRadius: 50, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, zIndex: 999, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
      {/* Header standalone completo */}
      <div style={{ padding: "28px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", letterSpacing: 4, textTransform: "uppercase", marginBottom: 4 }}>Dashboard Leader</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: T.text }}>{userProfile?.name}</div>
          <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginTop: 2 }}>Sorgenta Network</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ThemeToggle />
          <button onClick={logout} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, padding: "7px 14px", borderRadius: 50, fontSize: 12, fontFamily: "'DM Sans'", cursor: "pointer" }}>Esci</button>
        </div>
      </div>
      {content}
    </div>
  );
}

// ── Card singolo membro — usa useTheme per supporto light/dark ─
function MemberCard({ m, highlight, onUpdateLevel, fire, onPromote }) {
  const { T } = useTheme();
  const lvl    = LEVEL_CONFIG[m.level] || LEVEL_CONFIG.principiante;
  const goal   = m.currentWeek || 1;
  const actual = m.weeklyClients || 0;
  const pct    = Math.min((actual / goal) * 100, 100);
  const isRisk = highlight === "risk";
  const isTop  = highlight === "top";

  return (
    <div style={{ background: T.card, border: `1px solid ${isRisk ? T.red + "55" : isTop ? T.accent + "55" : T.border}`, borderRadius: 16, padding: 18, marginBottom: 12, boxShadow: T.shadowCard }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
        {/* Avatar */}
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: isTop ? T.accent : isRisk ? T.redBg : T.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: isTop ? "#0a0a0f" : T.text, flexShrink: 0, fontFamily: "'DM Sans'", border: `2px solid ${isRisk ? T.red + "44" : T.border}` }}>
          {m.name?.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* ← nome collaboratore: usa T.text esplicitamente */}
          <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{m.name}</div>
          <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginTop: 2 }}>
            {lvl.icon} {lvl.label} · Sett. {m.currentWeek || 1} · {m.completedMissions?.length || 0} missioni
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: isTop ? T.accent : T.text }}>{actual}</div>
          <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans'" }}>/ {goal} clienti</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: T.border, borderRadius: 50, height: 6, marginBottom: 12 }}>
        <div style={{ height: 6, borderRadius: 50, background: isTop ? `linear-gradient(90deg, ${T.accent}, ${T.accentSoft})` : isRisk ? T.red : T.blue, width: `${pct}%`, transition: "width 0.5s" }} />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted, marginRight: 4 }}>Cambia livello:</div>
        <select
          value={m.level || "principiante"}
          onChange={e => onUpdateLevel(m.id, e.target.value)}
        >
          {Object.entries(LEVEL_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.icon} {val.label}</option>
          ))}
        </select>
        {isRisk && (
          <button
            onClick={() => { navigator.clipboard?.writeText(`Ciao ${m.name}! Come va? Sono qui se hai bisogno di supporto questa settimana 💪`); fire("Messaggio copiato — incollalo su WhatsApp!"); }}
            style={{ background: T.redBg, border: `1px solid ${T.red}44`, color: T.red, padding: "5px 12px", borderRadius: 50, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 600, cursor: "pointer" }}>
            ✉️ Copia messaggio
          </button>
        )}
        {isTop && (
          <button
            onClick={() => { navigator.clipboard?.writeText(`Bravissimo/a ${m.name}! Risultati eccellenti questa settimana 🏆 Continua così!`); fire("Complimento copiato — incollalo su WhatsApp!"); }}
            style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, padding: "5px 12px", borderRadius: 50, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 600, cursor: "pointer" }}>
            🎉 Complimenta
          </button>
        )}
        {!m.isLeader && (
          <button
            onClick={() => { onPromote(m); }}
            style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, padding: "5px 12px", borderRadius: 50, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 600, cursor: "pointer" }}>
            👑 Promuovi a Leader
          </button>
        )}
        {m.isLeader && (
          <span style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.accent, fontWeight: 700 }}>👑 Già Leader</span>
        )}
      </div>
    </div>
  );
}
