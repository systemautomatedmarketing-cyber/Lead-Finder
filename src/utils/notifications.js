// src/utils/notifications.js
// Sistema di notifiche push per Lead Finder
// Usa le Web Push Notifications (browser) + Firebase Cloud Messaging (FCM)
// per i reminder follow-up lead e le missioni giornaliere

import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// ── VAPID Key pubblica FCM ────────────────────────────────────
// Generala in Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
// Sostituisci con la tua chiave reale
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjZSfbosWqFv24eMSnqY1q3A8";

// ── Service Worker registration ───────────────────────────────
let swRegistration = null;

export async function initNotifications() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    console.log("Notifiche push non supportate dal browser");
    return false;
  }
  try {
    swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("Service Worker registrato");
    return true;
  } catch (err) {
    console.error("Service Worker registration failed:", err);
    return false;
  }
}

// ── Richiedi permesso notifiche ───────────────────────────────
export async function requestNotificationPermission(userId) {
  if (!("Notification" in window)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  try {
    // Importa FCM solo se disponibile
    const { getMessaging, getToken } = await import("firebase/messaging");
    const { getApp } = await import("firebase/app");
    const messaging = getMessaging(getApp());

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (token && userId) {
      // Salva il token FCM sul profilo utente
      await updateDoc(doc(db, "users", userId), {
        fcmToken:             token,
        notificationsEnabled: true,
        notificationsUpdatedAt: new Date().toISOString(),
      });
      console.log("FCM token salvato");
    }
    return true;
  } catch (err) {
    console.warn("FCM non disponibile, uso notifiche browser locali:", err.message);
    // Fallback: salva solo il flag senza FCM token
    if (userId) {
      await updateDoc(doc(db, "users", userId), {
        notificationsEnabled: true,
        notificationsUpdatedAt: new Date().toISOString(),
      });
    }
    return true;
  }
}

// ── Disabilita notifiche ──────────────────────────────────────
export async function disableNotifications(userId) {
  if (!userId) return;
  await updateDoc(doc(db, "users", userId), {
    notificationsEnabled: false,
    fcmToken: null,
  });
}

// ── Notifica browser locale (fallback immediato) ──────────────
export function showLocalNotification(title, body, options = {}) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const notification = new Notification(title, {
    body,
    icon:  "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag:   options.tag || "lead-finder",
    data:  options.data || {},
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
    if (options.url) window.location.href = options.url;
  };

  // Auto-chiudi dopo 8 secondi
  setTimeout(() => notification.close(), 8000);
}

// ── Calcola follow-up scaduti per oggi ───────────────────────
export function getFollowupsForToday(contacts) {
  const today = new Date();
  return contacts.filter(c => {
    if (!c.contactedAt) return false;
    if (["convertito", "collaboratore", "archiviato"].includes(c.status)) return false;
    const contactDate = new Date(c.contactedAt);
    const daysDiff    = Math.floor((today - contactDate) / (1000 * 60 * 60 * 24));
    return [2, 5, 10, 21].includes(daysDiff);
  });
}

// ── Controlla e invia notifiche follow-up ────────────────────
export function checkFollowupNotifications(contacts, userName) {
  const due = getFollowupsForToday(contacts);
  if (!due.length) return;

  const names = due.map(c => c.name).join(", ");
  const count = due.length;

  showLocalNotification(
    `⏰ ${count} follow-up da fare oggi`,
    count === 1
      ? `Ricordati di ricontattare ${names}`
      : `Ricontatta: ${names.substring(0, 60)}${names.length > 60 ? "..." : ""}`,
    {
      tag:  "followup-reminder",
      data: { type: "followup" },
    }
  );
}

// ── Notifica missione giornaliera ────────────────────────────
export function notifyDailyMission(missionTitle, points) {
  showLocalNotification(
    "⚡ Missione del giorno disponibile",
    `${missionTitle} · +${points} punti`,
    { tag: "daily-mission", data: { type: "mission" } }
  );
}

// ── Notifica obiettivo settimanale raggiunto ─────────────────
export function notifyWeeklyGoalReached(weekNum) {
  showLocalNotification(
    "🏆 Obiettivo settimana raggiunto!",
    `Ottimo lavoro! Hai completato l'obiettivo della settimana ${weekNum}. Avanza alla prossima!`,
    { tag: "weekly-goal", data: { type: "goal" } }
  );
}

// ── Notifica nuovo collaboratore nel team ────────────────────
export function notifyNewTeamMember(memberName) {
  showLocalNotification(
    "👑 Nuovo collaboratore nel tuo team!",
    `${memberName} si è unito al tuo team. Avvia l'onboarding!`,
    { tag: "new-member", data: { type: "team" } }
  );
}

// ── Scheduler locale per i reminder ──────────────────────────
// Controlla i follow-up ogni volta che l'app torna in foreground
export function setupFollowupScheduler(contacts, userName, onNotification) {
  // Controlla immediatamente
  const due = getFollowupsForToday(contacts);
  if (due.length > 0) {
    onNotification(due);
    // Notifica browser se permesso
    if (Notification.permission === "granted") {
      checkFollowupNotifications(contacts, userName);
    }
  }

  // Controlla ogni ora (in background)
  const interval = setInterval(() => {
    const dueLater = getFollowupsForToday(contacts);
    if (dueLater.length > 0) {
      onNotification(dueLater);
    }
  }, 60 * 60 * 1000); // ogni ora

  return () => clearInterval(interval);
}
