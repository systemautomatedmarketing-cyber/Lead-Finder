// src/data/missions.js
// Percorsi personalizzati per livello: Principiante / In crescita / Avanzato / Pro

export const LEVELS = {
  principiante: {
    id: "principiante",
    label: "Principiante",
    icon: "🌱",
    color: "#3ecf8e",
    desc: "Stai muovendo i primi passi. Azioni semplici, risultati concreti.",
    weeklyTarget: [1, 1, 2, 2, 3, 3, 4],
  },
  in_crescita: {
    id: "in_crescita",
    label: "In Crescita",
    icon: "🌿",
    color: "#60a5fa",
    desc: "Hai le basi. Ora espandi i canali e il ritmo.",
    weeklyTarget: [2, 2, 3, 3, 4, 5, 7],
  },
  avanzato: {
    id: "avanzato",
    label: "Avanzato",
    icon: "🔥",
    color: "#fb923c",
    desc: "Sei operativo. Scala con eventi, referral e team building.",
    weeklyTarget: [3, 4, 5, 5, 6, 7, 7],
  },
  pro: {
    id: "pro",
    label: "Pro",
    icon: "⭐",
    color: "#e8c547",
    desc: "Guidi e moltiplichi. Il tuo focus è il sistema, non solo le vendite.",
    weeklyTarget: [4, 5, 6, 7, 7, 7, 7],
  },
};

