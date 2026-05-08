// src/components/LeaderMissions.jsx
// Missioni ricorrenti per i Leader con tracking e toggle reclutamento

import { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LEADER_MISSIONS_DAILY,
  LEADER_MISSIONS_WEEKLY,
  LEADER_MISSIONS_MONTHLY,
  LEADER_RECRUITMENT_MISSIONS,
  CADENCE_CONFIG,
  isMissionDoneInPeriod,
} from "../data/leaderMissions";

// ── Helper: key Firestore per completamento ───────────────────
function completionKey(missionId, cadence) {
  const now = new Date();
  if (cadence === "daily")   return `${missionId}_${now.toISOString().slice(0,10)}`;
  if (cadence === "weekly")  { const d = new Date(now); d.setDate(d.getDate() - d.getDay()); return `${missionId}_w${d.toISOString().slice(0,10)}`; }
  if (cadence === "monthly") return `${missionId}_${now.getFullYear()}_${now.getMonth()}`;
  return `${missionId}_once`;
}

export default function LeaderMissions() {
  const { userProfile, updateProfile } = useAuth();
  const { T } = useTheme();

  const [completions, setCompletions] = useState({});
  const [showMission, setShowMission] = useState(null);
  const [showRecruitToggle, setShowRecruitToggle] = useState(false);
  const [copiedScript, setCopiedScript] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterCadence, setFilterCadence] = useState("all");

  const fire = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const recruitEnabled  = userProfile?.leaderMissionsEnabled || false;
  const recruitStarted  = userProfile?.leaderMissionsStarted || false;
  const isLeader = userProfile?.role === "leader";

  // ── Carica completamenti da Firestore ─────────────────────
  useEffect(() => {
    if (!userProfile?.uid) return;
    getDoc(doc(db, "users", userProfile.uid)).then(snap => {
      if (snap.exists()) {
        setCompletions(snap.data()?.leaderMissionCompletions || {});
      }
    });
  }, [userProfile?.uid]);

  // ── Controlla se una missione è già completata nel periodo ─
  const isCompleted = (mission) => {
    const key = completionKey(mission.id, mission.cadence);
    const completedAt = completions[key];
    return isMissionDoneInPeriod(completedAt, mission.cadence);
  };

  // ── Completa una missione ─────────────────────────────────
  const completeMission = async (mission) => {
    if (!userProfile?.uid) return;
    setSaving(true);
    const key = completionKey(mission.id, mission.cadence);
    const newCompletions = { ...completions, [key]: new Date().toISOString() };
    setCompletions(newCompletions);

    // Aggiorna punti leader
    const newPoints = (userProfile.leaderPoints || 0) + mission.points;
    await updateDoc(doc(db, "users", userProfile.uid), {
      leaderMissionCompletions: newCompletions,
      leaderPoints: newPoints,
    });

    setSaving(false);
    fire(`+${mission.points} pt — Missione completata! ✅`);
    setShowMission(null);
  };

  // ── Completa missione reclutamento (permanente) ────────────
  const completeRecruitMission = async (mission) => {
    if (!userProfile?.uid) return;
    setSaving(true);
    const newCompletions = {
      ...completions,
      [mission.id]: new Date().toISOString(),
    };
    setCompletions(newCompletions);
    const newPoints = (userProfile.leaderPoints || 0) + mission.points;
    const updates = {
      leaderMissionCompletions: newCompletions,
      leaderPoints: newPoints,
    };
    // Prima missione completata → blocca il toggle
    if (!recruitStarted) updates.leaderMissionsStarted = true;
    await updateDoc(doc(db, "users", userProfile.uid), updates);
    setSaving(false);
    fire(`+${mission.points} pt — Missione reclutamento completata! 🎯`);
    setShowMission(null);
  };

  // ── Attiva il percorso di reclutamento ────────────────────
  const enableRecruitment = async () => {
    setSaving(true);
    await updateProfile({ leaderMissionsEnabled: true });
    setSaving(false);
    setShowRecruitToggle(false);
    fire("Percorso di reclutamento attivato! 🚀");
  };

  // ── Conta missioni completate oggi per il punteggio ───────
  const todayPoints = LEADER_MISSIONS_DAILY
    .filter(m => isCompleted(m))
    .reduce((s, m) => s + m.points, 0);

  const card = {
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 14, padding: 16, boxShadow: T.shadowCard,
  };

  const sections = [
    { label: "Giornaliere", id: "daily",   missions: LEADER_MISSIONS_DAILY,   color: CADENCE_CONFIG.daily.color },
    { label: "Settimanali", id: "weekly",  missions: LEADER_MISSIONS_WEEKLY,   color: CADENCE_CONFIG.weekly.color },
    { label: "Mensili",     id: "monthly", missions: LEADER_MISSIONS_MONTHLY,  color: CADENCE_CONFIG.monthly.color },
  ].filter(s => filterCadence === "all" || filterCadence === s.id);

  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: T.accent, color: "#0a0a0f", padding: "11px 24px", borderRadius: 50, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, zIndex: 999, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* Mission Detail Modal */}
      {showMission && (
        <div onClick={() => setShowMission(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.bg, borderRadius: "24px 24px 0 0", width: "100%", maxHeight: "88vh", overflowY: "auto", padding: 24, borderTop: `3px solid ${T.accent}` }}>
            {/* Header missione */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{showMission.icon}</span>
                  {showMission.cadence && (
                    <span style={{ background: CADENCE_CONFIG[showMission.cadence]?.bg, color: CADENCE_CONFIG[showMission.cadence]?.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 700 }}>
                      {CADENCE_CONFIG[showMission.cadence]?.label}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "'Playfair Display'", lineHeight: 1.3 }}>{showMission.title}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: T.accent }}>+{showMission.points}</div>
                <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans'" }}>punti</div>
              </div>
            </div>

            {/* Obiettivo */}
            <div style={{ background: T.surface, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🎯 Obiettivo</div>
              <div style={{ fontSize: 14, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.6 }}>{showMission.objective}</div>
            </div>

            {/* Azioni */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>Azioni concrete:</div>
              {showMission.actions.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.accent, color: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0, fontFamily: "'DM Sans'" }}>{i + 1}</div>
                  <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.6, paddingTop: 2 }}>{a}</div>
                </div>
              ))}
            </div>

            {/* Script */}
            {showMission.script && (
              <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>💬 {showMission.script.label}</div>
                <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.7, marginBottom: 10 }}>{showMission.script.text}</div>
                <button
                  onClick={() => { navigator.clipboard?.writeText(showMission.script.text); setCopiedScript(showMission.id); setTimeout(() => setCopiedScript(null), 2000); fire("Script copiato! ✂️"); }}
                  style={{ background: T.accent, border: "none", color: "#0a0a0f", borderRadius: 50, padding: "7px 16px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                >
                  {copiedScript === showMission.id ? "✓ Copiato!" : "Copia Script"}
                </button>
              </div>
            )}

            {/* Tip */}
            {showMission.tip && (
              <div style={{ background: `rgba(107,107,138,0.1)`, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", fontWeight: 700, marginBottom: 4 }}>💡 Perché è importante</div>
                <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.6 }}>{showMission.tip}</div>
              </div>
            )}

            {/* CTA */}
            {isCompleted(showMission) || completions[showMission.id] ? (
              <div style={{ textAlign: "center", padding: "12px 0", background: "rgba(62,207,142,0.1)", border: `1px solid rgba(62,207,142,0.3)`, borderRadius: 50, color: T.green || "#1A7A4A", fontFamily: "'DM Sans'", fontWeight: 700 }}>
                ✓ Completata!
              </div>
            ) : (
              <button
                disabled={saving}
                onClick={() => showMission.cadence ? completeMission(showMission) : completeRecruitMission(showMission)}
                style={{ width: "100%", background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "14px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Salvataggio..." : `Segna come Completata (+${showMission.points}pt)`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recruitment toggle modal */}
      {showRecruitToggle && (
        <div onClick={() => setShowRecruitToggle(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.bg, borderRadius: "24px 24px 0 0", width: "100%", padding: 24, borderTop: `3px solid ${T.accent}` }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🚀</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: "'Playfair Display'", marginBottom: 8 }}>Attiva il Percorso di Reclutamento</div>
              <div style={{ fontSize: 14, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.6 }}>
                Stai per attivare le missioni di reclutamento personale.<br />
                Questo ti permette di trovare nuovi collaboratori per il tuo team direttamente.
              </div>
            </div>
            <div style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.25)", borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.red || "#C0392B", fontWeight: 700, marginBottom: 6 }}>⚠️ Importante</div>
              <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.6 }}>
                Una volta completata la prima missione, il percorso non può essere disattivato autonomamente. Questa scelta rappresenta un impegno serio verso la crescita del tuo team.
              </div>
            </div>
            <button
              onClick={enableRecruitment}
              disabled={saving}
              style={{ width: "100%", background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "14px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 10 }}
            >
              {saving ? "Attivazione..." : "Sì, attivo il percorso di reclutamento"}
            </button>
            <button onClick={() => setShowRecruitToggle(false)} style={{ width: "100%", background: "none", color: T.muted, border: "none", padding: "8px 0", fontFamily: "'DM Sans'", fontSize: 13, cursor: "pointer" }}>
              Non ancora
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: "'Playfair Display'" }}>Le tue Missioni</div>
          <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, marginTop: 2 }}>
            ⭐ {userProfile?.leaderPoints || 0} punti leader
            {todayPoints > 0 && <span style={{ color: T.accent, marginLeft: 6 }}>+{todayPoints} oggi</span>}
          </div>
        </div>

        {isLeader && !recruitEnabled && (
          <button
            onClick={() => setShowRecruitToggle(true)}
            style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, borderRadius: 50, padding: "8px 14px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
          >
            🚀 Attiva Reclutamento
          </button>
        )}
        {recruitEnabled && !recruitStarted && (
          <span style={{ background: T.accentBg, color: T.accent, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 700 }}>
            🚀 Reclutamento attivo
          </span>
        )}
        {recruitStarted && (
          <span style={{ background: "rgba(26,122,74,0.1)", color: "#1A7A4A", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 700 }}>
            ✅ In percorso
          </span>
        )}
      </div>

      {/* Filtri cadenza */}
      <div style={{ display: "flex", gap: 8, margin: "16px 0", flexWrap: "wrap" }}>
        {[
          { id: "all",     label: "Tutte" },
          { id: "daily",   label: "Giornaliere" },
          { id: "weekly",  label: "Settimanali" },
          { id: "monthly", label: "Mensili" },
          ...(recruitEnabled ? [{ id: "recruit", label: "🚀 Reclutamento" }] : []),
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterCadence(f.id)}
            style={{ background: filterCadence === f.id ? T.accent : T.surface, border: `1px solid ${filterCadence === f.id ? T.accent : T.border}`, color: filterCadence === f.id ? "#0a0a0f" : T.muted, padding: "6px 14px", borderRadius: 50, fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 700, cursor: "pointer" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sezioni missioni ricorrenti */}
      {filterCadence !== "recruit" && sections.map(section => {
        const completed = section.missions.filter(m => isCompleted(m)).length;
        return (
          <div key={section.id} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: section.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                {section.label}
              </div>
              <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted }}>
                {completed}/{section.missions.length} completate
              </div>
            </div>

            {section.missions.map(m => {
              const done = isCompleted(m);
              const cfg  = CADENCE_CONFIG[m.cadence];
              return (
                <div
                  key={m.id}
                  onClick={() => setShowMission(m)}
                  style={{ ...card, marginBottom: 10, cursor: "pointer", opacity: done ? 0.65 : 1, background: done ? "rgba(26,122,74,0.05)" : T.card, border: `1px solid ${done ? "rgba(26,122,74,0.2)" : T.border}`, transition: "all 0.15s" }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: done ? "rgba(26,122,74,0.12)" : cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {done ? "✅" : m.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{m.title}</div>
                      <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.objective}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: done ? "#1A7A4A" : T.accent }}>+{m.points}pt</div>
                      <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans'" }}>Tocca →</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Missioni reclutamento */}
      {recruitEnabled && (filterCadence === "recruit" || filterCadence === "all") && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
              🚀 Percorso Reclutamento
            </div>
            <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted }}>
              {LEADER_RECRUITMENT_MISSIONS.filter(m => completions[m.id]).length}/{LEADER_RECRUITMENT_MISSIONS.length} completate
            </div>
          </div>
          <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.accent, lineHeight: 1.5 }}>
              Queste missioni sono permanenti — una volta completata si segna per sempre e non si ripete.
            </div>
          </div>
          {LEADER_RECRUITMENT_MISSIONS.map(m => {
            const done = !!completions[m.id];
            return (
              <div
                key={m.id}
                onClick={() => setShowMission(m)}
                style={{ ...card, marginBottom: 10, cursor: "pointer", opacity: done ? 0.65 : 1, background: done ? "rgba(26,122,74,0.05)" : T.card, border: `1px solid ${done ? "rgba(26,122,74,0.2)" : T.border}` }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: done ? "rgba(26,122,74,0.12)" : T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {done ? "✅" : m.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{m.title}</div>
                    <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted }}>{m.kpi}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: done ? "#1A7A4A" : T.accent }}>+{m.points}pt</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
