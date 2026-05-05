// src/components/NotificationSettings.jsx
// Componente per gestire le impostazioni delle notifiche push
// Usato nel CollaboratoreDashboard (sezione impostazioni)

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  requestNotificationPermission,
  disableNotifications,
  initNotifications,
} from "../utils/notifications";

export default function NotificationSettings({ onClose }) {
  const { userProfile, updateProfile } = useAuth();
  const { T } = useTheme();

  const [permission, setPermission]   = useState(Notification?.permission || "default");
  const [enabled, setEnabled]         = useState(userProfile?.notificationsEnabled || false);
  const [loading, setLoading]         = useState(false);
  const [supported, setSupported]     = useState(true);

  useEffect(() => {
    if (!("Notification" in window)) {
      setSupported(false);
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  const enableNotifications = async () => {
    setLoading(true);
    await initNotifications();
    const ok = await requestNotificationPermission(userProfile?.uid);
    if (ok) {
      setEnabled(true);
      setPermission(Notification.permission);
    }
    setLoading(false);
  };

  const handleDisable = async () => {
    setLoading(true);
    await disableNotifications(userProfile?.uid);
    setEnabled(false);
    setLoading(false);
  };

  const card = {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: T.shadowCard,
  };

  const NOTIFICATION_TYPES = [
    { icon: "⏰", label: "Follow-up lead", desc: "Ti avvisa quando un lead deve essere ricontattato (giorno 2, 5, 10, 21)", key: "followup" },
    { icon: "⚡", label: "Missioni del giorno", desc: "Reminder mattutino per le missioni della settimana corrente", key: "missions" },
    { icon: "🏆", label: "Obiettivi raggiunti", desc: "Notifica quando raggiungi l'obiettivo settimanale", key: "goals" },
    { icon: "👑", label: "Nuovo collaboratore", desc: "Avviso quando qualcuno si unisce al tuo team (solo se sei leader)", key: "team" },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.bg, borderRadius: "24px 24px 0 0", width: "100%", maxHeight: "88vh", overflowY: "auto", padding: 24, borderTop: `3px solid ${T.accent}` }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>🔔 Notifiche</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: "'Playfair Display'" }}>Impostazioni Notifiche</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, padding: "6px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 12 }}>✕</button>
        </div>

        {!supported ? (
          <div style={{ ...card, textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>😕</div>
            <div style={{ fontSize: 14, color: T.text, fontFamily: "'DM Sans'", fontWeight: 700, marginBottom: 4 }}>Browser non supportato</div>
            <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", lineHeight: 1.5 }}>
              Il tuo browser non supporta le notifiche push. Prova Chrome o Safari su iOS 16.4+.
            </div>
          </div>
        ) : (
          <>
            {/* Stato attuale */}
            <div style={{ ...card, background: enabled ? T.accentBg : T.surface }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'", marginBottom: 2 }}>
                    {enabled ? "🔔 Notifiche attive" : "🔕 Notifiche disattivate"}
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'" }}>
                    {permission === "denied"
                      ? "Permesso negato — abilitale dalle impostazioni del browser"
                      : enabled
                        ? "Ricevi avvisi per follow-up, missioni e obiettivi"
                        : "Attiva per non perdere i momenti chiave"}
                  </div>
                </div>
                {permission !== "denied" && (
                  <button
                    onClick={enabled ? handleDisable : enableNotifications}
                    disabled={loading}
                    style={{ background: enabled ? T.surface : T.accent, color: enabled ? T.text : "#0a0a0f", border: `1px solid ${enabled ? T.border : T.accent}`, borderRadius: 50, padding: "8px 16px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0, marginLeft: 12 }}
                  >
                    {loading ? "..." : enabled ? "Disattiva" : "Attiva"}
                  </button>
                )}
              </div>
            </div>

            {/* Tipi di notifica */}
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Quando ricevi notifiche
            </div>

            {NOTIFICATION_TYPES.map(n => (
              <div key={n.key} style={{ ...card, opacity: enabled ? 1 : 0.5 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{n.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'", marginBottom: 2 }}>{n.label}</div>
                    <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'", lineHeight: 1.5 }}>{n.desc}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Nota iOS */}
            <div style={{ ...card, background: T.surface, marginTop: 4 }}>
              <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", lineHeight: 1.6 }}>
                📱 <strong>Su iPhone</strong>: aggiungi Lead Finder alla schermata Home (Safari → Condividi → Aggiungi a Home) per ricevere le notifiche push anche su iOS.
              </div>
            </div>
          </>
        )}

        <button onClick={onClose} style={{ width: "100%", background: "none", color: T.muted, border: "none", padding: "12px 0", fontFamily: "'DM Sans'", fontSize: 13, cursor: "pointer", marginTop: 8 }}>
          Chiudi
        </button>
      </div>
    </div>
  );
}
