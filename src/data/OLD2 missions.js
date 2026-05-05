// src/data/missions.js — Percorso completo 7 settimane × 4 livelli

export const LEVELS = {
  principiante: { id:"principiante", label:"Principiante", icon:"🌱", color:"#1A7A4A", desc:"Stai muovendo i primi passi. Azioni semplici, risultati concreti.", weeklyTarget:[1,1,2,2,3,3,4] },
  in_crescita:  { id:"in_crescita",  label:"In Crescita",  icon:"🌿", color:"#1A5FA8", desc:"Hai le basi. Ora espandi i canali e il ritmo.", weeklyTarget:[2,2,3,3,4,5,7] },
  avanzato:     { id:"avanzato",     label:"Avanzato",     icon:"🔥", color:"#C05A1A", desc:"Sei operativo. Scala con eventi, referral e team building.", weeklyTarget:[3,4,5,5,6,7,7] },
  pro:          { id:"pro",          label:"Pro",           icon:"⭐", color:"#B8860B", desc:"Guidi e moltiplichi. Il tuo focus è il sistema, non solo le vendite.", weeklyTarget:[4,5,6,7,7,7,7] },
};

// Tempistiche follow-up ottimali basate su dati di conversione NM
export const FOLLOWUP_CYCLE = [
  { day:2,  label:"Giorno 2 — Leggero",       script:"Ciao [Nome]! Volevo assicurarmi che il messaggio fosse arrivato 😊 Hai avuto modo di pensarci?",                                       tone:"leggero, non pressante" },
  { day:5,  label:"Giorno 5 — Valore",         script:"Ciao [Nome]! Ho pensato a te: [testimonianza/risultato specifico]. Pensavo potesse risponderti ad alcune domande. Ti va di sentirci?", tone:"informativo, prova sociale" },
  { day:10, label:"Giorno 10 — Novità",        script:"Ciao [Nome]! Ci tenevo ad aggiornarti: [novità/promozione]. Ho pensato subito a te — senza impegno 😊",                               tone:"propositivo, gancio concreto" },
  { day:21, label:"Giorno 21 — Chiusura",      script:"Ciao [Nome]! Non voglio disturbarti ulteriormente. Rimango disponibile se mai ti interessasse in futuro. Buona settimana! 😊",           tone:"diretto, onesto, rispettoso" },
];

const M = (id, week, cat, title, obj, actions, script, ch, pts, kpi, tip, why, followup=false, fday=null) => ({
  id, week, category:cat, title, objective:obj, actions, script, channel:ch, points:pts, kpi, tip, why, lead_action:followup, followup_day:fday,
});

