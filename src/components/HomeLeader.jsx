// src/components/HomeLeader.jsx
// La home del leader — coaching intelligence dashboard
// Stato emotivo team · Alert intelligenti · Quote lideraggio · Azioni rapide · Digest

import { useState, useEffect } from "react";

// ── Frasi di leadership — cambiano ogni giorno ───────────────
const LEADERSHIP_QUOTES = [
  { text: "Un leader è migliore quando la gente appena sa che esiste. Quando il lavoro è fatto, la gente dice: lo abbiamo fatto noi stessi.", author: "Lao Tzu" },
  { text: "Il compito del leader non è fare il lavoro degli altri, ma creare le condizioni perché gli altri lo facciano meglio di quanto avrebbero fatto.", author: "Peter Drucker" },
  { text: "Non costruisci un'impresa. Costruisci persone, e poi le persone costruiscono l'impresa.", author: "Zig Ziglar" },
  { text: "La migliore struttura non garantirà i risultati né le prestazioni. Ma la struttura sbagliata è una garanzia di fallimento.", author: "Peter Drucker" },
  { text: "I leader straordinari non vogliono che le persone li seguano — vogliono che le persone le raggiungano.", author: "Lead Finder" },
  { text: "Il team a cui dai di più è quello che darà di più. L'investimento in persone è l'unico che si moltiplica.", author: "Lead Finder" },
  { text: "Il modo più rapido per far crescere il tuo business è far crescere le persone all'interno di esso.", author: "John Maxwell" },
  { text: "Motivare non è il tuo lavoro. Il tuo lavoro è creare un ambiente dove la motivazione sopravvive.", author: "Il tuo coach" },
  { text: "Chi forma leader crea un'eredità. Chi forma clienti crea un fatturato. Scegli chi vuoi essere.", author: "Lead Finder" },
  { text: "La velocità del leader determina la velocità del team. Non puoi essere lento e aspettarti che gli altri corrano.", author: "Principio NM" },
  { text: "Non dire ai tuoi collaboratori come fare le cose. Digli cosa fare e lascia che ti sorprendano con i loro risultati.", author: "George Patton" },
  { text: "Un grande leader non ha bisogno che le persone dipendano da lui. Ha bisogno che crescano oltre lui.", author: "Lead Finder" },
];

function getDailyLeaderQuote() {
  const today = new Date();
  const idx   = (today.getDate() + today.getMonth() * 3) % LEADERSHIP_QUOTES.length;
  return LEADERSHIP_QUOTES[idx];
}

// Analisi intelligente dello stato del team
function analyzeTeam(team, getMemberStatus) {
  const now   = new Date();
  const day   = now.getDay();

  const atRisk    = team.filter(m => getMemberStatus(m) === "risk");
  const top       = team.filter(m => getMemberStatus(m) === "top");
  const newMembers= team.filter(m => getMemberStatus(m) === "new");
  const ok        = team.filter(m => getMemberStatus(m) === "ok");

  // Punteggio salute team 0-100
  let health = 0;
  if (team.length > 0) {
    health += (top.length / team.length) * 40;
    health += (ok.length / team.length) * 30;
    health += (newMembers.length / team.length) * 20;
    health -= (atRisk.length / team.length) * 40;
    health = Math.max(0, Math.min(100, Math.round(health)));
  }

  const healthLabel = health >= 75 ? { label: "Eccellente 🏆", color: "#10B981" }
    : health >= 55 ? { label: "Buono 💪", color: "#7C3AED" }
    : health >= 35 ? { label: "Attenzione ⚠️", color: "#F59E0B" }
    : { label: "Critico 🚨", color: "#EF4444" };

  // Alert prioritari
  const alerts = [];

  if (atRisk.length > 0 && (day >= 3 || day === 0)) {
    alerts.push({
      priority: "high",
      icon: "🚨",
      title: `${atRisk.length} collaborator${atRisk.length > 1 ? "i" : "e"} a rischio abbandono`,
      desc: `${atRisk.map(m => m.name?.split(" ")[0]).join(", ")} ${atRisk.length === 1 ? "è" : "sono"} sotto al 50% dell'obiettivo. Contatta${atRisk.length === 1 ? "li" : "li"} oggi.`,
      action: "Contatta ora",
      script: atRisk.length === 1
        ? `Ciao ${atRisk[0].name?.split(" ")[0]}! Come stai questa settimana? Voglio assicurarmi di essere un supporto concreto per te. Hai 10 minuti per una call?`
        : `Ciao team! Questa settimana voglio fare un check personalizzato con ognuno di voi. Chi può sentirsi con me oggi?`,
      color: "#EF4444",
    });
  }

  const newNoContact = newMembers.filter(m => {
    const joined = m.createdAt?.toDate?.() || (m.createdAt ? new Date(m.createdAt) : null);
    return joined && (now - joined) > 2 * 24 * 60 * 60 * 1000; // > 2 giorni senza check-in
  });
  if (newNoContact.length > 0) {
    alerts.push({
      priority: "medium",
      icon: "👋",
      title: `${newNoContact.length} nuov${newNoContact.length > 1 ? "i" : "o"} — hai fatto il check-in?`,
      desc: `${newNoContact.map(m => m.name?.split(" ")[0]).join(", ")} si ${newNoContact.length === 1 ? "è registrato" : "sono registrati"} di recente. I primi 7 giorni sono cruciali.`,
      action: "Fai il check-in",
      script: `Ciao ${newNoContact[0]?.name?.split(" ")[0]}! Benvenuto/a nel team 🎉 Come stai trovando le prime azioni? Sono qui se hai domande — non esitare!`,
      color: "#7C3AED",
    });
  }

  if (top.length > 0) {
    alerts.push({
      priority: "positive",
      icon: "⭐",
      title: `${top.length} top performer da celebrare`,
      desc: `${top.map(m => m.name?.split(" ")[0]).join(", ")} ${top.length === 1 ? "sta" : "stanno"} andando benissimo. Un messaggio di riconoscimento vale più di qualsiasi incentivo.`,
      action: "Celebra ora",
      script: top.length === 1
        ? `${top[0].name?.split(" ")[0]}, voglio che tu sappia che stai facendo un lavoro straordinario questa settimana. Sei un esempio per tutto il team. Grazie! 🏆`
        : `Team, questa settimana voglio celebrare ${top.map(m => m.name?.split(" ")[0]).slice(0, 3).join(", ")} per i risultati eccezionali. Sono la dimostrazione che il metodo funziona! 🏆`,
      color: "#10B981",
    });
  }

  const totalClients = team.reduce((s, m) => s + (m.weeklyClients || 0), 0);

  return { atRisk, top, newMembers, ok, health, healthLabel, alerts, totalClients };
}

