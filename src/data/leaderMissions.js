// src/data/leaderMissions.js
// Missioni ricorrenti per i Leader
// Cadenze: daily (ogni giorno), weekly (ogni lunedì), monthly (ogni 1° del mese)
// Il completamento si resetta automaticamente in base alla cadenza

// ── Helper: controlla se una missione è già stata completata ─
// confrontando il timestamp di completamento con la finestra temporale corretta
export function isMissionDoneInPeriod(completedAt, cadence) {
  if (!completedAt) return false;
  const done = new Date(completedAt);
  const now  = new Date();

  if (cadence === "daily") {
    // Stesso giorno solare
    return done.toDateString() === now.toDateString();
  }
  if (cadence === "weekly") {
    // Stessa settimana (lunedì → domenica)
    const startOfWeek = (d) => {
      const day = new Date(d);
      const diff = day.getDay() === 0 ? -6 : 1 - day.getDay();
      day.setDate(day.getDate() + diff);
      day.setHours(0, 0, 0, 0);
      return day;
    };
    return startOfWeek(done).getTime() === startOfWeek(now).getTime();
  }
  if (cadence === "monthly") {
    return done.getMonth() === now.getMonth() && done.getFullYear() === now.getFullYear();
  }
  return false;
}

// ── Badge cadenza ─────────────────────────────────────────────
export const CADENCE_CONFIG = {
  daily:   { label: "OGGI",     color: "#C0392B", bg: "rgba(192,57,43,0.10)"  },
  weekly:  { label: "SETTIM.",  color: "#B8860B", bg: "rgba(184,134,11,0.10)" },
  monthly: { label: "MENSILE",  color: "#1A5FA8", bg: "rgba(26,95,168,0.10)"  },
};

// ══════════════════════════════════════════════════════════════
//  MISSIONI GIORNALIERE — si resettano ogni giorno
// ══════════════════════════════════════════════════════════════
export const LEADER_MISSIONS_DAILY = [
  {
    id: "ld_daily_1",
    cadence: "daily",
    icon: "📞",
    title: "Check-in Team Giornaliero",
    objective: "Controlla la situazione del team e contatta chi ha bisogno di supporto.",
    actions: [
      "Apri la tab Team — scorri i collaboratori",
      "Identifica chi è a rischio (barra rossa) o non ha completato missioni da 2+ giorni",
      "Manda un messaggio di check-in a 1-2 persone specifiche — non un messaggio di gruppo generico",
      "Segna la missione come completata dopo aver inviato i messaggi",
    ],
    script: {
      label: "Check-in personalizzato",
      text: "Ciao [Nome]! Come va oggi? Hai avuto modo di fare le tue azioni? Sono qui se hai bisogno di supporto o vuoi confrontarti su qualcosa 💪",
    },
    points: 10,
    tip: "Un check-in personalizzato vale 10× un messaggio di gruppo. Le persone sentono la differenza.",
  },
  {
    id: "ld_daily_2",
    cadence: "daily",
    icon: "🎯",
    title: "Aggiorna la tua Pipeline Personale",
    objective: "Dedicare 15 minuti alla tua pipeline di potenziali collaboratori.",
    actions: [
      "Apri la sezione Rete — controlla i collaboratori di 2° livello",
      "Identifica 1-2 persone da contattare oggi per far crescere la rete",
      "Aggiorna gli stati nella tua pipeline personale",
      "Pianifica l'azione successiva per ogni lead caldo",
    ],
    script: null,
    points: 10,
    tip: "Anche come leader devi coltivare la tua pipeline. Il team cresce solo se tu cresci.",
  },
  {
    id: "ld_daily_3",
    cadence: "daily",
    icon: "💡",
    title: "Condividi un Contenuto di Valore",
    objective: "Pubblicare o condividere qualcosa di utile per il team o la rete.",
    actions: [
      "Scegli tra: un tip pratico, una testimonianza, un risultato del team, un contenuto motivazionale",
      "Pubblica nel gruppo WhatsApp del team OPPURE sui social",
      "Il contenuto deve essere specifico e azionabile — non generico",
      "Tagga o menziona chi ha ottenuto il risultato (se è una vittoria del team)",
    ],
    script: {
      label: "Contenuto motivazionale team",
      text: "💪 Tip del giorno per il team:\n\n[Consiglio pratico basato su cosa hai imparato questa settimana]\n\nChiunque abbia domande o voglia approfondire — scrivimi!",
    },
    points: 15,
    tip: "I leader che condividono contenuti quotidiani hanno team con retention 2× superiore.",
  },
];

