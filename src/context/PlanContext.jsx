// src/context/PlanContext.jsx
// Gestisce piano attivo, limiti, trial e checkout Stripe

import { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";
import {
  effectivePlan, planHas, isContactLimitReached, hasUnlimitedScripts, scriptsLimit,
  isWeekAccessible, teamVisibleLimit, trialDaysLeft, TRIAL_UPGRADE_AFTER,
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
  const onTrial        = isTrialActive(userProfile);
  const daysLeft       = trialDaysLeft(userProfile?.trialStartedAt);
  // Dopo TRIAL_UPGRADE_AFTER giorni dall'inizio del trial → mostra il bottone acquisto
  const trialStarted   = userProfile?.trialStartedAt;
  const daysInTrial    = trialStarted
    ? Math.floor((new Date() - (trialStarted?.toDate ? trialStarted.toDate() : new Date(trialStarted))) / (1000 * 60 * 60 * 24))
    : 0;
  const canUpgradeEarly = onTrial && daysInTrial >= TRIAL_UPGRADE_AFTER;
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
      const priceKey = `${targetPlanId}_${billingPeriod}`;
      const priceId  = STRIPE_PRICES[priceKey];
      if (!priceId || priceId.includes("XXXXXXXXXX")) {
        alert("⚠️ Price ID non configurato per questo piano. Controlla src/data/plans.js.");
        return;
      }

      const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL
        || `https://europe-west1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

      const resp = await fetch(`${FUNCTIONS_URL}/createCheckoutSession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:     userProfile.uid,
          email:      userProfile.email,
          priceId,
          successUrl: `${window.location.origin}/?checkout=success`,
          cancelUrl:  `${window.location.origin}/?checkout=cancelled`,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      // Usa l'URL diretto — redirectToCheckout è deprecato
      const { url } = await resp.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("URL di pagamento non ricevuto dalla Function");
      }

    } catch (err) {
      console.error("Stripe checkout error:", err);
      alert(`Errore pagamento: ${err.message}`);
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
    allScripts:      () => hasUnlimitedScripts(planId),  // true solo se -1 (illimitati)
    scriptsLimit:    () => scriptsLimit(planId),             // numero script disponibili (3 o -1)
  }), [planId]);

  const value = {
    planId,
    plan,
    isPro,
    onTrial,
    daysLeft,
    canUpgradeEarly,
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