// ─────────────────────────────────────────────────────────────
//  PRINCIPIANTE — azioni ultra-semplici, molta guida
// ─────────────────────────────────────────────────────────────
export const MISSIONS_PRINCIPIANTE = [
  {
    id: "p_w1_1", week: 1, day: 1, category: "lista",
    title: "Scrivi la Lista dei 20",
    objective: "Avere 20 nomi scritti entro oggi. Niente di più.",
    actions: [
      "Apri i contatti del telefono — scorri dall'inizio alla fine",
      "Per ogni persona che conosci abbastanza: scrivila su un foglio o in Note",
      "Aggiungi anche chi segui sui social e interagisce con te",
      "Non filtrare nessuno: la lista è tua, non la vedranno",
      "Fermati solo quando arrivi a 20 nomi",
    ],
    script: null,
    channel: "offline", points: 10, week_label: "Settimana 1",
    kpi: "20 nomi scritti",
    tip: "Non pensare a chi 'comprerà'. Scrivi tutti. La selezione si fa dopo, non adesso.",
    why: "Senza lista non c'è business. È il fondamento di tutto quello che faremo.",
  },
  {
    id: "p_w1_2", week: 1, day: 2, category: "contatto_caldo",
    title: "Il Tuo Primo Messaggio (×3)",
    objective: "Inviare 3 messaggi oggi. Solo 3. Niente di più.",
    actions: [
      "Scegli 3 persone dalla lista che conosci bene e con cui hai un rapporto diretto",
      "Copia il messaggio qui sotto — cambia solo il nome e il beneficio",
      "Invia su WhatsApp — NON allegare foto prodotto, NON mandare link",
      "Aspetta le risposte con pazienza — non inviare follow-up oggi",
      "Segna i 3 come 'Contattato' nell'app",
    ],
    script: {
      label: "Il tuo primo messaggio WhatsApp",
      text: "Ciao [Nome]! 👋 Come stai? Ho scoperto qualcosa che mi ha davvero sorpreso per [es: la cura della pelle / i profumi naturali / l'energia]. Te ne parlerei volentieri. Sei disponibile per una chiamata di 10 minuti questa settimana?",
    },
    channel: "whatsapp", points: 15, week_label: "Settimana 1",
    kpi: "3 messaggi inviati",
    tip: "Il primo messaggio serve solo ad APRIRE la conversazione. Non devi vendere nulla adesso.",
    why: "Iniziare è la parte più difficile. 3 messaggi oggi rompono il ghiaccio per sempre.",
  },
  {
    id: "p_w1_3", week: 1, day: 3, category: "social",
    title: "La Tua Prima Storia",
    objective: "Pubblicare 1 storia su Instagram o Facebook con un prodotto Sorgenta.",
    actions: [
      "Scegli il prodotto Sorgenta che usi più volentieri",
      "Scatta una foto normale mentre lo usi (non deve essere perfetta)",
      "Aggiungi solo una frase breve — es: 'Questo è diventato parte della mia routine 😊'",
      "Pubblica — senza prezzi, senza link, senza hashtag esagerati",
      "Guarda chi vede la storia nelle prossime ore: sono i tuoi clienti più caldi",
    ],
    script: {
      label: "Testo per la storia",
      text: "Non pensavo mi sarei innamorato/a di [nome prodotto]. È diventato fisso nella mia giornata 🌿 Se vuoi sapere cos'è, scrivimi!",
    },
    channel: "social", points: 15, week_label: "Settimana 1",
    kpi: "1 storia pubblicata",
    tip: "La storia imperfetta e autentica funziona 3× meglio di quella costruita. Non rifare tutto — pubblica.",
    why: "La storia crea visibilità passiva: lavora per te mentre fai altro.",
  },
  {
    id: "p_w1_4", week: 1, day: 4, category: "followup",
    title: "Il Tuo Primo Follow-up",
    objective: "Rispondere a chi ha reagito e ricontattare chi non ha risposto.",
    actions: [
      "Rileggi le 3 conversazioni aperte ieri",
      "Chi ha risposto positivamente: proponi data e ora per una chiacchierata",
      "Chi non ha risposto: invia il messaggio di follow-up qui sotto",
      "Chi ha detto no: ringrazialo e aggiornalo a 'Non interessato' nell'app",
      "Segna lo stato aggiornato per ogni contatto",
    ],
    script: {
      label: "Follow-up leggero (24h dopo)",
      text: "Ciao [Nome]! Volevo assicurarmi che il messaggio fosse arrivato 😊 Nessuna fretta — se non è il momento va benissimo. Però se ti va di saperne di più sono qui!",
    },
    channel: "whatsapp", points: 15, week_label: "Settimana 1",
    kpi: "3 follow-up gestiti",
    tip: "Il follow-up non è pressione. Chi non ha risposto probabilmente non ha visto il messaggio.",
    why: "L'80% delle vendite avviene dopo il 2° o 3° contatto. Chi non fa follow-up lascia soldi sul tavolo.",
  },
  {
    id: "p_w1_5", week: 1, day: 5, category: "presentazione",
    title: "La Tua Prima Presentazione",
    objective: "Una chiacchierata informale di 15 minuti con 1 persona interessata.",
    actions: [
      "Scegli il formato più comodo: dal vivo, videocall o vocale WhatsApp",
      "Inizia con una domanda: 'Cosa cerchi tu per la cura di te stesso/a?'",
      "Mostra massimo 2 prodotti — non tutta la gamma",
      "Ascolta più di quanto parli",
      "Chiudi con: 'Cosa ti ha colpito di più?' — poi aspetta 24h prima di chiedere se vuole ordinare",
    ],
    script: {
      label: "Apertura presentazione principiante",
      text: "Prima di mostrarti qualsiasi cosa, voglio capire cosa ti serve davvero. Dimmi: cosa è importante per te quando scegli prodotti per [cura personale / casa / benessere]? Cosa non ti è mai piaciuto di quelli che hai provato finora?",
    },
    channel: "offline", points: 30, week_label: "Settimana 1",
    kpi: "1 presentazione completata",
    tip: "Se non sai rispondere a una domanda dì: 'Lo scopriamo insieme' o 'Te lo chiedo al mio leader'. È onesto e funziona.",
    why: "La prima presentazione sblocca tutto. Dopo la prima, la seconda è già più facile.",
  },
  {
    id: "p_w2_1", week: 2, day: 1, category: "lista",
    title: "Aggiungi 10 Nomi alla Lista",
    objective: "Espandere la lista con 10 nuovi contatti.",
    actions: [
      "Guarda chi ha visto le tue storie — aggiungi i più attivi",
      "Pensa a chi hai incontrato negli ultimi 2 mesi: palestra, corsi, lavoro, eventi",
      "Scorri i tuoi follower su Instagram o Facebook",
      "Aggiungi ogni nome con una nota: 'perché potrebbe essere interessato'",
    ],
    script: null,
    channel: "offline", points: 10, week_label: "Settimana 2",
    kpi: "+10 nomi aggiunti",
    tip: "La lista non si esaurisce mai. Ogni settimana incontri nuove persone — scrivile subito.",
    why: "Una lista grande ti dà libertà di scelta e riduce la paura del rifiuto.",
  },
  {
    id: "p_w2_2", week: 2, day: 2, category: "social",
    title: "Post Educativo su Facebook",
    objective: "Pubblicare un contenuto che genera curiosità e commenti.",
    actions: [
      "Scegli un tema semplice: un ingrediente naturale, un beneficio, una tua abitudine",
      "Scrivi 3-4 righe come se parlassi a un amico — niente tono commerciale",
      "Chiudi con una domanda: 'Voi cosa usate per...?'",
      "Rispondi a TUTTI i commenti entro 2 ore",
      "A chi commenta positivamente: invia messaggio privato",
    ],
    script: {
      label: "Post Facebook — Principiante",
      text: "Piccola scoperta della settimana 🌿\n\nHo sempre pensato che i prodotti naturali non funzionassero quanto quelli 'potenti'. Mi sbagliavo.\n\nDa quando uso [prodotto Sorgenta] per [beneficio], ho notato una differenza vera. Non me lo aspettavo.\n\nVoi avete mai provato a cambiare qualcosa nella vostra routine di cura? Come è andata? 👇",
    },
    channel: "social", points: 20, week_label: "Settimana 2",
    kpi: "1 post + risposte ai commenti",
    tip: "Un post che fa domande genera il 70% in più di commenti. La domanda finale è fondamentale.",
    why: "Il contenuto educativo costruisce fiducia nel tempo. Ogni post è un seme.",
  },
  {
    id: "p_w3_1", week: 3, day: 1, category: "referral",
    title: "Chiedi il Tuo Primo Referral",
    objective: "Ottenere 2 nuovi nomi da un cliente soddisfatto.",
    actions: [
      "Scegli un cliente che ti ha già dato feedback positivo",
      "Scrivilo o chiamalo con il messaggio qui sotto",
      "Chiedi: 'Posso dirti che mi hai presentato tu?'",
      "Aggiungi i nuovi nomi alla lista e contattali entro 24 ore",
    ],
    script: {
      label: "Richiesta referral — primo tentativo",
      text: "Ciao [Nome]! Sono davvero contento/a che i prodotti ti stiano piacendo 😊 Ti chiedo un favore: c'è qualcuno tra i tuoi amici o colleghi che potrebbe apprezzarli? Non ti preoccupare, non 'vendo' nulla — voglio solo farli conoscere a chi potrebbe trovarli utili.",
    },
    channel: "whatsapp", points: 25, week_label: "Settimana 3",
    kpi: "2 nuovi nomi da referral",
    tip: "Il momento migliore per chiedere un referral è subito dopo un commento positivo del cliente.",
    why: "Un nome da referral converte 5× di più di un contatto freddo. È il canale più efficiente.",
  },
];

