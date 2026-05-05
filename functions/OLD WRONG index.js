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

// ─────────────────────────────────────────────────────────────
//  4. sendFollowupReminders (scheduled)
//     Eseguita ogni giorno alle 9:00 IT
//     Invia notifiche push a chi ha follow-up in scadenza oggi
//
//  Deploy: firebase deploy --only functions
//  Per attivare lo scheduler: abilita Cloud Scheduler in Firebase Console
// ─────────────────────────────────────────────────────────────
const { onSchedule } = require("firebase-functions/v2/scheduler");

exports.sendFollowupReminders = onSchedule(
  {
    schedule:  "0 8 * * *",   // ogni giorno alle 8:00 UTC (9:00 Italia)
    timeZone:  "Europe/Rome",
    secrets:   [stripeSecretKey], // non serve Stripe ma manteniamo il pattern
  },
  async () => {
    const admin   = require("firebase-admin");
    const messaging = admin.messaging();
    const now     = new Date();
    const FOLLOWUP_DAYS = [2, 5, 10, 21];
    let   sent    = 0;

    try {
      // Prendi tutti i collaboratori con notifiche attive
      const usersSnap = await db.collection("users")
        .where("notificationsEnabled", "==", true)
        .where("fcmToken", "!=", null)
        .get();

      for (const userDoc of usersSnap.docs) {
        const user = userDoc.data();
        if (!user.fcmToken) continue;

        // Prendi i contatti dell'utente
        const contactsSnap = await db
          .collection("users")
          .doc(userDoc.id)
          .collection("contacts")
          .where("contactedAt", "!=", null)
          .get();

        const dueContacts = contactsSnap.docs
          .map(d => d.data())
          .filter(c => {
            if (["convertito", "collaboratore", "archiviato"].includes(c.status)) return false;
            const days = Math.floor((now - new Date(c.contactedAt)) / (1000 * 60 * 60 * 24));
            return FOLLOWUP_DAYS.includes(days);
          });

        if (!dueContacts.length) continue;

        const count = dueContacts.length;
        const names = dueContacts.slice(0, 3).map(c => c.name).join(", ");

        try {
          await messaging.send({
            token: user.fcmToken,
            notification: {
              title: `⏰ ${count} follow-up da fare oggi`,
              body:  count === 1
                ? `Ricontatta ${names}`
                : `Ricontatta: ${names}${count > 3 ? ` e altri ${count - 3}` : ""}`,
            },
            data: { type: "followup", count: String(count) },
            webpush: {
              headers:     { Urgency: "normal" },
              notification: { icon: "/icons/icon-192x192.png", badge: "/icons/badge-72x72.png" },
            },
          });
          sent++;
        } catch (tokenErr) {
          // Token scaduto — rimuovilo
          if (tokenErr.code === "messaging/registration-token-not-registered") {
            await userDoc.ref.update({ fcmToken: null });
          }
        }
      }

      console.log(`✅ Follow-up reminders inviati: ${sent}`);

    } catch (err) {
      console.error("sendFollowupReminders error:", err);
    }
  }
);

// ─────────────────────────────────────────────────────────────
//  5. sendWeeklyTeamDigest (scheduled)
//     Eseguita ogni lunedì alle 8:00 IT
//     Invia ai leader un digest del team via notifica push
// ─────────────────────────────────────────────────────────────
exports.sendWeeklyTeamDigest = onSchedule(
  {
    schedule: "0 8 * * 1",    // ogni lunedì alle 8:00 UTC
    timeZone: "Europe/Rome",
  },
  async () => {
    const admin     = require("firebase-admin");
    const messaging = admin.messaging();
    let   sent      = 0;

    try {
      const leadersSnap = await db.collection("users")
        .where("role", "==", "leader")
        .where("notificationsEnabled", "==", true)
        .where("fcmToken", "!=", null)
        .get();

      for (const leaderDoc of leadersSnap.docs) {
        const leader = leaderDoc.data();
        if (!leader.fcmToken) continue;

        // Conta collaboratori e risultati
        const teamSnap = await db.collection("users")
          .where("leaderId", "==", leaderDoc.id)
          .get();

        const team       = teamSnap.docs.map(d => d.data());
        const clients    = team.reduce((s, m) => s + (m.weeklyClients || 0), 0);
        const atRisk     = team.filter(m => (m.weeklyClients||0) < (m.currentWeek||1)*0.5).length;

        try {
          await messaging.send({
            token: leader.fcmToken,
            notification: {
              title: "📊 Digest settimanale del tuo team",
              body:  `${team.length} collaboratori · ${clients} clienti questa settimana${atRisk > 0 ? ` · ⚠️ ${atRisk} a rischio` : " · ✅ Tutti in obiettivo"}`,
            },
            data: { type: "weekly_digest" },
            webpush: {
              notification: { icon: "/icons/icon-192x192.png" },
            },
          });
          sent++;
        } catch (tokenErr) {
          if (tokenErr.code === "messaging/registration-token-not-registered") {
            await leaderDoc.ref.update({ fcmToken: null });
          }
        }
      }

      console.log(`✅ Weekly digest inviati: ${sent}`);
    } catch (err) {
      console.error("sendWeeklyTeamDigest error:", err);
    }
  }
);