// ─── PRINCIPIANTE — 7 settimane complete ──────────────────────
export const MISSIONS_PRINCIPIANTE = [

  // SETTIMANA 1: Le Fondamenta
  M("p_w1_1",1,"lista","La Lista dei 20",
    "Scrivere 20 nomi prima di sera. Nessun filtro.",
    ["Apri i contatti del telefono e scorri dalla A alla Z","Scrivi ogni nome su foglio o in Note","Aggiungi anche chi interagisce con te sui social","Non filtrare nessuno — la lista è tua, non la vedranno","Inseriscili nell'app come Lead nella sezione Contatti"],
    null,"offline",10,"20 nomi scritti e inseriti come Lead",
    "Il 90% di chi non ottiene risultati non ha mai fatto questa lista.","Senza lista non c'è business. È il fondamento di tutto."),

  M("p_w1_2",1,"contatto_caldo","I Primi 3 Messaggi",
    "Inviare 3 messaggi personalizzati ai lead della lista.",
    ["Scegli 3 lead dalla lista — persone che conosci bene","Copia il messaggio qui sotto e personalizza nome e beneficio","Invia su WhatsApp — NON aggiungere link o foto prodotto","Aggiorna lo stato da 'Lead' a 'Contattato' nell'app","Segna la data: il follow-up va fatto tra 2 giorni"],
    {label:"Primo messaggio WhatsApp",text:"Ciao [Nome]! 👋 Ho scoperto qualcosa che mi ha davvero sorpreso per [es: la cura della pelle / i profumi / l'energia]. Te ne parlerei in 5 minuti. Quando sei libero/a questa settimana?"},
    "whatsapp",15,"3 messaggi inviati, 3 lead aggiornati a 'Contattato'",
    "Il primo messaggio serve SOLO ad aprire la conversazione. Non vendere nulla adesso.",
    "Iniziare è la parte più difficile. 3 messaggi oggi rompono il ghiaccio per sempre."),

  M("p_w1_3",1,"social","La Prima Storia Autentica",
    "Pubblicare 1 storia su Instagram o Facebook con un prodotto.",
    ["Scegli il prodotto che usi più volentieri","Foto o video di 10-15 sec in modo naturale — non studiato","Aggiungi una frase breve: 'Non pensavo funzionasse così bene 😮'","NON mettere prezzi o link — vuoi curiosità, non pubblicità","Chi risponde alla storia: inseriscilo come Lead nell'app"],
    {label:"Testo storia",text:"Non pensavo mi sarei innamorato/a di [prodotto]. È diventato fisso nella mia giornata 🌿 Se vuoi sapere cos'è, scrivimi!"},
    "social",15,"1 storia pubblicata, lead da risposte inseriti",
    "La storia imperfetta e autentica funziona 3× meglio di quella costruita. Pubblica e basta.",
    "La storia crea visibilità passiva: lavora per te mentre fai altro."),

  M("p_w1_4",1,"followup","Follow-up Giorno 2 — Leggero",
    "Ricontattare i 3 lead a 2 giorni dal primo messaggio.",
    ["Apri Contatti — trova i lead con stato 'Contattato' da 2 giorni","Chi ha risposto: proponi una chiacchierata di 15 minuti","Chi NON ha risposto: invia il messaggio follow-up qui sotto","Aggiorna lo stato: 'Interessato' se ha risposto, 'Follow-up' se silenzio","Chi dice no: aggiorna a 'Non interessato' — rispetta la sua scelta"],
    {label:"Follow-up Giorno 2",text:"Ciao [Nome]! Volevo assicurarmi che il messaggio fosse arrivato 😊 Nessuna fretta — se ti va di saperne di più sono qui!"},
    "whatsapp",15,"3 follow-up fatti, stati aggiornati nell'app",
    "Il follow-up non è pressione. Chi non ha risposto probabilmente era occupato.",
    "L'80% delle conversioni avviene dopo il 2° o 3° contatto.",
    true, 2),

  M("p_w1_5",1,"presentazione","La Prima Mini-Presentazione",
    "Una chiacchierata informale di 15 minuti con 1 lead interessato.",
    ["Scegli il formato: dal vivo, videocall o vocale WhatsApp","Inizia con: 'Cosa cerchi tu per la cura di te stesso/a?'","Mostra massimo 2 prodotti — non tutta la gamma","Ascolta più di quanto parli","Chiudi con: 'Cosa ti ha colpito di più?' — aspetta 24h prima di chiedere se vuole acquistare"],
    {label:"Apertura presentazione",text:"Prima di mostrarti qualsiasi cosa, voglio capire cosa ti serve davvero. Dimmi: cosa è importante per te quando scegli prodotti per [cura personale / casa / benessere]?"},
    "offline",30,"1 presentazione completata",
    "Chi parla di più in una presentazione vende di meno. Fai domande, ascolta, poi mostra.",
    "La prima presentazione sblocca tutto. Dopo la prima, la seconda è già più facile."),

  // SETTIMANA 2: Espansione
  M("p_w2_1",2,"lista","Espandi la Lista: +10 Nuovi Lead",
    "Aggiungere 10 nuovi lead dall'app dalla rete allargata.",
    ["Guarda chi ha visto le tue storie — aggiungi i più attivi come lead","Pensa a chi hai incontrato negli ultimi 2 mesi","Scorri i tuoi follower su Instagram o Facebook","Inserisci ogni nuovo contatto nell'app come 'Lead'","Aggiungi una nota: perché potrebbe essere interessato"],
    null,"offline",10,"+10 nuovi lead inseriti nell'app",
    "La lista non si esaurisce mai. Ogni settimana incontri nuove persone — scrivile subito.",
    "Una lista grande ti dà libertà di scelta e riduce la paura del rifiuto."),

  M("p_w2_2",2,"followup","Follow-up Giorno 5 — Porta Valore",
    "Ricontattare i lead 'Follow-up' con una testimonianza o novità.",
    ["Trova i lead con stato 'Follow-up' da almeno 5 giorni nell'app","Cerca una testimonianza reale o un risultato da condividere","Invia il messaggio qui sotto — NON chiedere ancora di comprare","Aggiorna lo stato e la data dell'ultimo contatto","Se rispondono positivamente: proponi subito una presentazione"],
    {label:"Follow-up Giorno 5 — Testimonianza",text:"Ciao [Nome]! Ho pensato a te perché ho ricevuto un feedback bellissimo: [risultato specifico]. Pensavo potesse risponderti ad alcune domande. Ti va di sentirci 10 minuti?"},
    "whatsapp",15,"Tutti i lead 'Follow-up' da 5+ giorni ricontattati",
    "Le prove sociali abbassano le resistenze. Una testimonianza reale vale più di qualsiasi argomento.",
    "Al giorno 5 il lead è ancora caldo ma inizia a dimenticare. Il valore rinnova l'interesse.",
    true, 5),

  M("p_w2_3",2,"contatto_caldo","3 Nuovi Messaggi dalla Lista Espansa",
    "Contattare 3 nuovi lead aggiunti questa settimana.",
    ["Scegli 3 dei nuovi lead aggiunti a inizio settimana","Personalizza il messaggio per ognuno — cita qualcosa di specifico","Invia su WhatsApp o Instagram DM — varia il canale","Aggiorna lo stato a 'Contattato' nell'app","Segna la data: il prossimo follow-up sarà tra 2 giorni"],
    {label:"Messaggio settimana 2",text:"Ciao [Nome]! So che tieni a [interesse specifico]. Ho trovato qualcosa che mi ha colpito per [beneficio] e pensavo subito a te. Hai 5 minuti questa settimana?"},
    "whatsapp",15,"3 nuovi messaggi inviati, lead aggiornati",
    "Personalizzare con qualcosa di specifico aumenta le risposte del 40%.",
    "Ogni settimana nuovi contatti = pipeline sempre attiva."),

  M("p_w2_4",2,"social","Post Educativo su Facebook",
    "Pubblicare un contenuto che genera curiosità e commenti.",
    ["Scegli un tema: ingredienti naturali, beneficio, tua routine quotidiana","Scrivi 3-4 righe come parli a un amico — nessun tono commerciale","Chiudi con una domanda: 'Voi cosa usate per...?'","Rispondi a TUTTI i commenti entro 2 ore dalla pubblicazione","Chi commenta positivamente: inseriscilo come lead nell'app e mandagli un DM"],
    {label:"Post Facebook educativo",text:"Quante volte hai comprato qualcosa pensando 'questa volta funziona' e poi... niente? 😅\n\nHo capito che la differenza la fanno gli ingredienti. Da quando uso [prodotto] ho notato [risultato personale].\n\nVoi cosa usate e siete soddisfatti? 👇"},
    "social",20,"1 post + risposta a tutti i commenti + lead inseriti",
    "Un post con domanda riceve il 70% in più di commenti. La domanda finale è fondamentale.",
    "Il contenuto educativo costruisce fiducia nel tempo. Ogni post è un seme."),

  // SETTIMANA 3: Accelerazione
  M("p_w3_1",3,"followup","Follow-up Giorno 10 — Novità o Evento",
    "Riattivare i lead fermi da 10 giorni con una novità concreta.",
    ["Trova i lead con ultimo contatto 10+ giorni fa nell'app","Cerca una novità reale: nuovo prodotto, promozione, evento","Invia il messaggio qui sotto — il gancio deve essere concreto","Aggiorna la data dell'ultimo contatto nell'app","Se non rispondono entro 48h: aggiorna stato a 'Follow-up lungo'"],
    {label:"Follow-up Giorno 10 — Novità",text:"Ciao [Nome]! Ci tenevo ad aggiornarti: [novità/promozione/evento]. Ho pensato subito a te. Se vuoi, questa è una buona occasione — senza impegno 😊"},
    "whatsapp",15,"Tutti i lead fermi da 10+ giorni ricontattati",
    "Una novità reale è il miglior gancio per riaprire. Usa solo ciò che esiste davvero.",
    "Al giorno 10 il lead ha bisogno di un motivo nuovo per risponderti.",
    true, 10),

  M("p_w3_2",3,"referral","Il Primo Referral",
    "Ottenere 2 nuovi lead da un cliente soddisfatto.",
    ["Scegli un cliente soddisfatto","Scrivilo con il messaggio qui sotto","Chiedi: 'Posso dirti che mi hai presentato tu?'","Inserisci i nuovi nomi come lead nell'app con nota 'Referral da [nome]'","Contattali entro 24 ore citando chi te li ha presentati"],
    {label:"Richiesta referral",text:"Ciao [Nome]! Sono davvero contento/a che i prodotti ti stiano piacendo 😊 Ti chiedo un favore: c'è qualcuno tra i tuoi amici che potrebbe apprezzarli? Non voglio 'vendergli' nulla — voglio solo farglieli conoscere."},
    "whatsapp",25,"2 nuovi lead da referral inseriti nell'app",
    "Il momento migliore per chiedere un referral è subito dopo un commento positivo.",
    "Un lead da referral converte 5× più di un contatto freddo."),

  M("p_w3_3",3,"collaboratori","Prima Conversazione sull'Opportunità",
    "Presentare l'opportunità a 2 lead ambiziosi.",
    ["Scegli 2 lead ambiziosi con voglia di crescita","NON usare 'vendita' o 'MLM' — parla di 'progetto' o 'opportunità parallela'","Fai questa domanda: 'Se potessi guadagnare X€ extra al mese, ti interesserebbe?'","Se sì: inseriscili come lead 'Opportunità' e fissa un appuntamento","Se no: rispetta — non insistere, cambia argomento"],
    {label:"Apertura opportunità",text:"Ciao [Nome]! Mi viene in mente spesso quando penso a persone con la tua energia. Sto costruendo qualcosa di interessante e cerco persone motivate. Non è un lavoro classico — si fa in parallelo. Ti andrebbe di sentirti 10 minuti?"},
    "whatsapp",20,"2 conversazioni opportunità aperte, lead inseriti",
    "Non cercare chi 'ha tempo'. Cerca chi ha OBIETTIVI.",
    "Il reclutamento inizia qui. Prima si inizia, prima si accelera."),

  // SETTIMANA 4: Consolidamento
  M("p_w4_1",4,"followup","Follow-up Giorno 21 — Chiusura Rispettosa",
    "Chiudere il ciclo sui lead fermi da 21+ giorni.",
    ["Trova i lead con ultimo contatto 21+ giorni fa nell'app","Invia il messaggio onesto qui sotto — nessuna pressione","Se non rispondono entro 72h: aggiorna stato a 'Archiviato (60gg)'","NON insistere oltre: rispetta la persona e il tuo tempo","Segna in calendario: riattiva questi lead tra 60 giorni"],
    {label:"Follow-up Giorno 21 — Chiusura",text:"Ciao [Nome]! Non voglio disturbarti ulteriormente. Rimango disponibile se mai dovesse interessarti in futuro. Senza fretta, senza pressione. Ti auguro una buona settimana! 😊"},
    "whatsapp",15,"Lead 21+ giorni chiusi o archiviati nell'app",
    "Archiviare un lead non significa perderlo: significa rispettarlo. Molti torneranno da soli.",
    "Insistere oltre il giorno 21 danneggia la relazione. La pazienza crea opportunità future.",
    true, 21),

  M("p_w4_2",4,"testimonial","Raccogli la Prima Testimonianza",
    "Ottenere 1 feedback scritto o vocale da un cliente.",
    ["Scrivi a un cliente soddisfatto con il messaggio qui sotto","Accetta qualsiasi formato: testo, vocale, video","Ottieni sempre consenso esplicito prima di pubblicare","Pubblica la testimonianza nelle tue storie","Usala come leva nei prossimi messaggi ai lead"],
    {label:"Richiesta testimonianza",text:"Ciao [Nome]! Mi faresti un piacere enorme? Se hai 2 minuti, mi scrivi (o mandi un vocale) su cosa ti è piaciuto di più dall'aver usato i prodotti? Lo uso per aiutare altri a scegliere meglio 🙏"},
    "social",25,"1 testimonianza raccolta e pubblicata",
    "Una testimonianza autentica vale più di 10 post promozionali.",
    "La prova sociale è lo strumento di marketing più potente nel network."),

  M("p_w4_3",4,"lista","Audit della Pipeline Lead",
    "Rivedere tutti i lead dell'app e definire le prossime azioni.",
    ["Apri Contatti — esamina ogni lead per stato e data","Sposta i lead fermi da 2+ settimane in 'Follow-up lungo'","Identifica i 5 lead più caldi — quelli più vicini alla conversione","Scrivi una nota per ognuno: qual è il prossimo passo specifico","Pianifica le azioni per i prossimi 7 giorni partendo dai 5 caldi"],
    null,"offline",15,"Pipeline aggiornata, 5 lead prioritari identificati",
    "Lavorare sulle priorità batte lavorare sul volume.",
    "Il tuo tempo vale — concentralo dove il ritorno è maggiore."),

  // SETTIMANA 5: Accelerazione Sociale
  M("p_w5_1",5,"social","Reel / TikTok — Prima Volta",
    "Pubblicare 1 video breve e autentico (30-60 sec).",
    ["Filma mentre usi il prodotto — niente scenografie artificiali","Hook iniziale: 'Non mi aspettavo che funzionasse così...'","Mostra il risultato o la reazione — non il packaging","Pubblica tra le 12-13 o le 19-21 per massima visibilità","Chi commenta o mette like: inseriscilo come lead nell'app"],
    {label:"Script video 45 sec",text:"HOOK: 'Vi racconto cosa è successo quando ho provato [prodotto] per la prima volta'\n→ mostra prodotto in uso (15 sec)\n→ 'Dopo [X settimane] ho notato [risultato specifico]'\n→ 'Se volete saperne di più, scrivetemi nei commenti 👇'"},
    "social",20,"1 video pubblicato, lead da commenti inseriti",
    "L'autenticità di una persona reale converte più di qualsiasi produzione professionale.",
    "I video hanno reach 5× superiore alle foto. È il formato che scala più veloce."),

  M("p_w5_2",5,"evento","Mini-Evento Prodotto (3-5 persone)",
    "Organizzare un incontro informale con 3-5 persone.",
    ["Invita 7 persone sapendo che ne verranno 4-5","Prepara i prodotti da toccare, sentire e provare","Conversazione libera — non fare presentazione formale","Alla fine chiedi uno per uno (non tutti insieme): 'Cosa ti ha colpito?'","Inserisci TUTTI i partecipanti come lead nell'app con nota sull'evento"],
    {label:"Invito evento",text:"Ciao [Nome]! [Giorno] sera faccio un piccolo evento a casa mia. Oltre a stare insieme ti faccio scoprire prodotti di beauty e benessere. Nessun obbligo, solo curiosità 😊 Vieni?"},
    "offline",40,"Evento con min 3 partecipanti, tutti inseriti come lead",
    "L'esperienza fisica non ha concorrenti digitali. Chi tocca il prodotto compra molto più spesso.",
    "Gli eventi fisici hanno un tasso di conversione del 40-60%."),

  M("p_w5_3",5,"followup","Follow-up Post-Evento (Giorno 2)",
    "Ricontattare tutti i partecipanti all'evento dopo 2 giorni.",
    ["Apri l'app — trova i lead inseriti dall'evento","Invia un messaggio personalizzato a ognuno entro 48h","Cita qualcosa di specifico della serata — rende il messaggio personale","Proponi un passo concreto: ordine, seconda chiacchierata, o referral","Aggiorna lo stato di ogni lead in base alla risposta"],
    {label:"Follow-up post-evento",text:"Ciao [Nome]! È stato bello vederti l'altra sera 😊 Hai avuto modo di pensare a [prodotto che ti ha colpito]? Se hai domande sono qui — e se vuoi posso prepararti un piccolo kit da provare."},
    "whatsapp",20,"100% dei partecipanti ricontattati entro 48h",
    "Il follow-up post-evento entro 48h triplica il tasso di conversione.",
    "L'entusiasmo dell'evento dura 48-72h. Agisci mentre è ancora vivo.",
    true, 2),

  // SETTIMANA 6: Leadership
  M("p_w6_1",6,"collaboratori","Colloquio 1:1 con Potenziale Collaboratore",
    "Condurre un colloquio di 20 minuti con un lead Opportunità.",
    ["Prepara 3 domande: 'Cosa fai ora?', 'Cosa vorresti cambiare?', 'Quanto tempo hai?'","Ascolta l'80% — parla solo per rispondere","Racconta la TUA storia: perché hai scelto questo percorso","NON fare promesse di guadagno nella prima call","Chiudi con: 'Ti mando materiale. Ci risentiamo tra 3 giorni?'"],
    {label:"Apertura colloquio",text:"Prima di tutto voglio capire la tua situazione. Non ti sto 'reclutando' — voglio capire se quello che faccio ha senso per te. Parlami di te: dove sei ora, dove vorresti essere tra 12 mesi."},
    "offline",35,"1+ colloquio 1:1 completato",
    "Le persone si uniscono alle persone prima che all'azienda. La tua storia personale è il tuo asset.",
    "Il reclutamento sistematico è la chiave per scalare oltre i tuoi clienti diretti."),

  M("p_w6_2",6,"social","5 Storie Consecutive — Campagna Settimana",
    "Pubblicare una storia al giorno per 5 giorni consecutivi.",
    ["Giorno 1: routine di utilizzo del prodotto","Giorno 2: testimonianza di un cliente (con consenso)","Giorno 3: 'dietro le quinte' — come ordini, come funziona","Giorno 4: confronto prima/dopo o ingredienti","Giorno 5: invito esplicito a scrivere per info","Chi risponde o scrive in DM: inseriscilo come lead nell'app"],
    null,"social",25,"5 storie pubblicate in 5 giorni, lead da DM inseriti",
    "La presenza costante per 5 giorni aumenta la visibilità organica del 60%.",
    "La consistenza crea abitudine nel pubblico. Chi ti vede ogni giorno si fida di più."),

  M("p_w6_3",6,"followup","Riattivazione Lead Archiviati (60 giorni)",
    "Ricontattare lead archiviati 60 giorni fa con approccio rinnovato.",
    ["Trova i lead con stato 'Archiviato' da 60+ giorni nell'app","NON riprendere dall'ultima conversazione — riparti da zero","Usa una novità reale come gancio (nuovo prodotto, promozione, risultato)","Massimo 2 tentativi di riattivazione per ogni lead","Se non rispondono: archivio definitivo"],
    {label:"Riattivazione dopo 60 giorni",text:"Ciao [Nome]! Ci siamo persi di vista 😊 Volevo aggiornarti su una novità interessante: [novità specifica]. Ho pensato subito a te. Se ti va di risentirci sono qui — senza impegno!"},
    "whatsapp",20,"Lead 60gg+ ricontattati con approccio nuovo",
    "Dopo 60 giorni la situazione della persona potrebbe essere cambiata completamente.",
    "Il 20% dei lead riattivati dopo 60 giorni converte. Non buttare via contatti preziosi."),

  // SETTIMANA 7: Il Sistema
  M("p_w7_1",7,"sistema","Costruisci la Tua Routine Settimanale",
    "Definire un piano fisso settimanale per mantenere 4+ clienti/sett.",
    ["Blocca nel calendario: 30 min al giorno per messaggi e follow-up","Definisci il giorno fisso per inserire nuovi lead (es. ogni lunedì)","Pianifica 1 storia a settimana minimo sui social","Fissa 1 evento al mese in calendario","Rivedi la pipeline lead ogni venerdì — 15 minuti di audit"],
    null,"offline",30,"Piano settimanale scritto e condiviso col leader",
    "Chi pianifica la settimana domenica ottiene il 40% di risultati in più. La routine batte la motivazione.",
    "A 7 settimane devi avere un SISTEMA, non solo entusiasmo."),

  M("p_w7_2",7,"evento","Evento Grande — 8-12 Persone",
    "Organizzare un evento strutturato con presentazione + opportunità.",
    ["Invita 15 persone — ne verranno 8-12","Struttura: 5' accoglienza → 15' storia+prodotti → 10' opportunità → domande","Coinvolgi il tuo leader per la parte opportunità se possibile","Prepara un'offerta esclusiva solo per quella sera","Inserisci TUTTI i partecipanti come lead nell'app"],
    {label:"Invito evento grande",text:"Ciao [Nome]! Organizzo un evento speciale [data] su wellness, beauty e una opportunità interessante. Prodotti da provare e info su come guadagnare. Posti limitati — ti riservo il posto?"},
    "offline",50,"Evento con 8+ persone, tutti inseriti come lead",
    "Un evento mensile strutturato genera mediamente 3-5 clienti e 1-2 collaboratori.",
    "L'evento è la tua fabbrica di risultati. Uno al mese cambia la traiettoria del business."),

  M("p_w7_3",7,"collaboratori","Primo Onboarding — Accogli un Collaboratore",
    "Affiancare il primo collaboratore nei suoi primi 7 giorni.",
    ["Giorno 1: fai la Lista dei 20 INSIEME a lui/lei","Giorno 2-3: scrivi i primi messaggi insieme — mostragli come","Giorno 4: mostragli l'app e il sistema di follow-up lead","Giorno 5-7: accompagnalo alla sua prima mini-presentazione","Fissa un check-in fisso settimanale di 30 minuti"],
    {label:"Messaggio benvenuto collaboratore",text:"Benvenuto/a nel team [Nome]! 🎉 Nei prossimi 7 giorni ti affianco passo per passo. Non devi sapere tutto — devi solo fare le azioni che ti indico. Iniziamo domani con la Lista dei 20. Sei disponibile alle [ora]?"},
    "offline",50,"7 giorni onboarding completati con 1 collaboratore",
    "I primi 7 giorni determinano il 90% del successo a lungo termine di un collaboratore.",
    "Duplicare il metodo è la vera leva. Non vendi tu — insegni agli altri a vendere."),
];

