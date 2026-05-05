// src/data/missions_fase2_3.js
// ─────────────────────────────────────────────────────────────
//  FASE 2 — Settimane 8-16: Slancio e Sistema
//  FASE 3 — Settimane 17-26: Scalabilità e Leadership
//
//  Ispirate alle linee guida Sorgenta:
//  • Regola 3+2: 3 azioni di Semina + 2 di Coltivazione al giorno
//  • 40 Azioni Online (IG/FB/TikTok)
//  • 40 Azioni Offline (passaparola, eventi, networking)
//  • Onboarding progressivo verso l'autonomia del team
// ─────────────────────────────────────────────────────────────

const M = (id, week, cat, title, obj, actions, script, ch, pts, kpi, tip, why, followup=false, fday=null) => ({
  id, week, category:cat, title, objective:obj, actions, script,
  channel:ch, points:pts, kpi, tip, why, lead_action:followup, followup_day:fday,
});

// ══════════════════════════════════════════════════════════════
//  PRINCIPIANTE — Fase 2 (sett 8-16) + Fase 3 (sett 17-26)
// ══════════════════════════════════════════════════════════════

export const MISSIONS_PRINCIPIANTE_F2 = [

  // ── SETTIMANA 8: Il Sistema 3+2 ───────────────────────────
  M("p_w8_1", 8, "sistema",
    "Adotta la Regola del 3+2",
    "Strutturare ogni giornata con 3 azioni di Semina e 2 di Coltivazione.",
    [
      "La mattina (8-9): esegui 3 azioni di SEMINA — nuove persone, nuovi messaggi, nuovi contenuti social",
      "Il pomeriggio/sera: esegui 2 azioni di COLTIVAZIONE — follow-up su lead esistenti, formazione personale",
      "La domenica sera: pianifica le 5 azioni quotidiane della settimana entrante (15 minuti)",
      "Segna ogni azione completata nell'app — la costanza è misurabile",
      "Obiettivo: 5 azioni al giorno × 5 giorni = 25 azioni settimanali",
    ],
    null, "offline", 20,
    "25 azioni settimanali (3 semina + 2 coltivazione × 5 giorni)",
    "Chi pianifica domenica sera ottiene il 40% di risultati in più durante la settimana.",
    "La Regola del 3+2 trasforma l'entusiasmo in sistema. Il sistema lavora anche quando la motivazione cala."),

  M("p_w8_2", 8, "social",
    "Profilo Business Instagram e TikTok",
    "Trasformare il profilo personale in un profilo professionale ottimizzato.",
    [
      "Passa a profilo 'Business' su Instagram (Impostazioni → Account → Passa a Professional)",
      "Fai lo stesso su TikTok se lo usi",
      "Scrivi una Bio chiara: chi sei, cosa vendi, come ti contattano (max 150 caratteri)",
      "Aggiungi il link WhatsApp o il link bio nella Bio di Instagram",
      "Pubblica un video 'Chi sono' di 30-60 sec e fissalo in alto al profilo",
    ],
    {label: "Script video 'Chi sono'", text: "Ciao! Sono [Nome] e mi occupo di [wellness/beauty/benessere] con Sorgenta. Aiuto le persone a scoprire prodotti naturali di qualità e chi vuole a costruire una fonte di reddito extra. Se sei curioso/a, scrivimi! 👇"},
    "social", 25,
    "Profilo business attivo con Bio ottimizzata e video fisso",
    "Il profilo business ti dà accesso agli insight — sai chi vede i tuoi contenuti e quando.",
    "Il tuo profilo è il tuo biglietto da visita digitale. Vale 30 minuti di lavoro una volta sola."),

  M("p_w8_3", 8, "offline",
    "Biglietti da Visita e Presenza Fisica",
    "Preparare strumenti di contatto fisico e iniziare il networking offline.",
    [
      "Stampa 50-100 biglietti da visita con nome, telefono/WhatsApp e un QR code al tuo profilo social",
      "Porta sempre con te un prodotto Sorgenta da mostrare o far annusare/toccare",
      "Lascia 3 biglietti da visita in luoghi frequentati (parrucchiere, palestra, bar di fiducia)",
      "Parla della tua attività ad almeno 2 persone nuove questa settimana — non per vendere, per far sapere",
      "Inserisci nell'app tutti i nuovi contatti come Lead con canale 'Offline'",
    ],
    null, "offline", 20,
    "50+ biglietti stampati, 3 distribuiti, 2 nuovi contatti offline",
    "Il contatto fisico converte 5-10× più del digitale. Un biglietto da visita ben piazzato vale ore di social.",
    "Il networking offline è il canale più ignorato dai nuovi collaboratori — è il tuo vantaggio competitivo."),

  // ── SETTIMANA 9: Social Avanzato ─────────────────────────
  M("p_w9_1", 9, "social",
    "Segui 20 Potenziali Clienti e Interagisci",
    "Costruire relazioni autentiche con potenziali lead sui social.",
    [
      "Cerca su Instagram persone interessate a wellness, beauty, salute, profumi nella tua zona",
      "Segui 20 profili e interagisci con le loro storie per 3 giorni consecutivi (rispondi, metti like)",
      "Dopo 3 giorni di interazione: invia un DM personalizzato — non generico, cita qualcosa di specifico",
      "Inserisci ognuno come Lead nell'app con canale 'Instagram'",
      "Non inviare link o cataloghi nel primo messaggio — prima crea la relazione",
    ],
    {label: "DM Instagram dopo interazione", text: "Ciao [Nome]! Ho visto che segui [argomento] — io mi occupo proprio di questo con prodotti naturali di qualità. Se sei curiosa/o di saperne di più, scrivimi 😊"},
    "social", 25,
    "20 profili seguiti, 5+ DM inviati dopo interazione",
    "Chi interagisce per 3 giorni prima di scrivere riceve il 60% di risposte in più rispetto a chi scrive subito.",
    "Le relazioni autentiche sui social si costruiscono prima di chiedere. Dai valore prima di proporre."),

  M("p_w9_2", 9, "social",
    "Carosello Educativo su Instagram",
    "Pubblicare un carosello di 5-7 slide che educa e genera interesse.",
    [
      "Scegli un tema: '3 motivi per cui ho cambiato i miei cosmetici', 'Come scelgo gli ingredienti', '5 errori sulla cura della pelle'",
      "Crea le slide con Canva (gratuito) — usa colori del brand Sorgenta",
      "Prima slide: titolo che cattura ('Smetti di sprecare soldi in prodotti che non funzionano')",
      "Ultime slide: call to action chiara ('Scrivi 'INFO' nei commenti per saperne di più')",
      "Rispondi a OGNI commento entro 2 ore — chi commenta è un lead caldo",
    ],
    {label: "Prima slide carosello", text: "3 cose che ho scoperto dopo aver cambiato i miei prodotti di bellezza 👇\n\n(Scorri per scoprirle)"},
    "social", 25,
    "1 carosello pubblicato, commenti gestiti, lead identificati",
    "I caroselli hanno reach organico 3× superiore alle foto singole su Instagram.",
    "Il carosello educa prima di vendere. Chi legge tutto è già a metà strada verso l'acquisto."),

  M("p_w9_3", 9, "offline",
    "Caffè con un Potenziale Partner",
    "Incontrare una persona interessante per una chiacchierata informale.",
    [
      "Scegli una persona della tua lista — non necessariamente un cliente, anche un potenziale collaboratore",
      "Invitala per un caffè senza agenda commerciale: 'Mi piacerebbe sentirti e raccontarti cosa sto facendo'",
      "Parla per il 30% del tempo — ascolta l'80%: cosa fa, cosa cerca, cosa cambierebbe",
      "Se c'è interesse naturale: mostra un prodotto o parla dell'opportunità",
      "Inseriscila nell'app aggiornando lo stato dopo l'incontro",
    ],
    {label: "Invito al caffè", text: "Ciao [Nome]! Ti va di prendere un caffè questa settimana? Volevo raccontarti una cosa interessante su cui sto lavorando — e sentire com'è la tua vita ultimamente 😊"},
    "offline", 30,
    "1 incontro dal vivo completato",
    "Un incontro di persona in 20 minuti vale 20 messaggi WhatsApp. Il contatto umano è insostituibile.",
    "Il caffè non è una presentazione — è una conversazione. Le vendite nascono dalle relazioni."),

  // ── SETTIMANA 10: Contenuto Video ─────────────────────────
  M("p_w10_1", 10, "social",
    "Diretta Live di 10 Minuti",
    "Fare la prima diretta Instagram o TikTok Live.",
    [
      "Scegli un tema semplice: 'Vi mostro la mia routine mattina', 'Rispondo alle vostre domande sui prodotti'",
      "Annuncia la diretta nelle storie 2 ore prima",
      "Inizia anche se c'è solo 1 persona — l'importante è fare pratica",
      "Parla in modo naturale, non leggere da un foglio",
      "Alla fine: 'Se volete saperne di più, scrivetemi in DM!'",
      "Salva la diretta e ripostala come Reel nei giorni successivi",
    ],
    null, "social", 30,
    "1 diretta live completata (min 10 min)",
    "Le dirette vengono notificate a tutti i follower — è il formato con maggior visibilità organica gratuita.",
    "La prima diretta fa paura. La seconda è già diversa. Falla adesso."),

  M("p_w10_2", 10, "social",
    "Risposta Video a un Commento (TikTok)",
    "Usare la funzione 'Risposta Video' di TikTok per creare contenuto.",
    [
      "Cerca un commento interessante su un tuo video (o di qualcun altro nel tuo settore)",
      "Usa la funzione 'Rispondi con video' di TikTok",
      "Rispondi alla domanda in 30-60 secondi in modo genuino",
      "Questo formato viene promosso molto dall'algoritmo TikTok",
      "Alla fine aggiungi una CTA: 'Hai altre domande? Scrivimi!'",
    ],
    null, "social", 20,
    "1 risposta video pubblicata su TikTok",
    "I video risposta su TikTok ricevono il doppio di visualizzazioni dei video normali perché l'algoritmo li promuove come 'conversazioni'.",
    "Trasformare i commenti in contenuto è una delle strategie più intelligenti e rapide per crescere."),

  M("p_w10_3", 10, "referral",
    "Programma Referral Attivo",
    "Chiedere referral in modo sistematico a tutti i clienti soddisfatti.",
    [
      "Fai una lista di tutti i clienti che ti hanno dato feedback positivo",
      "Scrivi ognuno con il messaggio qui sotto",
      "Quando ti danno un nome: chiedi sempre il permesso di menzionarli",
      "Contatta il referral entro 24 ore citando chi te lo ha presentato",
      "Aggiorna l'app: il lead da referral vale doppio — segnalo con nota 'Referral da [nome]'",
    ],
    {label: "Richiesta referral sistematica", text: "Ciao [Nome]! Sono contento/a che i prodotti ti stiano piacendo 😊 Ho una piccola richiesta: se conosci qualcuno che potrebbe apprezzarli, mi presenteresti? Anche solo un nome — il resto lo faccio io, promesso!"},
    "whatsapp", 25,
    "3+ referral richiesti, min 2 nuovi lead da referral",
    "Un lead da referral converte il 5× più di un contatto freddo e ha LTV (valore nel tempo) più alto.",
    "Il referral è il canale più sottovalutato nel NM. Chi lo chiede sistematicamente cresce più veloce di tutti."),

  // ── SETTIMANA 11: Facebook e Community ────────────────────
  M("p_w11_1", 11, "social",
    "Entra in 5 Gruppi Facebook della tua Nicchia",
    "Costruire presenza nei gruppi Facebook frequentati dal tuo target.",
    [
      "Cerca gruppi Facebook su: wellness, bellezza naturale, mamme, sport, donne in carriera (in base al tuo target)",
      "Iscriviti a 5 gruppi attivi (min 1.000 membri, post recenti)",
      "Nei primi 3 giorni: solo commenta e aiuta — nessuna promozione",
      "Dal 4° giorno: posta un contenuto di valore genuino (non pubblicità!)",
      "Chi interagisce positivamente: mandagli un DM personale",
    ],
    {label: "Primo commento utile nel gruppo", text: "Ho letto la tua domanda su [argomento] — posso dirti la mia esperienza? Ho trovato che [consiglio genuino basato sulla tua esperienza]. Se vuoi approfondire scrivimi in privato 😊"},
    "social", 20,
    "5 gruppi uniti, 10 commenti utili lasciati, 3 DM inviati",
    "Nei gruppi Facebook vinci dando valore prima. Chi fa pubblicità immediata viene ignorato o bannato.",
    "I gruppi Facebook sono il posto dove le persone chiedono consigli. Tu sei lì per darli — con autenticità."),

  M("p_w11_2", 11, "social",
    "Prima e Dopo / Trasformazione",
    "Creare un contenuto 'Prima e Dopo' autentico.",
    [
      "Pensa a un risultato reale che hai ottenuto con un prodotto Sorgenta",
      "Scatta una foto o registra un video 'prima' (può essere un vecchio prodotto che usavi)",
      "Scatta la versione 'dopo' con il prodotto Sorgenta in uso",
      "Pubblica su Instagram, Facebook e TikTok — formati diversi per ogni piattaforma",
      "Aggiungi sempre il disclaimer: 'Risultati personali, possono variare'",
    ],
    {label: "Caption prima e dopo", text: "Non pensavo di vedere una differenza così netta... 🤯\n\nSinistra: quello che usavo prima. Destra: dopo [X settimane] con [prodotto].\n\nLa cosa che mi ha sorpreso di più? [risultato specifico]. Se vuoi sapere cosa uso, scrivimi nei commenti 👇"},
    "social", 25,
    "1 contenuto prima/dopo pubblicato su 2+ piattaforme",
    "I contenuti trasformativi generano il 3× di engagement rispetto ai post standard.",
    "Le persone comprano risultati, non prodotti. Mostrare il cambiamento è la forma di marketing più potente."),

  M("p_w11_3", 11, "offline",
    "Partecipa a un Evento Locale",
    "Fare networking in un contesto offline non lavorativo.",
    [
      "Cerca eventi gratuiti nella tua zona: mercatini, fiere, corsi, eventi sportivi, inaugurazioni",
      "Vai con l'obiettivo di conoscere 3 persone nuove — non di vendere",
      "Porta i tuoi biglietti da visita",
      "Nella conversazione: lascia che parlino loro, poi presenta cosa fai in modo naturale",
      "Entro 24 ore: aggiungi i nuovi contatti su LinkedIn/Instagram e mandali nell'app come Lead",
    ],
    null, "offline", 20,
    "1 evento frequentato, 3 nuovi lead offline inseriti",
    "Il networking offline ha un tasso di conversione 5× superiore al digitale per i primi 30 contatti.",
    "Le persone che incontri nella vita reale hanno già una connessione emotiva con te. È il vantaggio che il digitale non può replicare."),

  // ── SETTIMANA 12: Consolidamento e Ottimizzazione ─────────
  M("p_w12_1", 12, "sistema",
    "Analisi dei Risultati — Cosa Funziona?",
    "Fare un audit di 90 giorni per capire cosa ha portato i migliori risultati.",
    [
      "Apri la sezione Contatti — quanti lead hai? Da quale canale vengono i migliori?",
      "Calcola il tuo tasso di conversione: lead contattati ÷ clienti ottenuti",
      "Identifica il canale che ha funzionato di più (WhatsApp? Instagram? Offline? Referral?)",
      "Identifica le 3 azioni più efficaci che hai fatto nelle ultime 12 settimane",
      "Per le prossime 4 settimane: raddoppia su ciò che funziona, riduci ciò che non funziona",
    ],
    null, "offline", 30,
    "Audit completato, canale principale identificato, piano settimane 13-16",
    "Chi misura cresce più veloce di chi lavora solo 'a intuito'. 30 minuti di analisi valgono 2 settimane di lavoro.",
    "Non ottimizzare ciò che non misuri. Questo audit ti dice dove mettere l'energia nelle prossime settimane."),

  M("p_w12_2", 12, "social",
    "Rubrica Fissa Settimanale",
    "Lanciare un appuntamento fisso sui social (es. 'Il consiglio del martedì').",
    [
      "Scegli un giorno fisso e un tema ricorrente: 'Il mio prodotto della settimana', 'Consiglio beauty del martedì', 'La mia routine di...'",
      "Crea un template grafico fisso su Canva (stessi colori, stesso logo) per essere riconoscibile",
      "Annuncia la rubrica nelle storie e chiedi ai follower di attivare le notifiche",
      "Mantienila per almeno 6 settimane consecutive — la costanza crea abitudine",
      "Ogni puntata: finisci con una domanda o CTA per generare commenti",
    ],
    null, "social", 25,
    "Rubrica lanciata, template creato, prima puntata pubblicata",
    "Le rubriche fisse aumentano i follower fedeli del 40%. Le persone tornano per l'appuntamento.",
    "La costanza batte la perfezione. Una rubrica mediocre pubblicata ogni settimana vale più di un contenuto perfetto ogni mese."),

  M("p_w12_3", 12, "collaboratori",
    "Prima Presentazione dell'Opportunità in Gruppo",
    "Organizzare una piccola presentazione per 3-5 persone interessate all'opportunità.",
    [
      "Invita 3-5 persone che hanno mostrato interesse per l'opportunità di business",
      "Formato: aperitivo a casa tua o call Zoom di 45 minuti",
      "Struttura: 10 min tua storia → 15 min come funziona → 10 min risultati → 10 min domande",
      "Coinvolgi il tuo leader upline come 'esperto' nella call",
      "Al termine: chi è interessato a procedere? Raccogli le risposte una per una",
    ],
    {label: "Invito presentazione gruppo", text: "Ciao [Nome]! Ho organizzato una serata informale (/ call) con poche persone per raccontare cosa sto facendo con Sorgenta. Nessun impegno — solo curiosità. Hai un'ora [data/ora]?"},
    "offline", 40,
    "1 presentazione di gruppo completata con 3+ persone",
    "Presentare a un gruppo di 5 persone richiede lo stesso tempo che presentare a 1, ma il risultato è 5× migliore.",
    "La presentazione di gruppo crea anche dinamica sociale — le persone si influenzano a vicenda positivamente."),

  // ── SETTIMANE 13-16: Crescita Sistematica ─────────────────
  M("p_w13_1", 13, "social",
    "Hashtag Strategy e Geolocalizzazione",
    "Usare hashtag specifici e geolocalizzazione per aumentare la visibilità locale.",
    [
      "Usa 3-5 hashtag specifici per post (non generici come #beauty): #beautynaturale #wellnessitalia #[tuacittà]beauty",
      "Aggiungi sempre la geolocalizzazione nei post e nelle storie — sei un business locale",
      "Cerca i post con i tuoi hashtag e interagisci con chi li usa",
      "Testa hashtag diversi ogni settimana e monitora quale porta più engagement",
      "Crea un hashtag personale del tuo brand (es. #routinebynome)",
    ],
    null, "social", 20,
    "Set di 5 hashtag definito, geolocalizzazione attivata, hashtag personale creato",
    "I post con geolocalizzazione ricevono il 79% in più di engagement nelle ricerche locali.",
    "Essere trovati localmente vale più di avere 10.000 follower lontani. Il cliente ideale è a 10 km da te."),

  M("p_w13_2", 13, "offline",
    "Demo dal Vivo in un Posto Pubblico",
    "Organizzare una mini-dimostrazione prodotto in un luogo frequentato.",
    [
      "Scegli un luogo: mercato locale, evento di quartiere, fiera dell'artigianato, palestra",
      "Prepara un piccolo tavolo o stand con prodotti da toccare e annusare",
      "L'obiettivo non è vendere subito — è raccogliere contatti e creare curiosità",
      "Offri un piccolo campione gratuito in cambio del contatto WhatsApp",
      "Inserisci tutti i contatti nell'app come Lead con canale 'Demo dal vivo'",
    ],
    null, "offline", 35,
    "1 demo dal vivo, min 10 nuovi lead raccolti",
    "Chi tocca e annusa il prodotto dal vivo ha un tasso di acquisto del 60% vs il 5% online.",
    "La demo dal vivo azzera le obiezioni sul prodotto. Chi lo prova in mano ha già fatto metà della decisione."),

  M("p_w14_1", 14, "social",
    "Collaborazione con un Profilo della tua Nicchia",
    "Fare una collaborazione con un account affine per ampliare il pubblico.",
    [
      "Identifica 3 profili Instagram/TikTok con 500-5000 follower nel tuo settore (non competitor diretti)",
      "Contattali con una proposta di scambio: 'Ti menziono nelle mie storie se tu menzioni me'",
      "Oppure: organizzate una diretta insieme su un tema di interesse comune",
      "Assicurati che la collaborazione sia autentica — non deve sembrare pubblicità",
      "Inserisci i nuovi follower che arrivano dalla collaborazione come potenziali lead",
    ],
    {label: "DM proposta collaborazione", text: "Ciao [Nome]! Seguo il tuo profilo da un po' e mi piace molto come parli di [argomento]. Collaboro con Sorgenta per [beneficio] e penso che i nostri pubblici si integrino bene. Ti andrebbe di fare una cosa insieme? 😊"},
    "social", 30,
    "1 collaborazione avviata o completata",
    "Le collaborazioni tra micro-influencer portano in media 50-200 nuovi follower qualificati per parte.",
    "Il pubblico di qualcuno che ti apprezza ti accetta immediatamente. È la forma più efficiente di crescita sui social."),

  M("p_w15_1", 15, "social",
    "Stories: Sondaggi e Quiz Interattivi",
    "Usare le storie interattive per aumentare engagement e identificare lead.",
    [
      "Crea 3 storie con domande interattive: sondaggio, slider, quiz, domanda aperta",
      "Esempi: 'Preferisci creme naturali o convenzionali?', 'Conosci gli ingredienti dei tuoi prodotti?'",
      "Chi risponde attivamente alla tua storia è un lead molto caldo — mandagli un DM personalizzato",
      "Usa i risultati come spunto per nuovi contenuti: 'L'80% di voi ha detto X — ecco perché...'",
      "Ripeti ogni settimana: le storie interattive creano abitudine nel tuo pubblico",
    ],
    null, "social", 20,
    "3 storie interattive pubblicate, DM inviati a chi ha risposto",
    "Le storie con sondaggi hanno il 70% di engagement in più rispetto alle storie passive.",
    "Chi interagisce con le tue storie ti segue davvero. Sono le persone più pronte all'acquisto."),

  M("p_w16_1", 16, "sistema",
    "Revisione del Percorso e Obiettivi Fase 3",
    "Fare il bilancio delle prime 16 settimane e definire gli obiettivi per le prossime 10.",
    [
      "Conta: quanti clienti totali hai? Quanti collaboratori hai reclutato? Quanti lead in pipeline?",
      "Calcola il tuo reddito da Sorgenta nelle ultime 4 settimane",
      "Identifica il tuo profilo più forte: sei meglio online o offline? Clienti o collaboratori?",
      "Scrivi 3 obiettivi concreti per la Fase 3 (settimane 17-26) con numeri e date",
      "Condividi gli obiettivi con il tuo leader — la responsabilità pubblica aumenta i risultati",
    ],
    null, "offline", 30,
    "Bilancio completato, 3 obiettivi Fase 3 scritti e condivisi",
    "Chi scrive gli obiettivi ha il 42% in più di probabilità di raggiungerli rispetto a chi li tiene in testa.",
    "La Fase 3 è diversa dalla 1 e 2: non impari più le basi — costruisci il tuo sistema autonomo."),
];

