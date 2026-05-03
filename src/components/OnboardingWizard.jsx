// src/components/OnboardingWizard.jsx
// Wizard post-registrazione: 5 domande → AI genera persona → salva su Firestore

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// ── Personas base preimpostate ────────────────────────────────
export const BASE_PERSONAS = {
  mamma_attiva: {
    id: "mamma_attiva",
    icon: "👩‍👧",
    label: "Mamma Attiva",
    desc: "Gestisce famiglia e vuole guadagnare senza lasciare casa. Preferisce WhatsApp e il passaparola tra mamme.",
    strengths: ["Rete di mamme fidata", "Empatia naturale", "Sa ascoltare i bisogni"],
    channels:  ["WhatsApp gruppi famiglia", "Scuola / sport bambini", "Gruppi Facebook mamme"],
    scripts:   ["wellness famiglia", "prodotti sicuri e naturali", "routine mattina"],
    weaknesses:["Poco tempo", "Teme il giudizio delle amiche"],
    strategy:  "Punta sui prodotti per la famiglia e la cura quotidiana. I tuoi migliori lead sono le mamme della scuola e dello sport.",
  },
  professionista: {
    id: "professionista",
    icon: "💼",
    label: "Professionista",
    desc: "Ha già una carriera. Vuole un reddito extra strutturato. Preferisce dati, risultati e professionalità.",
    strengths: ["Credibilità professionale", "Network aziendale", "Comunicazione efficace"],
    channels:  ["LinkedIn", "Network professionale", "Eventi di settore"],
    scripts:   ["opportunità di business", "ROI e risultati concreti", "flessibilità oraria"],
    weaknesses:["Poco tempo", "Diffidenza verso il network marketing"],
    strategy:  "Presenta Sorgenta come un'opportunità di business con dati reali. Il tuo network professionale è il tuo asset più grande.",
  },
  sportivo: {
    id: "sportivo",
    icon: "🏃",
    label: "Sportivo / Health",
    desc: "Appassionato di salute, sport e benessere. Autentico testimonial naturale degli integratori e prodotti wellness.",
    strengths: ["Testimonial credibile", "Community fitness attiva", "Energia e motivazione"],
    channels:  ["Instagram / TikTok", "Palestra e corsi", "Community sport"],
    scripts:   ["performance e recupero", "ingredienti naturali", "risultati visibili"],
    weaknesses:["Difficoltà a parlare di soldi", "Teme di sembrare 'venditore'"],
    strategy:  "Mostra i risultati tuoi e degli altri. Video e storie autentiche in palestra convertono molto. Non parlare di soldi subito.",
  },
  social_influencer: {
    id: "social_influencer",
    icon: "📱",
    label: "Social Creator",
    desc: "Vive sui social, ha un seguito (anche piccolo) e ama condividere. Il contenuto è il suo canale naturale.",
    strengths: ["Visibilità organica", "Abilità di storytelling", "Audience già fidelizzata"],
    channels:  ["Instagram Reels", "TikTok", "YouTube Shorts", "Facebook"],
    scripts:   ["unboxing e first impression", "routine beauty", "before/after"],
    weaknesses:["Instabilità dei risultati", "Dipende dall'algoritmo"],
    strategy:  "Contenuto autentico prima di tutto. 3 storie a settimana + 1 reel. Non vendere mai direttamente — crea curiosità.",
  },
  networker_nato: {
    id: "networker_nato",
    icon: "🤝",
    label: "Networker Nato",
    desc: "Estroverso, conosce tutti, ama stare tra le persone. Il suo punto di forza sono gli eventi e le relazioni dirette.",
    strengths: ["Rete di contatti enorme", "Carisma naturale", "Facilità di approccio"],
    channels:  ["Eventi e aperitivi", "Incontri 1:1", "Passaparola diretto"],
    scripts:   ["invito evento", "chiacchierata informale", "presentazione dal vivo"],
    weaknesses:["Può essere percepito come troppo 'push'", "Difficoltà online"],
    strategy:  "Organizza un mini-evento al mese. Il tuo tasso di conversione dal vivo è 5× quello digitale. Sfruttalo.",
  },
  imprenditore: {
    id: "imprenditore",
    icon: "🚀",
    label: "Imprenditore",
    desc: "Pensa in grande, vuole costruire un team e scalare. Motivato da libertà finanziaria e leadership.",
    strengths: ["Visione strategica", "Capacità di motivare", "Orientato ai risultati"],
    channels:  ["Tutti i canali", "Team building", "Eventi grandi"],
    scripts:   ["opportunità di leadership", "costruire il team", "libertà finanziaria"],
    weaknesses:["Può bruciare le tappe", "Difficoltà con i dettagli operativi"],
    strategy:  "Il tuo obiettivo è reclutare e formare altri leader. Concentrati sulla qualità del team, non solo sui numeri.",
  },
};

