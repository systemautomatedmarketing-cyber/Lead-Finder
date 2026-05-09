// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from "react";

const ThemeContext = createContext(null);

// ── 5 schemi colore — versioni più vivide e moderne ───────────
// Ogni schema ha accent light + dark con sfondi abbinati
const SCHEMES = {
  // 🟣 Electric Violet — giovane, tech, premium
  viola: {
    light: {
      accent: "#7C3AED", accentSoft: "#9F67F5",
      accentBg: "rgba(124,58,237,0.08)", accentBorder: "rgba(124,58,237,0.22)",
      bg: "#FAFAFF", surface: "#FFFFFF", card: "#FFFFFF",
      border: "#E4E0F8", inputBg: "#F7F6FE",
      navBg: "rgba(250,250,255,0.96)",
      text: "#1A1030", muted: "#8B7BB0",
    },
    dark: {
      accent: "#A78BFA", accentSoft: "#C4B5FD",
      accentBg: "rgba(167,139,250,0.12)", accentBorder: "rgba(167,139,250,0.30)",
      bg: "#0D0B14", surface: "#161220", card: "#1E1A2E",
      border: "#2E2845", inputBg: "#161220",
      navBg: "rgba(13,11,20,0.97)",
      text: "#F0EEFF", muted: "#7B6BA0",
    },
  },
  // 🔵 Ocean Blue — fiducia, professionale, moderno
  blu: {
    light: {
      accent: "#0EA5E9", accentSoft: "#38BDF8",
      accentBg: "rgba(14,165,233,0.08)", accentBorder: "rgba(14,165,233,0.22)",
      bg: "#F0F8FF", surface: "#FFFFFF", card: "#FFFFFF",
      border: "#BAE0F8", inputBg: "#F5FBFF",
      navBg: "rgba(240,248,255,0.96)",
      text: "#0C1A28", muted: "#5E8CAE",
    },
    dark: {
      accent: "#38BDF8", accentSoft: "#7DD3FC",
      accentBg: "rgba(56,189,248,0.10)", accentBorder: "rgba(56,189,248,0.28)",
      bg: "#080E14", surface: "#0E1822", card: "#14202E",
      border: "#1C2E40", inputBg: "#0E1822",
      navBg: "rgba(8,14,20,0.97)",
      text: "#EEF6FF", muted: "#4A7090",
    },
  },
  // 🟢 Neon Green — energia, crescita, successo
  verde: {
    light: {
      accent: "#10B981", accentSoft: "#34D399",
      accentBg: "rgba(16,185,129,0.08)", accentBorder: "rgba(16,185,129,0.22)",
      bg: "#F0FDF6", surface: "#FFFFFF", card: "#FFFFFF",
      border: "#BBF0DA", inputBg: "#F4FEF9",
      navBg: "rgba(240,253,246,0.96)",
      text: "#0A1F14", muted: "#4A8C6A",
    },
    dark: {
      accent: "#34D399", accentSoft: "#6EE7B7",
      accentBg: "rgba(52,211,153,0.10)", accentBorder: "rgba(52,211,153,0.28)",
      bg: "#080F0C", surface: "#0E1812", card: "#14221A",
      border: "#1A3026", inputBg: "#0E1812",
      navBg: "rgba(8,15,12,0.97)",
      text: "#EEFDF6", muted: "#3A7050",
    },
  },
  // 🟠 Sunset Orange — passione, azione, calore
  arancio: {
    light: {
      accent: "#F97316", accentSoft: "#FB923C",
      accentBg: "rgba(249,115,22,0.08)", accentBorder: "rgba(249,115,22,0.22)",
      bg: "#FFFAF5", surface: "#FFFFFF", card: "#FFFFFF",
      border: "#FDDCBA", inputBg: "#FFFCF8",
      navBg: "rgba(255,250,245,0.96)",
      text: "#2A1200", muted: "#9A6030",
    },
    dark: {
      accent: "#FB923C", accentSoft: "#FDBA74",
      accentBg: "rgba(251,146,60,0.10)", accentBorder: "rgba(251,146,60,0.28)",
      bg: "#0F0A05", surface: "#1A1008", card: "#231608",
      border: "#3A2010", inputBg: "#1A1008",
      navBg: "rgba(15,10,5,0.97)",
      text: "#FFF8EE", muted: "#806030",
    },
  },
  // 🩷 Hot Pink — audace, creativo, distintivo
  rosa: {
    light: {
      accent: "#EC4899", accentSoft: "#F472B6",
      accentBg: "rgba(236,72,153,0.08)", accentBorder: "rgba(236,72,153,0.22)",
      bg: "#FFF5FA", surface: "#FFFFFF", card: "#FFFFFF",
      border: "#FBCFE8", inputBg: "#FFF8FC",
      navBg: "rgba(255,245,250,0.96)",
      text: "#2A0818", muted: "#A05070",
    },
    dark: {
      accent: "#F472B6", accentSoft: "#F9A8D4",
      accentBg: "rgba(244,114,182,0.10)", accentBorder: "rgba(244,114,182,0.28)",
      bg: "#100608", surface: "#1C0C12", card: "#261018",
      border: "#3A1828", inputBg: "#1C0C12",
      navBg: "rgba(16,6,8,0.97)",
      text: "#FFF0F6", muted: "#904060",
    },
  },
};

