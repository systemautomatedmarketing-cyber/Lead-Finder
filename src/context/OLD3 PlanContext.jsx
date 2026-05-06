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
// Chiave Stripe — imposta VITE_STRIPE_PUBLISHABLE_KEY nel file .env
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder";
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

  // ── Checkout Stripe (chiama Firebase Function) ───────────────
  const startCheckout = async (targetPlanId, billingPeriod = "monthly") => {
    try {
      const { loadStripe } = await import("@stripe/stripe-js");
      const stripe = await loadStripe(STRIPE_PK);
      if (!stripe) throw new Error("Stripe non disponibile");

      const priceKey = `${targetPlanId}_${billingPeriod}`;
      const priceId  = STRIPE_PRICES[priceKey];
      if (!priceId || priceId.includes("XXXXXXXXXX")) {
        alert("⚠️ Stripe non ancora configurato.\n\n1. Crea i prodotti su dashboard.stripe.com\n2. Copia i Price ID in src/data/plans.js\n3. Deploya le Firebase Functions con:\n   cd functions && npm install\n   firebase deploy --only functions\n4. Imposta le chiavi:\n   firebase functions:config:set stripe.secret='sk_live_xxx' stripe.webhook='whsec_xxx'");
        return;
      }

      // Chiama la Firebase Function per creare la Checkout Session
      // URL della Firebase Cloud Function (imposta VITE_FUNCTIONS_BASE_URL nel .env)
      const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL
        || `https://europe-west1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;
      const resp = await fetch(
        `${FUNCTIONS_URL}/createCheckoutSession`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId:     userProfile.uid,
            email:      userProfile.email,
            priceId,
            successUrl: `${window.location.origin}/?checkout=success`,
            cancelUrl:  `${window.location.origin}/?checkout=cancelled`,
          }),
        }
      );

      if (!resp.ok) throw new Error("Errore nella creazione della sessione di pagamento");
      const { sessionId } = await resp.json();
      await stripe.redirectToCheckout({ sessionId });

    } catch (err) {
      console.error("Stripe checkout error:", err);
      alert(`Errore: ${err.message}`);
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