// ══════════════════════════════════════════════════════════════
//  MISSIONI SETTIMANALI — si resettano ogni lunedì
// ══════════════════════════════════════════════════════════════
export const LEADER_MISSIONS_WEEKLY = [
  {
    id: "ld_weekly_1",
    cadence: "weekly",
    icon: "🏆",
    title: "Celebra le Vittorie della Settimana",
    objective: "Riconoscere pubblicamente i risultati del team nel gruppo.",
    actions: [
      "Raccogli i risultati della settimana: chi ha trovato clienti, chi ha completato missioni, chi ha reclutato",
      "Scrivi un messaggio nel gruppo team celebrando almeno 2-3 persone per nome",
      "Sii specifico: 'Marco ha trovato 3 clienti questa settimana' è meglio di 'bravi tutti'",
      "Chiedi alle persone celebrate di raccontare come l'hanno fatto — crea apprendimento condiviso",
    ],
    script: {
      label: "Messaggio celebrazione settimanale",
      text: "🏆 Risultati della settimana!\n\n⭐ [Nome1]: [risultato specifico]\n⭐ [Nome2]: [risultato specifico]\n\nOttimo lavoro! Questa settimana abbiamo dimostrato che [messaggio motivazionale].\n\nLa prossima settimana puntiamo a [obiettivo]. Chi è pronto? 💪",
    },
    points: 25,
    tip: "La celebrazione pubblica è il motivatore più potente nel network marketing. Costa 5 minuti e vale ore di coaching.",
  },
  {
    id: "ld_weekly_2",
    cadence: "weekly",
    icon: "📊",
    title: "Report Settimanale del Team",
    objective: "Generare e condividere il report settimanale con i dati del team.",
    actions: [
      "Premi il bottone '📊 Report Settimanale' nella dashboard",
      "Copia il report testuale e invialo al tuo upline (se ce l'hai)",
      "Analizza: chi è migliorato? Chi ha bisogno di supporto urgente?",
      "Definisci le 3 priorità di supporto per la settimana entrante",
    ],
    script: null,
    points: 20,
    tip: "Il report settimanale condiviso con l'upline crea accountability e spesso sblocca supporto aggiuntivo.",
  },
  {
    id: "ld_weekly_3",
    cadence: "weekly",
    icon: "🤝",
    title: "Sessione 1:1 con Collaboratore in Difficoltà",
    objective: "Dedicare 20-30 minuti a un collaboratore che ne ha bisogno.",
    actions: [
      "Identifica il collaboratore più in difficoltà (tab A Rischio nella dashboard)",
      "Contattalo per fissare una call o incontro di 20-30 minuti",
      "Prepara 3 domande specifiche sulla sua situazione attuale",
      "Esci dalla sessione con un piano d'azione scritto per i prossimi 7 giorni",
      "Follow-up dopo 48 ore per verificare che abbia iniziato",
    ],
    script: {
      label: "Proposta sessione 1:1",
      text: "Ciao [Nome]! Ho visto i tuoi dati questa settimana e vorrei dedicarti un po' di tempo per capire come posso aiutarti meglio. Hai 20-30 minuti questa settimana per una call? Nessuna valutazione — solo supporto 😊",
    },
    points: 35,
    tip: "Una sessione 1:1 ben fatta può trasformare un collaboratore a rischio in un top performer nel giro di 2 settimane.",
  },
  {
    id: "ld_weekly_4",
    cadence: "weekly",
    icon: "🔍",
    title: "Identifica 2 Potenziali Nuovi Collaboratori",
    objective: "Mantenere attiva la pipeline di reclutamento personale.",
    actions: [
      "Scorri la tua rete di contatti — chi ha energia, ambizione, voglia di crescita?",
      "Identifica 2 persone da avvicinare questa settimana per l'opportunità",
      "Non presentare subito — prima riconnettiti con una chiacchierata",
      "Inserisci i 2 nomi nell'app come Lead con tipo 'collaboratore'",
    ],
    script: {
      label: "Messaggio di riconnessione",
      text: "Ciao [Nome]! È un po' che non ci sentiamo. Come stai? Sto lavorando a qualcosa di interessante ultimamente e pensavo a te. Ti andrebbe di sentirci per un caffè o una call questa settimana?",
    },
    points: 25,
    tip: "Il leader che smette di reclutare dipende solo dai risultati del team esistente. Mantieni sempre la tua pipeline.",
  },
];