// ─── IN CRESCITA: eredita Principiante + missioni extra ────────
export const MISSIONS_IN_CRESCITA = [
  ...MISSIONS_PRINCIPIANTE.map(m => ({
    ...m, id: "ic_" + m.id,
    ...(m.category==="contatto_caldo" ? {kpi:m.kpi.replace("3 messaggi","5 messaggi"), points:m.points+5} : {}),
  })),
  M("ic_w2_reel",2,"social","Primo Reel / TikTok",
    "Pubblicare 1 video breve e autentico (30-60 sec).",
    ["Filma 30-60 sec mentre usi il prodotto","Hook: 'Non mi aspettavo che funzionasse così...'","Mostra il risultato — non il packaging","Pubblica tra le 12-13 o 19-21","Chi interagisce: inseriscilo come lead nell'app"],
    {label:"Script reel",text:"HOOK: 'Vi racconto cosa è successo quando ho provato [prodotto]'\n→ mostra uso (15 sec)\n→ 'Dopo [X settimane]: [risultato]'\n→ 'Scrivetemi nei commenti 👇'"},
    "social",20,"1 video pubblicato, lead da commenti inseriti",
    "Non rifare il video se non è perfetto. L'autenticità batte la perfezione.",
    "I video scalano 5× più veloce delle foto."),
  M("ic_w3_linkedin",3,"social","LinkedIn — Outreach Professionale",
    "Contattare 5 connessioni LinkedIn con approccio professionale.",
    ["Cerca connessioni che lavorano in HR, salute, commerciale","Invia richiesta di connessione con nota personalizzata","Dopo accettazione: invia il messaggio qui sotto","Inserisci come lead nell'app con canale 'LinkedIn'","Follow-up dopo 5 giorni se non rispondono"],
    {label:"LinkedIn outreach",text:"Ciao [Nome]! Ho visto il tuo profilo e mi ha colpito il tuo percorso. Collaboro con un'azienda di wellness e cerco persone con la tua esperienza. Ti andrebbe di connetterci per una chiacchierata?"},
    "social",20,"5 outreach LinkedIn inviati, lead inseriti",
    "LinkedIn ha un tasso di risposta 3× superiore a Instagram per i profili professionali.",
    "Il network professionale è un canale spesso ignorato nel NM — è un vantaggio competitivo."),
];