// ── FASE 3 PRINCIPIANTE (Settimane 17-26) ────────────────────
export const MISSIONS_PRINCIPIANTE_F3 = [

  // ── SETTIMANA 17: Leadership Personale ───────────────────
  M("p_w17_1", 17, "leadership",
    "Diventa il Punto di Riferimento della tua Nicchia",
    "Posizionarti come esperto/a di fiducia nel tuo settore specifico.",
    [
      "Scegli una nicchia specifica (es. beauty per mamme, wellness per sportivi, profumi naturali)",
      "Tutti i tuoi contenuti da ora puntano a quella nicchia — coerenza totale",
      "Crea un 'contenuto pilastro': un post molto dettagliato o un video lungo che risponde alla domanda più frequente della tua nicchia",
      "Salva e condividi il contenuto pilastro ogni mese — è evergreen",
      "Il posizionamento chiaro attira clienti qualificati: smetti di parlare a tutti per parlare a chi conta",
    ],
    null, "social", 35,
    "Nicchia definita, contenuto pilastro creato e pubblicato",
    "Il posizionamento specifico sembra limitante ma porta il doppio di clienti qualificati rispetto al generico.",
    "Non puoi essere tutto per tutti. Essere il miglior riferimento per una nicchia specifica vale 10× di più."),

  M("p_w17_2", 17, "collaboratori",
    "Struttura il tuo Sistema di Reclutamento",
    "Creare un processo ripetibile per trovare e qualificare potenziali collaboratori.",
    [
      "Definisci il profilo del collaboratore ideale per il tuo team (3 caratteristiche essenziali)",
      "Crea una lista di 10 persone che corrispondono a quel profilo",
      "Prepara un 'kit di presentazione' per l'opportunità: 2 slide, 3 messaggi tipo, 1 video breve",
      "Imposta un ritmo fisso: 2 conversazioni sull'opportunità a settimana, ogni settimana",
      "Usa l'app per tracciare ogni potenziale collaboratore con stato aggiornato",
    ],
    null, "offline", 40,
    "Profilo collaboratore definito, kit preparato, 2 conversazioni avviate",
    "Il reclutamento sistematico batte quello casuale 10 a 1. Chi ha un processo fisso recluta ogni mese.",
    "A questo punto della tua carriera, il reclutamento non è un'opzione — è la leva principale della crescita."),

  M("p_w18_1", 18, "social",
    "Crea un Contenuto Virale della tua Esperienza",
    "Raccontare la tua storia di trasformazione in formato ottimizzato per la condivisione.",
    [
      "Scrivi la tua storia in 3 atti: Prima (dove eri), Svolta (cosa ha cambiato), Dopo (dove sei ora)",
      "Pubblicala come post lungo su Facebook, carosello su Instagram e video su TikTok",
      "Sii specifico con i numeri: 'In 4 mesi ho guadagnato X€ extra' o 'In 6 settimane ho X clienti'",
      "Aggiungi una CTA chiara: 'Se vuoi sapere come, scrivimi STORIA nei commenti'",
      "Rispondi a ogni persona che scrive 'STORIA' con un messaggio personalizzato",
    ],
    {label: "Post storia di trasformazione", text: "6 mesi fa non sapevo nemmeno cosa fosse il network marketing. Oggi [risultato concreto].\n\nNon è stato magico. È stato [azione specifica che hai fatto].\n\nSe sei curioso/a di come ho iniziato, scrivi 'STORIA' nei commenti 👇"},
    "social", 40,
    "Storia pubblicata su 3 piattaforme, min 20 interazioni",
    "Le storie personali con numeri specifici generano il 5× di engagement rispetto ai contenuti generici.",
    "La tua storia è l'asset di marketing più potente che hai. Nessuno può copiarla."),

  M("p_w19_1", 19, "sistema",
    "Automatizza i Follow-up con Template Personali",
    "Creare una libreria di template WhatsApp personalizzati per ogni fase del follow-up.",
    [
      "Crea 5 template WhatsApp salvati per le 5 situazioni più comuni: primo contatto, follow-up gg2, follow-up gg5, obiezione prezzo, obiezione tempo",
      "Salva i template su Google Keep, Note o nella sezione Script dell'app",
      "Prima di ogni sessione di follow-up: apri i template e personalizza solo nome e dettaglio specifico",
      "Testa ogni template con almeno 10 persone e monitora i risultati — tieni quello che funziona",
      "Aggiorna i template ogni 30 giorni con ciò che impari",
    ],
    null, "offline", 30,
    "5 template salvati e testati, tasso di risposta monitorato",
    "I template riducono il tempo di follow-up del 60% e aumentano la consistenza del messaggio.",
    "Il follow-up sistematico con template ottimizzati è la differenza tra chi cresce e chi è sempre al punto di partenza."),

  M("p_w20_1", 20, "evento",
    "Evento Mensile del Team — Prima Edizione",
    "Organizzare il primo evento mensile ricorrente per team e prospect.",
    [
      "Formato: aperitivo o call di 60 min con parte prodotti + parte opportunità",
      "Invita sia clienti che potenziali collaboratori — la mescola è efficace",
      "Prepara un'agenda: 15 min accoglienza/prodotti → 20 min opportunità → 15 min testimonianze → 10 min Q&A",
      "Registra l'evento e usa il video per futuri contenuti social",
      "Fissa già la data del prossimo evento durante questo — crea l'abitudine",
    ],
    {label: "Invito evento mensile", text: "Ciao [Nome]! Questo mese organizzo un piccolo evento speciale con alcune persone interessanti su [tema]. Ci sarà modo di scoprire i prodotti Sorgenta e capire come funziona il business. Hai un'ora [data/ora]? 😊"},
    "offline", 50,
    "1 evento con min 8 persone, data prossimo evento fissata",
    "Chi organizza un evento mensile ha un tasso di crescita del team 3× superiore a chi non lo fa.",
    "L'evento mensile diventa il cuore del tuo sistema. Crea aspettativa, comunità e conversioni."),

  M("p_w21_1", 21, "leadership",
    "Mentor del tuo Team — Check-in Settimanale",
    "Istituire un check-in settimanale fisso con i propri collaboratori.",
    [
      "Ogni lunedì mattina: manda un messaggio di check-in a tutti i tuoi collaboratori",
      "Ogni venerdì: celebra pubblicamente nel gruppo team le vittorie della settimana",
      "Una volta al mese: sessione 1:1 di 30 minuti con ogni collaboratore",
      "Tieni traccia dei progressi di ognuno — usa la tab Team nell'app",
      "Il tuo obiettivo: che ognuno del tuo team faccia almeno 1 cliente a settimana",
    ],
    {label: "Messaggio check-in lunedì", text: "Buon lunedì team! 💪 Nuova settimana, nuove opportunità. Ricordate la Regola del 3+2: 3 azioni di Semina + 2 di Coltivazione oggi. Chi mi dice cosa farà oggi come prima azione?"},
    "offline", 40,
    "Check-in settimanale istituzionalizzato, 1:1 mensile avviato",
    "I team con check-in settimanale hanno retention del 70% vs il 30% di chi non li fa.",
    "Come leader sei responsabile dei risultati del tuo team, non solo dei tuoi. Il check-in è il tuo strumento principale."),

  M("p_w22_1", 22, "sistema",
    "Crea il tuo Brand Personale Online",
    "Unificare la presenza online sotto un brand personale riconoscibile.",
    [
      "Scegli un nome/soprannome professionale coerente su tutti i canali (es. 'Maria Beauty Naturale')",
      "Unifica: foto profilo, colori, font e tono di voce su Instagram, Facebook e TikTok",
      "Crea una 'firma' fissa per tutti i post (es. hashtag personale + emoji caratteristica)",
      "Scrivi una Bio aggiornata che includa: chi sei, cosa fai, come ti contattano, risultato promesso",
      "Il brand personale è la tua promessa — mantienila in ogni contenuto",
    ],
    null, "social", 35,
    "Brand personale unificato su tutti i canali attivi",
    "I profili con identità visiva coerente convertono il 35% in più rispetto a quelli disorganizzati.",
    "Il brand personale è ciò che rimane quando non sei online. È la tua reputazione digitale."),

  M("p_w23_1", 23, "social",
    "Piano Editoriale Mensile",
    "Pianificare un mese di contenuti social in anticipo.",
    [
      "Usa un foglio Google o Notion per pianificare 20 contenuti in anticipo (4-5 a settimana)",
      "Mix consigliato: 40% educativo, 30% personale/lifestyle, 20% prodotti, 10% testimonianze",
      "Prepara i contenuti della settimana ogni domenica sera in 45 minuti",
      "Usa Canva per creare template riutilizzabili — risparmi il 70% del tempo",
      "Programma i post con Meta Business Suite (gratuito) per non dipendere dalla memoria",
    ],
    null, "offline", 35,
    "Piano editoriale di 1 mese creato, prima settimana programmata",
    "Chi pianifica i contenuti in anticipo pubblica il 3× più regolarmente di chi improvvisa.",
    "La costanza è l'unica strategia che funziona nel lungo periodo. Il piano editoriale la rende automatica."),

  M("p_w24_1", 24, "collaboratori",
    "Duplicazione: Insegna a Insegnare",
    "Formare i propri collaboratori a loro volta leader del loro team.",
    [
      "Identifica il collaboratore più avanzato del tuo team",
      "Lavora con lui/lei per 2 settimane come 'apprendistato leadership'",
      "Insegnagli esattamente come fai i tuoi check-in, come gestisci le obiezioni, come presenti l'opportunità",
      "Dopo 2 settimane: lascia che conduca autonomamente una sessione mentre tu osservi",
      "La duplicazione è la vera prova che il tuo sistema funziona",
    ],
    null, "offline", 60,
    "1 collaboratore formato come futuro leader",
    "La duplicazione moltiplica la tua capacità di guadagno senza moltiplicare il tuo tempo.",
    "Non sei davvero un leader finché non hai formato qualcuno che può fare quello che fai tu. Questa è la settimana in cui lo fai."),

  M("p_w25_1", 25, "sistema",
    "Costruisci il tuo Ufficio Virtuale",
    "Organizzare uno spazio digitale per gestire team, clienti e comunicazioni.",
    [
      "Crea un gruppo WhatsApp del team con regole chiare: solo contenuti utili, nessuno spam",
      "Crea una cartella Google Drive condivisa con: script migliori, kit di presentazione, FAQ, testimonianze",
      "Imposta un calendario Google con: eventi mensili, check-in settimanali, scadenze Sorgenta",
      "Crea un canale Telegram o Broadcast WhatsApp per aggiornare i clienti su novità e promozioni",
      "Il tuo ufficio virtuale funziona 24/7 — anche quando non sei disponibile",
    ],
    null, "offline", 50,
    "Ufficio virtuale operativo (gruppo team + Drive + calendario)",
    "Un ufficio virtuale organizzato riduce il tempo di gestione del team del 50%.",
    "Il professionista del NM moderno ha un sistema digitale che lavora per lui. Questo è il passo che separa il dilettante dal professionista."),

  M("p_w26_1", 26, "sistema",
    "Celebrazione dei 6 Mesi — Piano Anno 2",
    "Fare il bilancio completo dei primi 6 mesi e pianificare il secondo anno.",
    [
      "Conta: clienti attivi, collaboratori nel team, reddito mensile da Sorgenta, missioni completate",
      "Celebra: organizza una piccola celebrazione con il tuo team (online o dal vivo)",
      "Analizza: cosa hai imparato di più? Quale canale ha funzionato meglio? Chi è il tuo collaboratore più promettente?",
      "Pianifica: scrivi 5 obiettivi per i prossimi 6 mesi con numeri e date precise",
      "Condividi: pubblica il tuo bilancio sui social — ispira chi inizia. La tua storia è il miglior strumento di reclutamento",
    ],
    {label: "Post celebrazione 6 mesi", text: "6 mesi fa ho iniziato questo percorso con Sorgenta. Oggi posso dire che [risultato concreto].\n\nNon è stato sempre facile, ma è stato ogni volta che ho scelto di farlo lo stesso. Il prossimo obiettivo? [obiettivo prossimi 6 mesi].\n\nGrazie a chi mi ha supportato in questo percorso 🙏"},
    "social", 100,
    "Bilancio 6 mesi completato, post celebrazione pubblicato, piano anno 2 scritto",
    "Chi celebra i traguardi intermedi ha il 2× di probabilità di continuare rispetto a chi non li riconosce.",
    "I 6 mesi sono il traguardo che separa chi prova da chi costruisce. Sei arrivato/a fin qui — il prossimo anno sarà diverso."),
];

