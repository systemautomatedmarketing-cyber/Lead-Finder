// src/utils/pwa.js
// Gestione PWA: registrazione SW + prompt installazione
// Versione PRODUZIONE — banner appare al primo accesso e ogni 7 giorni dopo dismiss

const SHOW_DELAY_MS  = 4000;              // 4s dopo apertura app
const REPEAT_MS      = 60 * 60 * 1000;   // controlla ogni ora (mostra solo se >7gg)
const REMINDER_DAYS  = 7;                 // giorni tra un reminder e l'altro
const LS_DISMISSED   = "lf_pwa_dismissed_at";
const LS_INSTALLED   = "lf_pwa_installed";

// ── Intercetta beforeinstallprompt a livello modulo ──────────
// IMPORTANTE: deve stare qui (fuori da React) per catturarlo
// 	prima che il componente venga montato
let _deferredPrompt  = null;
let _promptListeners = [];

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    _deferredPrompt = event;
    console.log("[PWA] beforeinstallprompt catturato ✅");
    _promptListeners.forEach(cb => cb(true));
  });

  window.addEventListener("appinstalled", () => {
    _deferredPrompt = null;
    localStorage.setItem(LS_INSTALLED, "1");
    _promptListeners.forEach(cb => cb(false));
    console.log("[PWA] App installata come PWA ✅");
  });
}

// Registra callback — chiamata subito se prompt già disponibile
export function onPromptAvailable(callback) {
  _promptListeners.push(callback);
  if (_deferredPrompt) {
    console.log("[PWA] Prompt già disponibile — callback immediata");
    callback(true);
  }
  return () => {
    _promptListeners = _promptListeners.filter(cb => cb !== callback);
  };
}

export async function triggerInstallPrompt() {
  if (!_deferredPrompt) {
    console.warn("[PWA] deferredPrompt non disponibile");
    return false;
  }
  _deferredPrompt.prompt();
  const { outcome } = await _deferredPrompt.userChoice;
  _deferredPrompt = null;
  return outcome === "accepted";
}

// ── Logica show/hide ──────────────────────────────────────────
export function shouldShowBanner() {
  if (isInstalledPWA()) return false;
  if (localStorage.getItem(LS_INSTALLED)) return false;

  const dismissedAt = localStorage.getItem(LS_DISMISSED);
  if (dismissedAt) {
    const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
    if (daysPassed < REMINDER_DAYS) return false;
  }
  return true;
}

export function dismissBanner() {
  localStorage.setItem(LS_DISMISSED, String(Date.now()));
}

export function getShowDelayMs()  { return SHOW_DELAY_MS; }
export function getRepeatMs()     { return REPEAT_MS; }
export function getReminderDays() { return REMINDER_DAYS; }

// ── Device detection ──────────────────────────────────────────
export function isInstalledPWA() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isSafari() {
  return /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
}

// ── Registra Service Worker ───────────────────────────────────
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("[PWA] Service Worker non supportato");
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    reg.addEventListener("updatefound", () => {
      const w = reg.installing;
      w?.addEventListener("statechange", () => {
        if (w.state === "installed" && navigator.serviceWorker.controller) {
          console.log("[PWA] Aggiornamento disponibile — ricarica per applicarlo");
        }
      });
    });
    console.log("[PWA] Service Worker registrato ✅", reg.scope);
    return reg;
  } catch (err) {
    console.error("[PWA] SW registration failed ❌", err);
    return null;
  }
}