// ══════════════════════════════════════════════════════════════
//  MISSIONI MENSILI — si resettano il 1° di ogni mese
// ══════════════════════════════════════════════════════════════
export const LEADER_MISSIONS_MONTHLY = [
  {
    id: "ld_monthly_1",
    cadence: "monthly",
    icon: "🎓",
    title: "Sessione Formativa per il Team",
    objective: "Organizzare una call o incontro formativo con tutto il team.",
    actions: [
      "Scegli un tema: gestione obiezioni, tecniche social, follow-up efficace, presentazione opportunità",
      "Prepara una presentazione di 30-45 minuti con esempi pratici reali",
      "Fissa data e ora con almeno 10 giorni di anticipo — metti nel calendario",
      "Registra la sessione e condividi la registrazione per chi non può partecipare",
      "Chiudi con 1 azione concreta da fare entro 48 ore",
    ],
    script: {
      label: "Annuncio formazione mensile",
      text: "📚 FORMAZIONE DEL MESE\n\nData: [data]\nOra: [ora]\nTema: [argomento]\n\nQuesto mese approfondiamo [argomento] — un'area dove molti di voi possono fare un salto di qualità.\n\nPresenza fortemente raccomandata. Chi non può: ci sarà la registrazione.\n\nConfermate la partecipazione con 👍",
    },
    points: 50,
    tip: "La formazione mensile è il cuore pulsante del team. Chi la salta perde il momentum collettivo.",
  },
  {
    id: "ld_monthly_2",
    cadence: "monthly",
    icon: "📈",
    title: "Rivaluta i Livelli del Team",
    objective: "Aggiornare il livello di ogni collaboratore in base ai progressi reali.",
    actions: [
      "Apri la dashboard Team — analizza le performance del mese per ogni persona",
      "Identifica chi ha superato il proprio livello attuale e dovrebbe avanzare",
      "Aggiorna il livello direttamente dalla card del collaboratore",
      "Invia un messaggio di congratulazioni a chi avanza di livello",
      "Per chi è rimasto indietro: pianifica un piano di recupero personalizzato",
    ],
    script: {
      label: "Messaggio avanzamento livello",
      text: "🌟 [Nome], ho aggiornato il tuo livello a [nuovo livello]!\n\nI tuoi progressi questo mese sono stati chiari: [risultato specifico]. Ora hai accesso a missioni più avanzate e ti aspettano nuove sfide. Sono orgoglioso/a di come stai crescendo! 💪",
    },
    points: 30,
    tip: "Aggiornare il livello in tempo è importante: il collaboratore deve avere accesso alle missioni giuste per il suo stadio.",
  },
  {
    id: "ld_monthly_3",
    cadence: "monthly",
    icon: "🎉",
    title: "Evento Mensile del Team",
    objective: "Organizzare l'evento mensile per il team e i prospect.",
    actions: [
      "Formato: aperitivo, cena, call di 60 minuti o evento in presenza",
      "Invita team + i migliori prospect di ogni collaboratore",
      "Struttura: 15 min risultati → 20 min opportunità → 15 min testimonianze → 10 min Q&A",
      "Fissa subito la data del mese successivo alla fine dell'evento",
      "Documenta con foto/video — il contenuto dura 3 mesi di social",
    ],
    script: {
      label: "Invito evento mensile",
      text: "🌟 EVENTO DEL MESE\n\nCaro team e amici!\n\nVi invito al nostro evento mensile [data] [ora] [luogo/link].\n\nCelebrazioni, opportunità da scoprire e tante sorprese vi aspettano.\n\nPosti limitati — confermate entro [data] ✅",
    },
    points: 60,
    tip: "L'evento mensile genera in media 3-5 nuovi clienti e 1-2 nuovi collaboratori. È il momento di maggior conversione del mese.",
  },
  {
    id: "ld_monthly_4",
    cadence: "monthly",
    icon: "🔄",
    title: "Analisi e Piano del Mese Successivo",
    objective: "Fare il bilancio del mese e pianificare il prossimo.",
    actions: [
      "Scarica o genera il report CSV del team per avere i dati completi",
      "Analizza: clienti totali, collaboratori attivi, missioni completate, trend vs mese precedente",
      "Identifica il canale più efficace del tuo team questo mese",
      "Scrivi 3 obiettivi specifici per il mese successivo con numeri e date",
      "Condividi il piano con il team — la trasparenza degli obiettivi crea accountability",
    ],
    script: {
      label: "Piano mese successivo",
      text: "📊 BILANCIO [mese] e PIANO [mese successivo]\n\n✅ Risultati raggiunti:\n- [risultato 1]\n- [risultato 2]\n\n🎯 Obiettivi [mese successivo]:\n1. [obiettivo con numero]\n2. [obiettivo con numero]\n3. [obiettivo con numero]\n\nInsieme ce la facciamo! 🚀",
    },
    points: 40,
    tip: "Chi pianifica il mese successivo prima che finisca quello corrente mantiene il momentum. Non aspettare il lunedì.",
  },
];