// ══════════════════════════════════════════════════════════════
//  IN CRESCITA — Fasi 2 e 3 (settimane 8-26)
//  Eredita Principiante + missioni con volume/obiettivi più alti
// ══════════════════════════════════════════════════════════════

export const MISSIONS_IN_CRESCITA_F2 = [
  // Usa le stesse missioni del Principiante con KPI aumentati
  ...MISSIONS_PRINCIPIANTE_F2.map(m => ({
    ...m,
    id: "ic_" + m.id,
    // Aumenta il volume richiesto per le missioni di contatto
    ...(m.category === "contatto_caldo" ? { kpi: m.kpi.replace("3", "5").replace("20", "30") } : {}),
    ...(m.category === "referral" ? { kpi: m.kpi.replace("3+", "5+").replace("min 2", "min 4") } : {}),
  })),
  // Missioni aggiuntive specifiche per In Crescita
  M("ic_w8_extra", 8, "social",
    "Crea un Profilo TikTok Business e Pubblica Ogni Giorno per 7 Giorni",
    "Testare la costanza su TikTok con una sfida personale di 7 giorni.",
    [
      "Crea o ottimizza il profilo TikTok Business",
      "Per 7 giorni consecutivi: pubblica 1 video al giorno (anche di 15 secondi)",
      "I video non devono essere perfetti — devono essere costanti",
      "Dopo 7 giorni: analizza quale video ha performato meglio e perché",
      "Raddoppia sul formato vincente nelle settimane successive",
    ],
    null, "social", 40,
    "7 video pubblicati in 7 giorni consecutivi",
    "L'algoritmo TikTok premia chi pubblica con costanza. 7 giorni consecutivi danno uno slancio misurabile.",
    "TikTok è il canale con la crescita organica più rapida. 7 giorni di costanza cambiano la traiettoria."),

  M("ic_w12_extra", 12, "social",
    "Usa Audio Trending su TikTok",
    "Sfruttare i suoni di tendenza per aumentare la visibilità organica.",
    [
      "Apri TikTok → Aggiungi suono → vedi i suoni 'In evidenza' o 'Trending'",
      "Scegli un audio che si adatta al tuo contenuto (non forzare)",
      "Crea un video che usa quell'audio in modo naturale — mostra un prodotto, una routine, un prima/dopo",
      "Pubblica nelle ore di picco del tuo pubblico (controlla gli insight)",
      "Nei commenti: rispondi a tutti nei primi 30 minuti dalla pubblicazione",
    ],
    null, "social", 25,
    "1 video con audio trending pubblicato e monitorato",
    "I video con audio trending su TikTok hanno il 3× di views rispetto agli stessi video con audio originale.",
    "L'algoritmo TikTok amplifica i video con audio trending — è una scorciatoia legittima alla visibilità."),
];

