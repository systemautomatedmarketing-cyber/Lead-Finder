// src/data/plans.js
// Definizione completa dei piani con limiti, feature e ID Stripe

// ── ID prezzi Stripe (sostituisci con i tuoi dopo la creazione su dashboard.stripe.com) ──
export const STRIPE_PRICES = {
  collaboratore_pro_monthly: "price_1TW1IyF3HfLtoUWmI1fQAK2g",   // €4.90/mese (era €9.99)
  collaboratore_pro_yearly:  "price_1TW1O4F3HfLtoUWmt5qzz8bO",   // €44.90/anno (era €89.99)
  leader_pro_monthly:        "price_1TW1RXF3HfLtoUWmoOxBrDcY",   // €10.90/mese (era €24.99)
  leader_pro_yearly:         "price_1TW1RqF3HfLtoUWmk9AfWUQW",   // €99.90/anno (era €219.99)
  // ⚠️  RICORDA: aggiorna i prezzi anche su dashboard.stripe.com
//  collaboratore_pro_monthly: "price_1TTNXeF3HfLtoUWm95wqQjb0",   // €9.99/mese 
//  collaboratore_pro_yearly:  "price_1TTNYBF3HfLtoUWmwAL8ASlp",   // €89.99/anno 
//  leader_pro_monthly:        "price_1TTNZwF3HfLtoUWmiiJX16Tq",   // €24.99/mese 
//  leader_pro_yearly:         "price_1TTNaHF3HfLtoUWmkzJriJ32",   // €219.99/anno

};

export const TRIAL_DAYS         = 14;   // durata totale del trial
export const TRIAL_UPGRADE_AFTER = 3;    // dopo quanti giorni appare il bottone acquisto

// ── Definizione piani ──────────────────────────────────────────
export const PLANS = {

  // ── STARTER (Free) ─────────────────────────────────────────
  starter: {
    id: "starter",
    name: "Starter",
    subtitle: "Inizia gratuitamente",
    price: { monthly: 0, yearly: 0 },
    badge: null,
    color: "#6b6b8a",
    cta: "Inizia gratis",
    target: "collaboratore",
    trial: false,

    limits: {
      contacts_max:       20,       // max contatti salvabili
      missions_weeks:     5,        // solo 5 settimane
      scripts_count:      3,        // solo script base
      team_visible:       5,        // solo leader: collaboratori visibili (0 = N/A)
      ai_persona:         false,    // onboarding AI disabilitato
      recovery_system:    false,    // sistema recovery disabilitato
      export_csv:         false,
      multi_company:      false,
      custom_branding:    false,
      advanced_analytics: false,
    },

    features: [
      { label: "Percorso per 5 settimane",        included: true  },
      { label: "Fino a 20 contatti",              included: true  },
      { label: "3 script base",                   included: true  },
      { label: "Obiettivo settimanale",           included: true  },
      { label: "Percorso completo 26 settimane",  included: false },
      { label: "Script personalizzati AI",        included: false },
      { label: "Profilo persona AI",              included: false },
      { label: "Sistema Recovery",                included: false },
      { label: "Contatti illimitati",             included: false },
    ],
  },

  // ── COLLABORATORE PRO ───────────────────────────────────────
  collaboratore_pro: {
    id: "collaboratore_pro",
    name: "Collaboratore Pro",
    subtitle: "Il percorso completo",
    price:    { monthly: 4.90, yearly: 44.90 },
    oldPrice: { monthly: 9.99, yearly: 89.99 },   // prezzo barrato
    badge: "Più popolare",
    color: "#B8860B",
    cta: "Prova 14 giorni gratis",
    ctaAfterTrial: "Attiva ora — €4,90/mese →",
    target: "collaboratore",
    trial: true,
    stripe_monthly: "collaboratore_pro_monthly",
    stripe_yearly:  "collaboratore_pro_yearly",

    limits: {
      contacts_max:       -1,       // illimitati
      missions_weeks:     26,       // tutte le 26 settimane (fasi 1+2+3)
      scripts_count:      -1,       // tutti gli script
      team_visible:       -1,        // N/A per collaboratori
      ai_persona:         true,
      recovery_system:    true,
      export_csv:         false,    // non necessario per collaboratori
      multi_company:      false,
      custom_branding:    false,
      advanced_analytics: false,
    },

    features: [
      { label: "Percorso completo 26 settimane",  included: true  },
      { label: "Contatti illimitati",             included: true  },
      { label: "Tutti gli script personalizzati", included: true  },
      { label: "Profilo persona generato da AI",  included: true  },
      { label: "Sistema Recovery anti-blocco",    included: true  },
      { label: "Badge e gamification completa",   included: true  },
      { label: "Dashboard leader avanzata",       included: false },
      { label: "Export dati CSV",                 included: false },
      { label: "Branding aziendale personalizzato", included: false },
    ],
  },

  // ── LEADER PRO ──────────────────────────────────────────────
  leader_pro: {
    id: "leader_pro",
    name: "Leader Pro",
    subtitle: "Gestisci e scala il tuo team",
    price:    { monthly: 10.90, yearly: 99.90 },
    oldPrice: { monthly: 24.99, yearly: 219.99 },
    badge: "Per i leader",
    color: "#1A5FA8",
    cta: "Prova 14 giorni gratis",
    ctaAfterTrial: "Attiva ora — €10,90/mese →",
    target: "leader",
    trial: true,
    stripe_monthly: "leader_pro_monthly",
    stripe_yearly:  "leader_pro_yearly",

    limits: {
      contacts_max:       -1,
      missions_weeks:     26,
      scripts_count:      -1,
      team_visible:       -1,       // illimitati
      ai_persona:         true,
      recovery_system:    true,
      export_csv:         true,
      multi_company:      true,
      custom_branding:    true,
      advanced_analytics: true,
    },

    features: [
      { label: "Team illimitato visibile",              included: true },
      { label: "Analytics avanzate del team",           included: true },
      { label: "Export dati CSV",                       included: true },
      { label: "Branding aziendale personalizzato",     included: true },
      { label: "Report settimanale automatico",         included: true },
      { label: "Codici invito illimitati",              included: true },
      { label: "Settore e script personalizzati",       included: true },
      { label: "Supporto prioritario",                  included: true },
    ],
  },

  // ── LEADER STARTER (Free) ───────────────────────────────────
  leader_starter: {
    id: "leader_starter",
    name: "Leader Starter",
    subtitle: "Inizia a costruire il team",
    price: { monthly: 0, yearly: 0 },
    badge: null,
    color: "#6b6b8a",
    cta: "Inizia gratis",
    target: "leader",
    trial: false,

    limits: {
      contacts_max:       -1,
      missions_weeks:     5,
      scripts_count:      3,
      team_visible:       5,        // vede solo 5 collaboratori
      ai_persona:         false,
      recovery_system:    false,
      export_csv:         false,
      multi_company:      false,
      custom_branding:    false,
      advanced_analytics: false,
    },

    features: [
      { label: "Fino a 5 collaboratori visibili",       included: true  },
      { label: "Dashboard base del team",               included: true  },
      { label: "Codice invito (1 attivo)",              included: true  },
      { label: "Team illimitato visibile",              included: false },
      { label: "Analytics avanzate",                    included: false },
      { label: "Export CSV",                            included: false },
      { label: "Branding personalizzato",               included: false },
      { label: "Report automatici",                     included: false },
    ],
  },
};

