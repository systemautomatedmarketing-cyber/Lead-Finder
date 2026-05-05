// functions/index.js — Lead Finder Stripe Integration
// Deploy: cd functions && npm install && firebase deploy --only functions
//
// Variabili d'ambiente (imposta con Firebase CLI):
//   firebase functions:secrets:set STRIPE_SECRET_KEY
//   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
//
// Oppure per la versione config (Firebase Functions v1):
//   firebase functions:config:set stripe.secret="sk_live_xxx" stripe.webhook="whsec_xxx"

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// Secrets gestiti in modo sicuro da Firebase
const stripeSecretKey   = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

// ── Mappa Price ID Stripe → Piano Lead Finder ─────────────────
// Aggiorna questi ID dopo aver creato i prodotti su dashboard.stripe.com
const PRICE_TO_PLAN = {
  // Sostituisci con i tuoi Price ID reali
  // Esempio: "price_1OxxxxxxxxxxxxxxxxxxxX": "collaboratore_pro"
  "price_1TTNXeF3HfLtoUWm95wqQjb0":  "collaboratore_pro",
  "price_1TTNYBF3HfLtoUWmwAL8ASlp":   "collaboratore_pro",
  "price_1TTNZwF3HfLtoUWmiiJX16Tq":  "leader_pro",
  "price_1TTNaHF3HfLtoUWmkzJriJ32":   "leader_pro",
};