export const MISSIONS_IN_CRESCITA_F3 = [
  ...MISSIONS_PRINCIPIANTE_F3.map(m => ({
    ...m,
    id: "ic_" + m.id,
    points: m.points + 10,
  })),
  M("ic_w20_extra", 20, "collaboratori",
    "Lancia un Programma di Mentoring Strutturato",
    "Creare un programma formale di accompagnamento per i nuovi collaboratori.",
    [
      "Definisci il percorso di onboarding dei nuovi collaboratori: settimana 1, 2, 3, 4",
      "Crea un 'contratto morale' con ogni nuovo collaboratore: impegni reciproci",
      "Sessione giornaliera di 15 minuti per i primi 7 giorni del nuovo collaboratore",
      "Condividi le risorse: script, FAQ, kit di presentazione nella cartella Google Drive del team",
      "Dopo 30 giorni: valutazione formale e piano personalizzato",
    ],
    null, "offline", 60,
    "Programma mentoring scritto e avviato con 1+ collaboratori",
    "I collaboratori con mentoring strutturato hanno il 3× di probabilità di rimanere attivi dopo 90 giorni.",
    "Il mentoring non è una gentilezza — è la strategia che moltiplica il tuo reddito nel tempo."),
];

// ══════════════════════════════════════════════════════════════
//  AVANZATO — Fasi 2 e 3
// ══════════════════════════════════════════════════════════════

