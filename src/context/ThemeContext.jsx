// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

// ── Token fissi (non cambiano con il tema) ─────────────────────
const FIXED = {
  green:   "#1A7A4A", greenBg:  "rgba(26,122,74,0.10)",
  red:     "#C0392B", redBg:    "rgba(192,57,43,0.08)",
  shadow:      "0 2px 12px rgba(0,0,0,0.08)",
  shadowCard:  "0 1px 4px rgba(0,0,0,0.05)",
};
const FIXED_DARK = {
  green:   "#3ecf8e", greenBg:  "rgba(62,207,142,0.10)",
  red:     "#f87171", redBg:    "rgba(248,113,113,0.10)",
  shadow:      "0 2px 12px rgba(0,0,0,0.4)",
  shadowCard:  "0 1px 4px rgba(0,0,0,0.3)",
};

// ── Palette accent per ogni schema ────────────────────────────
const ACCENTS = {
  // LIGHT
  "light-oro": {
    accent: "#B8860B", accentSoft: "#D4A017",
    accentBg: "rgba(184,134,11,0.08)", accentBorder: "rgba(184,134,11,0.25)",
  },
  "light-verde": {
    accent: "#1A7A4A", accentSoft: "#229E5E",
    accentBg: "rgba(26,122,74,0.08)", accentBorder: "rgba(26,122,74,0.25)",
  },
  "light-blu": {
    accent: "#1A5FA8", accentSoft: "#2274C9",
    accentBg: "rgba(26,95,168,0.08)", accentBorder: "rgba(26,95,168,0.25)",
  },
  "light-viola": {
    accent: "#6B4FA8", accentSoft: "#8464C9",
    accentBg: "rgba(107,79,168,0.08)", accentBorder: "rgba(107,79,168,0.25)",
  },
  "light-corallo": {
    accent: "#C05A1A", accentSoft: "#E06D20",
    accentBg: "rgba(192,90,26,0.08)", accentBorder: "rgba(192,90,26,0.25)",
  },
  // DARK
  "dark-oro": {
    accent: "#e8c547", accentSoft: "#f5e17a",
    accentBg: "rgba(232,197,71,0.10)", accentBorder: "rgba(232,197,71,0.28)",
  },
  "dark-verde": {
    accent: "#3ecf8e", accentSoft: "#5de0a5",
    accentBg: "rgba(62,207,142,0.10)", accentBorder: "rgba(62,207,142,0.28)",
  },
  "dark-blu": {
    accent: "#60a5fa", accentSoft: "#86bcfc",
    accentBg: "rgba(96,165,250,0.10)", accentBorder: "rgba(96,165,250,0.28)",
  },
  "dark-viola": {
    accent: "#a78bfa", accentSoft: "#c4aefb",
    accentBg: "rgba(167,139,250,0.10)", accentBorder: "rgba(167,139,250,0.28)",
  },
  "dark-corallo": {
    accent: "#fb923c", accentSoft: "#fcaa65",
    accentBg: "rgba(251,146,60,0.10)", accentBorder: "rgba(251,146,60,0.28)",
  },
};

// ── Sfondi per i temi light (5 varianti) ─────────────────────
const LIGHT_BG = {
  "light-oro":     { bg: "#F7F5F0", surface: "#FFFFFF", card: "#FFFFFF", border: "#E8E4DC", inputBg: "#FAFAF8", navBg: "rgba(247,245,240,0.95)", text: "#1A1814", muted: "#9A948A" },
  "light-verde":   { bg: "#F0F7F3", surface: "#FFFFFF", card: "#FFFFFF", border: "#D8EDE2", inputBg: "#F8FCF9", navBg: "rgba(240,247,243,0.95)", text: "#0F2218", muted: "#6E9480" },
  "light-blu":     { bg: "#F0F4FA", surface: "#FFFFFF", card: "#FFFFFF", border: "#D4DFF0", inputBg: "#F6F9FD", navBg: "rgba(240,244,250,0.95)", text: "#0D1A2E", muted: "#7A90B0" },
  "light-viola":   { bg: "#F4F0FA", surface: "#FFFFFF", card: "#FFFFFF", border: "#DED4F2", inputBg: "#FAF8FD", navBg: "rgba(244,240,250,0.95)", text: "#1A0F2E", muted: "#9080B0" },
  "light-corallo": { bg: "#FBF4EF", surface: "#FFFFFF", card: "#FFFFFF", border: "#EEDDD0", inputBg: "#FDF8F5", navBg: "rgba(251,244,239,0.95)", text: "#2A1208", muted: "#A08070" },
};

// ── Sfondi per i temi dark ────────────────────────────────────
const DARK_BG = {
  "dark-oro":     { bg: "#0a0a0f", surface: "#13131a", card: "#1a1a26", border: "#2a2a3d", inputBg: "#13131a", navBg: "rgba(13,13,20,0.97)", text: "#f0f0f5", muted: "#6b6b8a" },
  "dark-verde":   { bg: "#080f0a", surface: "#101a12", card: "#162018", border: "#1e3422", inputBg: "#101a12", navBg: "rgba(8,15,10,0.97)",  text: "#eef5f0", muted: "#5a8060" },
  "dark-blu":     { bg: "#080a0f", surface: "#10121a", card: "#161825", border: "#1e2238", inputBg: "#10121a", navBg: "rgba(8,10,15,0.97)",  text: "#eef0f8", muted: "#5a6080" },
  "dark-viola":   { bg: "#0a080f", surface: "#13101a", card: "#1a1625", border: "#2a2038", inputBg: "#13101a", navBg: "rgba(10,8,15,0.97)",  text: "#f0eef8", muted: "#7060a0" },
  "dark-corallo": { bg: "#0f0a08", surface: "#1a1210", card: "#251816", border: "#382018", inputBg: "#1a1210", navBg: "rgba(15,10,8,0.97)",  text: "#f8f0ee", muted: "#a07060" },
};