// ─────────────────────────────────────────────────────────────
//  IN CRESCITA — espande canali, inizia a reclutare
// ─────────────────────────────────────────────────────────────
export const MISSIONS_IN_CRESCITA = [
  ...MISSIONS_PRINCIPIANTE.slice(0, 3), // riusa le basi
  {
    id: "ic_w1_1", week: 1, day: 2, category: "contatto_caldo",
    title: "5 Messaggi al Giorno (×5 giorni)",
    objective: "Inviare 5 messaggi personalizzati al giorno per 5 giorni.",
    actions: [
      "Prepara i 5 nomi la sera prima — non al mattino quando sei già occupato",
      "Personalizza ogni messaggio: cita qualcosa di specifico della persona",
      "Usa canali diversi: WhatsApp, DM Instagram, Facebook Messenger",
      "Traccia ogni risposta nell'app con lo stato aggiornato",
      "Fissa almeno 2 appuntamenti dalla sessione di messaggi",
    ],
    script: {
      label: "Messaggio personalizzato — In Crescita",
      text: "Ciao [Nome]! Ho pensato a te perché so che tieni molto a [es: la cura della pelle / i prodotti naturali / il benessere]. Ho trovato qualcosa che mi ha davvero colpito e volevo condividerlo con te prima di dirlo a tutti. Hai 10 minuti questa settimana?",
    },
    channel: "whatsapp", points: 20, week_label: "Settimana 1",
    kpi: "25 messaggi inviati in 5 giorni",
    tip: "La personalizzazione aumenta il tasso di risposta del 40%. Vale il tempo extra di 30 secondi per messaggio.",
    why: "Il volume con qualità è il motore della crescita a questo livello.",
  },
  {
    id: "ic_w1_2", week: 1, day: 3, category: "social",
    title: "Reel / TikTok Autentico",
    objective: "Pubblicare 1 video breve che mostri il prodotto in uso reale.",
    actions: [
      "Filma 30-60 secondi mentre usi il prodotto — niente scenografie artificiali",
      "Hook iniziale: 'Non mi aspettavo che funzionasse così...' oppure 'La mia routine da quando ho scoperto...'",
      "Mostra il risultato o la reazione — non il packaging",
      "Aggiungi testo sullo schermo con il beneficio principale",
      "Pubblica tra le 12-13 o le 19-21 per massima visibilità",
    ],
    script: {
      label: "Script video 45 sec",
      text: "HOOK: 'Vi racconto cosa è successo quando ho provato [prodotto] per la prima volta'\n→ mostra prodotto in uso\n→ 'Dopo [X giorni / settimane] ho notato [risultato specifico]'\n→ 'Se volete saperne di più, scrivetemi nei commenti o in DM 👇'",
    },
    channel: "social", points: 20, week_label: "Settimana 1",
    kpi: "1 video pubblicato",
    tip: "L'autenticità di una persona reale converte più della produzione professionale. Non rifare il video.",
    why: "I video hanno reach organico 5× superiore alle foto. È il formato che scala più velocemente.",
  },
  {
    id: "ic_w2_1", week: 2, day: 1, category: "collaboratori",
    title: "Prima Conversazione sull'Opportunità",
    objective: "Presentare l'opportunità Sorgenta a 2 persone ambiziose.",
    actions: [
      "Scegli 2 persone con energia, voglia di crescere, o che vorresti nel tuo team",
      "Non usare la parola 'vendita' o 'MLM' — parla di 'progetto' o 'opportunità parallela'",
      "Fai questa domanda: 'Se potessi aggiungere 300-500€ al mese lavorando da casa, ti interesserebbe?'",
      "Se sì: fissa un appuntamento di 20 minuti per spiegare meglio",
      "Se no: rispetta, cambia argomento, non insistere",
    ],
    script: {
      label: "Apertura opportunità collaboratori",
      text: "Ciao [Nome]! Ti penso spesso quando si parla di persone con iniziativa. Sto costruendo qualcosa di interessante con un'azienda di wellness & beauty e cerco persone motivate da affiancare. Non è un lavoro classico — si fa in parallelo a quello che già fai. Ti andrebbe di sentirti 10-15 minuti per capire se fa per te?",
    },
    channel: "whatsapp", points: 20, week_label: "Settimana 2",
    kpi: "2 conversazioni opportunità aperte",
    tip: "Non cercare chi 'ha tempo'. Cerca chi ha OBIETTIVI. Le persone occupate e ambiziose sono i migliori collaboratori.",
    why: "A questo livello inizi a costruire il team. Reclutare non è un'opzione — è la chiave per scalare.",
  },
  {
    id: "ic_w3_1", week: 3, day: 1, category: "evento",
    title: "Mini-Evento Prodotto (3-5 persone)",
    objective: "Organizzare un incontro informale a casa tua o in un bar.",
    actions: [
      "Invita 7 persone sapendo che verranno in 4-5",
      "Prepara i prodotti da toccare, sentire e provare — l'esperienza sensoriale vende",
      "Non fare presentazione formale: fai conversazione e lascia che provino",
      "Alla fine chiedi uno per uno — non tutti insieme: 'Ti ha colpito qualcosa?'",
      "Per chi non ordina: 'Ti mando il link nei prossimi giorni?'",
    ],
    script: {
      label: "Invito evento",
      text: "Ciao [Nome]! [Giorno] sera faccio un piccolo evento a casa mia (/ al bar [nome]). Oltre a stare insieme ti faccio scoprire i prodotti Sorgenta che uso — profumi, beauty, benessere. Nessun obbligo, solo curiosità e due chiacchiere 😊 Vieni?",
    },
    channel: "offline", points: 40, week_label: "Settimana 3",
    kpi: "Evento con min 3 partecipanti",
    tip: "Gli eventi fisici hanno un tasso di conversione del 40-60%. Organizzane almeno 1 al mese.",
    why: "L'esperienza dal vivo non ha concorrenti digitali. Chi tocca il prodotto compra molto più spesso.",
  },
];

