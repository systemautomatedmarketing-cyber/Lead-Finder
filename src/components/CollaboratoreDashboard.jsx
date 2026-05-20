// src/components/CollaboratoreDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import {
  doc, collection, onSnapshot,
  addDoc, updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme, ThemeToggle, ThemePicker, ColorPickerDropdown } from "../context/ThemeContext";
import { MISSIONS_BY_LEVEL, LEVELS, TOTAL_WEEKS, getPhase } from "../data/missions";
import RecoverySystem from "./RecoverySystem";
import HomeDashboard from "./HomeDashboard";
import OnboardingTour, { RestartTourButton } from "./OnboardingTour";
import PWAInstallBanner from "./PWAInstallBanner";
import { isInstalledPWA } from "../utils/pwa";
import NotificationSettings from "./NotificationSettings";
import PlansTab from "./PlansTab";
import { setupFollowupScheduler, notifyWeeklyGoalReached } from "../utils/notifications";
import RoleToggle from "./RoleToggle";
//import MiniLeaderDashboard from "./MiniLeaderDashboard";
import { useDualRole } from "../hooks/useDualRole";
import { usePlan } from "../context/PlanContext";
import LeaderDashboard from "./LeaderDashboard";

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
  const dualRole = useDualRole();
  const { can, onTrial, planId } = usePlan();
  const uid     = userProfile?.uid;
  const level   = userProfile?.level || "principiante";
  const lvlInfo = LEVELS[level];
  const missions = MISSIONS_BY_LEVEL[level] || [];

  // ── TUTTI gli hooks PRIMA di qualsiasi return condizionale ──
  const [tab, setTab]               = useState("dashboard");
  const [toast, setToast]           = useState(null);
  const [contacts, setContacts]     = useState([]);
  const [showMission, setShowMission] = useState(null);
  const [copiedId, setCopiedId]     = useState(null);
  const [showRecovery, setShowRecovery]       = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [pwaShowNow, setPwaShowNow]               = useState(false);
  const [pwaInstalled, setPwaInstalled]           = useState(() => isInstalledPWA());
  const [nc, setNc] = useState({ name: "", type: "lead", status: "lead", channel: "", note: "" });

  // Mostra banner recovery se settimana >= 3 e 0 clienti
  const showRecoveryBanner = (userProfile?.currentWeek || 1) >= 3 && (userProfile?.weeklyClients || 0) === 0;

  // ── Ora è sicuro fare il return condizionale — tutti gli hooks sono già chiamati ──
