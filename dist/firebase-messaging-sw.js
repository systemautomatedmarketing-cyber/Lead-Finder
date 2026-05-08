// public/firebase-messaging-sw.js
// Service Worker per Firebase Cloud Messaging
// Gestisce le notifiche push quando l'app è in background
//
// IMPORTANTE: questo file va nella cartella /public del progetto Vite
// NON modificare il nome — Firebase lo cerca esattamente così

importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

// ── Configurazione Firebase (stessa del src/firebase.js) ─────
// Qui non possiamo usare import.meta.env — usiamo i valori diretti
// Aggiorna questi valori con quelli del tuo progetto Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBKdhPqwoVf-6w7yAGdo1UjqpoVc6UxKIo",
  authDomain: "lead-finder-b5602.firebaseapp.com",
  projectId: "lead-finder-b5602",
  storageBucket: "lead-finder-b5602.firebasestorage.app",
  messagingSenderId: "707007713023",
  appId: "1:707007713023:web:d44f11f573035e0889c6ca",
  measurementId: "G-EEZ2486W3T"
});

const messaging = firebase.messaging();

// ── Gestisci notifiche in background ─────────────────────────
messaging.onBackgroundMessage(payload => {
  console.log("Lead Finder — Notifica background ricevuta:", payload);

  const { title, body, icon, data } = payload.notification || {};

  const notifOptions = {
    body:   body  || "Hai qualcosa da fare su Lead Finder",
    icon:   icon  || "/icons/icon-192x192.png",
    badge:        "/icons/badge-72x72.png",
    data:   data  || {},
    actions: [
      { action: "open", title: "Apri l'app" },
      { action: "close", title: "Chiudi" },
    ],
    requireInteraction: false,
    tag: data?.type || "lead-finder",
  };

  self.registration.showNotification(title || "Lead Finder", notifOptions);
});

// ── Gestisci click sulla notifica ────────────────────────────
self.addEventListener("notificationclick", event => {
  event.notification.close();

  if (event.action === "close") return;

  // Apri o porta in focus l'app
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow("/");
    })
  );
});
