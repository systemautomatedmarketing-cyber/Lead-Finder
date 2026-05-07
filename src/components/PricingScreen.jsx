// src/components/PricingScreen.jsx
// Pagina pricing pubblica + modal upgrade interno all'app

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { usePlan } from "../context/PlanContext";
import { useAuth } from "../context/AuthContext";
import { PLANS } from "../data/plans";

// ── Pricing pubblico (pagina standalone, non loggato) ─────────
export function PricingPage({ onGetStarted }) {
  const { T } = useTheme();
  const [billing, setBilling] = useState("monthly"); // monthly | yearly

  const collaboratorePlans = [PLANS.starter, PLANS.collaboratore_pro];
  const leaderPlans        = [PLANS.leader_starter, PLANS.leader_pro];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, padding: "40px 20px 60px", fontFamily: "'Playfair Display', Georgia, serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap'); * { box-sizing:border-box; margin:0; padding:0; }`}</style>

      {/* Hero */}
      <div style={{ textAlign: "center", maxWidth: 480, margin: "0 auto 40px" }}>
        <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", letterSpacing: 5, textTransform: "uppercase", marginBottom: 8 }}>Lead Finder</div>
        <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.1, marginBottom: 12 }}>Il piano giusto<br />per la tua crescita</div>
        <div style={{ fontSize: 15, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.6 }}>
          Inizia gratis. Prova Pro per 14 giorni senza carta di credito.<br />Poi decidi tu.
        </div>

        {/* Billing toggle */}
        <div style={{ display: "inline-flex", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 50, padding: 4, marginTop: 24 }}>
          {["monthly", "yearly"].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ background: billing === b ? T.accent : "transparent", color: billing === b ? "#0a0a0f" : T.muted, border: "none", borderRadius: 50, padding: "8px 20px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
              {b === "monthly" ? "Mensile" : "Annuale"}{b === "yearly" && <span style={{ fontSize: 10, marginLeft: 6, background: "rgba(26,122,74,0.2)", color: "#1A7A4A", padding: "2px 6px", borderRadius: 10 }}>-25%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* COLLABORATORI */}
      <div style={{ maxWidth: 480, margin: "0 auto 32px" }}>
        <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, textAlign: "center" }}>Per Collaboratori</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {collaboratorePlans.map(plan => (
            <PlanCard key={plan.id} plan={plan} billing={billing} onSelect={() => onGetStarted(plan.id)} T={T} />
          ))}
        </div>
      </div>

      {/* LEADER */}
      <div style={{ maxWidth: 480, margin: "0 auto 40px" }}>
        <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, textAlign: "center" }}>Per Leader</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {leaderPlans.map(plan => (
            <PlanCard key={plan.id} plan={plan} billing={billing} onSelect={() => onGetStarted(plan.id)} T={T} />
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>Domande frequenti</div>
        {[
          { q: "Il trial richiede la carta di credito?", a: "No. Puoi provare il piano Pro per 14 giorni senza inserire nessun dato di pagamento. Al termine del trial, torni automaticamente al piano Starter gratuito." },
          { q: "Posso cambiare piano in qualsiasi momento?", a: "Sì. Puoi fare upgrade o downgrade in qualsiasi momento. Se fai downgrade a metà mese, mantieni il Pro fino alla fine del periodo pagato." },
          { q: "Il Leader Starter è davvero gratuito?", a: "Sì, per sempre. Puoi gestire fino a 5 collaboratori senza pagare nulla. Se il team cresce, il Leader Pro diventa conveniente automaticamente." },
          { q: "Funziona per qualsiasi azienda di network marketing?", a: "Sì. Lead Finder supporta tutti i settori: wellness, energia, cosmetici, integratori, immobiliare e molto altro. Puoi personalizzare il settore e gli script per la tua azienda." },
        ].map((faq, i) => (
          <FaqItem key={i} q={faq.q} a={faq.a} T={T} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan, billing, onSelect, T }) {
  const isHighlighted = !!plan.badge;
  const price = billing === "yearly" ? plan.price.yearly : plan.price.monthly;
  const isFree = price === 0;

  return (
    <div style={{ background: isHighlighted ? T.accentBg : T.card, border: `2px solid ${isHighlighted ? T.accent : T.border}`, borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 10, boxShadow: isHighlighted ? `0 4px 20px ${T.accent}22` : T.shadowCard }}>
      {plan.badge && (
        <div style={{ background: T.accent, color: "#0a0a0f", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontFamily: "'DM Sans'", fontWeight: 700, textAlign: "center", alignSelf: "flex-start" }}>{plan.badge}</div>
      )}
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{plan.name}</div>
      <div>
        {isFree ? (
          <span style={{ fontSize: 28, fontWeight: 900, color: T.accent }}>Gratis</span>
        ) : (
          <>
            <span style={{ fontSize: 28, fontWeight: 900, color: T.accent }}>€{billing === "yearly" ? (plan.price.yearly / 12).toFixed(2) : plan.price.monthly}</span>
            <span style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans'" }}>/mese</span>
            {billing === "yearly" && <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: "#1A7A4A", marginTop: 2 }}>€{plan.price.yearly}/anno</div>}
          </>
        )}
      </div>
      <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.5 }}>{plan.subtitle}</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {plan.features.slice(0, 4).map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <span style={{ fontSize: 12, color: f.included ? "#1A7A4A" : T.border, flexShrink: 0, marginTop: 1 }}>{f.included ? "✓" : "✗"}</span>
            <span style={{ fontSize: 11, fontFamily: "'DM Sans'", color: f.included ? T.text : T.muted, lineHeight: 1.4 }}>{f.label}</span>
          </div>
        ))}
      </div>
      <button onClick={onSelect} style={{ background: isHighlighted ? T.accent : T.surface, color: isHighlighted ? "#0a0a0f" : T.text, border: `1px solid ${isHighlighted ? T.accent : T.border}`, borderRadius: 50, padding: "10px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.15s", marginTop: 4 }}>
        {plan.cta}
      </button>
    </div>
  );
}

