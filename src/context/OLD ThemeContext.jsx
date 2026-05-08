// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

// ── Palette completa light + dark ────────────────────────────
export const THEMES = {
  light: {
    bg:          "#F7F5F0",   // crema calda
    surface:     "#FFFFFF",
    card:        "#FFFFFF",
    cardHover:   "#FAFAF8",
    border:      "#E8E4DC",
    borderStrong:"#D4CFC4",
    accent:      "#B8860B",   // oro scuro — leggibile su bianco
    accentSoft:  "#D4A017",
    accentBg:    "rgba(184,134,11,0.08)",
    accentBorder:"rgba(184,134,11,0.25)",
    text:        "#1A1814",
    textSub:     "#4A4640",
    muted:       "#9A948A",
    green:       "#1A7A4A",
    greenBg:     "rgba(26,122,74,0.08)",
    red:         "#C0392B",
    redBg:       "rgba(192,57,43,0.08)",
    blue:        "#1A5FA8",
    blueBg:      "rgba(26,95,168,0.08)",
    purple:      "#6B4FA8",
    orange:      "#C05A1A",
    navBg:       "rgba(247,245,240,0.95)",
    shadow:      "0 2px 12px rgba(0,0,0,0.06)",
    shadowCard:  "0 1px 4px rgba(0,0,0,0.04)",
    inputBg:     "#FAFAF8",
  },
  dark: {
    bg:          "#0a0a0f",
    surface:     "#13131a",
    card:        "#1a1a26",
    cardHover:   "#202030",
    border:      "#2a2a3d",
    borderStrong:"#3a3a50",
    accent:      "#e8c547",
    accentSoft:  "#f5e17a",
    accentBg:    "rgba(232,197,71,0.10)",
    accentBorder:"rgba(232,197,71,0.28)",
    text:        "#f0f0f5",
    textSub:     "#c0c0cc",
    muted:       "#6b6b8a",
    green:       "#3ecf8e",
    greenBg:     "rgba(62,207,142,0.10)",
    red:         "#f87171",
    redBg:       "rgba(248,113,113,0.10)",
    blue:        "#60a5fa",
    blueBg:      "rgba(96,165,250,0.10)",
    purple:      "#a78bfa",
    orange:      "#fb923c",
    navBg:       "rgba(13,13,20,0.97)",
    shadow:      "0 2px 12px rgba(0,0,0,0.4)",
    shadowCard:  "0 1px 4px rgba(0,0,0,0.3)",
    inputBg:     "#13131a",
  },
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("sorgenta_theme") || "light";
  });

  const T = THEMES[mode];

  const toggle = () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("sorgenta_theme", next);
  };

  // Applica colore di sfondo al body
  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
  }, [T]);

  return (
    <ThemeContext.Provider value={{ mode, T, toggle, isDark: mode === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// ── Componente toggle riutilizzabile ─────────────────────────
export function ThemeToggle({ style = {} }) {
  const { mode, toggle, T } = useTheme();
  return (
    <button
      onClick={toggle}
      title={mode === "light" ? "Passa al tema scuro" : "Passa al tema chiaro"}
      style={{
        background: T.accentBg,
        border: `1px solid ${T.accentBorder}`,
        borderRadius: 50,
        padding: "6px 12px",
        cursor: "pointer",
        fontSize: 16,
        lineHeight: 1,
        transition: "all 0.2s",
        ...style,
      }}
    >
      {mode === "light" ? "🌙" : "☀️"}
    </button>
  );
}
