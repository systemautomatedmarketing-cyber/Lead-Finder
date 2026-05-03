// src/data/sectors.js
// Settori supportati con script, prodotti campione e tono comunicativo personalizzato

export const SECTORS = {
  wellness_beauty: {
    id: "wellness_beauty",
    label: "Wellness & Beauty",
    icon: "🌿",
    color: "#B8860B",
    description: "Prodotti per il benessere, la cura della persona e la bellezza naturale.",
    products: ["creme e sieri", "profumi naturali", "integratori benessere", "make-up clean", "prodotti per la casa"],
    tone: "caldo, personale, autentico",
    hook: "Ti racconto qualcosa che ha cambiato la mia routine",
    benefit_examples: ["pelle più luminosa", "profumo che dura tutto il giorno", "più energia al mattino", "ingredienti naturali certificati"],
    scripts: {
      primo_messaggio: "Ciao [Nome]! 👋 Ho scoperto qualcosa che mi ha davvero sorpreso per [beneficio]. Te ne parlerei volentieri in 5 minuti. Sei disponibile questa settimana?",
      followup: "Ciao [Nome]! Volevo assicurarmi che il messaggio fosse arrivato 😊 Nessuna fretta — se ti va di saperne di più sono qui!",
      opportunita: "Ciao [Nome]! Sto costruendo qualcosa di interessante con un'azienda di wellness & beauty e cerco persone motivate. Non è un lavoro classico — si fa in parallelo. Ti andrebbe di sentirti 10 minuti?",
      evento: "Ciao [Nome]! [Giorno] sera faccio un piccolo evento a casa mia. Oltre a stare insieme ti faccio scoprire prodotti di beauty e benessere che uso ogni giorno. Nessun obbligo, solo curiosità 😊 Vieni?",
      referral: "Ciao [Nome]! Sono contento/a che i prodotti ti stiano piacendo 😊 C'è qualcuno tra i tuoi amici che potrebbe apprezzarli? Non voglio 'vendergli' nulla — solo farglielo conoscere.",
      obiezione_prezzo: "Ha senso chiederlo. Posso mostrarti il confronto con prodotti simili che trovi in profumeria? Spesso la differenza di qualità sorprende.",
    },
    post_ideas: [
      "Routine mattutina con i miei prodotti preferiti",
      "Ingredienti naturali vs chimici — cosa ho scoperto",
      "Prima e dopo: la mia pelle dopo [X] settimane",
      "Il profumo che tutti mi chiedono cos'è",
    ],
  },

  energia_utenze: {
    id: "energia_utenze",
    label: "Energia / Utenze",
    icon: "⚡",
    color: "#1A5FA8",
    description: "Fornitura di energia, luce, gas e servizi per la casa.",
    products: ["luce", "gas", "energia rinnovabile", "bundle casa", "telefonia"],
    tone: "professionale, concreto, orientato al risparmio",
    hook: "Ti mostro quanto potresti risparmiare in bolletta",
    benefit_examples: ["risparmio in bolletta", "energia 100% rinnovabile", "assistenza dedicata", "contratto trasparente senza sorprese"],
    scripts: {
      primo_messaggio: "Ciao [Nome]! Ho trovato un modo per [risparmiare sulla bolletta / avere energia verde]. In 5 minuti ti spiego tutto — potrebbe interessarti?",
      followup: "Ciao [Nome]! Volevo solo accertarmi che il messaggio fosse arrivato. Se hai qualche domanda sul risparmio in bolletta sono qui 😊",
      opportunita: "Ciao [Nome]! Collaboro con un'azienda del settore energetico e sto cercando persone che vogliano guadagnare aiutando famiglie e aziende a risparmiare. Ti incuriosisce?",
      evento: "Ciao [Nome]! Organizzo una piccola serata informativa su come ottimizzare i costi energetici di casa. Gratis, senza impegno. Vieni?",
      referral: "Ciao [Nome]! Sei soddisfatto/a del servizio? Se conosci qualcuno che vuole risparmiare in bolletta, posso aiutare anche loro — e per te c'è un vantaggio.",
      obiezione_prezzo: "Capisco la cautela. Ti faccio vedere subito un confronto con la tua bolletta attuale — in media i nostri clienti risparmiano [X]€ all'anno.",
    },
    post_ideas: [
      "Quanto spendi di bolletta? Ecco cosa ho scoperto",
      "Energia rinnovabile: mito o realtà del risparmio?",
      "Ho cambiato fornitore: ecco com'è andata dopo 3 mesi",
      "3 cose che nessuno ti dice sulla bolletta della luce",
    ],
  },

  integratori_salute: {
    id: "integratori_salute",
    label: "Integratori / Salute",
    icon: "💊",
    color: "#1A7A4A",
    description: "Integratori alimentari, nutraceutica e prodotti per la salute.",
    products: ["integratori vitaminici", "proteine e aminoacidi", "probiotici", "collagene", "omega 3"],
    tone: "scientifico ma accessibile, basato sui risultati",
    hook: "Ti racconto cosa è cambiato nella mia salute",
    benefit_examples: ["più energia durante il giorno", "recupero più veloce dopo lo sport", "intestino regolare", "sistema immunitario più forte"],
    scripts: {
      primo_messaggio: "Ciao [Nome]! So che tieni alla tua salute. Ho scoperto qualcosa che ha fatto la differenza per me in termini di [beneficio]. Ti va se te ne parlo in 5 minuti?",
      followup: "Ciao [Nome]! Non volevo essere invadente — solo assicurarmi che il messaggio fosse arrivato 😊 Se hai curiosità sugli integratori che uso, sono qui.",
      opportunita: "Ciao [Nome]! Collaboro con un'azienda di nutraceutica e sto cercando persone appassionate di salute e benessere che vogliano anche guadagnare. Ti interessa saperne di più?",
      evento: "Ciao [Nome]! Faccio una seratina informale su salute e integrazione — parleremo di come migliorare energia e benessere in modo naturale. Vieni?",
      referral: "Ciao [Nome]! Sei contento/a dei risultati? Se conosci qualcuno che vuole migliorare il suo benessere, posso aiutarlo con una consulenza gratuita.",
      obiezione_prezzo: "Capisco. Considera però che questi non sono prodotti da supermercato — la biodisponibilità e la certificazione degli ingredienti fanno la differenza. Ti mostro le analisi?",
    },
    post_ideas: [
      "Il mio protocollo di integrazione mattutina",
      "Ho smesso di essere sempre stanco/a: cosa ho cambiato",
      "Differenza tra integratori farmacia e quelli che uso io",
      "Dopo [X] settimane di omega 3: ecco cosa è cambiato",
    ],
  },

  cosmetici_profumi: {
    id: "cosmetici_profumi",
    label: "Cosmetici / Profumi",
    icon: "💄",
    color: "#C05A1A",
    description: "Cosmetici, profumeria e prodotti per la cura estetica.",
    products: ["profumi", "fondotinta e correttori", "rossetti", "mascara", "sieri viso"],
    tone: "elegante, aspirazionale, sensoriale",
    hook: "Lasciami raccontare del profumo che tutti mi chiedono",
    benefit_examples: ["profumo che dura 12 ore", "make-up che resiste tutto il giorno", "colori esclusivi", "formula cruelty-free"],
    scripts: {
      primo_messaggio: "Ciao [Nome]! Ho scoperto qualcosa nel mondo del beauty che mi ha conquistato subito — [beneficio]. Sono sicura che ti piacerebbe. Ti va se te lo mostro?",
      followup: "Ciao [Nome]! Pensavo ancora a te e ai prodotti che ti avevo mostrato 😊 C'è qualcosa che ti aveva incuriosito?",
      opportunita: "Ciao [Nome]! Collaboro con un brand cosmetico esclusivo e cerco persone appassionate di beauty che vogliano guadagnare condividendo prodotti che amano. Fa per te?",
      evento: "Ciao [Nome]! Organizzo una beauty night a casa mia — profumi, make-up e skincare da provare. Vieni con un'amica?",
      referral: "Ciao [Nome]! Adoro che i prodotti ti piacciano 😊 Se hai un'amica appassionata di beauty, presentamela — ho qualcosa che la sorprenderà.",
      obiezione_prezzo: "Il prezzo riflette la qualità degli ingredienti e l'esclusività della formula. Ti faccio provare — poi mi dici se vale la differenza 😊",
    },
    post_ideas: [
      "Il mio make-up del mattino in 5 minuti",
      "Profumo della settimana: quello che tutti mi chiedono",
      "Clean beauty: perché ho cambiato i miei cosmetici",
      "Get ready with me — routine serale",
    ],
  },

  immobiliare_finanziario: {
    id: "immobiliare_finanziario",
    label: "Immobiliare / Servizi Finanziari",
    icon: "🏠",
    color: "#6B4FA8",
    description: "Agenzie immobiliari, mutui, assicurazioni e servizi finanziari.",
    products: ["consulenza mutuo", "assicurazioni vita", "investimenti", "compravendita immobili", "affitti"],
    tone: "professionale, autorevole, orientato alla consulenza",
    hook: "Posso aiutarti a prendere la decisione giusta",
    benefit_examples: ["mutuo alle migliori condizioni", "protezione per la tua famiglia", "investimento sicuro", "risparmio fiscale"],
    scripts: {
      primo_messaggio: "Ciao [Nome]! So che stai [valutando una casa / cercando un mutuo / pensando agli investimenti]. Ho qualche informazione utile che potrebbe farti risparmiare. Ti va di parlarne?",
      followup: "Ciao [Nome]! Volevo solo assicurarmi che il messaggio precedente fosse arrivato. Resto disponibile per qualsiasi domanda — senza impegno.",
      opportunita: "Ciao [Nome]! Collaboro con una realtà nel settore [immobiliare / finanziario] e sto cercando persone con buone capacità relazionali. C'è un'opportunità interessante — ti va di sentirti?",
      evento: "Ciao [Nome]! Organizzo un incontro informativo gratuito su [mutui / investimenti immobiliari] con un esperto del settore. Posti limitati — ti riservo uno?",
      referral: "Ciao [Nome]! Sei soddisfatto/a della consulenza? Se conosci qualcuno che sta valutando [acquisto casa / mutuo], posso offrire una consulenza gratuita anche a lui/lei.",
      obiezione_prezzo: "Capisco la preoccupazione. La nostra consulenza in realtà vi fa risparmiare — in media troviamo condizioni migliori del [X]% rispetto al fai-da-te.",
    },
    post_ideas: [
      "3 errori da evitare quando chiedi un mutuo",
      "Affittare o comprare nel 2025: cosa conviene davvero",
      "Come ho aiutato [X] famiglie a trovare la casa dei loro sogni",
      "Investimento immobiliare: da dove si inizia con poco",
    ],
  },
};