// ─── AVANZATO: eredita + eventi strutturati + duplicazione ─────
export const MISSIONS_AVANZATO = [
  ...MISSIONS_PRINCIPIANTE.map(m => ({ ...m, id: "av_" + m.id })),
  M("av_w1_audit",1,"sistema","Audit della Pipeline — Priorità Caldi",
    "Classificare tutti i lead e definire le 5 priorità della settimana.",
    ["Apri l'app — esamina ogni lead per stato e data","Identifica i 5 lead più caldi — azione entro oggi","Sposta i lead 14+ giorni senza risposta a 'Follow-up lungo'","Archivia chi ha detto no chiaramente","Pianifica le azioni per ognuno dei 5 prioritari"],
    null,"offline",15,"5 lead prioritari identificati e pianificati",
    "Gli avanzati lavorano sulle priorità, non sul volume.","Il tuo tempo vale — concentralo dove il ritorno è maggiore."),
  M("av_w2_evento",2,"evento","Evento Strutturato (8-15 persone)",
    "Organizzare un evento con presentazione prodotti + opportunità.",
    ["Invita 20 persone — ne verranno 10-15","Struttura: accoglienza (5') → storia+prodotti (15') → opportunità (10') → domande","Coinvolgi il tuo leader per la parte opportunità","Prepara un'offerta esclusiva evento","Inserisci TUTTI i partecipanti come lead nell'app"],
    {label:"Invito evento strutturato",text:"Ciao [Nome]! Organizzo un evento speciale [data] su wellness e opportunità. Prodotti da provare e sorprese. Posti limitati — ti riservo il posto?"},
    "offline",50,"Evento 8+ persone, tutti inseriti come lead",
    "Un evento mensile strutturato genera mediamente 3-5 clienti e 1-2 collaboratori.",
    "L'evento è la tua fabbrica di risultati. Pianificalo ogni mese."),
  M("av_w3_testimonial",3,"testimonial","Campagna Testimonianze — 3 in 7 Giorni",
    "Raccogliere 3 testimonianze e pubblicarne 1 a settimana.",
    ["Contatta 5 clienti soddisfatti con il messaggio qui sotto","Accetta testo, vocale o video","Ottieni consenso prima di pubblicare","Crea cartella 'Testimonianze' per archiviarle","Pubblicane 1 subito, le altre nelle prossime 2 settimane"],
    {label:"Richiesta testimonianza avanzata",text:"Ciao [Nome]! La tua esperienza può aiutare tantissime persone. Mi mandi 2 righe (o vocale) su cosa ti ha cambiato l'uso dei prodotti? Ti mando il testo da approvare prima di pubblicare 🙏"},
    "social",30,"3 testimonianze raccolte, 1 pubblicata",
    "Archivio testimonianze = contenuto inesauribile. 3 al mese e non resti mai senza materiale.",
    "La prova sociale è l'asset di marketing più potente nel network. Lavora per te 24/7."),
];

