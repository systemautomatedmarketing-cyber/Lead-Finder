// src/components/RoleToggle.jsx
// Toggle per passare dalla vista collaboratore a quella leader

import { useTheme } from "../context/ThemeContext";

export default function RoleToggle({ activeView, onSwitch, teamSize, hasBothRoles }) {
  const { T } = useTheme();

  if (!hasBothRoles) return null;

  return (
    <div style={{
      display: "flex",
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 50,
      padding: 3,
      gap: 2,
    }}>
      {[
        { id: "collaboratore", icon: "⚡", label: "Il mio percorso" },
        { id: "leader",        icon: "👑", label: `Team (${teamSize})` },
      ].map(v => (
        <button
          key={v.id}
          onClick={() => onSwitch(v.id)}
          style={{
            background: activeView === v.id ? T.accent : "transparent",
            color:      activeView === v.id ? "#0a0a0f" : T.muted,
            border:     "none",
            borderRadius: 50,
            padding:    "6px 14px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize:   12,
            cursor:     "pointer",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
            display:    "flex",
            alignItems: "center",
            gap:        5,
          }}
        >
          <span>{v.icon}</span>
          <span>{v.label}</span>
        </button>
      ))}
    </div>
  );
}
