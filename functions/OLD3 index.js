// functions/index.js — Lead Finder Stripe Integration
// Compatibile con: firebase-admin@13 + firebase-functions@6 + stripe@17
//
// Prima del deploy imposta i secrets:
//   firebase functions:secrets:set STRIPE_SECRET_KEY
//   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET

const { onRequest }   = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin           = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Secrets gestiti in modo sicuro da Firebase Secret Manager
const stripeSecretKey     = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

// ── Mappa Price ID Stripe → Piano Lead Finder ─────────────────
// AGGIORNA questi ID dopo aver creato i prodotti su dashboard.stripe.com
const PRICE_TO_PLAN = {
  "price_collab_monthly": "collaboratore_pro",
  "price_collab_yearly":  "collaboratore_pro",
  "price_leader_monthly": "leader_pro",
  "price_leader_yearly":  "leader_pro",
};

// ── CORS — domini autorizzati ─────────────────────────────────
function setCors(res, req) {
  const allowed = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://lead-finder-b5602.web.app",
    "https://lead-finder-b5602.firebaseapp.com",
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
// ─────────────────────────────────────────────────────────────
exports.createCheckoutSession = onRequest(
  { secrets: [stripeSecretKey], cors: false },
  async (req, res) => {
    setCors(res, req);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const Stripe = require("stripe");
    const stripe = Stripe(stripeSecretKey.value());
    const { userId, email, priceId, successUrl, cancelUrl } = req.body;

    if (!userId || !priceId) {
      return res.status(400).json({ error: "userId e priceId sono obbligatori" });
    }

    try {
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

      const session = await stripe.checkout.sessions.create({
        customer:             customerId,
        payment_method_types: ["card"],
        line_items:           [{ price: priceId, quantity: 1 }],
        mode:                 "subscription",
        success_url:  successUrl || `${req.headers.origin}/?checkout=success`,
        cancel_url:   cancelUrl  || `${req.headers.origin}/?checkout=cancelled`,
        subscription_data: { metadata: { firebaseUID: userId } },
        metadata:     { firebaseUID: userId, priceId },
        allow_promotion_codes: true,
        locale: "it",
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
// ─────────────────────────────────────────────────────────────
exports.stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret], rawBody: true, cors: false },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const Stripe = require("stripe");
    const stripe = Stripe(stripeSecretKey.value());
    const sig    = req.headers["stripe-signature"];
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
    const uid  = data.metadata?.firebaseUID ||
                 data.subscription_data?.metadata?.firebaseUID;

    try {
      switch (event.type) {

        case "checkout.session.completed": {
          if (!uid) break;
          const priceId = data.metadata?.priceId;
          const plan    = PRICE_TO_PLAN[priceId] || "collaboratore_pro";
          await db.collection("users").doc(uid).update({
            plan,
            subscriptionStatus:   "active",
            stripeSubscriptionId: data.subscription,
            subscribedAt:         new Date().toISOString(),
          });
          console.log(`✅ Piano attivato: ${plan} per ${uid}`);
          break;
        }

        case "invoice.payment_succeeded": {
          const snap = await db.collection("users")
            .where("stripeSubscriptionId", "==", data.subscription).limit(1).get();
          if (!snap.empty) {
            await snap.docs[0].ref.update({
              subscriptionStatus: "active",
              lastPaymentAt: new Date().toISOString(),
            });
          }
          break;
        }

        case "invoice.payment_failed": {
          const snap = await db.collection("users")
            .where("stripeSubscriptionId", "==", data.subscription).limit(1).get();
          if (!snap.empty) {
            await snap.docs[0].ref.update({ subscriptionStatus: "past_due" });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const snap = await db.collection("users")
            .where("stripeSubscriptionId", "==", data.id).limit(1).get();
          if (!snap.empty) {
            const d = snap.docs[0].data();
            const isLeader = d.role === "leader" || d.isLeader;
            await snap.docs[0].ref.update({
              plan:               isLeader ? "leader_starter" : "starter",
              subscriptionStatus: "cancelled",
              cancelledAt:        new Date().toISOString(),
            });
          }
          break;
        }

        case "customer.subscription.updated": {
          const snap = await db.collection("users")
            .where("stripeSubscriptionId", "==", data.id).limit(1).get();
          if (!snap.empty) {
            const newPriceId = data.items?.data?.[0]?.price?.id;
            const newPlan    = PRICE_TO_PLAN[newPriceId];
            if (newPlan) {
              await snap.docs[0].ref.update({
                plan: newPlan,
                subscriptionStatus: data.status === "active" ? "active" : data.status,
              });
            }
          }
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
// ─────────────────────────────────────────────────────────────
exports.createPortalSession = onRequest(
  { secrets: [stripeSecretKey], cors: false },
  async (req, res) => {
    setCors(res, req);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const Stripe = require("stripe");
    const stripe = Stripe(stripeSecretKey.value());
    const { userId, returnUrl } = req.body;

    if (!userId) return res.status(400).json({ error: "userId obbligatorio" });

    try {
      const userSnap   = await db.collection("users").doc(userId).get();
      const customerId = userSnap.data()?.stripeCustomerId;

      if (!customerId) {
        return res.status(404).json({ error: "Nessun account Stripe trovato" });
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