// ─── PRO: leadership, duplicazione, sistema autonomo ──────────
export const MISSIONS_PRO = [
  ...MISSIONS_AVANZATO.map(m => ({ ...m, id: "pro_" + m.id })),
  M("pro_checkin",1,"leadership","Weekly Team Check-in",
    "Check-in strutturato con tutti i collaboratori del team.",
    ["Prepara la lista collaboratori con stato settimana corrente","Chiama o messaggeria ognuno: 'Come va? Quanti lead questa settimana?'","Identifica chi è bloccato — offri supporto specifico","Celebra i progressi nel gruppo team","Fissa 1 sessione affiancamento per chi è indietro"],
    {label:"Check-in settimanale",text:"Ciao [Nome]! Check-in settimanale 💪 Come va? Quante persone hai contattato? C'è qualcosa che ti ha bloccato? Sono qui per affiancarti."},
    "offline",40,"Check-in con 100% del team",
    "Il leader Pro non aspetta che i collaboratori chiedano aiuto. Va a cercarli.",
    "La retention del team è il vero moltiplicatore del business."),
  M("pro_onboarding",1,"duplicazione","Onboarding Nuovo Collaboratore (7 giorni)",
    "Affiancare un nuovo collaboratore nei primi 7 giorni critici.",
    ["Giorno 1: Lista dei 20 insieme — siediti accanto e fatela insieme","Giorno 2: primi 3 messaggi INSIEME — non lasciarlo solo","Giorno 3: spiega l'app, il sistema lead e i follow-up","Giorno 4-5: affiancamento sulla prima presentazione","Giorno 6-7: review e piano per la settimana 2"],
    {label:"Benvenuto collaboratore",text:"Benvenuto/a nel team [Nome]! 🎉 Nei prossimi 7 giorni ti affianco passo per passo. Il tuo unico compito è fidarti del processo. Iniziamo domani con la Lista dei 20 — sei disponibile alle [ora]?"},
    "offline",50,"7 giorni onboarding completati",
    "I primi 7 giorni determinano il 90% del successo a lungo termine.",
    "Duplicare il metodo è la vera leva del Pro."),
  M("pro_kit",2,"sistema","Crea il Kit di Avvio del Team",
    "Produrre materiali standard per l'onboarding di ogni nuovo collaboratore.",
    ["Scrivi un documento 'Primi 7 giorni' con azioni giorno per giorno","Raccogli i 5 script più efficaci — personalizzali per il team","Crea una mini-FAQ sulle domande più frequenti","Prepara il messaggio di benvenuto standard","Condividi il kit nel gruppo WhatsApp del team"],
    null,"offline",60,"Kit onboarding creato e condiviso",
    "Un sistema duplicabile vale 10× più delle tue capacità personali.",
    "Il Pro costruisce sistemi. La crescita non dipende dalla tua presenza costante."),
];

export const MISSIONS_BY_LEVEL = {
  principiante: MISSIONS_PRINCIPIANTE,
  in_crescita:  MISSIONS_IN_CRESCITA,
  avanzato:     MISSIONS_AVANZATO,
  pro:          MISSIONS_PRO,
};