// ── Helpers ────────────────────────────────────────────────────

/** Piano di default per ruolo al momento della registrazione */
export function getDefaultPlan(role) {
  return role === "leader" ? "leader_starter" : "starter";
}

/** Determina se il piano ha una funzionalità */
export function planHas(planId, feature) {
  const plan = PLANS[planId];
  if (!plan) return false;
  const limit = plan.limits[feature];
  if (typeof limit === "boolean") return limit;
  if (typeof limit === "number") return limit === -1 || limit > 0;
  return false;
}

/** Quanti script può usare il piano (3 = limitati, -1 = illimitati) */
export function scriptsLimit(planId) {
  return PLANS[planId]?.limits?.scripts_count ?? 3;
}

/** Il piano ha script illimitati? */
export function hasUnlimitedScripts(planId) {
  return scriptsLimit(planId) === -1;
}

/** Verifica se il collaboratore ha raggiunto il limite contatti */
export function isContactLimitReached(planId, currentCount) {
  const max = PLANS[planId]?.limits?.contacts_max;
  if (max === -1) return false;
  return currentCount >= max;
}

/** Verifica se la settimana è accessibile con il piano */
export function isWeekAccessible(planId, week) {
  const maxWeeks = PLANS[planId]?.limits?.missions_weeks || 5;
  if (maxWeeks === -1) return true;
  return week <= maxWeeks;
}

/** Quanti collaboratori può vedere il leader */
export function teamVisibleLimit(planId) {
  return PLANS[planId]?.limits?.team_visible ?? 5;
}

/** Calcola giorni rimanenti del trial */
export function trialDaysLeft(trialStartedAt) {
  if (!trialStartedAt) return 0;
  const start = trialStartedAt.toDate ? trialStartedAt.toDate() : new Date(trialStartedAt);
  const elapsed = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, TRIAL_DAYS - elapsed);
}

/** Il piano trial è ancora attivo? */
export function isTrialActive(userProfile) {
  if (!userProfile?.trialStartedAt) return false;
  if (userProfile?.subscriptionStatus === "active") return false;
  return trialDaysLeft(userProfile.trialStartedAt) > 0;
}

/** Piano effettivo (considera trial attivo) */
export function effectivePlan(userProfile) {
  if (!userProfile) return "starter";
  if (isTrialActive(userProfile)) {
    // Durante trial: accesso completo al piano pro corrispondente
    return userProfile.role === "leader" ? "leader_pro" : "collaboratore_pro";
  }
  return userProfile.plan || getDefaultPlan(userProfile.role);
}
