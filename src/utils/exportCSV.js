// src/utils/exportCSV.js
// Utility per esportare i dati del team in formato CSV
// Usata dal LeaderDashboard con controllo piano Pro

/**
 * Converte un array di oggetti in stringa CSV
 */
function toCSV(rows, columns) {
  const header = columns.map(c => `"${c.label}"`).join(",");
  const lines  = rows.map(row =>
    columns.map(c => {
      const val = c.fn ? c.fn(row) : (row[c.key] ?? "");
      // Escape virgolette e a capo
      return `"${String(val).replace(/"/g, '""').replace(/\n/g, " ")}"`;
    }).join(",")
  );
  return [header, ...lines].join("\n");
}

/**
 * Scarica una stringa come file
 */
function downloadFile(content, filename, mimeType = "text/csv;charset=utf-8;") {
  const BOM  = "\uFEFF"; // BOM per Excel italiano
  const blob = new Blob([BOM + content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Formatta una data ISO in formato italiano
 */
function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("it-IT");
  } catch {
    return iso;
  }
}

/**
 * Esporta i collaboratori del team
 */
export function exportTeamCSV(team, leaderName) {
  const LEVEL_LABELS = {
    principiante: "Principiante",
    in_crescita:  "In Crescita",
    avanzato:     "Avanzato",
    pro:          "Pro",
  };

  const columns = [
    { label: "Nome",               key: "name" },
    { label: "Email",              key: "email" },
    { label: "Livello",            fn: r => LEVEL_LABELS[r.level] || r.level },
    { label: "Settimana attuale",  key: "currentWeek" },
    { label: "Clienti sett.",      key: "weeklyClients" },
    { label: "Missioni completate",fn: r => r.completedMissions?.length || 0 },
    { label: "Punti",              key: "points" },
    { label: "È anche Leader",     fn: r => r.isLeader ? "Sì" : "No" },
    { label: "Piano",              key: "plan" },
    { label: "Stato abbonamento",  key: "subscriptionStatus" },
    { label: "Data registrazione", fn: r => fmtDate(r.createdAt?.toDate?.()?.toISOString() || r.createdAt) },
    { label: "Trial avviato il",   fn: r => fmtDate(r.trialStartedAt) },
  ];

  const csv      = toCSV(team, columns);
  const dateStr  = new Date().toLocaleDateString("it-IT").replace(/\//g, "-");
  const filename = `LeadFinder_Team_${leaderName.replace(/\s+/g, "_")}_${dateStr}.csv`;
  downloadFile(csv, filename);
}

/**
 * Esporta i lead/contatti di un collaboratore
 */
export function exportContactsCSV(contacts, collaboratoreName) {
  const STATUS_LABELS = {
    lead:          "Lead",
    nuovo:         "Nuovo",
    contattato:    "Contattato",
    interessato:   "Interessato",
    followup:      "Follow-up",
    presentato:    "Presentato",
    convertito:    "Cliente",
    collaboratore: "Collaboratore",
    archiviato:    "Archiviato",
  };

  const columns = [
    { label: "Nome",               key: "name" },
    { label: "Tipo",               key: "type" },
    { label: "Stato",              fn: r => STATUS_LABELS[r.status] || r.status },
    { label: "Canale",             key: "channel" },
    { label: "Note",               key: "note" },
    { label: "Data contatto",      fn: r => fmtDate(r.contactedAt) },
    { label: "Ultimo aggiornamento", fn: r => fmtDate(r.updatedAt?.toDate?.()?.toISOString() || r.updatedAt) },
    { label: "Data inserimento",   fn: r => fmtDate(r.createdAt?.toDate?.()?.toISOString() || r.createdAt) },
  ];

  const csv      = toCSV(contacts, columns);
  const dateStr  = new Date().toLocaleDateString("it-IT").replace(/\//g, "-");
  const filename = `LeadFinder_Contatti_${collaboratoreName.replace(/\s+/g, "_")}_${dateStr}.csv`;
  downloadFile(csv, filename);
}

/**
 * Esporta il report settimanale completo del team
 * (usato sia per download che per generare il testo del report)
 */
export function exportWeeklyReportCSV(team, deepTeam, leaderName) {
  const now     = new Date();
  const week    = `Settimana del ${now.toLocaleDateString("it-IT")}`;

  // Sezione 1 — Sommario team
  const summary = [
    ["REPORT SETTIMANALE LEAD FINDER"],
    [`Leader: ${leaderName}`],
    [`Generato il: ${now.toLocaleString("it-IT")}`],
    [],
    ["SOMMARIO"],
    ["Collaboratori totali", team.length],
    ["Clienti acquisiti questa settimana", team.reduce((s, m) => s + (m.weeklyClients || 0), 0)],
    ["Missioni completate totali",          team.reduce((s, m) => s + (m.completedMissions?.length || 0), 0)],
    ["A rischio (< 50% obiettivo)",         team.filter(m => (m.weeklyClients||0) < (m.currentWeek||1)*0.5).length],
    ["Top performer (≥ obiettivo)",         team.filter(m => (m.weeklyClients||0) >= (m.currentWeek||1)).length],
    ["Neo-leader nel team",                 team.filter(m => m.isLeader).length],
    ["Collaboratori di 2° livello",         deepTeam.length],
    [],
  ];

  const summaryCSV = summary.map(row =>
    Array.isArray(row) ? row.map(v => `"${v}"`).join(",") : ""
  ).join("\n");

  // Sezione 2 — Dettaglio collaboratori
  const teamCSV = toCSV(team, [
    { label: "Nome",          key: "name" },
    { label: "Livello",       key: "level" },
    { label: "Settimana",     key: "currentWeek" },
    { label: "Clienti sett.", key: "weeklyClients" },
    { label: "Missioni",      fn: r => r.completedMissions?.length || 0 },
    { label: "Stato",         fn: r => {
      const ratio = (r.weeklyClients||0) / (r.currentWeek||1);
      if (ratio >= 1)   return "✅ In obiettivo";
      if (ratio >= 0.5) return "⚠️ Quasi";
      return "🔴 A rischio";
    }},
    { label: "È Leader",      fn: r => r.isLeader ? "Sì" : "No" },
  ]);

  const fullCSV  = summaryCSV + "\nDETTAGLIO COLLABORATORI\n" + teamCSV;
  const dateStr  = now.toLocaleDateString("it-IT").replace(/\//g, "-");
  const filename = `LeadFinder_ReportSettimanale_${leaderName.replace(/\s+/g, "_")}_${dateStr}.csv`;
  downloadFile(fullCSV, filename);

  return fullCSV; // restituisce anche la stringa per altri usi
}

/**
 * Genera il testo del report settimanale in formato WhatsApp/testo
 */
export function generateWeeklyReportText(team, deepTeam, leaderName) {
  const now       = new Date();
  const totClients = team.reduce((s, m) => s + (m.weeklyClients || 0), 0);
  const totMissions = team.reduce((s, m) => s + (m.completedMissions?.length || 0), 0);
  const atRisk    = team.filter(m => (m.weeklyClients||0) < (m.currentWeek||1)*0.5);
  const topPerf   = team.filter(m => (m.weeklyClients||0) >= (m.currentWeek||1));

  const lines = [
    `📊 *REPORT SETTIMANALE LEAD FINDER*`,
    `👤 Leader: ${leaderName}`,
    `📅 ${now.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}`,
    ``,
    `*📈 RISULTATI SETTIMANA*`,
    `• 👥 Collaboratori attivi: ${team.length}`,
    `• 🎯 Clienti acquisiti: ${totClients}`,
    `• ⚡ Missioni completate: ${totMissions}`,
    `• 🌐 Rete di 2° livello: ${deepTeam.length} persone`,
    ``,
    topPerf.length > 0 ? `*⭐ TOP PERFORMER*\n${topPerf.map(m => `• ${m.name}: ${m.weeklyClients} clienti`).join("\n")}` : null,
    ``,
    atRisk.length > 0 ? `*⚠️ NECESSITANO SUPPORTO*\n${atRisk.map(m => `• ${m.name} (Sett ${m.currentWeek}: ${m.weeklyClients}/${m.currentWeek} clienti)`).join("\n")}` : `*✅ TUTTO IL TEAM IN OBIETTIVO*`,
    ``,
    `_Generato da Lead Finder Platform_`,
  ].filter(l => l !== null);

  return lines.join("\n");
}
