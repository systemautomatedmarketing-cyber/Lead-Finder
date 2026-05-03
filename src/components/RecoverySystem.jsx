// src/components/RecoverySystem.jsx
// Sistema di recupero per collaboratori senza risultati dopo 2 settimane

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

// ── Missioni NUOVE per recovery (mai viste prima) ─────────────
export const RECOVERY_MISSIONS_NEW = {
  giudizio: [
    {
      id: "rec_g1", title: "Il Metodo dell'Anonimato",
      objective: "Contattare 3 persone che NON fanno parte della tua cerchia stretta.",
      actions: [
        "Scegli 3 persone che conosci ma con cui non hai un legame forte (es. ex colleghi, conoscenti)",
        "Con loro il rischio di giudizio è quasi zero — non sanno cosa pensi di te normalmente",
        "Invia il messaggio template qui sotto",
        "Questo esercizio dimostra che il giudizio è sopravvalutato",
      ],
      script: { label: "Messaggio a conoscenti lontani", text: "Ciao [Nome]! Non ci sentiamo da un po'. Ho scoperto qualcosa di interessante su prodotti wellness/beauty che mi ha colpito — pensavo a te. Hai 5 minuti questa settimana per una chiacchierata?" },
      kpi: "3 messaggi inviati a conoscenti lontani", points: 20, channel: "whatsapp",
    },
    {
      id: "rec_g2", title: "La Storia Anonima",
      objective: "Pubblicare una storia senza mostrare il tuo viso.",
      actions: [
        "Filma solo le mani mentre usi il prodotto",
        "Oppure fotografa solo il prodotto sul tuo comodino o bagno",
        "Aggiungi testo: 'Piccola scoperta di questa settimana 🌿'",
        "Nessuno sa che sei tu — nessun giudizio possibile",
      ],
      script: null, kpi: "1 storia pubblicata senza viso", points: 15, channel: "social",
    },
    {
      id: "rec_g3", title: "Il Gioco delle Statistiche",
      objective: "Capire empiricamente che il rifiuto è raro.",
      actions: [
        "Invia 5 messaggi oggi con questo obiettivo: raccogliere dati, non vendere",
        "Conta le risposte positive, negative e i silenzi",
        "Scommetti con te stesso: almeno 2 risponderanno positivamente",
        "Registra il risultato — probabilmente rimarrai sorpreso",
      ],
      script: { label: "Messaggio statistico", text: "Ciao [Nome]! Sto scoprendo prodotti di wellness che mi hanno sorpreso. Potresti dirmi se ti interesserebbe saperne di più, anche solo per curiosità? 😊 Nessun impegno!" },
      kpi: "5 messaggi + registra le risposte", points: 25, channel: "whatsapp",
    },
  ],
  rifiuto: [
    {
      id: "rec_r1", title: "La Collezione dei No",
      objective: "Raccogliere intenzionalmente 5 rifiuti come allenamento mentale.",
      actions: [
        "Obiettivo dichiarato: raccogliere 5 'no' questa settimana",
        "Ogni 'no' vale punti — è un allenamento, non una sconfitta",
        "Scrivi come ti sei sentito dopo ogni rifiuto: si attenua con l'abitudine",
        "Chi raccoglie i no più velocemente vince la paura del rifiuto per sempre",
      ],
      script: { label: "Script diretto (alta probabilità di no)", text: "Ciao [Nome], ti parlo direttamente: ho un'opportunità di business con prodotti wellness. Non è per tutti — potrebbe interessarti?" },
      kpi: "5 contatti con risposta raccolta (sì o no)", points: 30, channel: "whatsapp",
    },
    {
      id: "rec_r2", title: "Il Follow-up Coraggioso",
      objective: "Ricontattare 3 persone che ti hanno detto no nelle ultime 2 settimane.",
      actions: [
        "Apri la lista contatti — trova chi ha detto no o non ha risposto",
        "Aspetta sempre almeno 7-10 giorni prima di ricontattare",
        "Il messaggio non è 'ci ho ripensato' — è nuovo valore",
        "Non chiedere di comprare: condividi qualcosa di utile",
      ],
      script: { label: "Re-engagement dopo il no", text: "Ciao [Nome]! So che l'altra volta non era il momento. Ho trovato qualcosa che potrebbe cambiare idea: [risultato/testimonianza recente]. Solo per tenerti aggiornato/a 😊" },
      kpi: "3 re-engagement fatti", points: 20, channel: "whatsapp",
    },
  ],
  vendere: [
    {
      id: "rec_v1", title: "Il Metodo del Regalo",
      objective: "Condividere il prodotto come se fosse un consiglio da amico, non una vendita.",
      actions: [
        "Scrivi a 3 persone come se stessi consigliando un ristorante o un film",
        "Inizia con: 'Ho provato qualcosa che devi assolutamente sapere...'",
        "Non dire mai 'comprare', 'prezzo' o 'prodotto' nel primo messaggio",
        "Parla solo del beneficio che hai provato tu personalmente",
      ],
      script: { label: "Il consiglio da amico", text: "Ciao [Nome]! Devo dirti una cosa: ho scoperto [prodotto] e da quando lo uso [beneficio specifico]. Non è una pubblicità, te lo giuro — è una di quelle cose che mi sento di dire agli amici veri. Ti va se te ne parlo?" },
      kpi: "3 conversazioni aperte senza 'vendere'", points: 20, channel: "whatsapp",
    },
    {
      id: "rec_v2", title: "Contenuto Educativo Puro",
      objective: "Pubblicare un post che non vende nulla, solo informa e crea valore.",
      actions: [
        "Scegli un ingrediente o beneficio di un prodotto Sorgenta",
        "Scrivi 4-5 righe su perché è utile — dati, non opinioni",
        "Concludi con: 'Se vuoi saperne di più scrivimi' — nessun link, nessun prezzo",
        "Chi commenta o scrive è già interessato — li contatti tu",
      ],
      script: { label: "Post educativo", text: "Lo sapevi che [ingrediente] aiuta [beneficio]? La maggior parte dei prodotti che troviamo al supermercato non lo contengono o lo contengono in quantità minime.\n\nDa quando l'ho scoperto ho cambiato completamente la mia routine di [cura/benessere].\n\nSe vuoi saperne di più, scrivimi 👇 — nessuna vendita, solo informazioni." },
      kpi: "1 post educativo pubblicato", points: 20, channel: "social",
    },
  ],
  risultati: [
    {
      id: "rec_res1", title: "Il Mini-Obiettivo Garantito",
      objective: "Fissare un obiettivo talmente piccolo che è impossibile non raggiungerlo.",
      actions: [
        "Obiettivo di questa settimana: 1 SOLO messaggio al giorno",
        "Non 5, non 10 — solo 1. Scegline uno dalla lista",
        "Invialo ogni mattina prima di fare colazione",
        "7 giorni = 7 messaggi. Anche solo 1 risposta positiva = successo",
      ],
      script: { label: "Il messaggio quotidiano minimo", text: "Ciao [Nome]! Sto usando prodotti Sorgenta da [X settimane] e mi sono davvero stupito/a. Ti racconto in 2 minuti?" },
      kpi: "7 giorni × 1 messaggio al giorno", points: 25, channel: "whatsapp",
    },
    {
      id: "rec_res2", title: "Chiedi Aiuto al Leader",
      objective: "Fare una chiamata di 15 minuti con il tuo leader per sbloccarti.",
      actions: [
        "Scrivi al tuo leader con il messaggio qui sotto",
        "Prepara 3 domande concrete: cosa non sta funzionando, cosa hai provato, cosa ti blocca",
        "Prendi appunti durante la chiamata",
        "Esci dalla chiamata con 1 azione concreta per il giorno stesso",
      ],
      script: { label: "Messaggio al leader", text: "Ciao [Leader]! Ho bisogno di supporto — non sto ottenendo risultati come mi aspettavo. Potresti dedicarmi 15 minuti questa settimana? Ho alcune domande specifiche su cosa migliorare." },
      kpi: "1 chiamata con il leader fatta", points: 20, channel: "offline",
    },
  ],
};