// ── Domande onboarding ────────────────────────────────────────
const QUESTIONS = [
  {
    id: "tempo",
    question: "Quante ore a settimana puoi dedicare a Sorgenta?",
    icon: "⏱",
    options: [
      { value: "1-3",  label: "1-3 ore",  desc: "Piccoli passi, ogni giorno" },
      { value: "4-7",  label: "4-7 ore",  desc: "Qualche ora al giorno" },
      { value: "8-15", label: "8-15 ore", desc: "Impegno serio" },
      { value: "15+",  label: "15+ ore",  desc: "Priorità principale" },
    ],
  },
  {
    id: "obiettivo",
    question: "Qual è il tuo obiettivo principale?",
    icon: "🎯",
    options: [
      { value: "extra",       label: "Reddito extra",        desc: "200-500€ al mese aggiuntivi" },
      { value: "principale",  label: "Reddito principale",   desc: "Sostituire o affiancare il lavoro attuale" },
      { value: "liberta",     label: "Libertà di tempo",     desc: "Lavorare quando voglio, dove voglio" },
      { value: "prodotti",    label: "Solo i prodotti",      desc: "Uso personale + qualche cliente" },
    ],
  },
  {
    id: "personalita",
    question: "Come ti descriveresti meglio?",
    icon: "🧠",
    options: [
      { value: "estroverso",   label: "Estroverso",    desc: "Amo stare con le persone, parlo facilmente" },
      { value: "selettivo",    label: "Selettivo",     desc: "Preferisco relazioni profonde a tanti contatti" },
      { value: "digitale",     label: "Digitale",      desc: "Mi trovo meglio online che di persona" },
      { value: "analitico",    label: "Analitico",     desc: "Voglio dati, risultati e metodo chiaro" },
    ],
  },
  {
    id: "canale",
    question: "Su quale canale ti senti più a tuo agio?",
    icon: "📡",
    options: [
      { value: "whatsapp",  label: "WhatsApp",        desc: "Messaggi diretti e gruppi" },
      { value: "social",    label: "Social (IG/FB)",  desc: "Storie, post e reel" },
      { value: "livivo",    label: "Dal vivo",        desc: "Incontri, eventi, passaparola" },
      { value: "tiktok",    label: "TikTok / Video",  desc: "Contenuto video creativo" },
    ],
  },
  {
    id: "paura",
    question: "Qual è la tua paura principale in questo percorso?",
    icon: "💭",
    options: [
      { value: "giudizio",   label: "Il giudizio degli altri",  desc: "Cosa penseranno amici e famiglia" },
      { value: "rifiuto",    label: "Il rifiuto",               desc: "Quando qualcuno dice no" },
      { value: "vendere",    label: "Sembrare un venditore",    desc: "Non voglio essere invadente" },
      { value: "risultati",  label: "Non avere risultati",      desc: "Paura di lavorare per nulla" },
    ],
  },
];