// Settore generico fallback
export const GENERIC_SECTOR = {
  id: "generico",
  label: "Network Marketing",
  icon: "🤝",
  color: "#B8860B",
  description: "Prodotti e servizi in network marketing.",
  products: ["prodotti aziendali"],
  tone: "professionale e autentico",
  hook: "Ho qualcosa che potrebbe interessarti",
  benefit_examples: ["qualità superiore", "risultati garantiti", "convenienza"],
  scripts: {
    primo_messaggio: "Ciao [Nome]! Ho scoperto qualcosa che mi ha davvero colpito per [beneficio]. Te ne parlerei volentieri in 5 minuti. Sei disponibile questa settimana?",
    followup: "Ciao [Nome]! Volevo assicurarmi che il messaggio fosse arrivato 😊 Se ti va di saperne di più sono qui!",
    opportunita: "Ciao [Nome]! Sto costruendo qualcosa di interessante e cerco persone motivate. Non è un lavoro classico — si fa in parallelo. Ti andrebbe di sentirti 10 minuti?",
    evento: "Ciao [Nome]! Organizzo un piccolo incontro informale per presentare quello che faccio. Nessun obbligo, solo curiosità. Vieni?",
    referral: "Ciao [Nome]! Conosci qualcuno a cui potrebbe interessare quello di cui ti ho parlato? Posso offrire una consulenza gratuita.",
    obiezione_prezzo: "Capisco la domanda. Posso mostrarti il confronto qualità-prezzo? Spesso la differenza sorprende.",
  },
  post_ideas: [
    "Cosa faccio e perché l'ho scelto",
    "Il mio percorso da [prima] a [dopo]",
    "Domande frequenti sul mio lavoro — rispondo a tutto",
    "Opportunità che non avevo considerato un anno fa",
  ],
};

export const getSectorById = (id) => SECTORS[id] || GENERIC_SECTOR;
export const getSectorList = () => Object.values(SECTORS);