//  if (dualRole.hasBothRoles && dualRole.activeView === "leader") {
//    return (
//      <MiniLeaderDashboard
//        onSwitchBack={() => dualRole.switchView("collaboratore")}
//        teamMembers={dualRole.teamMembers}
//        myInviteCode={dualRole.myInviteCode}
//        uplineName={dualRole.uplineName}
//        promoteToLeader={dualRole.promoteToLeader}
//        promoting={dualRole.promoting}
//        generateMyInviteCode={dualRole.generateMyInviteCode}
//      />
//    );
//  }

  const fire = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // ── Derived da userProfile ────────────────────────────────
  const currentWeek      = userProfile?.currentWeek || 1;
  const weeklyClients    = userProfile?.weeklyClients || 0;
  const points           = userProfile?.points || 0;
  const completedMissions= userProfile?.completedMissions || [];
  const weekGoal         = lvlInfo?.weeklyTarget?.[Math.min(currentWeek - 1, TOTAL_WEEKS - 1)] || currentWeek;
  const progress         = Math.min((weeklyClients / weekGoal) * 100, 100);

  // ── Contatti real-time da Firestore ──────────────────────
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(collection(db, "users", uid, "contacts"), (snap) => {
      setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [uid]);

  // ── Scheduler notifiche follow-up ─────────────────────────
  useEffect(() => {
    if (!contacts.length || !userProfile?.notificationsEnabled) return;
    const cleanup = setupFollowupScheduler(
      contacts,
      userProfile?.name || "",
      (dueContacts) => {
        // Il banner nell'app è già gestito da leadsNeedingFollowup
        // Qui gestiamo solo la notifica browser
      }
    );
    return cleanup;
  }, [contacts, userProfile?.notificationsEnabled]);

  // ── Notifica quando si raggiunge l'obiettivo ───────────────
  useEffect(() => {
    if (weeklyClients >= weekGoal && weekGoal > 0 && userProfile?.notificationsEnabled) {
      notifyWeeklyGoalReached(currentWeek);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeklyClients, weekGoal]);

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
    if (currentWeek >= TOTAL_WEEKS) return;
    // Controlla se il piano permette la settimana successiva
    if (!can.accessWeek(currentWeek + 1)) {
      setTab("piani");
      fire("🔒 Settimana bloccata — passa al piano Pro!");
      return;
    }
    await updateProfile({ currentWeek: currentWeek + 1, weeklyClients: 0 });
    fire(`Settimana ${currentWeek + 1} iniziata! 🚀`);
  };

  // ── CRUD Contatti ─────────────────────────────────────────
  const addContact = async () => {
    if (!nc.name.trim()) return;
    // Controlla limite contatti del piano
    if (!can.addContact(contacts.length)) {
      setTab("piani");
      fire("🔒 Limite 20 contatti raggiunto — passa al Pro!");
      return;
    }
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
      {showNotifSettings && <NotificationSettings onClose={() => setShowNotifSettings(false)} />}

      {/* ── ONBOARDING TOUR ── */}
      <OnboardingTour
        role="collaboratore"
        hasBothRoles={dualRole.hasBothRoles}
        onTabChange={setTab}
        onCopyCode={() => {
          if (userProfile?.inviteCode) {
            navigator.clipboard?.writeText(userProfile.inviteCode);
            fire("Codice copiato! 📋");
          }
        }}
      />

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
          {dualRole.hasUpline && (
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", marginTop: 2 }}>
              Upline: {dualRole.uplineName}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {can.allScripts() ? (
            <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 50, padding: "6px 14px", fontFamily: "'DM Sans'", fontWeight: 700, color: T.accent, fontSize: 14 }}>⭐ {points}pt</div>
          ) : (
            <div onClick={() => setTab("piani")} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 50, padding: "6px 14px", fontFamily: "'DM Sans'", fontWeight: 600, color: T.muted, fontSize: 12, cursor: "pointer" }}>🔒 Pro</div>
          )}
          <button
            onClick={() => setShowNotifSettings(true)}
            title="Impostazioni notifiche"
            style={{ background: userProfile?.notificationsEnabled ? T.accentBg : "none", border: `1px solid ${userProfile?.notificationsEnabled ? T.accentBorder : T.border}`, borderRadius: 50, padding: "6px 10px", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
          >
            {userProfile?.notificationsEnabled ? "🔔" : "🔕"}
          </button>
          <button
            onClick={() => { if (!pwaInstalled) setPwaShowNow(true); }}
            title={pwaInstalled ? "App già installata" : "Installa l'app"}
            disabled={pwaInstalled}
            style={{ background: "none", border: `1px solid ${T.border}`, color: pwaInstalled ? T.muted : T.text, borderRadius: 50, padding: "6px 8px", cursor: pwaInstalled ? "default" : "pointer", opacity: pwaInstalled ? 0.35 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="2" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <ColorPickerDropdown />
          <ThemeToggle />
          <button onClick={logout} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, padding: "6px 10px", borderRadius: 50, fontSize: 12, fontFamily: "'DM Sans'", cursor: "pointer" }}>↩</button>
        </div>
      </div>

      {/* Banner "Diventa Leader" — mostra sempre dopo 5 missioni completate */}
      {(userProfile?.completedMissions?.length || 0) >= 5 && (
        <div style={{ margin: "12px 16px 0", background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>👑</span>
          <div style={{ flex: 1 }}>
            {userProfile?.inviteCode ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: "'DM Sans'" }}>
                  <span id="tour-invite-code">Codice: <span style={{ letterSpacing: 2 }}>{userProfile.inviteCode}</span></span>
                </div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", marginTop: 2 }}>
                  Condividilo e usa la tab 👑 <strong>Team</strong> per gestire il tuo sotto-team.
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: "'DM Sans'" }}>Pronto a reclutare?</div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'" }}>Genera il codice invito — la tab Team apparirà subito.</div>
              </>
            )}
          </div>
          {userProfile?.inviteCode ? (
            <button
              onClick={() => { navigator.clipboard?.writeText(userProfile.inviteCode); setToast("Codice copiato! 📋"); }}
              style={{ background: T.surface, color: T.accent, border: `1px solid ${T.accentBorder}`, borderRadius: 50, padding: "7px 14px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
              Copia
            </button>
          ) : (
            <button
              onClick={async () => {
                const c = await dualRole.generateMyInviteCode();
                navigator.clipboard?.writeText(c);
                setToast("Codice creato! Ora hai la tab 👑 Team 🎉");
              }}
              style={{ background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "7px 14px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
              Genera
            </button>
          )}
        </div>
      )}

      <div style={{ padding: "16px 16px 0" }} className="anim">

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <HomeDashboard
              userProfile={userProfile}
              T={T}
              currentWeek={currentWeek}
              weeklyClients={weeklyClients}
              weekGoal={weekGoal}
              completedMissions={completedMissions}
              contacts={contacts}
              thisWeekMissions={thisWeekMissions}
              progress={progress}
              allMissionsDone={allMissionsDone}
              leadsNeedingFollowup={leadsNeedingFollowup}
              showRecoveryBanner={showRecoveryBanner}
              can={can}
              onAdvanceWeek={advanceWeek}
              onTabChange={setTab}
              onRegisterClient={registerClient}
              onShowMission={setShowMission}
              onShowRecovery={() => setShowRecovery(true)}
            />
          </div>
        )}

                {/* ── MISSIONI ── */}
        {tab === "missioni" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Tutte le Missioni</div>
            <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginBottom: 16 }}>
              Percorso {lvlInfo?.icon} {lvlInfo?.label} · {completedMissions.length}/{missions.filter(m => can.accessWeek(m.week)).length} completate
            </div>

            {/* Progress bar */}
            <div style={{ background: T.border, borderRadius: 50, height: 6, marginBottom: 20 }}>
              <div style={{ height: 6, borderRadius: 50, background: `linear-gradient(90deg, ${lvlInfo?.color || T.accent}, ${T.accentSoft})`, width: `${Math.min((completedMissions.length / Math.max(missions.filter(m => can.accessWeek(m.week)).length, 1)) * 100, 100)}%`, transition: "width 0.5s" }} />
            </div>

            {/* Fasi e settimane — tutte le 26, con lock per piano Starter */}
            {[
              { fase: 1, label: "Fase 1 — Fondamenta", weeks: [1,2,3,4,5,6,7],     color: "#1A7A4A" },
              { fase: 2, label: "Fase 2 — Slancio",    weeks: [8,9,10,11,12,13,14,15,16], color: "#1A5FA8" },
              { fase: 3, label: "Fase 3 — Scalabilità",weeks: [17,18,19,20,21,22,23,24,25,26], color: "#B8860B" },
            ].map(({ fase, label, weeks, color }) => {
              // Controlla se almeno una settimana di questa fase ha missioni
              const faseHasMissions = weeks.some(w => missions.some(m => m.week === w));
              if (!faseHasMissions) return null;

              // Prima settimana bloccata in questa fase (se esiste)
              const firstLockedWeek = weeks.find(w => !can.accessWeek(w) && missions.some(m => m.week === w));

              return (
                <div key={fase} style={{ marginBottom: 28 }}>
                  {/* Header fase */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ height: 2, width: 16, background: color, borderRadius: 2 }} />
                    <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                    <div style={{ flex: 1, height: 1, background: T.border }} />
                  </div>

                  {weeks.map(w => {
                    const wm = missions.filter(m => m.week === w);
                    if (!wm.length) return null;

                    const isLocked   = !can.accessWeek(w);
                    const isCurrent  = w === currentWeek;
                    const isDone     = wm.every(m => completedMissions.includes(m.id));
                    const isFirst    = w === firstLockedWeek; // mostra banner Pro solo sulla prima settimana bloccata

                    return (
                      <div key={w} style={{ marginBottom: 20 }}>
                        {/* Header settimana */}
                        <div style={{ fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8, color: isCurrent ? T.accent : isLocked ? T.muted : T.text }}>
                          {isDone ? "✅" : isLocked ? "🔒" : isCurrent ? "▶" : "○"}
                          {" "}Settimana {w}
                          {isCurrent && <span style={{ background: T.accentBg, color: T.accent, padding: "2px 8px", borderRadius: 20, fontSize: 10 }}>Corrente</span>}
                          {isLocked && <span style={{ background: T.surface, color: T.muted, padding: "2px 8px", borderRadius: 20, fontSize: 10, border: `1px solid ${T.border}` }}>Bloccata</span>}
                        </div>

                        {/* Banner upgrade — solo sulla prima settimana bloccata di ogni fase */}
                        {isLocked && isFirst && (
                          <div
                            onClick={() => setTab("piani")}
                            style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}
                          >
                            <span style={{ fontSize: 28 }}>🔒</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: "'DM Sans'", marginBottom: 2 }}>
                                Settimane {firstLockedWeek}–{weeks[weeks.length - 1]} bloccate
                              </div>
                              <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.5 }}>
                                Il piano Starter include solo le prime 5 settimane. Passa al <strong>Collaboratore Pro</strong> per sbloccare il percorso completo di 26 settimane.
                              </div>
                            </div>
                            <div style={{ background: T.accent, color: "#0a0a0f", borderRadius: 50, padding: "7px 14px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                              Sblocca →
                            </div>
                          </div>
                        )}

                        {/* Missioni della settimana — dimmed se bloccata */}
                        {wm.map(m => {
                          const done = completedMissions.includes(m.id);
                          return (
                            <div
                              key={m.id}
                              className="mission-card"
                              onClick={() => { if (!isLocked) setShowMission(m); else setTab("piani"); }}
                              style={{ background: isLocked ? T.surface : done ? "rgba(62,207,142,0.06)" : T.card, border: `1px solid ${isLocked ? T.border : done ? "rgba(62,207,142,0.2)" : T.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", gap: 12, alignItems: "center", opacity: isLocked ? 0.45 : 1, cursor: isLocked ? "pointer" : "pointer" }}
                            >
                              <div style={{ width: 40, height: 40, borderRadius: 12, background: isLocked ? T.border : done ? "rgba(62,207,142,0.15)" : "rgba(232,197,71,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                                {isLocked ? "🔒" : done ? "✅" : m.channel === "whatsapp" ? "💬" : m.channel === "social" ? "📱" : "🤝"}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, color: isLocked ? T.muted : T.text }}>{m.title}</div>
                                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'" }}>{isLocked ? "Disponibile con il piano Pro" : m.kpi}</div>
                              </div>
                              <div style={{ color: isLocked ? T.muted : done ? T.green : T.accent, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13 }}>
                                {isLocked ? "🔒" : `+${m.points}`}
                              </div>
                            </div>
                          );
                        })}
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

            {/* Banner limite contatti per piano Starter */}
            {!can.addContact(contacts.length) && (
              <div onClick={() => setTab("piani")} style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: "12px 16px", marginBottom: 14, cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>🔒</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: "'DM Sans'" }}>Limite 20 contatti raggiunto</div>
                  <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted }}>Passa al Collaboratore Pro per contatti illimitati.</div>
                </div>
                <span style={{ color: T.accent, fontWeight: 700, fontSize: 12, fontFamily: "'DM Sans'" }}>Upgrade →</span>
              </div>
            )}

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
                <Btn
                  onClick={addContact}
                  disabled={!can.addContact(contacts.length)}
                  style={{ opacity: can.addContact(contacts.length) ? 1 : 0.4 }}
                >
                  {can.addContact(contacts.length) ? "Aggiungi" : `🔒 Limite raggiunto (${contacts.length}/20)`}
                </Btn>
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
            <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginBottom: 4 }}>Personalizzati per il livello {lvlInfo?.icon} {lvlInfo?.label}</div>
{ console.log("can.allScripts = ", can.allScripts()) }
{  console.log("can = ", can) }
            {!can.allScripts() && (
              <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
                <span>🔒</span>
                <div style={{ flex: 1, fontSize: 12, fontFamily: "'DM Sans'", color: T.muted }}>
                  Piano Starter: accesso a 3 script base. <button onClick={() => setTab("piani")} style={{ background: "none", border: "none", color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Passa al Pro →</button>
                </div>
              </div>
            )}

            {(() => {
              const allScripts = missions.filter(m => m.script);
              const visibleScripts = can.allScripts() ? allScripts : allScripts.slice(0, 3);
              const lockedCount = allScripts.length - visibleScripts.length;
              return (
                <>
                  {visibleScripts.map((m, i) => (
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
                  {lockedCount > 0 && (
                    <div onClick={() => setTab("piani")} style={{ background: T.surface, border: `2px dashed ${T.border}`, borderRadius: 14, padding: 20, textAlign: "center", cursor: "pointer", marginBottom: 12 }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>🔒</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'", marginBottom: 4 }}>+{lockedCount} script bloccati</div>
                      <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'" }}>Passa al Collaboratore Pro per sbloccarli tutti</div>
                    </div>
                  )}
                </>
              );
            })()}

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

        {/* ── TAB TEAM — solo per collaboratori con isLeader=true ── */}
        {(dualRole.isLeader || !!userProfile?.inviteCode) && tab === "team" && (
          <LeaderDashboard isEmbedded={true} />
        )}

        {/* TAB PIANI */}
        {tab === "piani" && (
          <div style={{ padding: "0 4px" }}>
            <PlansTab />
          </div>
        )}

        {/* TAB IMPOSTAZIONI */}
        {tab === "impostazioni" && (
          <div style={{ padding: "0 4px" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: "'Playfair Display'", marginBottom: 20 }}>
              ⚙️ Impostazioni
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'", marginBottom: 16 }}>
                🎨 Aspetto
              </div>
              <ThemePicker />
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'", marginBottom: 12 }}>
                🎓 Tour Guidato
              </div>
              <RestartTourButton tourKey="collab" label="Rivedi il tour collaboratore" />
              {dualRole.hasBothRoles && (
                <div style={{ marginTop: 10 }}>
                  <RestartTourButton tourKey="dual" label="Rivedi il tour team" />
                </div>
              )}
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'", marginBottom: 10 }}>
                👤 Account
              </div>
              <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted, marginBottom: 14 }}>
                {userProfile?.email}
              </div>
              <button onClick={logout} style={{ background: T.redBg, border: `1px solid ${T.red}44`, color: T.red, borderRadius: 50, padding: "10px 20px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Esci dall'account
              </button>
            </div>
          </div>
        )}

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.navBg, borderTop: `1px solid ${T.border}`, padding: "10px 8px", display: "flex", backdropFilter: "blur(12px)" }}>
        {[
          { id: "dashboard", icon: "🏠", label: "Home" },
          { id: "missioni",  icon: "⚡", label: "Missioni" },
          { id: "contatti",  icon: "👥", label: "Contatti" },
          { id: "script",    icon: "💬", label: "Script" },
          ...((dualRole.isLeader || !!userProfile?.inviteCode) ? [{ id: "team", icon: "👑", label: `Team${dualRole.teamSize > 0 ? ` (${dualRole.teamSize})` : ""}` }] : []),
          { id: "piani",       icon: "💎", label: "Piani" },
          { id: "impostazioni", icon: "⚙️", label: "Impost." },
        ].map(n => (
          <div key={n.id} id={n.id === "script" ? "tour-scripts-tab" : n.id === "team" ? "tour-team-tab" : undefined} onClick={() => setTab(n.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", cursor: "pointer", borderRadius: 10, background: tab === n.id ? T.accentBg : "none" }}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontFamily: "'DM Sans'", fontWeight: 600, color: tab === n.id ? T.accent : T.muted }}>{n.label}</span>
          </div>
        ))}
      </div>
      <PWAInstallBanner forceShow={pwaShowNow} onShown={() => setPwaShowNow(false)} />
    </div>
  );
}
