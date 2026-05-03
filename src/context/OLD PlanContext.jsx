// src/context/PlanContext.jsx
// Gestisce piano attivo, limiti, trial e checkout Stripe

import { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";
import {
  effectivePlan, planHas, isContactLimitReached,
  isWeekAccessible, teamVisibleLimit, trialDaysLeft,
  isTrialActive, PLANS, STRIPE_PRICES,
} from "../data/plans";

// ── Stripe publishable key (sostituisci con la tua) ───────────
const STRIPE_PK = "pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXX";
// Per test usa: "pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXX"

const PlanContext = createContext(null);

export function PlanProvider({ children }) {
  const { userProfile, updateProfile } = useAuth();

  const planId   = effectivePlan(userProfile);
  const plan     = PLANS[planId];
  const onTrial  = isTrialActive(userProfile);
  const daysLeft = trialDaysLeft(userProfile?.trialStartedAt);
  const isPro    = planId === "collaboratore_pro" || planId === "leader_pro";

  // ── Attiva trial (chiamato al primo accesso dopo registrazione) ──
  const startTrial = async () => {
    if (userProfile?.trialStartedAt) return; // già avviato
    await updateProfile({
      plan: userProfile?.role === "leader" ? "leader_starter" : "starter",
      trialStartedAt: new Date(),
      subscriptionStatus: "trial",
    });
  };

  // ── Checkout Stripe ──────────────────────────────────────────
  const startCheckout = async (priceKey, billingPeriod = "monthly") => {
    try {
      // Carica Stripe dinamicamente solo quando serve
//TEMP      const { loadStripe } = await import("@stripe/stripe-js");
      const stripe = await loadStripe(STRIPE_PK);
      if (!stripe) throw new Error("Stripe non disponibile");

      // In produzione qui chiami il tuo backend/Firebase Function
      // che crea una Checkout Session e restituisce l'URL
      // Per ora mostra un messaggio di placeholder
      alert(`Reindirizzamento a Stripe per il piano ${PLANS[priceKey]?.name || priceKey}.\n\nConnetti il tuo backend Firebase per completare l'integrazione.`);

      // Esempio di chiamata al backend:
      // const resp = await fetch("/api/create-checkout", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     priceId: STRIPE_PRICES[`${priceKey}_${billingPeriod}`],
      //     userId: userProfile.uid,
      //     email: userProfile.email,
      //   }),
      // });
      // const { sessionId } = await resp.json();
      // await stripe.redirectToCheckout({ sessionId });

    } catch (err) {
      console.error("Stripe checkout error:", err);
    }
  };

  // ── Verifica limiti ──────────────────────────────────────────
  const can = useMemo(() => ({
    accessWeek:      (w) => isWeekAccessible(planId, w),
    addContact:      (count) => !isContactLimitReached(planId, count),
    useAI:           () => planHas(planId, "ai_persona"),
    useRecovery:     () => planHas(planId, "recovery_system"),
    exportCSV:       () => planHas(planId, "export_csv"),
    customBranding:  () => planHas(planId, "custom_branding"),
    advancedAnalytics: () => planHas(planId, "advanced_analytics"),
    multiCompany:    () => planHas(planId, "multi_company"),
    teamVisibleLimit: () => teamVisibleLimit(planId),
    allScripts:      () => planHas(planId, "scripts_count"),
  }), [planId]);

  const value = {
    planId,
    plan,
    isPro,
    onTrial,
    daysLeft,
    can,
    startTrial,
    startCheckout,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  return useContext(PlanContext);
}

// ── Hook per mostrare il paywall ─────────────────────────────
export function usePaywall() {
  const { isPro, onTrial, startCheckout, planId } = usePlan();
  const { userProfile } = useAuth();
  const isLeader = userProfile?.role === "leader";

  const upgradeTarget = isLeader ? "leader_pro" : "collaboratore_pro";

  return {
    isLocked: !isPro && !onTrial,
    upgrade: () => startCheckout(upgradeTarget),
    upgradeTarget,
  };
}