// ─────────────────────────────────────────────────────────────
//  AVANZATO — scala, delega, costruisce sistema
// ─────────────────────────────────────────────────────────────
export const MISSIONS_AVANZATO = [
  {
    id: "av_w1_1", week: 1, day: 1, category: "sistema",
    title: "Audit della Tua Lista Contatti",
    objective: "Classificare tutti i contatti esistenti e definire azioni prioritarie.",
    actions: [
      "Apri la lista contatti nell'app e rivedi lo stato di ognuno",
      "Sposta chi è fermo da 2+ settimane in 'Follow-up urgente'",
      "Identifica i 5 contatti più caldi — quelli più vicini alla conversione",
      "Definisci l'azione specifica per ognuno dei 5 entro oggi",
      "Archivia chi ha detto no chiaramente — non sprecare energia",
    ],
    script: null,
    channel: "offline", points: 15, week_label: "Settimana 1",
    kpi: "Lista auditata, 5 priorità definite",
    tip: "Gli avanzati lavorano sulle priorità, non sul volume. Qualità delle azioni batte quantità.",
    why: "Il tuo tempo vale di più: concentralo dove il ritorno è maggiore.",
  },
  {
    id: "av_w1_2", week: 1, day: 2, category: "collaboratori",
    title: "Colloquio 1:1 con Potenziale Collaboratore",
    objective: "Condurre un colloquio strutturato di 20-25 minuti.",
    actions: [
      "Prepara 4 domande: obiettivi, situazione attuale, tempo disponibile, cosa cerca",
      "Ascolta l'80% — parla solo per rispondere e guidare",
      "Condividi la TUA storia di crescita con numeri reali (dove possibile)",
      "NON fare promesse di guadagno — parla di potenziale e impegno",
      "Chiudi con: 'Ti mando del materiale. Ci risentiamo tra 3 giorni per le tue domande?'",
    ],
    script: {
      label: "Apertura colloquio avanzato",
      text: "Prima di tutto voglio capire la tua situazione. Non ti sto 'reclutando' — voglio capire se quello che faccio ha senso per te, non per me. Parliamo un po' di te: dove sei ora, dove vorresti essere tra 12 mesi, e quanto tempo hai per lavorarci.",
    },
    channel: "offline", points: 35, week_label: "Settimana 1",
    kpi: "2 colloqui 1:1 condotti",
    tip: "Le persone si uniscono alle persone prima che all'azienda. La tua credibilità è il tuo asset principale.",
    why: "A livello avanzato il reclutamento è sistematico, non casuale. Ogni settimana 2 colloqui.",
  },
  {
    id: "av_w2_1", week: 2, day: 1, category: "evento",
    title: "Evento Strutturato (8-15 persone)",
    objective: "Organizzare un evento con presentazione prodotti + opportunità business.",
    actions: [
      "Invita 20 persone — ne verranno 10-15",
      "Struttura: 5 min accoglienza → 15 min storia + prodotti → 10 min opportunità → domande",
      "Coinvolgi il tuo leader o un collaboratore per la parte opportunità",
      "Prepara un'offerta esclusiva evento (bundle o sconto solo quella sera)",
      "Raccogli contatti di TUTTI — anche chi non acquista subito",
    ],
    script: {
      label: "Invito evento strutturato",
      text: "Ciao [Nome]! Organizzo un evento speciale [data] su wellness, beauty e una opportunità interessante con Sorgenta. Ci saranno prodotti da provare, qualche sorpresa e info su come guadagnare con quello che ami. Posti limitati a 15 — ti riservo il posto?",
    },
    channel: "offline", points: 50, week_label: "Settimana 2",
    kpi: "Evento 8+ persone, min 3 ordini",
    tip: "Un evento mensile strutturato genera mediamente 3-5 nuovi clienti e 1-2 collaboratori.",
    why: "L'evento è la tua fabbrica di risultati. Uno al mese cambia la traiettoria del business.",
  },
  {
    id: "av_w3_1", week: 3, day: 1, category: "testimonial",
    title: "Campagna Testimonianze",
    objective: "Raccogliere 3 testimonianze e costruire un mini-archivio da usare nei contenuti.",
    actions: [
      "Scrivi a 5 clienti soddisfatti con il messaggio qui sotto",
      "Accetta qualsiasi formato: testo, vocale, video",
      "Ottieni consenso esplicito prima di pubblicare",
      "Pubblica 1 testimonianza a settimana nei prossimi 3 mesi",
      "Crea una cartella 'Testimonianze' sul telefono per archiviarle",
    ],
    script: {
      label: "Richiesta testimonianza avanzata",
      text: "Ciao [Nome]! Sai che apprezzo molto il tuo feedback. Ti chiedo un favore che mi aiuterebbe tanto: mi mandi 2 righe (o un vocale) su cosa ti ha cambiato l'uso dei prodotti Sorgenta? La tua esperienza autentica può aiutare altre persone a scegliere meglio. Ti mando io il testo da approvare prima di pubblicare 🙏",
    },
    channel: "social", points: 30, week_label: "Settimana 3",
    kpi: "3 testimonianze raccolte",
    tip: "Archivio testimonianze = contenuto inesauribile. 3 al mese e non resterai mai senza materiale.",
    why: "La prova sociale è l'asset di marketing più potente nel network. Ogni testimonianza lavora per te 24/7.",
  },
];

