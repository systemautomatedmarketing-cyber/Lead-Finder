// src/components/LeaderDashboard.jsx
import { useState, useEffect } from "react";
import WeeklyReport from "./WeeklyReport";
import { PaywallModal } from "./PricingScreen";
import LeaderMissions from "./LeaderMissions";
import HomeLeader from "./HomeLeader";
import OnboardingTour, { RestartTourButton } from "./OnboardingTour";
import PWAInstallBanner from "./PWAInstallBanner";
import { isInstalledPWA } from "../utils/pwa";
import PlansTab from "./PlansTab";
import UplineConnect from "./UplineConnect";
import NotificationSettings from "./NotificationSettings";
import { exportTeamCSV } from "../utils/exportCSV";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { teamVisibleLimit } from "../data/plans";
import { usePlan } from "../context/PlanContext";
import { useTheme, ThemeToggle, ThemePicker, ColorPickerDropdown } from "../context/ThemeContext";
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
  const { can }                 = usePlan();
  const { T } = useTheme();
  const { promoteToLeader, promoting } = useDualRole();
  const [team, setTeam]         = useState([]);
  const [tab, setTab]           = useState("home");
  const [toast, setToast]       = useState(null);
  const [selectedMember, setSelectedMember]       = useState(null);
  const [showReport, setShowReport]               = useState(false);
  const [expandedLeader, setExpandedLeader]       = useState(null);
  const [showUplineConnect, setShowUplineConnect] = useState(false);
  const [showTeamPaywall, setShowTeamPaywall]     = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [pwaShowNow, setPwaShowNow]               = useState(false);
  const [pwaInstalled, setPwaInstalled]           = useState(() => isInstalledPWA());
  const [deepTeam, setDeepTeam]             = useState([]);

  const fire = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // ── Carica i collaboratori del team in tempo reale ────────
  useEffect(() => {
    if (!userProfile?.uid) return;
    // Carica TUTTI i membri con questo leaderId: collaboratori normali
    // + leader collegati via UplineConnect (role="leader" con leaderId impostato)
    const q = query(
      collection(db, "users"),
      where("leaderId", "==", userProfile.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setTeam(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [userProfile?.uid]);

  // ── Scheduler notifiche follow-up ─────────────────────────
{/*  useEffect(() => {
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
  }, [contacts, userProfile?.notificationsEnabled]); */}
	

  // ── Carica collaboratori di 2° livello ─────────────────────
  useEffect(() => {
    if (!team.length) { setDeepTeam([]); return; }
    const subLeaderIds = team.filter(m => m.isLeader).map(m => m.uid || m.id).filter(Boolean);
    if (!subLeaderIds.length) { setDeepTeam([]); return; }
    const batches = [];
    for (let i = 0; i < subLeaderIds.length; i += 30) batches.push(subLeaderIds.slice(i, i + 30));
    const unsubs = batches.map(batch => {
      const q2 = query(collection(db, "users"), where("leaderId", "in", batch));
      return onSnapshot(q2, snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setDeepTeam(prev => [...prev.filter(d => !batch.includes(d.leaderId)), ...docs]);
      });
    });
    return () => unsubs.forEach(u => u());
  }, [team]);

  // ── KPI aggregati ─────────────────────────────────────────
  const totalClients  = team.reduce((s, m) => s + (m.weeklyClients || 0), 0);
  const totalMissions = team.reduce((s, m) => s + (m.completedMissions?.length || 0), 0);

  // Status membro: "risk" | "top" | "new" | "ok"
  // A Rischio: da mercoledì + sotto 50% obiettivo settimanale
  // Top:       raggiunto/superato obiettivo OPPURE vicino + molte missioni
  // Nuovo:     registrato da meno di 7 giorni (non ancora valutabile)
  const _now         = new Date();
  const _day         = _now.getDay(); // 0=dom 1=lun 2=mar 3=mer 4=gio 5=ven 6=sab
  const _wedOrLater  = _day >= 3 || _day === 0; // mercoledì, giovedì, venerdì, sabato, domenica

  const getMemberStatus = (m) => {
    const goal    = m.currentWeek || 1;
    const clients = m.weeklyClients || 0;
    const mCount  = (m.completedMissions || []).length;
    const joined  = m.createdAt?.toDate?.() || (m.createdAt ? new Date(m.createdAt) : null);
    const isNew   = joined && (_now - joined) < 7 * 24 * 60 * 60 * 1000;

    if (isNew) return "new";
    if (clients >= goal) return "top";                              // ha raggiunto obiettivo
    if (mCount >= 3 && clients >= goal * 0.8) return "top";       // quasi obiettivo + molto attivo
    if (_wedOrLater && clients < goal * 0.5) return "risk";        // da mercoledì + sotto 50%
    return "ok";
  };

  const atRisk        = team.filter(m => getMemberStatus(m) === "risk");
  const topPerformers = team.filter(m => getMemberStatus(m) === "top");

  // ── Limite team per piano ─────────────────────────────────
  const planId      = userProfile?.plan || "leader_starter";
  const teamLimit   = teamVisibleLimit(planId);   // -1=illimitato, 5=starter
  const isTeamFull  = teamLimit !== -1 && team.length > teamLimit;
  const visibleTeam = teamLimit === -1 ? team : team.slice(0, teamLimit);



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

        {/* Azioni rapide — Report e Export */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => setShowReport(true)}
            style={{ flex: 1, background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, borderRadius: 50, padding: "10px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            📊 Report Settimanale
          </button>
          {can.exportCSV() && (
            <button
              onClick={() => { exportTeamCSV(team, userProfile?.name || "Leader"); fire("CSV scaricato! 📥"); }}
              style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 50, padding: "10px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              📥 Esporta CSV
            </button>
          )}
        </div>

        {/* Codice invito */}
        <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Il tuo codice invito</div>
            <div id="tour-invite-code" style={{ fontSize: 22, fontWeight: 900, letterSpacing: 3, color: T.accent }}>{userProfile?.inviteCode}</div>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", marginTop: 2 }}>Condividilo con i tuoi nuovi collaboratori</div>
          </div>
          <button onClick={copyInviteCode} style={{ background: T.accent, border: "none", color: "#0a0a0f", padding: "9px 16px", borderRadius: 50, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            Copia
          </button>
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Team",      value: isTeamFull ? `${visibleTeam.length}/${team.length}🔒` : team.length, icon: "👥", color: T.text },
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
            { id: "home",     label: "🏠 Home" },
            { id: "team",     label: "👥 Team" },
            { id: "rete",     label: `🌐 Rete (${deepTeam.length})` },
            { id: "rischio",  label: `⚠️ Rischio (${atRisk.length})` },
            { id: "top",      label: `⭐ Top (${topPerformers.length})` },
            { id: "missioni", label: "⚡ Missioni" },
            { id: "piani",        label: "💎 Piani" },
            { id: "impostazioni", label: "⚙️ Impost." }, 
          ].map(t => (
            <button key={t.id} id={t.id === "missioni" ? "tour-leader-missions-tab" : undefined} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? T.accent : T.surface, border: `1px solid ${tab === t.id ? T.accent : T.border}`, color: tab === t.id ? "#0a0a0f" : T.muted, padding: "7px 14px", borderRadius: 50, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TEAM completo */}
        {tab === "home" && (
          <div>
            <HomeLeader
              team={team}
              deepTeam={deepTeam}
              userProfile={userProfile}
              T={T}
              onTabChange={setTab}
              fire={fire}
              getMemberStatus={getMemberStatus}
            />
          </div>
        )}

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
            ) : (
              <>
                {visibleTeam.map(m => <MemberCard key={m.id} m={m} onUpdateLevel={updateLevel} onSelect={setSelectedMember} fire={fire} onPromote={(member) => { promoteToLeader(member, "manual"); fire(`${member.name} promosso a Leader! 👑`); }} />)}

                {isTeamFull && ( 
                  <div 
                    onClick={() => setShowTeamPaywall(true)} 
                    style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 14, padding: "20px 16px", textAlign: "center", cursor: "pointer", marginTop: 8 }} 
                  > 
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div> 
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "'Playfair Display'", marginBottom: 6 }}> 
                      +{team.length - teamLimit} collaboratori non visibili 
                    </div> 
                    <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted, marginBottom: 16, lineHeight: 1.5 }}> 
                      Con il piano <strong>Starter</strong> vedi solo {teamLimit} collaboratori.<br /> 
                      Passa a <strong style={{ color: T.accent }}>{ userProfile.role === "leader" ? "Leader Pro" : "Collaboratore Pro" }</strong> per gestire il team completo.
                    </div>
                    <div style={{ background: T.accent, color: "#0a0a0f", borderRadius: 50, padding: "10px 24px", display: "inline-block", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13 }}>
                      Passa a { userProfile.role === "leader" ? "Leader Pro" : "Collaboratore Pro" } — 14 giorni gratis 
                    </div> 
                  </div> 
                )} 
              </> 
            )} 
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

        {/* 🌐 RETE — collaboratori di 2° livello */}
        {tab === "rete" && (
          <div>
            {deepTeam.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: T.muted, fontFamily: "'DM Sans'" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🌐</div>
                <div style={{ lineHeight: 1.8 }}>Nessun collaboratore di secondo livello ancora.<br />
                  <span style={{ fontSize: 12 }}>Appariranno quando i tuoi neo-leader inizieranno a reclutare.</span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, marginBottom: 14, lineHeight: 1.6, padding: "10px 14px", background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 10 }}>
                  💡 Questi sono i collaboratori dei tuoi neo-leader. Usa il bottone 📩 per segnalare situazioni critiche al loro leader.
                </div>
                {team.filter(m => m.isLeader).map(leader => {
                  const subs = deepTeam.filter(d => d.leaderId === (leader.uid || leader.id));
                  if (!subs.length) return null;
                  const isExp = expandedLeader === (leader.uid || leader.id);
                  const subRisk = subs.filter(m => (m.weeklyClients||0) < (m.currentWeek||1)*0.5);
                  return (
                    <div key={leader.id} style={{ marginBottom: 14 }}>
                      <div onClick={() => setExpandedLeader(isExp ? null : (leader.uid||leader.id))}
                        style={{ background: T.card, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: isExp ? 8 : 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.accentBg, border: `2px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: T.accent, flexShrink: 0, fontFamily: "'DM Sans'" }}>
                          {(leader.name||"?").split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>👑 {leader.name}
                            <span style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted, marginLeft: 8 }}>· {subs.length} collaboratori</span>
                          </div>
                          {subRisk.length > 0 && <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.red||"#C0392B", marginTop: 2 }}>⚠️ {subRisk.length} a rischio nel suo team</div>}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {subRisk.length > 0 && (
                            <button onClick={e => { e.stopPropagation(); const msg=`Ciao ${leader.name}! Ho visto che ${subRisk.map(m=>m.name).join(", ")} ${subRisk.length===1?"è":"sono"} indietro con gli obiettivi. Come posso aiutarti?`; navigator.clipboard?.writeText(msg); fire("Messaggio copiato! ✉️"); }}
                              style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:T.red||"#C0392B", padding:"5px 10px", borderRadius:50, fontSize:10, fontFamily:"'DM Sans'", fontWeight:700, cursor:"pointer" }}>
                              📩 Segnala
                            </button>
                          )}
                          <span style={{ color: T.muted, fontSize: 14 }}>{isExp ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {isExp && subs.map(sub => {
                        const goal=sub.currentWeek||1; const actual=sub.weeklyClients||0;
                        const pct=Math.min((actual/goal)*100,100); const isRisk=actual<goal*0.5;
                        return (
                          <div key={sub.id} style={{ background:T.card, border:`1px solid ${isRisk?T.red+"44":T.border}`, borderRadius:10, padding:"12px 14px", marginBottom:8, marginLeft:16 }}>
                            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
                              <div style={{ width:28, height:28, borderRadius:"50%", background:T.surface, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:T.text, flexShrink:0, fontFamily:"'DM Sans'" }}>
                                {(sub.name||"?").split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase()}
                              </div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{sub.name}</div>
                                <div style={{ fontSize:11, color:T.muted, fontFamily:"'DM Sans'" }}>Sett.{sub.currentWeek||1} · {sub.completedMissions?.length||0} missioni</div>
                              </div>
                              <div style={{ textAlign:"right" }}>
                                <div style={{ fontSize:16, fontWeight:900, color:isRisk?T.red||"#C0392B":T.accent }}>{actual}</div>
                                <div style={{ fontSize:9, color:T.muted, fontFamily:"'DM Sans'" }}>/{goal} clienti</div>
                              </div>
                            </div>
                            <div style={{ background:T.border, borderRadius:50, height:4 }}>
                              <div style={{ height:4, borderRadius:50, background:isRisk?T.red||"#C0392B":T.accent, width:`${pct}%`, transition:"width 0.5s" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MISSIONI LEADER */}
        {tab === "missioni" && <LeaderMissions />}
        {tab === "piani" && (
          <div style={{ padding: "0 4px" }}>
            <PlansTab />
          </div>
        )}
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
              <RestartTourButton tourKey="leader" label="Rivedi il tour leader" />
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
{/*      </div> */}

      {/* Bottom nav — solo in modalità standalone */}

      {!isEmbedded && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.navBg, borderTop: `1px solid ${T.border}`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(12px)" }}>
          <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: T.muted }}>Leader · {team.length} collaboratori</div>
          <button onClick={logout} style={{ background: T.redBg, border: `1px solid ${T.red}44`, color: T.red, padding: "7px 16px", borderRadius: 50, fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );

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
{/*          <ColorPickerDropdown />
          <ThemeToggle /> */}
        </div>
        {content}
      {showTeamPaywall && (
        <PaywallModal feature="team_size" onClose={() => setShowTeamPaywall(false)} />
      )}
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

      {showReport && (
        <WeeklyReport
          team={team}
          deepTeam={deepTeam}
          leaderName={userProfile?.name || ""}
          onClose={() => setShowReport(false)}
        />
      )}
      {showUplineConnect && (
        <UplineConnect
          onClose={() => setShowUplineConnect(false)}
          onConnected={() => setShowUplineConnect(false)}
        />
      )}
      {showNotifSettings && (
        <NotificationSettings onClose={() => setShowNotifSettings(false)} />
      )}

      {/* ── ONBOARDING TOUR ── */}
      <OnboardingTour
        role="leader"
        hasBothRoles={false}
        onTabChange={setTab}
        onCopyCode={() => {
          navigator.clipboard?.writeText(userProfile?.inviteCode || "");
          fire("Codice copiato! 📋");
        }}
      />

      {showTeamPaywall && (
        <PaywallModal feature="team_size" onClose={() => setShowTeamPaywall(false)} />
      )}
      {/* Header standalone completo */}
      <div style={{ padding: "28px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", letterSpacing: 4, textTransform: "uppercase", marginBottom: 4 }}>Dashboard Leader</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: T.text }}>{userProfile?.name}</div>
          {userProfile?.leaderName ? (
            <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginTop: 2 }}>
              Upline: {userProfile.leaderName}
              {!userProfile?.leaderId && (
                <button onClick={() => setShowUplineConnect(true)} style={{ marginLeft: 8, background: "none", border: "none", color: T.accent, fontSize: 11, fontFamily: "'DM Sans'", cursor: "pointer", fontWeight: 700 }}>Collega upline →</button>
              )}
            </div>
          ) : (
            <button onClick={() => setShowUplineConnect(true)} style={{ background: "none", border: "none", color: T.muted, fontSize: 12, fontFamily: "'DM Sans'", cursor: "pointer", padding: 0, marginTop: 4 }}>
              + Collega il tuo upline
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
{ console.log ("pwaShowNow: ", pwaShowNow) }

      <PWAInstallBanner forceShow={pwaShowNow} onShown={() => setPwaShowNow(false)} />
    </div>
  );
}