// ── Missioni RIPETIBILI (versione aggiornata, non duplicata) ──
export const RECOVERY_MISSIONS_REPEAT = [
  {
    id: "rep_1", title: "Nuovi Nomi dalla Lista Estesa",
    objective: "Aggiungere 10 nomi NUOVI — non già nella lista originale.",
    actions: [
      "Guarda i follower dei tuoi amici: chi non conosci direttamente?",
      "Pensa a chi hai incontrato nelle ultime 2-3 settimane",
      "Scorri i commenti dei tuoi post: chi ha interagito?",
      "Aggiungi solo nomi che NON erano nella tua lista originale",
    ],
    script: null, kpi: "+10 nomi nuovi", points: 15, channel: "offline",
    isRepeat: true, originalMission: "Lista dei 20",
  },
  {
    id: "rep_2", title: "Nuovi Messaggi — Approccio Diverso",
    objective: "Inviare 3 messaggi con un approccio completamente diverso da quello usato prima.",
    actions: [
      "Rivedi i messaggi che hai inviato nelle ultime 2 settimane",
      "Identifica lo schema comune — e cambialo completamente",
      "Se hai usato l'approccio curioso, prova quello diretto",
      "Se hai usato WhatsApp, prova Instagram DM o dal vivo",
    ],
    script: { label: "Approccio alternativo — Diretto", text: "Ciao [Nome]! Ti parlo direttamente perché mi fido di te: sto lavorando con un'azienda di wellness e beauty e cerco clienti e collaboratori seri. Il prodotto è eccellente, i risultati ci sono. Ti interessa saperne di più?" },
    kpi: "3 messaggi con approccio nuovo", points: 15, channel: "whatsapp",
    isRepeat: true, originalMission: "Primo Messaggio Caldo",
  },
  {
    id: "rep_3", title: "Seconda Storia — Formato Diverso",
    objective: "Pubblicare una storia con un formato che non hai ancora usato.",
    actions: [
      "Se hai pubblicato foto → pubblica video",
      "Se hai pubblicato video → pubblica testo su sfondo colorato",
      "Se hai mostrato il prodotto → mostra il risultato / come ti senti",
      "Nuovo angolo: 'Dopo X giorni di utilizzo...'",
    ],
    script: null, kpi: "1 storia con formato nuovo", points: 15, channel: "social",
    isRepeat: true, originalMission: "Prima Storia",
  },
  {
    id: "rep_4", title: "Seconda Presentazione — Formato Diverso",
    objective: "Fare una presentazione in un formato che non hai ancora provato.",
    actions: [
      "Se hai fatto dal vivo → prova videocall",
      "Se hai fatto videocall → prova vocale WhatsApp di 3 minuti",
      "Se hai mostrato tanti prodotti → mostra solo 1 prodotto in dettaglio",
      "Usa la domanda: 'Cosa è successo dall'ultima volta che ne abbiamo parlato?'",
    ],
    script: { label: "Riapertura presentazione", text: "Ciao [Nome]! L'altra volta mi hai detto [cosa ha detto]. Ho pensato esattamente a quello. Hai 15 minuti questa settimana per approfondire?" },
    kpi: "1 presentazione in formato nuovo", points: 30, channel: "offline",
    isRepeat: true, originalMission: "Prima Presentazione",
  },
];