// ─────────────────────────────────────────────────────────────
//  PRO — leadership, sistema, duplicazione
// ─────────────────────────────────────────────────────────────
export const MISSIONS_PRO = [
  {
    id: "pro_w1_1", week: 1, day: 1, category: "leadership",
    title: "Weekly Team Check-in",
    objective: "Fare un check-in strutturato con tutti i collaboratori del proprio team.",
    actions: [
      "Prepara la lista dei tuoi collaboratori con stato settimana corrente",
      "Chiama o messaggeria ogni collaboratore: 'Come va? Quanti contatti questa settimana?'",
      "Identifica chi è bloccato — offri supporto specifico, non generico",
      "Celebra i progressi nel gruppo team — anche le piccole vittorie",
      "Fissa 1 sessione di affiancamento per chi è indietro",
    ],
    script: {
      label: "Check-in settimanale collaboratori",
      text: "Ciao [Nome]! Check-in settimanale 💪 Come va? Quante persone hai contattato questa settimana? Hai avuto presentazioni? C'è qualcosa su cui ti serve supporto o che ti ha bloccato? Sono qui per affiancarti — dimmi tutto.",
    },
    channel: "offline", points: 40, week_label: "Ogni settimana",
    kpi: "Check-in con 100% del team",
    tip: "Il leader pro non aspetta che i collaboratori chiedano aiuto. Va a cercarli proattivamente.",
    why: "La retention del team è il vero moltiplicatore del business. Chi si sente supportato resta.",
  },
  {
    id: "pro_w1_2", week: 1, day: 2, category: "duplicazione",
    title: "Onboarding Nuovo Collaboratore",
    objective: "Affiancare un nuovo collaboratore nei primi 7 giorni critici.",
    actions: [
      "Giorno 1: lista dei 20 insieme — siediti accanto a lui/lei e fatela insieme",
      "Giorno 2: scrivi i primi 3 messaggi INSIEME — non lasciarlo solo",
      "Giorno 3: spiega l'app, i livelli e il sistema di missioni",
      "Giorno 4-5: affiancamento sulla prima presentazione",
      "Giorno 6-7: review e piano per la settimana 2",
    ],
    script: {
      label: "Messaggio di benvenuto nuovo collaboratore",
      text: "Benvenuto/a nel team [Nome]! 🎉 Sono felice di averti a bordo. Nei prossimi 7 giorni ti affiancherò passo per passo — non devi sapere tutto, devi solo fare le azioni che ti indico io. Il tuo unico compito adesso è fidarti del processo. Iniziamo domani con la Lista dei 20 — sei disponibile alle [ora]?",
    },
    channel: "offline", points: 50, week_label: "Ogni nuovo collaboratore",
    kpi: "7 giorni onboarding completati",
    tip: "I primi 7 giorni determinano il 90% del successo a lungo termine di un collaboratore.",
    why: "Duplicare il metodo è la vera leva del Pro. Non vendi tu — insegni agli altri a vendere.",
  },
  {
    id: "pro_w2_1", week: 2, day: 1, category: "sistema",
    title: "Crea il Kit di Avvio del Team",
    objective: "Produrre materiali standard per l'onboarding di ogni nuovo collaboratore.",
    actions: [
      "Scrivi un documento 'Primi 7 giorni' con le azioni giorno per giorno",
      "Raccogli i 5 script più efficaci che hai usato — personalizzali per il team",
      "Crea un mini-FAQ sulle domande più frequenti (prodotti, prezzi, come si ordina)",
      "Prepara un messaggio di benvenuto standard da inviare a ogni nuovo collaboratore",
      "Condividi il kit su Google Drive o WhatsApp del team",
    ],
    script: null,
    channel: "offline", points: 60, week_label: "Settimana 2",
    kpi: "Kit onboarding creato e condiviso",
    tip: "Un sistema duplicabile vale 10× più delle tue capacità personali. Il kit fa crescere il team anche quando non ci sei tu.",
    why: "Il Pro costruisce sistemi. La crescita del team non dipende dalla tua presenza costante.",
  },
  {
    id: "pro_w3_1", week: 3, day: 1, category: "leadership",
    title: "Evento di Team Mensile",
    objective: "Organizzare una riunione motivazionale e formativa per tutto il team.",
    actions: [
      "Prepara agenda: 10 min risultati settimana → 20 min formazione → 15 min Q&A → 5 min motivazione",
      "Celebra pubblicamente le vittorie di ogni collaboratore",
      "Presenta 1 tecnica nuova o un caso studio reale",
      "Raccogli feedback: cosa funziona, cosa no, cosa manca",
      "Chiudi con obiettivi chiari per la settimana successiva",
    ],
    script: {
      label: "Apertura riunione team",
      text: "Benvenuti a tutti! Prima di iniziare voglio celebrare le vittorie di questa settimana perché ogni risultato, grande o piccolo, merita di essere riconosciuto. [Nomina i collaboratori con risultati]. Poi parliamo di cosa possiamo migliorare insieme. Il nostro obiettivo oggi è che ognuno di voi esca con 1 cosa concreta da fare domani.",
    },
    channel: "offline", points: 60, week_label: "Ogni mese",
    kpi: "Riunione team con 80%+ partecipazione",
    tip: "La riunione mensile è il cuore pulsante del team. Saltarla è come tagliare il carburante al motore.",
    why: "Il team che si incontra regolarmente ha tassi di retention e performance 2× superiori.",
  },
];

// Mappa livello → missioni
export const MISSIONS_BY_LEVEL = {
  principiante: MISSIONS_PRINCIPIANTE,
  in_crescita:  MISSIONS_IN_CRESCITA,
  avanzato:     MISSIONS_AVANZATO,
  pro:          MISSIONS_PRO,
};