export const MISSIONS_AVANZATO_F2 = [
  ...MISSIONS_PRINCIPIANTE_F2.map(m => ({
    ...m,
    id: "av_" + m.id,
    points: m.points + 15,
  })),
  M("av_w9_extra", 9, "sistema",
    "Costruisci una Dashboard di Monitoraggio del Team",
    "Creare un sistema per tracciare le performance di ogni collaboratore in tempo reale.",
    [
      "Crea un foglio Google con: nome collaboratore, settimana attuale, clienti questa settimana, missioni completate, ultimo contatto",
      "Aggiorna il foglio ogni lunedì con i dati della settimana precedente",
      "Identifica automaticamente chi è 'in verde' (obiettivo raggiunto) e chi è 'in rosso' (a rischio)",
      "Condividi il foglio (in sola lettura) con i collaboratori — la trasparenza crea accountability",
      "Usa questi dati nel check-in settimanale per avere conversazioni specifiche, non generiche",
    ],
    null, "offline", 45,
    "Dashboard team creata e aggiornata settimanalmente",
    "I leader che monitorano dati specifici ottengono il 40% di risultati in più dai loro team.",
    "Non puoi migliorare ciò che non misuri. La dashboard trasforma la leadership da istintiva a strategica."),

  M("av_w14_extra", 14, "evento",
    "Organizza un Workshop Formativo per il Team",
    "Condurre una sessione formativa approfondita su un tema specifico.",
    [
      "Scegli un tema: gestione delle obiezioni, tecniche di follow-up, social media per il NM",
      "Prepara una presentazione di 45 minuti con esempi pratici reali del tuo team",
      "Invita tutti i collaboratori — online o dal vivo",
      "Includi una parte pratica: esercitazioni, role-play, feedback in tempo reale",
      "Registra e rendi disponibile la registrazione per chi non può partecipare",
    ],
    null, "offline", 60,
    "1 workshop formativo completato, min 5 partecipanti",
    "I workshop formativi aumentano le competenze del team più velocemente del self-study individuale.",
    "Formare il team è investire in un asset che lavora per te 24/7. Ogni ora di formazione vale 10 ore di coaching individuale."),
];