function FaqItem({ q, a, T }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}`, padding: "14px 0" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'DM Sans'", paddingRight: 16 }}>{q}</div>
        <span style={{ color: T.accent, fontSize: 20, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </div>
      {open && <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.7, marginTop: 10 }}>{a}</div>}
    </div>
  );
}

// ── Modal Paywall interno all'app ─────────────────────────────
export function PaywallModal({ feature, onClose }) {
  const { T } = useTheme();
  const { plan, daysLeft, onTrial, startCheckout, planId } = usePlan();
  const { userProfile } = useAuth();
  const isLeader = userProfile?.role === "leader";
  const [billing, setBilling] = useState("monthly");

  const targetPlanId = isLeader ? "leader_pro" : "collaboratore_pro";
  const targetPlan   = PLANS[targetPlanId];

  const featureLabels = {
    week:       "le settimane avanzate del percorso",
    contacts:   "i contatti illimitati",
    ai:         "il profilo persona generato dall'AI",
    recovery:   "il sistema Recovery anti-blocco",
    export:     "l'export CSV del team",
    branding:   "il branding personalizzato",
    analytics:  "le analytics avanzate",
    team:       "la visibilità completa del team",
  };
console.log("PaywallModal Inizio", onClose);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.bg, borderRadius: "24px 24px 0 0", width: "100%", padding: 24, borderTop: `3px solid ${T.accent}` }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 6 }}>Funzionalità Pro</div>
          <div style={{ fontSize: 14, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.5 }}>
            Sblocca {featureLabels[feature] || "questa funzionalità"} con <strong style={{ color: T.accent }}>{targetPlan.name}</strong>
          </div>
        </div>

        {/* Trial badge */}
        {!onTrial && (
          <div style={{ background: "#1A7A4A22", border: "1px solid #1A7A4A44", borderRadius: 12, padding: "12px 16px", marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1A7A4A", fontFamily: "'DM Sans'" }}>🎁 14 giorni gratis — nessuna carta richiesta</div>
          </div>
        )}

        {onTrial && (
          <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.accent, fontWeight: 700 }}>⏱ Trial attivo — {daysLeft} giorni rimanenti</div>
          </div>
        )}

        {/* Billing toggle */}
        <div style={{ display: "flex", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 50, padding: 3, marginBottom: 16 }}>
          {["monthly", "yearly"].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ flex: 1, background: billing === b ? T.accent : "transparent", color: billing === b ? "#0a0a0f" : T.muted, border: "none", borderRadius: 50, padding: "8px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              {b === "monthly" ? "Mensile" : `Annuale (-25%)`}
            </button>
          ))}
        </div>

        {/* Prezzo */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: T.accent }}>
            €{billing === "yearly" ? (targetPlan.price.yearly / 12).toFixed(2) : targetPlan.price.monthly}
          </span>
          <span style={{ fontSize: 14, color: T.muted, fontFamily: "'DM Sans'" }}>/mese</span>
          {billing === "yearly" && (
            <div style={{ fontSize: 12, color: "#1A7A4A", fontFamily: "'DM Sans'", marginTop: 2 }}>€{targetPlan.price.yearly} fatturati annualmente</div>
          )}
        </div>

        {/* Feature list */}
        <div style={{ marginBottom: 20 }}>
          {targetPlan.features.filter(f => f.included).slice(0, 5).map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
              <span style={{ color: "#1A7A4A", fontSize: 14, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text }}>{f.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => startCheckout(targetPlanId, billing)}
          style={{ width: "100%", background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "15px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 16, cursor: "pointer", marginBottom: 10 }}
        >
          {onTrial ? `Abbonati a ${targetPlan.name}` : `Prova gratis 14 giorni`}
        </button>

        <button onClick={onClose} style={{ width: "100%", background: "none", color: T.muted, border: "none", padding: "8px 0", fontFamily: "'DM Sans'", fontSize: 13, cursor: "pointer" }}>
          Torna al piano Starter
        </button>
      </div>
    </div>
  );
}

// ── Banner trial nell'app ─────────────────────────────────────
export function TrialBanner() {
  const { T } = useTheme();
  const { onTrial, daysLeft, isPro, planId, startCheckout } = usePlan();
  const { userProfile } = useAuth();

  if (!onTrial && isPro) return null;
  if (planId === "starter" || planId === "leader_starter") return null;

  const isLeader    = userProfile?.role === "leader";
  const targetPlan  = isLeader ? "leader_pro" : "collaboratore_pro";
  const isUrgent    = daysLeft <= 3;

  if (!onTrial) return null;

  return (
    <div style={{ background: isUrgent ? "#C0392B22" : T.accentBg, border: `1px solid ${isUrgent ? "#C0392B44" : T.accentBorder}`, borderRadius: 10, padding: "10px 14px", margin: "0 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: isUrgent ? "#C0392B" : T.accent, fontWeight: 700 }}>
          {isUrgent ? `⚠️ Trial scade tra ${daysLeft} giorni` : `✨ Trial Pro — ${daysLeft} giorni rimanenti`}
        </div>
        <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted }}>Al termine torni al piano Starter</div>
      </div>
      <button onClick={() => startCheckout(targetPlan)} style={{ background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "6px 14px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 11, cursor: "pointer", flexShrink: 0 }}>
        Abbonati
      </button>
    </div>
  );
}