// ── Assessment blocco ─────────────────────────────────────────
const BLOCK_QUESTIONS = [
  {
    id: "cosa_hai_fatto",
    question: "Nelle ultime 2 settimane, cosa hai fatto?",
    options: [
      { value: "niente",    label: "Non ho fatto quasi nulla",       icon: "😶" },
      { value: "messaggi",  label: "Ho mandato messaggi ma nessuna risposta", icon: "💬" },
      { value: "risposte",  label: "Ho avuto risposte ma nessuna conversione", icon: "🔄" },
      { value: "presentazioni", label: "Ho fatto presentazioni ma nessuno ha comprato", icon: "📋" },
    ],
  },
  {
    id: "blocco_principale",
    question: "Qual è la sensazione prevalente?",
    options: [
      { value: "giudizio",  label: "Ho paura di cosa penseranno di me",  icon: "👀" },
      { value: "rifiuto",   label: "Ho ricevuto troppi 'no' o silenzi",   icon: "🙅" },
      { value: "vendere",   label: "Mi sento un venditore invadente",     icon: "😬" },
      { value: "risultati", label: "Perdo motivazione senza risultati",   icon: "📉" },
    ],
  },
];

export default function RecoverySystem({ onClose, userProfile }) {
  const { T } = useTheme();
  const [step, setStep]         = useState(0); // 0-1 assessment, 2 = piano
  const [blockAnswers, setBlockAnswers] = useState({});
  const [plan, setPlan]         = useState(null);

  const q = BLOCK_QUESTIONS[step];

  const handleAnswer = (value) => {
    const newAnswers = { ...blockAnswers, [q.id]: value };
    setBlockAnswers(newAnswers);

    if (step < BLOCK_QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Costruisci il piano
      const blocco = newAnswers.blocco_principale;
      const newMissions = RECOVERY_MISSIONS_NEW[blocco] || [];
      const repeatMissions = RECOVERY_MISSIONS_REPEAT;
      setPlan({ blocco, newMissions, repeatMissions, answers: newAnswers });
      setStep(2);
    }
  };

  const card = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, boxShadow: T.shadowCard };
  const CH_ICON = { whatsapp: "💬", social: "📱", offline: "🤝" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: T.bg, borderRadius: "24px 24px 0 0", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24, borderTop: `3px solid ${T.accent}` }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap'); @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } .anim { animation: fadeIn 0.25s ease; }`}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "'Playfair Display'" }}>
            {step < 2 ? "📊 Analizziamo il blocco" : "🗺 Il tuo piano di recupero"}
          </div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, padding: "6px 12px", borderRadius: 50, cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 12 }}>Chiudi</button>
        </div>

        {/* ASSESSMENT */}
        {step < 2 && (
          <div className="anim" key={step}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16, fontFamily: "'Playfair Display'" }}>{q.question}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map(opt => (
                <div key={opt.value} onClick={() => handleAnswer(opt.value)} style={{ ...card, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}>
                  <span style={{ fontSize: 24 }}>{opt.icon}</span>
                  <span style={{ fontSize: 14, fontFamily: "'DM Sans'", color: T.text, fontWeight: 500 }}>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIANO DI RECUPERO */}
        {step === 2 && plan && (
          <div className="anim">
            <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.accent, fontWeight: 700, marginBottom: 4 }}>Il tuo blocco principale</div>
              <div style={{ fontSize: 14, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.6 }}>
                {plan.blocco === "giudizio"  && "Stai rallentando per paura del giudizio. Le prossime missioni ti aiutano ad aggirarlo gradualmente."}
                {plan.blocco === "rifiuto"   && "I rifiuti ti pesano. Trasformiamoli in un gioco — chi raccoglie più 'no' vince la paura più velocemente."}
                {plan.blocco === "vendere"   && "Ti senti un venditore. Le prossime missioni ti mostrano come condividere invece di vendere."}
                {plan.blocco === "risultati" && "Perdi motivazione senza risultati. Iniziamo con obiettivi micro-garantiti per ricostruire lo slancio."}
              </div>
            </div>

            {/* Missioni NUOVE */}
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12, fontFamily: "'Playfair Display'" }}>
              ⚡ Missioni nuove — specifiche per te
            </div>
            {plan.newMissions.map(m => (
              <div key={m.id} style={{ ...card, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{CH_ICON[m.channel]} {m.title}</div>
                  <span style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.accent, fontWeight: 700 }}>+{m.points}pt</span>
                </div>
                <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.5, marginBottom: 6 }}>{m.objective}</div>
                <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.accent, fontWeight: 600 }}>KPI: {m.kpi}</div>
              </div>
            ))}

            {/* Missioni RIPETIBILI */}
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: "20px 0 12px", fontFamily: "'Playfair Display'" }}>
              🔄 Ripetibili — versione aggiornata
            </div>
            <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, marginBottom: 12, lineHeight: 1.5 }}>
              Azioni già fatte ma in versione evoluta — canali o approcci diversi da quelli usati prima.
            </div>
            {plan.repeatMissions.map(m => (
              <div key={m.id} style={{ ...card, marginBottom: 10, opacity: 0.9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{CH_ICON[m.channel]} {m.title}</div>
                  <span style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted }}>🔄 Ripetibile</span>
                </div>
                <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.5 }}>{m.objective}</div>
              </div>
            ))}

            <button onClick={onClose} style={{ width: "100%", background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "14px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 16 }}>
              Inizia il piano di recupero →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