// ── Lista schemi per la UI di selezione ───────────────────────
export const COLOR_SCHEMES = [
  { id: "oro",     label: "Oro",     emoji: "🟡", lightKey: "light-oro",     darkKey: "dark-oro"     },
  { id: "verde",   label: "Verde",   emoji: "🟢", lightKey: "light-verde",   darkKey: "dark-verde"   },
  { id: "blu",     label: "Blu",     emoji: "🔵", lightKey: "light-blu",     darkKey: "dark-blu"     },
  { id: "viola",   label: "Viola",   emoji: "🟣", lightKey: "light-viola",   darkKey: "dark-viola"   },
  { id: "corallo", label: "Corallo", emoji: "🟠", lightKey: "light-corallo", darkKey: "dark-corallo" },
];

// ── Costruisce il tema completo da mode + schema ───────────────
function buildTheme(mode, scheme) {
  const key     = `${mode}-${scheme}`;
  const bgTokens = mode === "light" ? (LIGHT_BG[key]     || LIGHT_BG["light-oro"])
                                    : (DARK_BG[key]      || DARK_BG["dark-oro"]);
  const accent   = ACCENTS[key]     || ACCENTS[`${mode}-oro`];
  const fixed    = mode === "light"  ? FIXED : FIXED_DARK;
  return {
    ...bgTokens,
    ...accent,
    ...fixed,
    // colori semantici aggiuntivi
    blue:   mode === "light" ? "#1A5FA8" : "#60a5fa",
    blueBg: mode === "light" ? "rgba(26,95,168,0.08)" : "rgba(96,165,250,0.10)",
    purple: mode === "light" ? "#6B4FA8" : "#a78bfa",
    orange: mode === "light" ? "#C05A1A" : "#fb923c",
    cardHover:    bgTokens.surface,
    textSub:      bgTokens.muted,
    borderStrong: bgTokens.border,
  };
}

// ── Provider ─────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [mode,   setMode]   = useState(() => localStorage.getItem("lf_mode")   || "light");
  const [scheme, setScheme] = useState(() => localStorage.getItem("lf_scheme") || "oro");

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

export function useTheme() {
  return useContext(ThemeContext);
}

// ── ThemeToggle (solo light/dark) ─────────────────────────────
export function ThemeToggle({ style = {} }) {
  const { mode, toggle, T } = useTheme();
  return (
    <button
      onClick={toggle}
      title={mode === "light" ? "Passa al tema scuro" : "Passa al tema chiaro"}
      style={{
        background: T.accentBg, border: `1px solid ${T.accentBorder}`,
        borderRadius: 50, padding: "6px 12px", cursor: "pointer",
        fontSize: 16, lineHeight: 1, transition: "all 0.2s", ...style,
      }}
    >
      {mode === "light" ? "🌙" : "☀️"}
    </button>
  );
}

// ── ThemePicker — selettore completo da usare nelle impostazioni
export function ThemePicker() {
  const { mode, scheme, toggle, setColorScheme, T } = useTheme();
  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');`}</style>

      {/* Light / Dark toggle */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Modalità
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ id: "light", icon: "☀️", label: "Chiaro" }, { id: "dark", icon: "🌙", label: "Scuro" }].map(m => (
            <button
              key={m.id}
              onClick={() => { if (mode !== m.id) toggle(); }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: `2px solid ${mode === m.id ? T.accent : T.border}`, background: mode === m.id ? T.accentBg : T.surface, color: mode === m.id ? T.accent : T.muted, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color scheme picker */}
      <div>
        <div style={{ fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Colore accent
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {COLOR_SCHEMES.map(cs => {
            const key    = `${mode}-${cs.id}`;
            const accent = ACCENTS[key]?.accent || "#B8860B";
            const active = scheme === cs.id;
            return (
              <button
                key={cs.id}
                onClick={() => setColorScheme(cs.id)}
                title={cs.label}
                style={{ width: 48, height: 48, borderRadius: 12, border: `3px solid ${active ? T.text : "transparent"}`, background: T.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, padding: 0, transition: "all 0.15s", boxShadow: active ? `0 0 0 2px ${accent}` : "none" }}
              >
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: accent }} />
                <span style={{ fontSize: 9, fontFamily: "'DM Sans'", color: T.muted, fontWeight: 600 }}>{cs.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Anteprima */}
      <div style={{ marginTop: 20, padding: "12px 16px", background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 12 }}>
        <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.accent, fontWeight: 700, marginBottom: 4 }}>
          {mode === "light" ? "☀️" : "🌙"} Tema corrente: {mode === "light" ? "Chiaro" : "Scuro"} · {COLOR_SCHEMES.find(c => c.id === scheme)?.label}
        </div>
        <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted }}>
          La preferenza viene salvata automaticamente.
        </div>
      </div>
    </div>
  );
}
