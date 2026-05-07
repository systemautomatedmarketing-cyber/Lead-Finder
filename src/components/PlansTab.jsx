// src/components/PlansTab.jsx
// Tab "Piani" accessibile dall'interno dei dashboard collaboratore e leader.
// Mostra i piani disponibili per il proprio ruolo, lo stato attuale,
// il trial rimanente e il bottone di upgrade.

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { usePlan } from "../context/PlanContext";
import { PLANS, trialDaysLeft, TRIAL_DAYS } from "../data/plans";

export default function PlansTab() {
  const { T }                        = useTheme();
  const { userProfile }              = useAuth();
  const { planId, isPro, onTrial, daysLeft, startCheckout } = usePlan();
  const [billing, setBilling]        = useState("monthly");
  const [loadingPlan, setLoadingPlan] = useState(null);

  const role      = userProfile?.role || "collaboratore";
  const isLeader  = role === "leader" || userProfile?.isLeader;

  // Mostra i piani rilevanti per il ruolo dell'utente
  const availablePlans = isLeader
    ? [PLANS.leader_starter, PLANS.leader_pro]
    : [PLANS.starter, PLANS.collaboratore_pro];

  const handleUpgrade = async (plan) => {
    if (!plan.stripe_monthly) return; // piano gratuito
    setLoadingPlan(plan.id);
    await startCheckout(plan.id, billing);
    setLoadingPlan(null);
  };

  const isCurrentPlan = (plan) => {
    if (onTrial) return plan.id === (isLeader ? "leader_pro" : "collaboratore_pro");
    return plan.id === planId;
  };

  const card = {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 20,
    boxShadow: T.shadowCard,
    marginBottom: 16,
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, fontFamily: "'Playfair Display'", marginBottom: 4 }}>
          I tuoi Piani
        </div>
        <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted }}>
          {onTrial
            ? `🎁 Trial attivo — ${daysLeft} giorni rimanenti su ${TRIAL_DAYS}`
            : isPro
              ? "✅ Sei al piano Pro"
              : "Passa al Pro per sbloccare tutte le funzionalità"}
        </div>
      </div>

      {/* Trial banner */}
      {onTrial && (
        <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 24 }}>⏰</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: "'DM Sans'" }}>
              Trial Pro in corso — {daysLeft} giorni rimasti
            </div>
            <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, marginTop: 2 }}>
              Stai usando tutte le funzionalità Pro. Abbonati prima della scadenza per non perdere l'accesso.
            </div>
          </div>
        </div>
      )}

      {/* Billing toggle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ display: "inline-flex", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 50, padding: 3 }}>
          {[
            { id: "monthly", label: "Mensile" },
            { id: "yearly",  label: "Annuale", badge: "-25%" },
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setBilling(b.id)}
              style={{ background: billing === b.id ? T.accent : "transparent", color: billing === b.id ? "#0a0a0f" : T.muted, border: "none", borderRadius: 50, padding: "7px 18px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
            >
              {b.label}
              {b.badge && (
                <span style={{ fontSize: 9, background: "rgba(26,122,74,0.2)", color: "#1A7A4A", padding: "2px 5px", borderRadius: 8, fontWeight: 700 }}>
                  {b.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      {availablePlans.map(plan => {
        const isCurrent  = isCurrentPlan(plan);
        const isFree     = plan.price.monthly === 0;
        const price      = billing === "yearly" ? plan.price.yearly : plan.price.monthly;
        const isLoading  = loadingPlan === plan.id;

        return (
          <div
            key={plan.id}
            style={{ ...card, border: isCurrent ? `2px solid ${T.accent}` : `1px solid ${T.border}`, position: "relative" }}
          >
            {/* Badge piano popolare / corrente */}
            {(plan.badge || isCurrent) && (
              <div style={{ position: "absolute", top: -12, left: 16, background: isCurrent ? "#1A7A4A" : T.accent, color: isCurrent ? "#fff" : "#0a0a0f", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Sans'", fontWeight: 700 }}>
                {isCurrent ? (onTrial ? "🎁 In trial" : "✅ Piano attuale") : plan.badge}
              </div>
            )}

            {/* Header piano */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'Playfair Display'", marginBottom: 2 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'" }}>{plan.subtitle}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {isFree ? (
                  <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>Gratis</div>
                ) : (
                  <>
                    <div style={{ fontSize: 26, fontWeight: 900, color: plan.color }}>
                      €{billing === "yearly" ? (price / 12).toFixed(2) : price}
                      <span style={{ fontSize: 13, fontWeight: 400, color: T.muted }}>/mese</span>
                    </div>
                    {billing === "yearly" && (
                      <div style={{ fontSize: 11, color: "#1A7A4A", fontFamily: "'DM Sans'", marginTop: 2 }}>
                        €{price}/anno · risparmi €{((plan.price.monthly * 12) - price).toFixed(0)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Feature list */}
            <div style={{ marginBottom: 16 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, flexShrink: 0, color: f.included ? "#1A7A4A" : T.border }}>
                    {f.included ? "✓" : "✗"}
                  </span>
                  <span style={{ fontSize: 13, fontFamily: "'DM Sans'", color: f.included ? T.text : T.muted, textDecoration: f.included ? "none" : "none" }}>
                    {f.label}
                  </span>
                </div>
              ))}

              {/* Multi-company badge per Leader Pro */}
              {plan.id === "leader_pro" && (
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, flexShrink: 0, color: "#1A7A4A" }}>✓</span>
                  <span style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text }}>
                    Multi-azienda (gestisci più brand)
                  </span>
                </div>
              )}
            </div>

            {/* CTA */}
            {isCurrent && !onTrial ? (
              <div style={{ textAlign: "center", padding: "10px 0", fontSize: 13, fontFamily: "'DM Sans'", color: "#1A7A4A", fontWeight: 600 }}>
                ✅ Piano attivo
              </div>
            ) : isFree && !isCurrent ? (
              <div style={{ textAlign: "center", padding: "10px 0", fontSize: 12, fontFamily: "'DM Sans'", color: T.muted }}>
                Piano base — sempre disponibile
              </div>
            ) : (
              <button
                onClick={() => handleUpgrade(plan)}
                disabled={isLoading || isCurrent}
                style={{ width: "100%", background: isCurrent && onTrial ? T.surface : plan.color === "#6b6b8a" ? T.surface : T.accent, color: isCurrent && onTrial ? T.muted : "#0a0a0f", border: `1px solid ${isCurrent && onTrial ? T.border : T.accent}`, borderRadius: 50, padding: "13px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, cursor: isLoading ? "wait" : "pointer", opacity: isLoading ? 0.7 : 1, transition: "all 0.2s" }}
              >
                {isLoading ? "Redirect a Stripe..." : onTrial && isCurrent ? "Abbonati ora" : plan.cta}
              </button>
            )}
          </div>
        );
      })}

      {/* Info multi-company */}
      {isLeader && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'", marginBottom: 6 }}>
            🏢 Multi-azienda — incluso in Leader Pro
          </div>
          <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.6 }}>
            Con Leader Pro puoi gestire più aziende di network marketing dallo stesso account. Script, lead e missioni si adattano automaticamente all'azienda selezionata. Nessun costo aggiuntivo.
          </div>
        </div>
      )}

      {/* FAQ rapida */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Domande frequenti
        </div>
        {[
          { q: "Posso disdire quando voglio?", r: "Sì. Disdici in qualsiasi momento dal portale abbonamenti. Non ci sono penali." },
          { q: "Cosa succede al trial dopo 14 giorni?", r: "Torni automaticamente al piano Starter gratuito. Non perdi i dati, solo le funzioni avanzate." },
          { q: "Il piano è per persona o per account?", r: "Per account. Ogni collaboratore gestisce il proprio piano indipendentemente." },
        ].map((faq, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'", marginBottom: 3 }}>
              {faq.q}
            </div>
            <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.5 }}>
              {faq.r}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
