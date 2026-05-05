// functions/index.js — Lead Finder
// Merge definitivo: Stripe sicuro + Scheduled Functions + CORS
//
// Versione compatibile con:
//   firebase-admin@13 + firebase-functions@6 + stripe@17
//
// Setup prima del deploy:
//   firebase functions:secrets:set STRIPE_SECRET_KEY
//   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
//   firebase deploy --only functions

const { onRequest }    = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { onSchedule }   = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin            = require("firebase-admin");

// Imposta opzioni globali per tutte le funzioni v2
setGlobalOptions({
  region: "europe-west1",
});


admin.initializeApp();
const db = admin.firestore();

// ── Secrets da Firebase Secret Manager (sicuri, mai in chiaro) ─
const stripeSecretKey     = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

// ── Mappa Price ID Stripe → Piano Lead Finder ─────────────────
// Aggiorna questi ID dopo aver creato i prodotti su dashboard.stripe.com
const PRICE_TO_PLAN = {
  "price_collab_monthly": "collaboratore_pro",
  "price_collab_yearly":  "collaboratore_pro",
  "price_leader_monthly": "leader_pro",
  "price_leader_yearly":  "leader_pro",
};

// ── CORS — domini autorizzati ─────────────────────────────────
// Aggiungi qui il tuo dominio di produzione
function setCors(res, req) {
  const allowed = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://lead-finder-b5602.web.app",
    "https://lead-finder-b5602.firebaseapp.com",
    // "https://www.leadfinder.app",  // ← aggiungi il tuo dominio finale
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
    if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

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

      // Crea il customer Stripe se non esiste ancora
      if (!customerId) {
        const customer = await stripe.customers.create({
          email:    email || userData.email,
          name:     userData.name,
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
        success_url: successUrl || `${req.headers.origin}/?checkout=success`,
        cancel_url:  cancelUrl  || `${req.headers.origin}/?checkout=cancelled`,
        subscription_data: {
          metadata: { firebaseUID: userId },
          // trial_period_days: 0  // il trial è gestito lato app
        },
        metadata:              { firebaseUID: userId, priceId },
        allow_promotion_codes: true,
        locale:                "it",
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
//     Gestisce tutti gli eventi del ciclo di vita abbonamento
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
    const uid  = data.metadata?.firebaseUID
              || data.subscription_data?.metadata?.firebaseUID;

    try {
      switch (event.type) {

        // ── Pagamento checkout completato → attiva il piano ──────
        case "checkout.session.completed": {
          if (!uid) { console.warn("No firebaseUID in metadata"); break; }
          const priceId = data.metadata?.priceId;
          const plan    = PRICE_TO_PLAN[priceId] || "collaboratore_pro";
          await db.collection("users").doc(uid).update({
            plan,
            subscriptionStatus:   "active",
            stripeSubscriptionId: data.subscription,
            subscribedAt:         new Date().toISOString(),
          });
          // Log per audit
          await db.collection("stripe_events").add({
            type: event.type, uid, plan,
            subId: data.subscription,
            createdAt: new Date().toISOString(),
          });
          console.log(`✅ Piano attivato: ${plan} per ${uid}`);
          break;
        }

        // ── Rinnovo periodico riuscito ───────────────────────────
        case "invoice.payment_succeeded": {
          const snap = await db.collection("users")
            .where("stripeSubscriptionId", "==", data.subscription).limit(1).get();
          if (!snap.empty) {
            await snap.docs[0].ref.update({
              subscriptionStatus: "active",
              lastPaymentAt:      new Date().toISOString(),
            });
          }
          break;
        }

        // ── Pagamento fallito — avvisa, non blocca subito ────────
        case "invoice.payment_failed": {
          const snap = await db.collection("users")
            .where("stripeSubscriptionId", "==", data.subscription).limit(1).get();
          if (!snap.empty) {
            await snap.docs[0].ref.update({ subscriptionStatus: "past_due" });
          }
          console.warn(`⚠️ Pagamento fallito per sub ${data.subscription}`);
          break;
        }

        // ── Abbonamento cancellato → downgrade a Starter ─────────
        case "customer.subscription.deleted": {
          const snap = await db.collection("users")
            .where("stripeSubscriptionId", "==", data.id).limit(1).get();
          if (!snap.empty) {
            const userData   = snap.docs[0].data();
            const isLeader   = userData.role === "leader" || userData.isLeader;
            const downgradeTo = isLeader ? "leader_starter" : "starter";
            await snap.docs[0].ref.update({
              plan:               downgradeTo,
              subscriptionStatus: "cancelled",
              cancelledAt:        new Date().toISOString(),
            });
            console.log(`📉 Downgrade a ${downgradeTo} per ${snap.docs[0].id}`);
          }
          break;
        }

        // ── Abbonamento aggiornato (upgrade/downgrade da portale) ─
        case "customer.subscription.updated": {
          const snap = await db.collection("users")
            .where("stripeSubscriptionId", "==", data.id).limit(1).get();
          if (!snap.empty) {
            const newPriceId = data.items?.data?.[0]?.price?.id;
            const newPlan    = PRICE_TO_PLAN[newPriceId];
            if (newPlan) {
              await snap.docs[0].ref.update({
                plan:               newPlan,
                subscriptionStatus: data.status === "active" ? "active" : data.status,
              });
              console.log(`🔄 Piano aggiornato a ${newPlan}`);
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
//     POST /createPortalSession
//     Apre il portale Stripe per gestire l'abbonamento
// ─────────────────────────────────────────────────────────────
exports.createPortalSession = onRequest(
  { secrets: [stripeSecretKey], cors: false },
  async (req, res) => {
    setCors(res, req);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

    const Stripe = require("stripe");
    const stripe = Stripe(stripeSecretKey.value());
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

// ─────────────────────────────────────────────────────────────
//  4. sendFollowupReminders  [SCHEDULED]
//     Ogni giorno alle 9:00 ora italiana
//     Invia notifiche push a chi ha follow-up in scadenza oggi
//
//  Richiede: Cloud Scheduler abilitato in Google Cloud Console
//  Richiede: Firebase Cloud Messaging abilitato
// ─────────────────────────────────────────────────────────────
exports.sendFollowupReminders = onSchedule(
  {
    schedule: "0 8 * * *",    // 8:00 UTC = 9:00 Italia (10:00 ora legale)
    timeZone: "Europe/Rome",
    // Nessun secret Stripe necessario per questa funzione
  },
  async () => {
    const messaging     = admin.messaging();
    const now           = new Date();
    const FOLLOWUP_DAYS = [2, 5, 10, 21];
    let   sent          = 0;

    try {
      // Tutti gli utenti con notifiche attive e token FCM
      const usersSnap = await db.collection("users")
        .where("notificationsEnabled", "==", true)
        .where("fcmToken", "!=", null)
        .get();

      for (const userDoc of usersSnap.docs) {
        const user = userDoc.data();
        if (!user.fcmToken) continue;

        // Leggi i contatti dell'utente
        const contactsSnap = await db
          .collection("users").doc(userDoc.id)
          .collection("contacts")
          .where("contactedAt", "!=", null)
          .get();

        // Filtra solo quelli in scadenza oggi
        const dueContacts = contactsSnap.docs
          .map(d => d.data())
          .filter(c => {
            if (["convertito", "collaboratore", "archiviato"].includes(c.status)) return false;
            const days = Math.floor(
              (now - new Date(c.contactedAt)) / (1000 * 60 * 60 * 24)
            );
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
              headers:      { Urgency: "normal" },
              notification: {
                icon:  "/icons/icon-192x192.png",
                badge: "/icons/badge-72x72.png",
              },
            },
          });
          sent++;
        } catch (tokenErr) {
          // Token FCM scaduto — rimuovilo per non sprecare chiamate future
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
//  5. sendWeeklyTeamDigest  [SCHEDULED]
//     Ogni lunedì alle 9:00 ora italiana
//     Invia ai leader un digest settimanale del loro team
// ─────────────────────────────────────────────────────────────
exports.sendWeeklyTeamDigest = onSchedule(
  {
    schedule: "0 8 * * 1",    // ogni lunedì alle 8:00 UTC = 9:00 Italia
    timeZone: "Europe/Rome",
  },
  async () => {
    const messaging = admin.messaging();
    let   sent      = 0;

    try {
      // Tutti i leader con notifiche attive
      const leadersSnap = await db.collection("users")
        .where("role", "==", "leader")
        .where("notificationsEnabled", "==", true)
        .where("fcmToken", "!=", null)
        .get();

      for (const leaderDoc of leadersSnap.docs) {
        const leader = leaderDoc.data();
        if (!leader.fcmToken) continue;

        // Conta collaboratori e clienti del team
        const teamSnap = await db.collection("users")
          .where("leaderId", "==", leaderDoc.id)
          .get();

        const team    = teamSnap.docs.map(d => d.data());
        const clients = team.reduce((s, m) => s + (m.weeklyClients || 0), 0);
        const atRisk  = team.filter(
          m => (m.weeklyClients || 0) < (m.currentWeek || 1) * 0.5
        ).length;

        try {
          await messaging.send({
            token: leader.fcmToken,
            notification: {
              title: "📊 Digest settimanale del tuo team",
              body:  `${team.length} collaboratori · ${clients} clienti`
                   + (atRisk > 0
                     ? ` · ⚠️ ${atRisk} a rischio`
                     : " · ✅ Tutti in obiettivo"),
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

// export const api = onRequest({ region: "europe-west1" }, app);