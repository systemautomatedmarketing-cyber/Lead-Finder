// src/components/WeeklyReport.jsx
// Modal report settimanale per i leader:
// - Anteprima testuale del report
// - Copia su clipboard (per WhatsApp/email)
// - Download CSV
// - Paywall per piano Starter

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { usePlan } from "../context/PlanContext";
import { exportWeeklyReportCSV, generateWeeklyReportText } from "../utils/exportCSV";

export default function WeeklyReport({ team, deepTeam, leaderName, onClose }) {
  const { T }              = useTheme();
  const { can, startCheckout } = usePlan();
  const [copied, setCopied] = useState(false);

  const canExport    = can.exportCSV();
  const reportText   = generateWeeklyReportText(team, deepTeam, leaderName);

  const copyReport = () => {
    navigator.clipboard?.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSV = () => {
    exportWeeklyReportCSV(team, deepTeam, leaderName);
  };

  const card = {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: 14,
    boxShadow: T.shadowCard,
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: T.bg, borderRadius: "24px 24px 0 0", width: "100%", maxHeight: "88vh", overflowY: "auto", padding: 24, borderTop: `3px solid ${T.accent}` }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>📊 Report Settimanale</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: "'Playfair Display'" }}>Il tuo team questa settimana</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, padding: "6px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 12 }}>✕</button>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { icon: "👥", label: "Collaboratori", value: team.length, color: T.text },
            { icon: "🎯", label: "Clienti sett.", value: team.reduce((s,m) => s+(m.weeklyClients||0), 0), color: T.accent },
            { icon: "⭐", label: "Top performer", value: team.filter(m => (m.weeklyClients||0) >= (m.currentWeek||1)).length, color: T.green || "#1A7A4A" },
            { icon: "⚠️", label: "A rischio",    value: team.filter(m => (m.weeklyClients||0) < (m.currentWeek||1)*0.5).length, color: T.red || "#C0392B" },
          ].map(k => (
            <div key={k.label} style={{ ...card, textAlign: "center", padding: 12 }}>
              <div style={{ fontSize: 22 }}>{k.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: k.color, lineHeight: 1.2 }}>{k.value}</div>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans'", marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Anteprima testo report */}
        <div style={{ ...card, marginBottom: 16, background: T.surface }}>
          <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Anteprima — Pronto per WhatsApp
          </div>
          <pre style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, maxHeight: 200, overflowY: "auto" }}>
            {reportText}
          </pre>
        </div>

        {/* Azioni */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Copia su WhatsApp — disponibile per tutti */}
          <button
            onClick={copyReport}
            style={{ background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "13px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >
            {copied ? "✓ Copiato!" : "📋 Copia per WhatsApp / Email"}
          </button>

          {/* Export CSV — solo Pro */}
          {canExport ? (
            <button
              onClick={downloadCSV}
              style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, borderRadius: 50, padding: "12px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              📥 Scarica Report CSV (Excel)
            </button>
          ) : (
            <div style={{ ...card, background: T.surface, textAlign: "center", padding: 18 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🔒</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'", marginBottom: 4 }}>Export CSV — Piano Pro</div>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", marginBottom: 12, lineHeight: 1.5 }}>
                Scarica il report in Excel con tutti i dati del team. Disponibile con Leader Pro.
              </div>
              <button
                onClick={() => startCheckout("leader_pro", "monthly")}
                style={{ background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "10px 24px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Prova Leader Pro — 14 giorni gratis
              </button>
            </div>
          )}

          <button onClick={onClose} style={{ background: "none", color: T.muted, border: "none", padding: "8px 0", fontFamily: "'DM Sans'", fontSize: 13, cursor: "pointer" }}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
