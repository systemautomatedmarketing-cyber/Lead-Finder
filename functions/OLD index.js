// functions/index.js
// Firebase Functions per integrazione Stripe
// Deploy: firebase deploy --only functions

const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const stripe = require("stripe");

initializeApp();
const db = getFirestore();

// ── Chiavi Stripe (imposta in Firebase config) ─────────────────
// firebase functions:config:set stripe.secret="sk_live_xxx" stripe.webhook="whsec_xxx"
const STRIPE_SECRET  = process.env.STRIPE_SECRET_KEY  || "sk_test_xxx";
const STRIPE_WEBHOOK = process.env.STRIPE_WEBHOOK_SECRET || "whsec_xxx";

const stripeClient = stripe(STRIPE_SECRET);

// ── Mappa Price ID → Piano ─────────────────────────────────────
const PRICE_TO_PLAN = {
  "price_collab_monthly":  "collaboratore_pro",
  "price_collab_yearly":   "collaboratore_pro",
  "price_leader_monthly":  "leader_pro",
  "price_leader_yearly":   "leader_pro",
};

// ─────────────────────────────────────────────────────────────
//  1. Crea Checkout Session
//     POST /createCheckoutSession
//     Body: { userId, email, priceId, successUrl, cancelUrl }
// ─────────────────────────────────────────────────────────────
exports.createCheckoutSession = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { userId, email, priceId, successUrl, cancelUrl } = req.body;
  if (!userId || !priceId) return res.status(400).json({ error: "Missing required fields" });

  try {
    // Cerca o crea il customer Stripe
    const userRef  = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    let customerId = userData?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripeClient.customers.create({
        email: email || userData?.email,
        metadata: { firebaseUID: userId },
      });
      customerId = customer.id;
      await userRef.update({ stripeCustomerId: customerId });
    }

    // Crea la Checkout Session
    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl || `${req.headers.origin}/?checkout=success`,
      cancel_url:  cancelUrl  || `${req.headers.origin}/?checkout=cancelled`,
      subscription_data: {
        metadata: { firebaseUID: userId },
        trial_period_days: 0, // il trial è già gestito lato app
      },
      metadata: { firebaseUID: userId, priceId },
    });

    res.json({ sessionId: session.id, url: session.url });

  } catch (err) {
    console.error("createCheckoutSession error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  2. Webhook Stripe
//     POST /stripeWebhook
//     Gestisce: checkout.session.completed,
//               invoice.payment_succeeded,
//               customer.subscription.deleted
// ─────────────────────────────────────────────────────────────
exports.stripeWebhook = onRequest({ rawBody: true, cors: false }, async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data   = event.data.object;
  const uid    = data.metadata?.firebaseUID || data.subscription_data?.metadata?.firebaseUID;

  try {
    switch (event.type) {

      // ── Checkout completato con successo ─────────────────────
      case "checkout.session.completed": {
        if (!uid) break;
        const priceId   = data.metadata?.priceId;
        const plan      = PRICE_TO_PLAN[priceId] || "collaboratore_pro";
        const subId     = data.subscription;

        await db.collection("users").doc(uid).update({
          plan,
          subscriptionStatus:   "active",
          stripeSubscriptionId: subId,
          subscribedAt:         new Date().toISOString(),
        });

        // Log evento
        await db.collection("stripe_events").add({
          type: event.type, uid, plan, subId,
          createdAt: new Date().toISOString(),
        });
        break;
      }

      // ── Pagamento periodico riuscito ─────────────────────────
      case "invoice.payment_succeeded": {
        const subId = data.subscription;
        if (!subId) break;

        // Cerca l'utente per subscriptionId
        const snap = await db.collection("users")
          .where("stripeSubscriptionId", "==", subId).limit(1).get();
        if (snap.empty) break;

        const userDoc = snap.docs[0];
        await userDoc.ref.update({
          subscriptionStatus: "active",
          lastPaymentAt: new Date().toISOString(),
        });
        break;
      }

      // ── Abbonamento cancellato o scaduto ─────────────────────
      case "customer.subscription.deleted": {
        const subId = data.id;
        const snap  = await db.collection("users")
          .where("stripeSubscriptionId", "==", subId).limit(1).get();
        if (snap.empty) break;

        const userDoc  = snap.docs[0];
        const userData = userDoc.data();
        const downgraded = userData.role === "leader" ? "leader_starter" : "starter";

        await userDoc.ref.update({
          plan:               downgraded,
          subscriptionStatus: "cancelled",
          cancelledAt:        new Date().toISOString(),
        });
        break;
      }

      // ── Pagamento fallito ────────────────────────────────────
      case "invoice.payment_failed": {
        const subId = data.subscription;
        if (!subId) break;
        const snap = await db.collection("users")
          .where("stripeSubscriptionId", "==", subId).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({ subscriptionStatus: "past_due" });
        }
        break;
      }
    }

    res.json({ received: true });

  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  3. Portale Cliente Stripe (gestione abbonamento)
//     POST /createPortalSession
//     Body: { userId }
// ─────────────────────────────────────────────────────────────
exports.createPortalSession = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { userId, returnUrl } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const userSnap = await db.collection("users").doc(userId).get();
    const customerId = userSnap.data()?.stripeCustomerId;
    if (!customerId) return res.status(404).json({ error: "No Stripe customer found" });

    const session = await stripeClient.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${req.headers.origin}/`,
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("createPortalSession error:", err);
    res.status(500).json({ error: err.message });
  }
});