// ── CORS helper ───────────────────────────────────────────────
function setCors(res, req) {
  const allowed = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://lead-finder-b5602.web.app",
    "https://lead-finder-b5602.firebaseapp.com",
    // Aggiungi qui il tuo dominio Cloudflare Pages quando lo hai
    // "https://tuo-dominio.com",
  ];
  const origin = req.headers.origin;
  if (allowed.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ─────────────────────────────────────────────────────────────
//  1. createCheckoutSession
//     POST /createCheckoutSession
//     Body: { userId, email, priceId, successUrl, cancelUrl }
// ─────────────────────────────────────────────────────────────
exports.createCheckoutSession = onRequest(
  { secrets: [stripeSecretKey], cors: false },
  async (req, res) => {
    setCors(res, req);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const stripe = require("stripe")(stripeSecretKey.value());
    const { userId, email, priceId, successUrl, cancelUrl } = req.body;

    if (!userId || !priceId) {
      return res.status(400).json({ error: "userId e priceId sono obbligatori" });
    }

    try {
      // Cerca o crea il customer Stripe
      const userRef  = db.collection("users").doc(userId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({ error: "Utente non trovato" });
      }

      const userData   = userSnap.data();
      let   customerId = userData.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: email || userData.email,
          name:  userData.name,
          metadata: { firebaseUID: userId },
        });
        customerId = customer.id;
        await userRef.update({ stripeCustomerId: customerId });
      }

      // Crea la Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer:             customerId,
        payment_method_types: ["card"],
        line_items:           [{ price: priceId, quantity: 1 }],
        mode:                 "subscription",
        success_url:          successUrl || `${req.headers.origin}/?checkout=success`,
        cancel_url:           cancelUrl  || `${req.headers.origin}/?checkout=cancelled`,
        subscription_data: {
          metadata: { firebaseUID: userId },
        },
        metadata:             { firebaseUID: userId, priceId },
        allow_promotion_codes: true,
        locale:               "it",
      });

      return res.json({ sessionId: session.id, url: session.url });

    } catch (err) {
      console.error("createCheckoutSession error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─────────────────────────────────────────────────────────────
//  2. stripeWebhook
//     POST /stripeWebhook  (chiamato direttamente da Stripe)
//     Gestisce: checkout.session.completed
//               invoice.payment_succeeded
//               invoice.payment_failed
//               customer.subscription.deleted
//               customer.subscription.updated
// ─────────────────────────────────────────────────────────────
exports.stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret], rawBody: true, cors: false },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const stripe    = require("stripe")(stripeSecretKey.value());
    const sig       = req.headers["stripe-signature"];
    let   event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const data = event.data.object;

    // Estrai l'UID Firebase dal metadata
    const uid =
      data.metadata?.firebaseUID ||
      data.subscription_data?.metadata?.firebaseUID;

    try {
      switch (event.type) {

        // ── Pagamento completato — attiva il piano ───────────────
        case "checkout.session.completed": {
          if (!uid) { console.warn("No firebaseUID in metadata"); break; }

          const priceId = data.metadata?.priceId;
          const plan    = PRICE_TO_PLAN[priceId] || "collaboratore_pro";
          const subId   = data.subscription;

          await db.collection("users").doc(uid).update({
            plan,
            subscriptionStatus:   "active",
            stripeSubscriptionId: subId,
            subscribedAt:         new Date().toISOString(),
          });

          console.log(`✅ Piano attivato: ${plan} per ${uid}`);
          break;
        }

        // ── Rinnovo mensile/annuale riuscito ─────────────────────
        case "invoice.payment_succeeded": {
          const subId = data.subscription;
          if (!subId) break;

          const snap = await db.collection("users")
            .where("stripeSubscriptionId", "==", subId).limit(1).get();
          if (snap.empty) break;

          await snap.docs[0].ref.update({
            subscriptionStatus: "active",
            lastPaymentAt:      new Date().toISOString(),
          });
          break;
        }

        // ── Pagamento fallito — avvisa ma non blocca subito ──────
        case "invoice.payment_failed": {
          const subId = data.subscription;
          if (!subId) break;

          const snap = await db.collection("users")
            .where("stripeSubscriptionId", "==", subId).limit(1).get();
          if (snap.empty) break;

          await snap.docs[0].ref.update({
            subscriptionStatus: "past_due",
            // Non fare downgrade immediato: Stripe ritenterà il pagamento
          });
          console.warn(`⚠️ Pagamento fallito per sub ${subId}`);
          break;
        }

        // ── Abbonamento cancellato — downgrade a Starter ─────────
        case "customer.subscription.deleted": {
          const subId = data.id;
          const snap  = await db.collection("users")
            .where("stripeSubscriptionId", "==", subId).limit(1).get();
          if (snap.empty) break;

          const userDoc    = snap.docs[0];
          const isLeader   = userDoc.data().role === "leader" || userDoc.data().isLeader;
          const downgradeTo = isLeader ? "leader_starter" : "starter";

          await userDoc.ref.update({
            plan:               downgradeTo,
            subscriptionStatus: "cancelled",
            cancelledAt:        new Date().toISOString(),
          });
          console.log(`📉 Downgrade a ${downgradeTo} per ${userDoc.id}`);
          break;
        }

        // ── Abbonamento aggiornato (upgrade/downgrade da portale) ─
        case "customer.subscription.updated": {
          const subId = data.id;
          if (!subId) break;

          const snap = await db.collection("users")
            .where("stripeSubscriptionId", "==", subId).limit(1).get();
          if (snap.empty) break;

          const newPriceId = data.items?.data?.[0]?.price?.id;
          if (!newPriceId) break;

          const newPlan = PRICE_TO_PLAN[newPriceId];
          if (!newPlan) break;

          await snap.docs[0].ref.update({
            plan:               newPlan,
            subscriptionStatus: data.status === "active" ? "active" : data.status,
          });
          console.log(`🔄 Piano aggiornato a ${newPlan}`);
          break;
        }
      }

      return res.json({ received: true });

    } catch (err) {
      console.error("Webhook handler error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─────────────────────────────────────────────────────────────
//  3. createPortalSession
//     POST /createPortalSession
//     Body: { userId, returnUrl }
//     Apre il portale Stripe per gestire abbonamento
// ─────────────────────────────────────────────────────────────
exports.createPortalSession = onRequest(
  { secrets: [stripeSecretKey], cors: false },
  async (req, res) => {
    setCors(res, req);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const stripe = require("stripe")(stripeSecretKey.value());
    const { userId, returnUrl } = req.body;

    if (!userId) return res.status(400).json({ error: "userId obbligatorio" });

    try {
      const userSnap   = await db.collection("users").doc(userId).get();
      const customerId = userSnap.data()?.stripeCustomerId;

      if (!customerId) {
        return res.status(404).json({ error: "Nessun account Stripe trovato per questo utente" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer:   customerId,
        return_url: returnUrl || `${req.headers.origin}/`,
      });

      return res.json({ url: session.url });

    } catch (err) {
      console.error("createPortalSession error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }
);
