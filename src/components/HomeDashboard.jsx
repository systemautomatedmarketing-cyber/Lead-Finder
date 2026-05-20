// src/components/HomeDashboard.jsx
// La home del collaboratore — sistema di crescita personale completo
// Streak · Momentum · Frase del giorno · Missione principale · Feed vittorie team · Coach AI

import { useState, useEffect, useCallback } from "react";
import { doc, collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// ── Frasi del coach — per ogni giorno settimana × situazione ──
const COACH_QUOTES = {
  // Per chi è all'inizio della settimana
  start: [
    { text: "Non devi essere straordinario ogni giorno. Devi solo essere costante.", author: "Il tuo sistema" },
    { text: "La settimana non si vince il venerdì. Si decide il lunedì mattina.", author: "Principio NM" },
    { text: "Ogni grande risultato è la somma di piccole azioni fatte bene.", author: "Lead Finder" },
    { text: "Non hai bisogno di motivazione. Hai bisogno di un'azione. La motivazione segue.", author: "Il tuo coach" },
    { text: "Il 90% di chi fallisce nel NM smette prima di vedere i risultati. Tu sei nel 10%.", author: "Statistica reale" },
  ],
  // Per chi è a metà settimana
  mid: [
    { text: "Siamo a metà. Chi rallenta adesso perde quello che ha costruito ieri.", author: "Il tuo coach" },
    { text: "I risultati non arrivano quando sei pronto. Arrivano quando sei coerente.", author: "Lead Finder" },
    { text: "Un follow-up in più oggi vale tre contatti nuovi la settimana prossima.", author: "Dati NM" },
    { text: "La differenza tra chi riesce e chi no? Chi riesce fa le cose anche quando non ha voglia.", author: "Verità scomoda" },
  ],
  // Per chi ha raggiunto l'obiettivo
  goal_reached: [
    { text: "Obiettivo raggiunto. Ora puoi fermarti. Oppure puoi diventare leggendario.", author: "Il tuo coach" },
    { text: "Il successo non è un traguardo. È un'abitudine che stai costruendo.", author: "Lead Finder" },
    { text: "Sai qual è il segreto dei top performer? Quando raggiungono l'obiettivo, ne fissano subito uno più grande.", author: "Principio NM" },
  ],
  // Per chi è indietro rispetto all'obiettivo
  behind: [
    { text: "Non sei in ritardo. Sei esattamente dove devi essere per imparare la lezione più importante.", author: "Il tuo coach" },
    { text: "La differenza tra chi si blocca e chi cresce: chi cresce invia comunque il messaggio anche quando ha paura.", author: "Lead Finder" },
    { text: "Un contatto fatto oggi con il 50% di energia vale infinitamente più di zero contatti perfetti.", author: "Verità del NM" },
  ],
  // Per chi ha streak alta
  streak: [
    { text: "Sei in una serie vincente. Le serie vincenti non si spezzano per stanchezza. Si spezzano per noncuranza.", author: "Il tuo coach" },
    { text: "La costanza è il superpotere più raro nel network marketing. Ce l'hai tu.", author: "Lead Finder" },
  ],
};

// Frase motivazionale per situazione del giorno
function getDailyQuote(streak, weeklyClients, weekGoal, dayOfWeek) {
  let pool;
  if (weeklyClients >= weekGoal)             pool = COACH_QUOTES.goal_reached;
  else if (streak >= 7)                       pool = COACH_QUOTES.streak;
  else if (dayOfWeek >= 3 && weeklyClients < weekGoal * 0.5) pool = COACH_QUOTES.behind;
  else if (dayOfWeek >= 3)                   pool = COACH_QUOTES.mid;
  else                                        pool = COACH_QUOTES.start;

  // Deterministica rispetto al giorno — stessa frase tutto il giorno
  const today = new Date();
  const idx   = (today.getDate() + today.getMonth()) % pool.length;
  return pool[idx];
}

// Calcola streak da Firestore profile
function calculateStreak(userProfile) {
  const last = userProfile?.lastMissionDate;
  if (!last) return 0;
  const lastDate = new Date(last);
  const today    = new Date();
  const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return userProfile?.streak || 1;
  if (diffDays === 1) return userProfile?.streak || 1;
  return 0; // streak spezzata
}

// Momentum score 0-100 basato su più fattori
function calculateMomentum(completedMissions, weeklyClients, weekGoal, streak, contacts) {
  let score = 0;
  // Missioni completate questa settimana (max 30 pt)
  score += Math.min(completedMissions * 10, 30);
  // Progresso verso obiettivo (max 30 pt)
  score += Math.min((weeklyClients / Math.max(weekGoal, 1)) * 30, 30);
  // Streak (max 20 pt)
  score += Math.min(streak * 2, 20);
  // Contatti totali (max 20 pt)
  score += Math.min(contacts * 2, 20);
  return Math.min(Math.round(score), 100);
}

// Label momentum
function getMomentumLabel(score) {
  if (score >= 80) return { label: "🔥 In Fiamma",   color: "#F97316", desc: "Stai dominando questa settimana." };
  if (score >= 60) return { label: "⚡ In Slancio",  color: "#10B981", desc: "Buon ritmo. Spingi ancora un po'." };
  if (score >= 40) return { label: "🌱 In Crescita", color: "#7C3AED", desc: "Stai costruendo. Non mollare." };
  if (score >= 20) return { label: "💤 Rallentato",  color: "#F59E0B", desc: "È il momento di accelerare." };
  return              { label: "🆕 Inizia Ora",     color: "#6B7280", desc: "Un'azione adesso cambia tutto." };
}

export default function HomeDashboard({
  userProfile, T, currentWeek, weeklyClients, weekGoal,
  completedMissions, contacts, thisWeekMissions, progress,
  allMissionsDone, leadsNeedingFollowup, showRecoveryBanner,
  can, onAdvanceWeek, onTabChange, onRegisterClient,
  onShowMission, onShowRecovery,
}) {
  const [teamFeed, setTeamFeed]   = useState([]);
  const [showAll, setShowAll]     = useState(false);

  const streak    = calculateStreak(userProfile);
  const dayOfWeek = new Date().getDay();
  const quote     = getDailyQuote(streak, weeklyClients, weekGoal, dayOfWeek);
  const momentum  = calculateMomentum(
    completedMissions.length, weeklyClients, weekGoal, streak, contacts.length
  );
  const mom = getMomentumLabel(momentum);

  // Prima missione non completata = "missione del giorno"
  const missioneDelGiorno = thisWeekMissions.find(m => !completedMissions.includes(m.id));

  // Feed vittorie del team (se il leader ha abilitato la condivisione)
  useEffect(() => {
    if (!userProfile?.leaderId) return;
    const q = query(
      collection(db, "team_feed"),
      where("leaderId", "==", userProfile.leaderId),
      orderBy("createdAt", "desc"),
      limit(8)
    );
    const unsub = onSnapshot(q, snap => {
      setTeamFeed(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [userProfile?.leaderId]);

  const card = (extra = {}) => ({
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 16,
    boxShadow: T.shadowCard,
    marginBottom: 14,
    ...extra,
  });

  const hora = new Date().getHours();
  const saluto = hora < 12 ? "Buongiorno" : hora < 18 ? "Buon pomeriggio" : "Buonasera";
  const nome   = userProfile?.name?.split(" ")[0] || "";

  return (
    <div>

      {/* ── HEADER PERSONALE ──────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted, marginBottom: 2 }}>
          {saluto}, {nome} 👋
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, fontFamily: "'Playfair Display'", lineHeight: 1.2 }}>
          {weeklyClients >= weekGoal
            ? "Obiettivo raggiunto. 🏆"
            : allMissionsDone
              ? "Missioni fatte. Vai a registrare! ⚡"
              : `Settimana ${currentWeek} — ${weekGoal - weeklyClients} clienti al goal.`
          }
        </div>
      </div>

      {/* ── MOMENTUM BAR ─────────────────────────────────── */}
      <div id="tour-momentum" style={{ ...card(), padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: mom.color, fontFamily: "'DM Sans'" }}>
              {mom.label}
            </div>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", marginTop: 1 }}>
              {mom.desc}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: mom.color, lineHeight: 1 }}>{momentum}</div>
            <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 1 }}>momentum</div>
          </div>
        </div>
        {/* Barra momentum */}
        <div style={{ background: T.border, borderRadius: 50, height: 6, overflow: "hidden" }}>
          <div style={{ height: 6, borderRadius: 50, background: `linear-gradient(90deg, ${mom.color}88, ${mom.color})`, width: `${momentum}%`, transition: "width 1s ease" }} />
        </div>
        {/* Indicatori streak + obiettivo */}
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: streak > 0 ? "#F97316" : T.muted, fontFamily: "'DM Sans'" }}>
                {streak} {streak === 1 ? "giorno" : "giorni"}
              </div>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans'" }}>streak attiva</div>
            </div>
          </div>
          <div style={{ width: 1, background: T.border }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>🎯</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, fontFamily: "'DM Sans'" }}>
                {weeklyClients}/{weekGoal}
              </div>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans'" }}>clienti sett.</div>
            </div>
          </div>
          <div style={{ width: 1, background: T.border }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, fontFamily: "'DM Sans'" }}>
                {completedMissions.length}
              </div>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans'" }}>missioni</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FRASE DEL GIORNO ─────────────────────────────── */}
      <div style={{ ...card(), background: `linear-gradient(135deg, ${T.accentBg}, ${T.surface})`, borderLeft: `3px solid ${T.accent}` }}>
        <div style={{ fontSize: 10, fontFamily: "'DM Sans'", color: T.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
          💬 Il coach dice oggi
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "'Playfair Display'", lineHeight: 1.5, marginBottom: 6, fontStyle: "italic" }}>
          "{quote.text}"
        </div>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'" }}>
          — {quote.author}
        </div>
      </div>

      {/* ── MISSIONE PRINCIPALE DEL GIORNO ───────────────── */}
      {missioneDelGiorno && (
        <div
          id="tour-mission-card"
          onClick={() => onShowMission(missioneDelGiorno)}
          style={{ ...card(), background: T.accentBg, border: `2px solid ${T.accent}`, cursor: "pointer", position: "relative", overflow: "hidden" }}
        >
          {/* Decorazione */}
          <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${T.accent}15` }} />
          <div style={{ position: "absolute", top: -10, right: -10, width: 50, height: 50, borderRadius: "50%", background: `${T.accent}20` }} />

          <div style={{ fontSize: 10, fontFamily: "'DM Sans'", color: T.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
            ⚡ Missione del giorno
          </div>
          <div style={{ fontSize: 17, fontWeight: 900, color: T.text, fontFamily: "'Playfair Display'", marginBottom: 6, lineHeight: 1.3 }}>
            {missioneDelGiorno.title}
          </div>
          <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", lineHeight: 1.6, marginBottom: 12 }}>
            {missioneDelGiorno.objective}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontFamily: "'DM Sans'", color: T.muted, fontWeight: 600 }}>
                +{missioneDelGiorno.points}pt
              </span>
              <span style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontFamily: "'DM Sans'", color: T.muted, fontWeight: 600 }}>
                {missioneDelGiorno.channel === "whatsapp" ? "💬 WhatsApp" : missioneDelGiorno.channel === "social" ? "📱 Social" : "🤝 Offline"}
              </span>
            </div>
            <div style={{ fontSize: 13, color: T.accent, fontWeight: 700, fontFamily: "'DM Sans'" }}>
              Inizia →
            </div>
          </div>
        </div>
      )}

      {/* ── OBIETTIVO SETTIMANALE ────────────────────────── */}
      <div style={{ ...card() }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
              Settimana {currentWeek} · Obiettivo clienti
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: weeklyClients >= weekGoal ? T.green : T.text, lineHeight: 1 }}>
              {weeklyClients}
              <span style={{ fontSize: 16, color: T.muted, fontWeight: 400 }}> / {weekGoal}</span>
            </div>
          </div>
          <div style={{ fontSize: 36 }}>
            {weeklyClients >= weekGoal ? "🏆" : progress >= 50 ? "💪" : "🎯"}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ background: T.border, borderRadius: 50, height: 8, marginBottom: 12, overflow: "hidden" }}>
          <div style={{
            height: 8, borderRadius: 50,
            background: weeklyClients >= weekGoal
              ? `linear-gradient(90deg, ${T.green}, #34D399)`
              : `linear-gradient(90deg, ${T.accent}, ${T.accentSoft})`,
            width: `${progress}%`,
            transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }} />
        </div>
        {/* CTA contestuale */}
        {weeklyClients >= weekGoal ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, fontSize: 13, fontFamily: "'DM Sans'", color: T.green, fontWeight: 600 }}>
              🎉 Obiettivo raggiunto! Vai oltre?
            </div>
            <button
              onClick={onRegisterClient}
              style={{ background: T.green, color: "#fff", border: "none", borderRadius: 50, padding: "8px 16px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
            >
              +1 ancora
            </button>
          </div>
        ) : (
          <div id="tour-contacts-btn" style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onRegisterClient}
              style={{ flex: 1, background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "11px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              + Registra Cliente
            </button>
            <button
              onClick={() => onTabChange("contatti")}
              style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: 50, padding: "11px 16px", fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              Lead →
            </button>
          </div>
        )}
      </div>

      {/* ── AZIONI RAPIDE ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          {
            icon: "⏰", label: "Follow-up da fare",
            value: leadsNeedingFollowup.length, unit: "lead",
            color: leadsNeedingFollowup.length > 0 ? "#7C3AED" : T.muted,
            urgent: leadsNeedingFollowup.length > 0,
            action: () => onTabChange("contatti"),
          },
          {
            icon: "📱", label: "Contatti totali",
            value: contacts.length, unit: "persone",
            color: T.blue,
            urgent: false,
            action: () => onTabChange("contatti"),
          },
        ].map(item => (
          <div
            key={item.label}
            onClick={item.action}
            style={{ background: item.urgent ? `${item.color}12` : T.card, border: `1px solid ${item.urgent ? item.color + "44" : T.border}`, borderRadius: 14, padding: 14, cursor: "pointer", transition: "all 0.15s" }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: item.color, lineHeight: 1, marginBottom: 2 }}>{item.value}</div>
            <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans'", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
            {item.urgent && (
              <div style={{ fontSize: 10, color: item.color, fontFamily: "'DM Sans'", marginTop: 4, fontWeight: 700 }}>
                Tocca →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── MISSIONI SETTIMANA (compatte) ────────────────── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>⚡ Missioni Sett. {currentWeek}</div>
          <button onClick={() => onTabChange("missioni")} style={{ background: "none", border: "none", color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            Vedi tutte →
          </button>
        </div>
        {(showAll ? thisWeekMissions : thisWeekMissions.slice(0, 3)).map(m => {
          const done = completedMissions.includes(m.id);
          return (
            <div
              key={m.id}
              onClick={() => onShowMission(m)}
              style={{ background: done ? `${T.green}10` : T.card, border: `1px solid ${done ? T.green + "40" : T.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: done ? `${T.green}20` : T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {done ? "✅" : m.channel === "whatsapp" ? "💬" : m.channel === "social" ? "📱" : "🤝"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: done ? T.muted : T.text, marginBottom: 1, textDecoration: done ? "line-through" : "none" }}>{m.title}</div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'" }}>{m.kpi}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: done ? T.green : T.accent, fontFamily: "'DM Sans'", flexShrink: 0 }}>
                {done ? "✓" : `+${m.points}pt`}
              </div>
            </div>
          );
        })}
        {thisWeekMissions.length > 3 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 12, padding: "10px 0", fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            +{thisWeekMissions.length - 3} altre missioni
          </button>
        )}
      </div>

      {/* ── RECOVERY / BLOCCO ───────────────────────────── */}
      {showRecoveryBanner && (
        can.useRecovery() ? (
          <div
            onClick={onShowRecovery}
            style={{ background: `${T.red}10`, border: `1px solid ${T.red}44`, borderRadius: 14, padding: "16px 18px", marginBottom: 14, cursor: "pointer" }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 28 }}>🧭</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.red, fontFamily: "'Playfair Display'", marginBottom: 4 }}>
                  Nessun risultato ancora?
                </div>
                <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.6 }}>
                  Non sei rotto — hai solo bisogno di una rotta diversa. Il sistema Recovery analizza il tuo blocco specifico e ti dà le missioni giuste per superarlo.
                </div>
                <div style={{ fontSize: 12, color: T.red, fontFamily: "'DM Sans'", fontWeight: 700, marginTop: 8 }}>
                  Analizza il mio blocco →
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div onClick={() => onTabChange("piani")} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 18px", marginBottom: 14, cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 24 }}>🔒</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'" }}>Sistema Recovery — Piano Pro</div>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'" }}>Sblocca il piano anti-blocco personalizzato.</div>
            </div>
            <span style={{ color: T.accent, fontWeight: 700, fontSize: 12, fontFamily: "'DM Sans'" }}>Upgrade →</span>
          </div>
        )
      )}

      {/* ── FEED VITTORIE DEL TEAM ───────────────────────── */}
      {teamFeed.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            🏆 Vittorie del Team
          </div>
          {teamFeed.slice(0, 4).map(event => (
            <div key={event.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10, padding: "10px 14px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                {event.icon || "🎉"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'DM Sans'", lineHeight: 1.4 }}>
                  {event.message}
                </div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", marginTop: 2 }}>
                  {event.authorName} · {formatTimeAgo(event.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STATS COMPATTE ──────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Missioni", value: completedMissions.length, icon: "⚡", color: T.accent },
          { label: "Clienti", value: contacts.filter(c => c.status === "convertito" || c.status === "collaboratore").length, icon: "✅", color: T.green },
          { label: "Pipeline", value: contacts.filter(c => c.status === "interessato" || c.status === "followup").length, icon: "🔥", color: "#F97316" },
        ].map(s => (
          <div key={s.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── PROSSIMA SETTIMANA ───────────────────────────── */}
      {(weeklyClients >= weekGoal || allMissionsDone) && (
        <div style={{ background: `${T.green}10`, border: `1px solid ${T.green}40`, borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.green, fontFamily: "'Playfair Display'", marginBottom: 6 }}>
            {weeklyClients >= weekGoal ? "🏆 Pronto per la prossima settimana!" : "✅ Missioni completate!"}
          </div>
          <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.6, marginBottom: 12 }}>
            {weeklyClients >= weekGoal
              ? "Hai raggiunto l'obiettivo. Avanza alla settimana successiva e mantieni il momentum."
              : "Hai completato tutte le missioni. Registra i risultati nei contatti, poi avanza."}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {weeklyClients < weekGoal && (
              <button onClick={() => onTabChange("contatti")} style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 50, padding: "10px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                📋 Contatti
              </button>
            )}
            <button onClick={onAdvanceWeek} style={{ flex: 1, background: T.green, color: "#fff", border: "none", borderRadius: 50, padding: "10px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Sett. {currentWeek + 1} →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff  = Math.floor((new Date() - date) / 1000);
  if (diff < 60)   return "ora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min fa`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h fa`;
  return `${Math.floor(diff / 86400)}g fa`;
}