// ── Logica di matching persona ────────────────────────────────
function matchPersona(answers) {
  const scores = Object.fromEntries(Object.keys(BASE_PERSONAS).map(k => [k, 0]));

  // Tempo
  if (answers.tempo === "1-3")  { scores.mamma_attiva += 2; scores.professionista += 1; }
  if (answers.tempo === "4-7")  { scores.sportivo += 1; scores.social_influencer += 1; scores.networker_nato += 1; }
  if (answers.tempo === "8-15") { scores.networker_nato += 2; scores.imprenditore += 1; }
  if (answers.tempo === "15+")  { scores.imprenditore += 3; }

  // Obiettivo
  if (answers.obiettivo === "extra")      { scores.mamma_attiva += 2; scores.professionista += 1; }
  if (answers.obiettivo === "principale") { scores.imprenditore += 2; scores.networker_nato += 1; }
  if (answers.obiettivo === "liberta")    { scores.imprenditore += 2; scores.social_influencer += 1; }
  if (answers.obiettivo === "prodotti")   { scores.sportivo += 2; scores.mamma_attiva += 1; }

  // Personalità
  if (answers.personalita === "estroverso") { scores.networker_nato += 3; scores.imprenditore += 1; }
  if (answers.personalita === "selettivo")  { scores.mamma_attiva += 2; scores.professionista += 1; }
  if (answers.personalita === "digitale")   { scores.social_influencer += 3; }
  if (answers.personalita === "analitico")  { scores.professionista += 3; scores.imprenditore += 1; }

  // Canale
  if (answers.canale === "whatsapp") { scores.mamma_attiva += 2; scores.networker_nato += 1; }
  if (answers.canale === "social")   { scores.social_influencer += 2; scores.sportivo += 1; }
  if (answers.canale === "livivo")   { scores.networker_nato += 3; }
  if (answers.canale === "tiktok")   { scores.social_influencer += 3; }

  // Paura → strategia di supporto
  if (answers.paura === "giudizio") { scores.mamma_attiva += 1; }
  if (answers.paura === "vendere")  { scores.sportivo += 1; scores.social_influencer += 1; }
  if (answers.paura === "rifiuto")  { scores.networker_nato -= 1; }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return BASE_PERSONAS[best];
}

// ── Chiamata AI per personalizzare la persona ─────────────────
async function generateAIPersona(answers, basePersona) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Sei un esperto stratega di network marketing per Sorgenta (prodotti wellness, beauty, profumi, integratori, cura casa).

Un nuovo collaboratore ha risposto a queste domande:
- Ore disponibili/settimana: ${answers.tempo}
- Obiettivo: ${answers.obiettivo}
- Personalità: ${answers.personalita}
- Canale preferito: ${answers.canale}
- Paura principale: ${answers.paura}

La persona base assegnata è: ${basePersona.label} — ${basePersona.desc}

