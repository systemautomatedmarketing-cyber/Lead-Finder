// src/components/CollaboratoreDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import {
  doc, collection, onSnapshot,
  addDoc, updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme, ThemeToggle } from "../context/ThemeContext";
import { MISSIONS_BY_LEVEL, LEVELS } from "../data/missions";
import RecoverySystem from "./RecoverySystem";

const C = {
  bg: "#0a0a0f", surface: "#13131a", card: "#1a1a26",
  border: "#2a2a3d", accent: "#e8c547", accentSoft: "#f5e17a",
  text: "#f0f0f5", muted: "#6b6b8a", green: "#3ecf8e",
  red: "#f87171", blue: "#60a5fa", purple: "#a78bfa", orange: "#fb923c",
};

const STATUS_CONFIG = {
  lead:          { label: "🔍 Lead",       color: "#6B4FA8", bg: "rgba(107,79,168,0.15)"  },
  nuovo:         { label: "Nuovo",         color: "#6b6b8a", bg: "rgba(107,107,138,0.15)" },
  contattato:    { label: "Contattato",    color: "#1A5FA8", bg: "rgba(26,95,168,0.15)"   },
  interessato:   { label: "Interessato",   color: "#B8860B", bg: "rgba(184,134,11,0.15)"  },
  followup:      { label: "Follow-up",     color: "#C05A1A", bg: "rgba(192,90,26,0.15)"   },
  presentato:    { label: "Presentato",    color: "#1A5FA8", bg: "rgba(26,95,168,0.18)"   },
  convertito:    { label: "✅ Cliente",    color: "#1A7A4A", bg: "rgba(26,122,74,0.15)"   },
  collaboratore: { label: "🤝 Collab.",   color: "#B8860B", bg: "rgba(184,134,11,0.20)"  },
  archiviato:    { label: "📦 Archiviato", color: "#6b6b8a", bg: "rgba(107,107,138,0.08)" },
};

const CHANNEL_OPTIONS = ["WhatsApp","Instagram","Facebook","Referral","Evento","Conoscenza","TikTok","Altro"];

const Card = ({ children, style = {} }) => {
  const { T } = useTheme();
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, boxShadow: T.shadowCard, ...style }}>
      {children}
    </div>
  );
};