// ══════════════════════════════════════════════════════════════
//  MISSIONI RECLUTAMENTO — attivabili dal leader (one-way toggle)
//  Queste missioni appaiono solo se leaderMissionsEnabled = true
// ══════════════════════════════════════════════════════════════
export const LEADER_RECRUITMENT_MISSIONS = [
  {
    id: "lr_1",
    week: 1,
    icon: "📋",
    title: "La tua Lista di Potenziali Collaboratori",
    objective: "Creare una lista di 20 persone che potrebbero essere interessate all'opportunità.",
    actions: [
      "Scorri i tuoi contatti: chi ha energia, ambizione, voglia di crescita economica?",
      "Pensa a chi si lamenta spesso del lavoro, vorrebbe più libertà o reddito extra",
      "Scrivi 20 nomi su carta o nel telefono — senza filtrare nessuno",
      "Per ognuno annota: perché potrebbe essere interessato, qual è il suo obiettivo principale",
      "Inserisci i nomi nell'app come Lead con tipo 'collaboratore'",
    ],
    script: null,
    points: 15,
    kpi: "20 potenziali collaboratori identificati e inseriti nell'app",
    tip: "Non decidere tu chi 'è il tipo'. Scrivi tutti e lascia che siano loro a decidere.",
  },
  {
    id: "lr_2",
    week: 1,
    icon: "💬",
    title: "Primi 3 Messaggi per l'Opportunità",
    objective: "Inviare 3 messaggi personalizzati a potenziali collaboratori.",
    actions: [
      "Scegli 3 persone dalla lista che conosci bene",
      "Personalizza il messaggio — cita qualcosa di specifico della loro situazione",
      "NON presentare subito l'opportunità: prima crea curiosità e apri la conversazione",
      "Aggiorna lo stato nell'app a 'Contattato' per ognuno",
      "Segna la data: il follow-up va fatto tra 2 giorni",
    ],
    script: {
      label: "Primo messaggio reclutamento",
      text: "Ciao [Nome]! Come stai? Stavo pensando a te ultimamente perché sto costruendo qualcosa di interessante e la tua energia mi è venuta in mente. Non è il classico lavoro — si fa in parallelo a quello che già fai. Ti andrebbe di sentirti 10 minuti questa settimana?",
    },
    points: 20,
    kpi: "3 messaggi inviati, stati aggiornati nell'app",
    tip: "Il primo messaggio apre la conversazione — non chiude una vendita. Non anticipare troppo.",
  },
  {
    id: "lr_3",
    week: 2,
    icon: "🤝",
    title: "Prima Presentazione dell'Opportunità",
    objective: "Fare una presentazione strutturata di 20 minuti con un potenziale collaboratore.",
    actions: [
      "Scegli il formato: dal vivo, videocall o chiamata",
      "Inizia con domande: 'Cosa fai ora?', 'Cosa cambieresti?', 'Quanto tempo hai?'",
      "Racconta la TUA storia: perché hai scelto questo percorso, cosa ti ha convinto",
      "Mostra i numeri reali senza esagerare — la credibilità vale più delle promesse",
      "Chiudi con: 'Ti mando materiale. Ci risentiamo tra 3 giorni per le tue domande?'",
    ],
    script: {
      label: "Apertura presentazione collaboratore",
      text: "Grazie per aver accettato di sentirti. Prima di mostrarti qualsiasi cosa, voglio capire la tua situazione. Dimmi: dove sei ora nel lavoro, cosa vorresti cambiare, e quanto tempo avresti per qualcosa di parallelo?",
    },
    points: 35,
    kpi: "1 presentazione completata",
    tip: "Ascolta il 70%, parla il 30%. La presentazione che converte è quella dove la persona si sente capita.",
  },
  {
    id: "lr_4",
    week: 2,
    icon: "📱",
    title: "Post sull'Opportunità sui Social",
    objective: "Pubblicare un contenuto autentico che mostri l'opportunità di business.",
    actions: [
      "Racconta la TUA storia: da dove sei partito, cosa stai costruendo, cosa ti ha sorpreso",
      "Sii specifico con i numeri dove possibile — l'autenticità batte la perfezione",
      "Non usare linguaggio da 'venditore': parla come se stessi raccontando a un amico",
      "Concludi con: 'Se sei curioso di saperne di più, scrivimi in DM'",
      "Rispondi a ogni DM entro 2 ore — sono lead caldi",
    ],
    script: {
      label: "Post opportunità social",
      text: "Qualche mese fa ho detto sì a qualcosa che non avevo mai considerato prima.\n\nOggi posso dire che [risultato concreto].\n\nNon è stato magico — è stata una scelta, poi un'altra, poi un'altra ancora.\n\nSe sei curioso di cosa faccio e come potrebbe funzionare anche per te, scrivimi in DM. Parlo volentieri con chi è genuinamente interessato a costruire qualcosa 🤝",
    },
    points: 25,
    kpi: "1 post pubblicato, DM ricevuti gestiti",
    tip: "La storia autentica è il contenuto più potente per il reclutamento. Nessuno può copiarla.",
  },
  {
    id: "lr_5",
    week: 3,
    icon: "🎤",
    title: "Porta un Ospite a un Evento del Team",
    objective: "Invitare un potenziale collaboratore a un evento o call del team come 'ospite'.",
    actions: [
      "Scegli il prospect più caldo dalla tua lista",
      "Invitalo come 'ospite speciale' — non come candidato",
      "Briefing pre-evento: spiegagli cosa vedrà e cosa non deve aspettarsi",
      "Durante l'evento: siediti vicino (o sii in call insieme) — facilita le connessioni",
      "Post-evento entro 24h: 'Cosa ti ha colpito di più?'",
    ],
    script: {
      label: "Invito evento come ospite",
      text: "Ciao [Nome]! La settimana prossima ho un evento con il mio team — si parla di risultati, opportunità e si conosce gente interessante. Ti andrebbe di venire come mio ospite? Nessun impegno, solo per vedere dall'interno.",
    },
    points: 40,
    kpi: "1 ospite portato all'evento",
    tip: "L'evento fa il lavoro al posto tuo. Il tuo ruolo è solo portare la persona — il team e l'atmosfera fanno il resto.",
  },
];

export const ALL_LEADER_MISSIONS = [
  ...LEADER_MISSIONS_DAILY,
  ...LEADER_MISSIONS_WEEKLY,
  ...LEADER_MISSIONS_MONTHLY,
];