export const MISSIONS_AVANZATO_F3 = [
  ...MISSIONS_PRINCIPIANTE_F3.map(m => ({
    ...m,
    id: "av_" + m.id,
    points: m.points + 20,
  })),
  M("av_w22_extra", 22, "sistema",
    "Crea un Funnel di Acquisizione Lead Automatizzato",
    "Costruire un sistema semi-automatico per acquisire lead dai social.",
    [
      "Crea una Landing Page semplice con Linktree o Taplink: chi sei, cosa offri, bottone WhatsApp",
      "Metti il link della landing page nella Bio di tutti i tuoi profili social",
      "Ogni settimana: 1 contenuto che porta traffico alla landing page (Reel, post con CTA)",
      "Quando qualcuno clicca e ti scrive: hai già un lead qualificato che ha preso l'iniziativa",
      "Testa e ottimizza: cambia il testo della landing page ogni 30 giorni",
    ],
    null, "social", 70,
    "Landing page creata, link in tutte le bio, 1 contenuto di traffico/settimana",
    "I lead che arrivano da soli (inbound) convertono il 3× più di quelli che hai contattato tu (outbound).",
    "Il funnel semi-automatico lavora anche quando dormi. È il salto qualitativo che distingue il professionista dal dilettante."),
];

// ══════════════════════════════════════════════════════════════
//  PRO — Fasi 2 e 3
// ══════════════════════════════════════════════════════════════