const Btn = ({ children, onClick, variant = "primary", style = {} }) => {
  const { T } = useTheme();
  const s = {
    primary: { background: T.accent, color: "#0a0a0f", fontWeight: 700 },
    ghost:   { background: "transparent", color: T.muted, border: `1px solid ${T.border}` },
    soft:    { background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBorder}` },
  }[variant];
  return (
    <button onClick={onClick} style={{ border: "none", borderRadius: 50, padding: "10px 20px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.15s", ...s, ...style }}>
      {children}
    </button>
  );
};

export default function CollaboratoreDashboard() {
  const { userProfile, updateProfile, logout } = useAuth();
  const { T } = useTheme();
  const uid     = userProfile?.uid;
  const level   = userProfile?.level || "principiante";
  const lvlInfo = LEVELS[level];
  const missions = MISSIONS_BY_LEVEL[level] || [];

  const [tab, setTab]               = useState("dashboard");
  const [toast, setToast]           = useState(null);
  const [contacts, setContacts]     = useState([]);
  const [showMission, setShowMission] = useState(null);
  const [copiedId, setCopiedId]     = useState(null);
  const [showRecovery, setShowRecovery] = useState(false);

  // Mostra banner recovery se settimana >= 3 e 0 clienti
  const showRecoveryBanner = (userProfile?.currentWeek || 1) >= 3 && (userProfile?.weeklyClients || 0) === 0;

  // Form nuovo contatto
  const [nc, setNc] = useState({ name: "", type: "lead", status: "lead", channel: "", note: "" });

  const fire = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // ── Derived da userProfile ────────────────────────────────
  const currentWeek      = userProfile?.currentWeek || 1;
  const weeklyClients    = userProfile?.weeklyClients || 0;
  const points           = userProfile?.points || 0;
  const completedMissions= userProfile?.completedMissions || [];
  const weekGoal         = lvlInfo?.weeklyTarget?.[Math.min(currentWeek - 1, 6)] || currentWeek;
  const progress         = Math.min((weeklyClients / weekGoal) * 100, 100);

  // ── Contatti real-time da Firestore ──────────────────────
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(collection(db, "users", uid, "contacts"), (snap) => {
      setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [uid]);

  // ── Completa missione → salva su Firestore ────────────────
  const completeMission = useCallback(async (mission) => {
    if (completedMissions.includes(mission.id)) return;
    await updateProfile({
      completedMissions: [...completedMissions, mission.id],
      points: points + mission.points,
    });
    fire(`+${mission.points} pt — Missione completata! 🎯`);
    setShowMission(null);
  }, [completedMissions, points, updateProfile]);

  // ── Aggiungi cliente → salva settimana ───────────────────
  const registerClient = async () => {
    const newCount = Math.min(weeklyClients + 1, weekGoal);
    await updateProfile({ weeklyClients: newCount });
    fire("🎯 Cliente / collaboratore registrato!");
  };

  // ── Avanza settimana ──────────────────────────────────────
  const advanceWeek = async () => {
    if (currentWeek >= 7) return;
    await updateProfile({ currentWeek: currentWeek + 1, weeklyClients: 0 });
    fire(`Settimana ${currentWeek + 1} iniziata! 🚀`);
  };

  // ── CRUD Contatti ─────────────────────────────────────────
  const addContact = async () => {
    if (!nc.name.trim()) return;
    const contactData = {
      ...nc,
      createdAt: serverTimestamp(),
      contactedAt: nc.status === "contattato" ? new Date().toISOString() : null,
    };
    await addDoc(collection(db, "users", uid, "contacts"), contactData);
    setNc({ name: "", type: "lead", status: "lead", channel: "", note: "" });
    fire("Contatto aggiunto 📋");
    setTab("contatti");
  };

  const updateStatus = async (contactId, status) => {
    const updates = { status, updatedAt: serverTimestamp() };
    if (status === "contattato") updates.contactedAt = new Date().toISOString();
    await updateDoc(doc(db, "users", uid, "contacts", contactId), updates);
    if (status === "convertito" || status === "collaboratore") {
      await updateProfile({ weeklyClients: Math.min(weeklyClients + 1, weekGoal) });
      fire(status === "convertito" ? "🎉 Nuovo cliente!" : "🤝 Nuovo collaboratore!");
    }
  };

  const copyScript = (text, id) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    fire("Script copiato! ✂️");
  };

  const thisWeekMissions = missions.filter(m => m.week === currentWeek);
  const allMissionsDone  = thisWeekMissions.length > 0 && thisWeekMissions.every(m => completedMissions.includes(m.id));

  // Calcola lead che necessitano follow-up oggi
  const leadsNeedingFollowup = contacts.filter(c => {
    if (!c.contactedAt || c.status === "convertito" || c.status === "collaboratore" || c.status === "archiviato") return false;
    const days = Math.floor((Date.now() - new Date(c.contactedAt).getTime()) / 86400000);
    return [2, 5, 10, 21].includes(days);
  });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 92, fontFamily: "'Playfair Display', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
        .anim { animation: fadeIn 0.25s ease; }
        input, select, textarea { background: ${T.inputBg}; border: 1px solid ${T.border}; border-radius: 10px; color: ${T.text}; padding: 11px 14px; font-family: 'DM Sans',sans-serif; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: ${T.accent}; }
        input::placeholder, textarea::placeholder { color: ${T.muted}; }
        select option { background: ${T.surface}; }
        .mission-card { cursor: pointer; transition: all 0.15s; }
        .mission-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: T.accent, color: "#0a0a0f", padding: "11px 24px", borderRadius: 50, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, zIndex: 999, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {showRecovery && <RecoverySystem onClose={() => setShowRecovery(false)} userProfile={userProfile} />}

      {/* Mission Modal */}
      {showMission && (
        <div onClick={() => setShowMission(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.card, borderRadius: "24px 24px 0 0", padding: 24, width: "100%", maxHeight: "88vh", overflowY: "auto", borderTop: `2px solid ${T.accent}`, animation: "slideUp 0.25s ease" }}>
            {/* Mission header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <span style={{ display: "inline-block", background: "rgba(232,197,71,0.15)", color: T.accent, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 700, marginBottom: 8 }}>
                  {showMission.channel === "whatsapp" ? "💬 WhatsApp" : showMission.channel === "social" ? "📱 Social" : "🤝 Offline"}
                </span>
                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>{showMission.title}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: T.accent }}>+{showMission.points}</div>
                <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans'" }}>punti</div>
              </div>
            </div>

            {/* Obiettivo */}
            <div style={{ background: T.surface, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🎯 Obiettivo</div>
              <div style={{ fontSize: 14, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.6 }}>{showMission.objective}</div>
            </div>

            {/* Azioni numerate */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Azioni concrete:</div>
              {showMission.actions.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.accent, color: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0, fontFamily: "'DM Sans'" }}>{i + 1}</div>
                  <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.6, paddingTop: 2 }}>{a}</div>
                </div>
              ))}
            </div>

            {/* Script */}
            {showMission.script && (
              <div style={{ background: "rgba(232,197,71,0.07)", border: `1px solid rgba(232,197,71,0.25)`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>💬 {showMission.script.label}</div>
                <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.7, marginBottom: 12 }}>{showMission.script.text}</div>
                <Btn variant="soft" onClick={() => copyScript(showMission.script.text, showMission.id)} style={{ fontSize: 12 }}>
                  {copiedId === showMission.id ? "✓ Copiato!" : "Copia Script"}
                </Btn>
              </div>
            )}

            {/* KPI + Why */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ background: T.surface, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>KPI</div>
                <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.text }}>{showMission.kpi}</div>
              </div>
              <div style={{ background: T.surface, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>💡 Tip</div>
                <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.5 }}>{showMission.tip}</div>
              </div>
            </div>

            {/* Why */}
            {showMission.why && (
              <div style={{ background: `rgba(107,107,138,0.1)`, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: T.purple, fontFamily: "'DM Sans'", fontWeight: 700, marginBottom: 4 }}>Perché questa missione?</div>
                <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.6 }}>{showMission.why}</div>
              </div>
            )}

            {completedMissions.includes(showMission.id) ? (
              <div style={{ textAlign: "center", padding: "12px 0", background: "rgba(62,207,142,0.1)", border: `1px solid rgba(62,207,142,0.3)`, borderRadius: 50, color: T.green, fontFamily: "'DM Sans'", fontWeight: 700 }}>✓ Già completata!</div>
            ) : (
              <Btn onClick={() => completeMission(showMission)} style={{ width: "100%", textAlign: "center" }}>
                Segna come Completata (+{showMission.points}pt)
              </Btn>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "24px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 18 }}>{lvlInfo?.icon}</span>
            <span style={{ fontSize: 11, color: lvlInfo?.color || T.accent, fontFamily: "'DM Sans'", letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}>{lvlInfo?.label}</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, color: T.text }}>{userProfile?.name}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 50, padding: "6px 14px", fontFamily: "'DM Sans'", fontWeight: 700, color: T.accent, fontSize: 14 }}>⭐ {points}pt</div>
          <ThemeToggle />
          <button onClick={logout} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, padding: "6px 10px", borderRadius: 50, fontSize: 12, fontFamily: "'DM Sans'", cursor: "pointer" }}>↩</button>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }} className="anim">

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginBottom: 2 }}>Settimana {currentWeek} — Obiettivo</div>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>{weeklyClients} <span style={{ fontSize: 14, color: T.muted }}>/ {weekGoal}</span></div>
                </div>
                <div style={{ fontSize: 36 }}>{weeklyClients >= weekGoal ? "🏆" : "🎯"}</div>
              </div>
              <div style={{ background: T.border, borderRadius: 50, height: 8, marginBottom: 14 }}>
                <div style={{ height: 8, borderRadius: 50, background: `linear-gradient(90deg, ${T.accent}, ${T.accentSoft})`, width: `${progress}%`, transition: "width 0.5s" }} />
              </div>
              {weeklyClients >= weekGoal ? (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ flex: 1, fontSize: 13, fontFamily: "'DM Sans'", color: T.green }}>🎉 Obiettivo raggiunto!</div>
                  {currentWeek < 7 && (
                    <Btn variant="soft" onClick={advanceWeek} style={{ fontSize: 12 }}>
                      Settimana {currentWeek + 1} →
                    </Btn>
                  )}
                </div>
              ) : allMissionsDone ? (
                // Tutte le missioni completate → mostra bottone avanza settimana
                <div>
                  <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, marginBottom: 10, textAlign: "center", lineHeight: 1.5 }}>
                    ✅ Tutte le missioni completate!<br />Registra i tuoi risultati nella sezione Contatti, poi avanza.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="soft" onClick={() => setTab("contatti")} style={{ flex: 1, fontSize: 12, textAlign: "center" }}>
                      📋 Vai ai Contatti
                    </Btn>
                    {currentWeek < 7 && (
                      <Btn variant="ghost" onClick={advanceWeek} style={{ flex: 1, fontSize: 12, textAlign: "center" }}>
                        Settimana {currentWeek + 1} →
                      </Btn>
                    )}
                  </div>
                </div>
              ) : (
                // Missioni ancora in corso → piccolo bottone + link a contatti
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setTab("contatti")}
                    style={{ flex: 1, background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, borderRadius: 50, padding: "10px 12px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  >
                    + Aggiungi Lead / Cliente
                  </button>
                </div>
              )}
            </Card>

            {/* Roadmap */}
            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🗺 Percorso 7 Settimane</div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {Array.from({ length: 7 }, (_, i) => i + 1).map(w => {
                  const t = lvlInfo?.weeklyTarget?.[w - 1] || w;
                  return (
                    <div key={w} style={{ flexShrink: 0, textAlign: "center", width: 54 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", margin: "0 auto 6px", background: w < currentWeek ? T.green : w === currentWeek ? T.accent : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: w <= currentWeek ? "#0a0a0f" : T.muted }}>
                        {w < currentWeek ? "✓" : w}
                      </div>
                      <div style={{ fontSize: 9, fontFamily: "'DM Sans'", color: w === currentWeek ? T.accent : T.muted }}>{t}/sett</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Banner follow-up lead in scadenza */}
            {leadsNeedingFollowup.length > 0 && (
              <div onClick={() => setTab("contatti")} style={{ background: "rgba(107,79,168,0.1)", border: "1px solid rgba(107,79,168,0.3)", borderRadius: 14, padding: "12px 16px", marginBottom: 14, cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 24 }}>⏰</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6B4FA8", fontFamily: "'Playfair Display'" }}>
                    {leadsNeedingFollowup.length} lead {leadsNeedingFollowup.length === 1 ? "aspetta" : "aspettano"} il follow-up
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted }}>Tocca per vedere chi contattare oggi</div>
                </div>
                <span style={{ color: T.muted }}>→</span>
              </div>
            )}

            {/* Recovery banner — appare dalla settimana 3 senza risultati */}
            {showRecoveryBanner && (
              <div onClick={() => setShowRecovery(true)} style={{ background: T.redBg, border: `1px solid ${T.red}44`, borderRadius: 14, padding: "14px 18px", marginBottom: 14, cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 28 }}>🔄</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.red, fontFamily: "'Playfair Display'", marginBottom: 2 }}>Nessun risultato ancora?</div>
                  <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.5 }}>Analizziamo il blocco e creiamo un piano personalizzato per te.</div>
                </div>
                <span style={{ color: T.muted, fontSize: 18 }}>→</span>
              </div>
            )}

            {/* Missioni settimana corrente */}
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>⚡ Missioni Settimana {currentWeek}</div>
            {thisWeekMissions.length === 0 ? (
              <Card><div style={{ fontFamily: "'DM Sans'", fontSize: 13, color: T.muted, textAlign: "center", padding: "16px 0" }}>Nessuna missione per questa settimana al tuo livello.</div></Card>
            ) : thisWeekMissions.map(m => {
              const done = completedMissions.includes(m.id);
              return (
                <div key={m.id} className="mission-card" onClick={() => setShowMission(m)} style={{ background: done ? "rgba(62,207,142,0.07)" : T.card, border: `1px solid ${done ? "rgba(62,207,142,0.25)" : T.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: done ? "rgba(62,207,142,0.15)" : "rgba(232,197,71,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {done ? "✅" : m.channel === "whatsapp" ? "💬" : m.channel === "social" ? "📱" : "🤝"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.kpi}</div>
                  </div>
                  <div style={{ color: done ? T.green : T.accent, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>+{m.points}pt</div>
                </div>
              );
            })}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
              {[
                { label: "Missioni", value: completedMissions.length, icon: "⚡" },
                { label: "Contatti", value: contacts.length, icon: "👥" },
                { label: "Convertiti", value: contacts.filter(c => c.status === "convertito" || c.status === "collaboratore").length, icon: "✅" },
              ].map(s => (
                <Card key={s.label} style={{ padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 18 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: T.accent, lineHeight: 1.2 }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── MISSIONI ── */}
        {tab === "missioni" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Tutte le Missioni</div>
            <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginBottom: 16 }}>Percorso {lvlInfo?.icon} {lvlInfo?.label} · {completedMissions.length}/{missions.length} completate</div>

            {/* Progress bar livello */}
            <div style={{ background: T.border, borderRadius: 50, height: 6, marginBottom: 20 }}>
              <div style={{ height: 6, borderRadius: 50, background: `linear-gradient(90deg, ${lvlInfo?.color || T.accent}, ${T.accentSoft})`, width: `${Math.min((completedMissions.length / Math.max(missions.length, 1)) * 100, 100)}%`, transition: "width 0.5s" }} />
            </div>

            {[1, 2, 3, 4, 5, 6, 7].map(w => {
              const wm = missions.filter(m => m.week === w);
              if (!wm.length) return null;
              const wLabels = ["🌱 Settimana 1", "🌿 Settimana 2", "🔥 Settimana 3", "💪 Settimana 4", "🚀 Settimana 5", "⭐ Settimana 6", "🏆 Settimana 7"];
              return (
                <div key={w} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: w === currentWeek ? T.accent : T.muted, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{wLabels[w - 1]}</div>
                  {wm.map(m => {
                    const done = completedMissions.includes(m.id);
                    return (
                      <div key={m.id} className="mission-card" onClick={() => setShowMission(m)} style={{ background: done ? "rgba(62,207,142,0.06)" : T.card, border: `1px solid ${done ? "rgba(62,207,142,0.2)" : T.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: done ? "rgba(62,207,142,0.15)" : "rgba(232,197,71,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                          {done ? "✅" : m.channel === "whatsapp" ? "💬" : m.channel === "social" ? "📱" : "🤝"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{m.title}</div>
                          <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'" }}>{m.kpi}</div>
                        </div>
                        <div style={{ color: done ? T.green : T.accent, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13 }}>+{m.points}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ── CONTATTI ── */}
        {tab === "contatti" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Contatti</div>
            <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginBottom: 20 }}>Ogni contatto è sincronizzato in tempo reale</div>

            {/* Pipeline counts */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = contacts.filter(c => c.status === key).length;
                return (
                  <div key={key} style={{ flexShrink: 0, background: cfg.bg, borderRadius: 10, padding: "8px 12px", textAlign: "center", minWidth: 68, border: `1px solid ${cfg.color}33` }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: cfg.color, fontFamily: "'DM Sans'" }}>{count}</div>
                    <div style={{ fontSize: 9, color: cfg.color, fontFamily: "'DM Sans'", fontWeight: 700 }}>{cfg.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Form nuovo contatto */}
            <Card style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: T.text }}>+ Nuovo Contatto</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input placeholder="Nome e cognome *" value={nc.name} onChange={e => setNc(p => ({ ...p, name: e.target.value }))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <select value={nc.type} onChange={e => setNc(p => ({ ...p, type: e.target.value }))}>
                    <option value="lead">🔍 Lead</option>
                    <option value="cliente">👤 Cliente</option>
                    <option value="collaboratore">🤝 Collaboratore</option>
                  </select>
                  <select value={nc.channel} onChange={e => setNc(p => ({ ...p, channel: e.target.value }))}>
                    <option value="">Canale...</option>
                    {CHANNEL_OPTIONS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                  </select>
                </div>
                <select value={nc.status} onChange={e => setNc(p => ({ ...p, status: e.target.value }))}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <textarea placeholder="Note (interessi, prossimo passo...)" rows={2} value={nc.note} onChange={e => setNc(p => ({ ...p, note: e.target.value }))} style={{ resize: "none" }} />
                <Btn onClick={addContact}>Aggiungi</Btn>
              </div>
            </Card>

            {contacts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: T.muted, fontFamily: "'DM Sans'" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ lineHeight: 1.8 }}>Inizia con la Lista dei 20!<br />Aggiungi i tuoi primi lead qui.</div>
              </div>
            ) : contacts.map(c => {
              const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.nuovo;
              const daysSince = c.contactedAt
                ? Math.floor((Date.now() - new Date(c.contactedAt).getTime()) / 86400000)
                : null;
              const needsFollowup = daysSince !== null && [2,5,10,21].includes(daysSince) &&
                !["convertito","collaboratore","archiviato"].includes(c.status);
              const followupLabel = needsFollowup
                ? `⏰ Follow-up oggi! (Giorno ${daysSince})`
                : daysSince !== null ? `Contattato ${daysSince}g fa` : null;
              return (
                <Card key={c.id} style={{ marginBottom: 12, border: needsFollowup ? `2px solid #6B4FA8` : undefined }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{c.name}</div>
                      <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted, marginTop: 3 }}>
                        {c.type === "lead" ? "🔍" : c.type === "cliente" ? "👤" : "🤝"} {c.type}{c.channel && ` · ${c.channel}`}
                      </div>
                      {followupLabel && (
                        <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: needsFollowup ? "#6B4FA8" : T.muted, fontWeight: needsFollowup ? 700 : 400, marginTop: 4 }}>
                          {followupLabel}
                        </div>
                      )}
                      {c.note && <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, marginTop: 6, lineHeight: 1.5 }}>{c.note}</div>}
                    </div>
                    <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{cfg.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <button key={key} onClick={() => updateStatus(c.id, key)} style={{ background: c.status === key ? val.bg : "transparent", border: `1px solid ${c.status === key ? val.color : T.border}`, color: c.status === key ? val.color : T.muted, padding: "3px 9px", borderRadius: 20, fontSize: 10, cursor: "pointer", fontFamily: "'DM Sans'", fontWeight: 600, transition: "all 0.1s" }}>
                        {val.label}
                      </button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── SCRIPT ── */}
        {tab === "script" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Script & Obiezioni</div>
            <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginBottom: 20 }}>Personalizzati per il livello {lvlInfo?.icon} {lvlInfo?.label}</div>

            {missions.filter(m => m.script).map((m, i) => (
              <div key={m.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, marginBottom: 12, borderLeft: `3px solid ${T.accent}` }}>
                <div style={{ fontSize: 10, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{m.script.label}</div>
                <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.7, marginBottom: 12 }}>{m.script.text}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'" }}>Missione: {m.title}</div>
                  <Btn variant="soft" onClick={() => copyScript(m.script.text, m.id)} style={{ fontSize: 11, padding: "6px 14px" }}>
                    {copiedId === m.id ? "✓ Copiato!" : "Copia"}
                  </Btn>
                </div>
              </div>
            ))}

            {/* Obiezioni */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🛡 Gestione Obiezioni</div>
              {[
                { q: '"Non ho tempo"', a: '"Capisco. Non è un secondo lavoro: si inizia con 1 ora a settimana. Poi cresci ai tuoi ritmi."' },
                { q: '"È troppo caro"', a: '"Ha senso chiederlo. Posso mostrarti il confronto qualità-prezzo? Spesso la differenza sorprende."' },
                { q: '"Devo pensarci"', a: '"Certo, è giusto! Cosa ti manca per decidere? Proviamo a rispondere insieme adesso."' },
                { q: '"Non sono il tipo da vendite"', a: '"Neanch\'io lo sono. Qui non si vende: si condivide quello che usi già. È molto diverso."' },
                { q: '"Ho già provato altri MLM"', a: '"Capisco la diffidenza. Cosa non ha funzionato prima? Così vedo se qui è davvero diverso per te."' },
              ].map((o, i) => (
                <Card key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.red, fontWeight: 700, marginBottom: 8 }}>❝ {o.q}</div>
                  <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.7 }}>→ {o.a}</div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.navBg, borderTop: `1px solid ${T.border}`, padding: "10px 8px", display: "flex", backdropFilter: "blur(12px)" }}>
        {[
          { id: "dashboard", icon: "🏠", label: "Home" },
          { id: "missioni",  icon: "⚡", label: "Missioni" },
          { id: "contatti",  icon: "👥", label: "Contatti" },
          { id: "script",    icon: "💬", label: "Script" },
        ].map(n => (
          <div key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", cursor: "pointer", borderRadius: 10, background: tab === n.id ? T.accentBg : "none" }}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontFamily: "'DM Sans'", fontWeight: 600, color: tab === n.id ? T.accent : T.muted }}>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
