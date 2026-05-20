// src/components/PWAInstallBanner.jsx — MODALITA DEBUG
// Appare sempre dopo 3 secondi e ogni ora — rimuovere DEBUG quando ok

import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  onPromptAvailable, triggerInstallPrompt,
  shouldShowBanner, dismissBanner,
  getShowDelayMs, getRepeatMs, getReminderDays,
  isInstalledPWA, isIOS, isSafari,
} from "../utils/pwa";

export default function PWAInstallBanner({ forceShow = false, onShown } = {}) {
  const { T }                     = useTheme();
  const [show, setShow]           = useState(false);
  const [isIOSDevice, setIsIOS]   = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);
  const showTimer   = useRef(null);
  const repeatTimer = useRef(null);

console.log("isInstalledPWA : ", isInstalledPWA());

  const openBanner = () => {
    if (isInstalledPWA()) return;
    console.log("[PWABanner] Apro il banner");
    setShow(true);
  };

  // forceShow: apre il banner immediatamente su richiesta del bottone header
  useEffect(() => {
    if (forceShow) {
      setShow(true);
      onShown?.();
    }
  }, [forceShow]);

  useEffect(() => {
    if (isInstalledPWA()) return;

    const ios = isIOS() && isSafari();
    setIsIOS(ios);

    // Mostra dopo il delay iniziale
    showTimer.current = setTimeout(openBanner, getShowDelayMs());

    // Ripeti ogni ora
    repeatTimer.current = setInterval(() => {
      if (shouldShowBanner()) {
        console.log("[PWABanner] Repeat orario — riapro");
        setShow(true);
      }
    }, getRepeatMs());

    if (!ios) {
      // Registra callback per prompt nativo Android
      const unsub = onPromptAvailable((available) => {
        console.log("[PWABanner] Prompt disponibile:", available);
        setHasPrompt(available);
      });
      return () => {
        unsub();
        clearTimeout(showTimer.current);
        clearInterval(repeatTimer.current);
      };
    }

    return () => {
      clearTimeout(showTimer.current);
      clearInterval(repeatTimer.current);
    };
  }, []);

  const handleDismiss = () => {
    setShow(false);
    dismissBanner();
  };

  const handleInstall = async () => {
    const accepted = await triggerInstallPrompt();
    if (accepted) setShow(false);
  };

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes pwaUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div style={{
        position: "fixed", bottom: 88, left: 12, right: 12, zIndex: 8500,
        background: T.card, border: `2px solid ${T.accent}`, borderRadius: 18,
        padding: 14, boxShadow: `0 8px 40px rgba(0,0,0,0.30), 0 0 0 4px ${T.accent}18`,
        display: "flex", gap: 12, alignItems: "flex-start",
        animation: "pwaUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: T.accentBg, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
          📲
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'", marginBottom: 3 }}>
            Installa Lead Finder
          </div>

          {isIOSDevice ? (
            <>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", lineHeight: 1.65, marginBottom: 10 }}>
                Tocca <span style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 5, padding: "1px 6px", fontSize: 13 }}>⎋</span>{" "}
                <strong style={{ color: T.text }}>Condividi</strong> in Safari,
                poi <strong style={{ color: T.text }}>"Aggiungi a Home"</strong>.
                Avrai notifiche e accesso diretto.
              </div>
              <button onClick={handleDismiss} style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, borderRadius: 50, padding: "7px 18px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                Ok, capito!
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", lineHeight: 1.65, marginBottom: 10 }}>
                {hasPrompt
                  ? "Icona sul telefono + notifiche push per missioni e follow-up. Gratuito, nessun app store."
                  : "Usa il menu del browser → \"Aggiungi a Home\" per installare l'app."}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {hasPrompt && (
                  <button onClick={handleInstall} style={{ background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "8px 20px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    Installa
                  </button>
                )}
                <button onClick={handleDismiss} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 50, padding: "8px 14px", fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  {hasPrompt ? "Non ora" : "Ok"}
                </button>
              </div>
            </>
          )}
          <div style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Sans'", marginTop: 8, opacity: 0.6 }}>
            Te lo ricordiamo ogni {getReminderDays()} giorni.
          </div>
        </div>

        <button onClick={handleDismiss} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1, flexShrink: 0 }}>
          ✕
        </button>
      </div>
    </>
  );
}