// Token semantici fissi (uguali in tutti i temi)
const SEMANTIC = {
  green: "#10B981", greenBg: "rgba(16,185,129,0.12)",
  red:   "#EF4444", redBg:   "rgba(239,68,68,0.10)",
  blue:  "#0EA5E9", blueBg:  "rgba(14,165,233,0.10)",
  purple:"#7C3AED", orange:  "#F97316",
};
const SEMANTIC_DARK = {
  green: "#34D399", greenBg: "rgba(52,211,153,0.12)",
  red:   "#F87171", redBg:   "rgba(248,113,113,0.10)",
  blue:  "#38BDF8", blueBg:  "rgba(56,189,248,0.10)",
  purple:"#A78BFA", orange:  "#FB923C",
};

// Lista per la UI
export const COLOR_SCHEMES = [
  { id: "viola",   label: "Viola",   color: "#7C3AED", darkColor: "#A78BFA" },
  { id: "blu",     label: "Blu",     color: "#0EA5E9", darkColor: "#38BDF8" },
  { id: "verde",   label: "Verde",   color: "#10B981", darkColor: "#34D399" },
  { id: "arancio", label: "Arancio", color: "#F97316", darkColor: "#FB923C" },
  { id: "rosa",    label: "Rosa",    color: "#EC4899", darkColor: "#F472B6" },
];

function buildTheme(mode, scheme) {
  const s    = SCHEMES[scheme] || SCHEMES.viola;
  const base = mode === "light" ? s.light : s.dark;
  const sem  = mode === "light" ? SEMANTIC : SEMANTIC_DARK;
  return {
    ...base, ...sem,
    shadow:     mode === "light" ? "0 4px 20px rgba(0,0,0,0.08)" : "0 4px 20px rgba(0,0,0,0.5)",
    shadowCard: mode === "light" ? "0 1px 6px rgba(0,0,0,0.06)"  : "0 1px 6px rgba(0,0,0,0.4)",
    textSub: base.muted, borderStrong: base.border, cardHover: base.surface, inputBg: base.inputBg,
  };
}

export function ThemeProvider({ children }) {
  const [mode,   setMode]   = useState(() => localStorage.getItem("lf_mode")   || "light");
  const [scheme, setScheme] = useState(() => localStorage.getItem("lf_scheme") || "viola");

  const T = buildTheme(mode, scheme);

  const toggle = () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("lf_mode", next);
  };

  const setColorScheme = (s) => {
    setScheme(s);
    localStorage.setItem("lf_scheme", s);
  };

  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color      = T.text;
  }, [T]);

  return (
    <ThemeContext.Provider value={{ mode, scheme, T, toggle, setColorScheme, isDark: mode === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }

// ── ThemeToggle — solo pulsante light/dark ────────────────────
export function ThemeToggle({ style = {} }) {
  const { mode, toggle, T } = useTheme();
  return (
    <button onClick={toggle}
      title={mode === "light" ? "Tema scuro" : "Tema chiaro"}
      style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 50, padding: "6px 11px", cursor: "pointer", fontSize: 15, lineHeight: 1, transition: "all 0.2s", ...style }}>
      {mode === "light" ? "🌙" : "☀️"}
    </button>
  );
}

// ── ColorPickerDropdown — tendina compatta accanto al toggle ──
export function ColorPickerDropdown({ style = {} }) {
  const { mode, scheme, setColorScheme, T } = useTheme();
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  // Chiudi cliccando fuori
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = COLOR_SCHEMES.find(c => c.id === scheme) || COLOR_SCHEMES[0];
  const dotColor = mode === "dark" ? current.darkColor : current.color;

  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Cambia colore"
        style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 50, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
      >
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: T.accent }}>
          {current.label}
        </span>
        <span style={{ fontSize: 9, color: T.muted }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: 10, zIndex: 500,
          boxShadow: T.shadow, minWidth: 160,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {COLOR_SCHEMES.map(cs => {
            const c       = mode === "dark" ? cs.darkColor : cs.color;
            const active  = scheme === cs.id;
            return (
              <button
                key={cs.id}
                onClick={() => { setColorScheme(cs.id); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: active ? T.accentBg : "transparent",
                  border: `1px solid ${active ? T.accentBorder : "transparent"}`,
                  borderRadius: 8, padding: "7px 10px", cursor: "pointer",
                  width: "100%", textAlign: "left",
                  transition: "all 0.12s",
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: c, flexShrink: 0, boxShadow: active ? `0 0 0 2px ${c}40` : "none" }} />
                <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: active ? 700 : 500, color: active ? T.accent : T.text }}>
                  {cs.label}
                </span>
                {active && <span style={{ marginLeft: "auto", color: T.accent, fontSize: 14 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ThemePicker completo — per la tab Impostazioni ────────────
export function ThemePicker() {
  const { mode, scheme, toggle, setColorScheme, T } = useTheme();
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Modalità</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ id: "light", icon: "☀️", label: "Chiaro" }, { id: "dark", icon: "🌙", label: "Scuro" }].map(m => (
            <button key={m.id} onClick={() => { if (mode !== m.id) toggle(); }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: `2px solid ${mode === m.id ? T.accent : T.border}`, background: mode === m.id ? T.accentBg : T.surface, color: mode === m.id ? T.accent : T.muted, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Colore accent</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {COLOR_SCHEMES.map(cs => {
            const c      = mode === "dark" ? cs.darkColor : cs.color;
            const active = scheme === cs.id;
            return (
              <button key={cs.id} onClick={() => setColorScheme(cs.id)} title={cs.label}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 10, outline: active ? `2px solid ${c}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: c, boxShadow: active ? `0 0 0 3px ${c}40` : "none", transition: "all 0.15s" }} />
                <span style={{ fontSize: 10, fontFamily: "'DM Sans'", color: active ? T.accent : T.muted, fontWeight: active ? 700 : 500 }}>{cs.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