export const MISSIONS_PRO_F2 = [
  ...MISSIONS_PRINCIPIANTE_F2.map(m => ({
    ...m,
    id: "pro_" + m.id,
    points: m.points + 20,
  })),
  M("pro_w8_extra", 8, "leadership",
    "Lancia la Newsletter del Team",
    "Creare una comunicazione periodica per team e prospect.",
    [
      "Usa Mailchimp o Brevo (gratuiti fino a 500 contatti) per creare una newsletter mensile",
      "Contenuto: risultati del team, 1 tattica del mese, testimonianze, prossimi eventi",
      "Invia ai tuoi collaboratori, ai clienti attivi e ai prospect interessati (con consenso)",
      "La newsletter crea presenza nella mente delle persone anche quando non pubblichi sui social",
      "Monitora il tasso di apertura — punta al 25%+ per sapere che il contenuto funziona",
    ],
    null, "offline", 50,
    "Newsletter lanciata, prima edizione inviata a min 20 contatti",
    "Le email hanno un tasso di conversione 40× superiore ai social media per il business B2C.",
    "La newsletter è l'unico canale che non dipende dall'algoritmo. I tuoi contatti sono tuoi — non di Instagram."),

  M("pro_w11_extra", 11, "sistema",
    "Sistema di Onboarding Automatizzato",
    "Creare una sequenza di messaggi automatici per i nuovi collaboratori.",
    [
      "Scrivi una sequenza di 7 messaggi WhatsApp: uno per ogni giorno della prima settimana",
      "Ogni messaggio: obiettivo del giorno + azione specifica + script da usare",
      "Programma i messaggi su WhatsApp Business (funzione Messaggi Programmati)",
      "Dopo la sequenza automatica: inizia il mentoring personalizzato",
      "Aggiorna la sequenza ogni 3 mesi con ciò che hai imparato",
    ],
    null, "offline", 60,
    "Sequenza 7 giorni scritta e programmata per i nuovi collaboratori",
    "L'onboarding automatizzato garantisce che ogni nuovo collaboratore riceva lo stesso livello di supporto.",
    "Il Pro scala moltiplicando i sistemi, non le ore. L'onboarding automatico è il primo passo verso un team che cresce da solo."),
];