export default function HomeLeader({
  team, deepTeam, userProfile, T, onTabChange, fire,
  getMemberStatus,
}) {
  const [copiedAlert, setCopiedAlert] = useState(null);

  const quote    = getDailyLeaderQuote();
  const analysis = analyzeTeam(team, getMemberStatus || (() => "ok"));

  const hora   = new Date().getHours();
  const saluto = hora < 12 ? "Buongiorno" : hora < 18 ? "Buon pomeriggio" : "Buonasera";
  const nome   = userProfile?.name?.split(" ")[0] || "";

  const copyScript = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedAlert(id);
    fire("Script copiato! Incollalo su WhatsApp ✂️");
    setTimeout(() => setCopiedAlert(null), 2000);
  };

  const card = (extra = {}) => ({
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 16,
    boxShadow: T.shadowCard,
    marginBottom: 14,
    ...extra,
  });

  return (
    <div>

      {/* ── HEADER ───────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted, marginBottom: 2 }}>
          {saluto}, Leader {nome} 👑
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, fontFamily: "'Playfair Display'", lineHeight: 1.2 }}>
          {analysis.atRisk.length > 0
            ? `${analysis.atRisk.length} persone hanno bisogno di te.`
            : analysis.top.length > 0
              ? `Il tuo team sta crescendo. 🚀`
              : `Tutto sotto controllo. Costruisci.`
          }
        </div>
      </div>

      {/* ── SALUTE DEL TEAM ─────────────────────────────── */}
      <div style={{ ...card(), background: `linear-gradient(135deg, ${T.surface}, ${T.card})` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              Salute del Team
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: analysis.healthLabel.color, lineHeight: 1 }}>
              {analysis.healthLabel.label}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: analysis.healthLabel.color, lineHeight: 1 }}>
              {analysis.health}
            </div>
            <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 1 }}>/ 100</div>
          </div>
        </div>
        {/* Barra salute */}
        <div style={{ background: T.border, borderRadius: 50, height: 8, marginBottom: 14, overflow: "hidden" }}>
          <div style={{ height: 8, borderRadius: 50, background: `linear-gradient(90deg, ${analysis.healthLabel.color}88, ${analysis.healthLabel.color})`, width: `${analysis.health}%`, transition: "width 1s" }} />
        </div>
        {/* KPI team */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { icon: "👥", label: "Totale",  value: team.length,                  color: T.text },
            { icon: "⭐", label: "Top",     value: analysis.top.length,           color: "#10B981" },
            { icon: "🆕", label: "Nuovi",   value: analysis.newMembers.length,    color: "#7C3AED" },
            { icon: "⚠️", label: "Rischio", value: analysis.atRisk.length,        color: "#EF4444" },
          ].map(k => (
            <div key={k.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{k.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: k.color, lineHeight: 1.2 }}>{k.value}</div>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 0.5 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ALERT INTELLIGENTI ──────────────────────────── */}
      {analysis.alerts.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            🎯 Azioni Prioritarie
          </div>
          {analysis.alerts.map((alert, i) => (
            <div key={i} style={{ background: `${alert.color}0E`, border: `1px solid ${alert.color}44`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: alert.script ? 12 : 0 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{alert.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: alert.color, fontFamily: "'DM Sans'", marginBottom: 4 }}>
                    {alert.title}
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", lineHeight: 1.6 }}>
                    {alert.desc}
                  </div>
                </div>
              </div>
              {alert.script && (
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                    💬 Script pronto da copiare
                  </div>
                  <div style={{ fontSize: 12, color: T.text, fontFamily: "'DM Sans'", lineHeight: 1.6, marginBottom: 8 }}>
                    {alert.script}
                  </div>
                  <button
                    onClick={() => copyScript(alert.script, i)}
                    style={{ background: alert.color, color: "#fff", border: "none", borderRadius: 50, padding: "7px 16px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                  >
                    {copiedAlert === i ? "✓ Copiato!" : `${alert.action} — Copia Script`}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── FRASE DI LEADERSHIP ──────────────────────────── */}
      <div style={{ ...card(), borderLeft: `3px solid ${T.accent}`, background: `linear-gradient(135deg, ${T.accentBg}, ${T.surface})` }}>
        <div style={{ fontSize: 10, fontFamily: "'DM Sans'", color: T.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
          📖 Leadership del giorno
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'Playfair Display'", lineHeight: 1.6, fontStyle: "italic", marginBottom: 6 }}>
          "{quote.text}"
        </div>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'" }}>
          — {quote.author}
        </div>
      </div>

      {/* ── DIGEST SETTIMANALE ───────────────────────────── */}
      <div style={{ ...card() }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
          📊 Questa settimana
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Clienti acquisiti dal team",  value: analysis.totalClients, icon: "🎯", color: T.accent },
            { label: "Collaboratori di 2° livello",  value: deepTeam.length,       icon: "🌐", color: "#7C3AED" },
            { label: "Sub-leader nel team",           value: team.filter(m => m.isLeader).length, icon: "👑", color: "#F97316" },
            { label: "Team attivo (non a rischio)",   value: team.length - analysis.atRisk.length, icon: "✅", color: "#10B981" },
          ].map(item => (
            <div key={item.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: item.color, lineHeight: 1, marginBottom: 2 }}>{item.value}</div>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans'", lineHeight: 1.4 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AZIONI RAPIDE DEL LEADER ─────────────────────── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          ⚡ Azioni Rapide
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "👥", label: "Vedi il Team",        action: () => onTabChange("team"),     bg: T.accentBg, border: T.accentBorder, color: T.accent },
            { icon: "⚡", label: "Le mie Missioni",     action: () => onTabChange("missioni"), bg: T.surface,  border: T.border,        color: T.text },
            { icon: "📊", label: "Report Settimanale",  action: () => onTabChange("team"),     bg: T.surface,  border: T.border,        color: T.text },
            { icon: "🌐", label: "Rete 2° Livello",     action: () => onTabChange("rete"),     bg: T.surface,  border: T.border,        color: T.text },
          ].map(a => (
            <button key={a.label} onClick={a.action}
              style={{ background: a.bg, border: `1px solid ${a.border}`, color: a.color, borderRadius: 12, padding: "14px 12px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, textAlign: "left" }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHECK-IN DI OGGI ─────────────────────────────── */}
      <div style={{ ...card(), background: `${T.accent}08`, border: `1px solid ${T.accentBorder}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: "'DM Sans'", marginBottom: 6 }}>
          🌅 La tua missione quotidiana più importante
        </div>
        <div style={{ fontSize: 13, color: T.text, fontFamily: "'DM Sans'", lineHeight: 1.7, marginBottom: 12 }}>
          Contatta <strong>una</strong> persona del tuo team oggi — non un messaggio di gruppo, 
          un messaggio personale. Chiedi come sta, non come sta andando il lavoro.
          I leader che fanno questo hanno team con il 70% di retention in più.
        </div>
        <button
          onClick={() => {
            const member = team.find(m => getMemberStatus(m) === "risk") || team[0];
            if (member) {
              const text = `Ciao ${member.name?.split(" ")[0]}! Come stai? Non parlo del lavoro — parlo di te. Hai un momento oggi?`;
              navigator.clipboard?.writeText(text);
              fire(`Script per ${member.name?.split(" ")[0]} copiato! ✂️`);
            }
          }}
          style={{ background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "11px 24px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Copia il messaggio per {(team.find(m => getMemberStatus(m) === "risk") || team[0])?.name?.split(" ")[0] || "il team"}
        </button>
      </div>

    </div>
  );
}