Genera un profilo personalizzato in JSON (solo JSON, nessun testo prima o dopo):
{
  "nickname": "nome creativo per questa persona specifica (es. 'La Mamma Social', 'Il Networker Veloce')",
  "tagline": "frase motivazionale personalizzata di max 12 parole",
  "tip_paura": "consiglio specifico su come superare la paura dichiarata in 2 righe",
  "azione_immediata": "1 azione concreta da fare entro oggi, personalizzata sul canale preferito",
  "messaggio_tipo": "un messaggio WhatsApp di esempio personalizzato su obiettivo e canale (max 3 righe)",
  "forza_nascosta": "una forza che forse non ha ancora riconosciuto in se stesso/a"
}`
        }],
      }),
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

// ── COMPONENTE PRINCIPALE ─────────────────────────────────────
export default function OnboardingWizard({ onComplete }) {
  const { userProfile, updateProfile } = useAuth();
  const { T } = useTheme();
  const [step, setStep]       = useState(0); // 0-4 domande, 5 = loading, 6 = risultato
  const [answers, setAnswers] = useState({});
  const [persona, setPersona] = useState(null);
  const [aiData, setAiData]   = useState(null);
  const [saving, setSaving]   = useState(false);

  const q = QUESTIONS[step];
  const totalSteps = QUESTIONS.length;

  const handleAnswer = async (value) => {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      // Ultima domanda → calcola persona
      setStep(5); // loading
      const base = matchPersona(newAnswers);
      setPersona(base);
      const ai = await generateAIPersona(newAnswers, base);
      setAiData(ai);
      setStep(6); // risultato
    }
  };

  const saveAndContinue = async () => {
    setSaving(true);
    await updateProfile({
      onboardingCompleted: true,
      onboardingAnswers: answers,
      persona: {
        id:       persona.id,
        label:    persona.label,
        nickname: aiData?.nickname || persona.label,
        tagline:  aiData?.tagline  || persona.desc,
      },
      personaFull: { ...persona, aiEnrichment: aiData },
    });
    setSaving(false);
    onComplete();
  };

  // ── Styles helpers ────────────────────────────────────────
  const card = {
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 16, padding: 18, boxShadow: T.shadowCard,
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "32px 20px 40px", fontFamily: "'Playfair Display', Georgia, serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } .anim { animation: fadeIn 0.3s ease; }`}</style>

      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", letterSpacing: 4, textTransform: "uppercase", marginBottom: 6 }}>Benvenuto/a</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: T.text }}>Il tuo profilo</div>
          <div style={{ fontSize: 14, color: T.muted, fontFamily: "'DM Sans'", marginTop: 4 }}>5 domande per personalizzare il tuo percorso</div>
        </div>

        {/* Progress bar */}
        {step < totalSteps && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted }}>Domanda {step + 1} di {totalSteps}</span>
              <span style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.accent, fontWeight: 700 }}>{Math.round(((step) / totalSteps) * 100)}%</span>
            </div>
            <div style={{ background: T.border, borderRadius: 50, height: 6 }}>
              <div style={{ height: 6, borderRadius: 50, background: `linear-gradient(90deg, ${T.accent}, ${T.accentSoft})`, width: `${(step / totalSteps) * 100}%`, transition: "width 0.4s ease" }} />
            </div>
          </div>
        )}

        {/* DOMANDA */}
        {step < totalSteps && (
          <div className="anim" key={step}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{q.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{q.question}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {q.options.map(opt => (
                <div key={opt.value} onClick={() => handleAnswer(opt.value)} style={{ ...card, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.accentBg; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.card; }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted }}>{opt.desc}</div>
                  </div>
                  <div style={{ color: T.muted, fontSize: 18 }}>→</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOADING */}
        {step === 5 && (
          <div className="anim" style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 1s linear infinite" }}>🌿</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>Analizziamo le tue risposte...</div>
            <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted }}>L'AI sta costruendo il tuo profilo personalizzato</div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* RISULTATO */}
        {step === 6 && persona && (
          <div className="anim">
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>{persona.icon}</div>
              <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Il tuo profilo</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: T.text }}>{aiData?.nickname || persona.label}</div>
              <div style={{ fontSize: 14, fontFamily: "'DM Sans'", color: T.muted, marginTop: 6, fontStyle: "italic", lineHeight: 1.5 }}>
                {aiData?.tagline || persona.desc}
              </div>
            </div>

            {/* Forza nascosta */}
            {aiData?.forza_nascosta && (
              <div style={{ ...card, background: T.accentBg, border: `1px solid ${T.accentBorder}`, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>💡 La tua forza nascosta</div>
                <div style={{ fontSize: 14, fontFamily: "'DM Sans'", color: T.textSub, lineHeight: 1.6 }}>{aiData.forza_nascosta}</div>
              </div>
            )}

            {/* Paura → soluzione */}
            {aiData?.tip_paura && (
              <div style={{ ...card, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: T.purple, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🛡 Come superare il tuo blocco</div>
                <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.textSub, lineHeight: 1.6 }}>{aiData.tip_paura}</div>
              </div>
            )}

            {/* Azione immediata */}
            {aiData?.azione_immediata && (
              <div style={{ ...card, background: T.greenBg, border: `1px solid ${T.green}33`, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: T.green, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>⚡ Fai questo oggi</div>
                <div style={{ fontSize: 14, fontFamily: "'DM Sans'", color: T.text, lineHeight: 1.6, fontWeight: 600 }}>{aiData.azione_immediata}</div>
              </div>
            )}

            {/* Canali e punti di forza */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>I tuoi canali migliori</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {persona.channels.map((ch, i) => (
                  <span key={i} style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 600 }}>{ch}</span>
                ))}
              </div>
            </div>

            {/* Messaggio tipo */}
            {aiData?.messaggio_tipo && (
              <div style={{ ...card, borderLeft: `3px solid ${T.accent}`, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>💬 Il tuo primo messaggio tipo</div>
                <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.textSub, lineHeight: 1.7, fontStyle: "italic" }}>"{aiData.messaggio_tipo}"</div>
              </div>
            )}

            <button onClick={saveAndContinue} disabled={saving} style={{ width: "100%", background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "15px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 16, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "all 0.15s" }}>
              {saving ? "Salvataggio..." : "Inizia il percorso →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