export const MISSIONS_PRO_F3 = [
  ...MISSIONS_PRINCIPIANTE_F3.map(m => ({
    ...m,
    id: "pro_" + m.id,
    points: m.points + 25,
  })),
  M("pro_w20_extra", 20, "leadership",
    "Lancia il tuo Evento Annuale di Team",
    "Organizzare un evento significativo per celebrare il team e attrarre nuovi collaboratori.",
    [
      "Formato: serata di gala o evento in location con 30-50+ persone",
      "Invita: tutto il team + i loro migliori prospect + i clienti fedeli",
      "Agenda: celebrazione risultati + riconoscimenti + testimonianze + opportunità per i nuovi",
      "L'evento deve avere un nome — 'Sorgenta Night', 'Gala del Team' — crea identità",
      "Documenta tutto con foto e video — il contenuto dell'evento ti dura 3 mesi di social",
    ],
    {label: "Invito evento annuale", text: "Sei invitato/a all'evento più speciale dell'anno del Team [Nome]! 🌟 Una serata per celebrare i nostri risultati, conoscere storie straordinarie e scoprire le opportunità del prossimo anno. [Data, ora, luogo]. Posti limitati — conferma entro [data]!"},
    "offline", 100,
    "Evento annuale con 30+ persone organizzato",
    "L'evento annuale crea cultura di team, attrae nuovi collaboratori e genera contenuti per mesi.",
    "I migliori team del network marketing hanno una tradizione annuale. Tu stai creando la tua cultura."),

  M("pro_w24_extra", 24, "sistema",
    "Costruisci il tuo Sistema di Business Autonomo",
    "Creare un sistema che funzioni anche senza la tua presenza quotidiana.",
    [
      "Documenta tutti i tuoi processi: come trovi clienti, come onboardi collaboratori, come gestisci il follow-up",
      "Crea video tutorial interni per il team su ogni processo chiave",
      "Delega: ogni processo deve avere un collaboratore responsabile",
      "Testa il sistema: prendi 2 settimane di 'vacanza operativa' — il team continua senza di te?",
      "Il business autonomo è il vero obiettivo finale del NM professionista",
    ],
    null, "offline", 100,
    "Tutti i processi documentati, video tutorial creati, responsabili assegnati",
    "Il business veramente scalabile funziona anche quando il fondatore è assente. È il test definitivo.",
    "Sei arrivato/a alla settimana 24 del percorso Pro. Il tuo obiettivo ora non è lavorare di più — è lavorare meno perché il sistema lavora per te."),
];
