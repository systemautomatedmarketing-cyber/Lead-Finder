// src/components/OnboardingTour.jsx
// Spotlight Product Tour per Lead Finder
// Gestisce 3 percorsi: collaboratore · leader · collaboratore-leader
// Stato persistito su Firestore: userProfile.tourStep + userProfile.tourCompleted

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

// ─────────────────────────────────────────────────────────────
//  DEFINIZIONE STEP PER RUOLO
//  target: id CSS dell'elemento da spotlightare (null = overlay centrato)
//  requiresAction: se true il tour NON avanza con "Avanti" ma aspetta
//                  che l'utente faccia qualcosa (gestito da fuori via onActionDone)
// ─────────────────────────────────────────────────────────────

export const TOUR_STEPS_COLLABORATORE = [
  {
    id: "collab_welcome",
    target: null,
    title: "Benvenuto/a in Lead Finder! 🎉",
    body: "Questo è il tuo sistema di crescita personale per il network marketing. Nei prossimi 26 settimane ti guideremo passo per passo — con missioni concrete, script pronti e un coach digitale sempre con te.\n\nNon è un'app per tracciare. È un sistema per crescere.",
    cta: "Iniziamo →",
    icon: "🚀",
  },
  {
    id: "collab_momentum",
    target: "tour-momentum",
    title: "Il tuo Momentum Score ⚡",
    body: "Questo numero — da 0 a 100 — misura il tuo slancio attuale. Missioni completate, clienti registrati, giorni consecutivi attivi: tutto contribuisce.\n\nNon è un voto. È una bussola. Tienilo sopra 60 e stai crescendo.",
    cta: "Capito →",
    icon: "⚡",
  },
  {
    id: "collab_mission",
    target: "tour-mission-card",
    title: "La Missione del Giorno 🎯",
    body: "Ogni giorno hai una missione prioritaria. Non è una lista infinita — è una cosa concreta, fattibile, con lo script già scritto.\n\nTocca la card per aprirla. Leggi il 'perché', esegui le azioni, segna come completata. Così funziona il sistema.",
    cta: "Ho capito →",
    icon: "🎯",
  },
  {
    id: "collab_contacts",
    target: "tour-contacts-btn",
    title: "I tuoi Contatti e Lead 👥",
    body: "Ogni persona con cui parli va qui. Nome, canale, stato.\n\nL'app ti dice automaticamente quando ricontattarla: giorno 2 (leggero), giorno 5 (valore), giorno 10 (novità), giorno 21 (chiusura).\n\nNon devi ricordarti nulla — ci pensa Lead Finder.",
    cta: "Capito →",
    icon: "👥",
  },
  {
    id: "collab_scripts",
    target: "tour-scripts-tab",
    title: "Script Pronti ✍️",
    body: "Non sai cosa scrivere? Hai script pronti per ogni situazione: primo contatto, follow-up, gestione obiezioni.\n\nCopia, personalizza con il nome, invia. Con il piano Starter hai 3 script base — con il Pro ne hai decine divisi per settimana.",
    cta: "Capito →",
    icon: "✍️",
  },
  {
    id: "collab_first_lead",
    target: "tour-contacts-btn",
    title: "Un'azione sola adesso 🏁",
    body: "Sei pronto/a. C'è una sola cosa da fare adesso: inserisci il tuo primo contatto.\n\nCi vuole 30 secondi. Da quello parte tutto. Ogni grande team è iniziato con un nome scritto su un foglio.",
    cta: "Inserisci il primo lead →",
    icon: "🏁",
    isLast: true,
  },
];

export const TOUR_STEPS_LEADER = [
  {
    id: "leader_welcome",
    target: null,
    title: "Benvenuto/a, Leader! 👑",
    body: "Lead Finder ti dà visibilità completa sul tuo team — senza chiedere report, senza messaggi di gruppo generici.\n\nVedi chi ha bisogno di te, quando e perché. Intervieni nel momento giusto con le parole giuste.",
    cta: "Iniziamo →",
    icon: "👑",
  },
  {
    id: "leader_invite",
    target: "tour-invite-code",
    title: "Il tuo Codice Invito 🔑",
    body: "Questo è il codice che devi condividere. Ogni collaboratore che lo usa in fase di registrazione apparirà automaticamente nel tuo team.\n\nSenza questo codice il team non cresce. È la prima cosa da fare — condividilo oggi.",
    cta: "Copiato, procediamo →",
    icon: "🔑",
  },
  {
    id: "leader_health",
    target: "tour-team-health",
    title: "Salute del Team 💚",
    body: "Questo score da 0 a 100 ti dice in un secondo com'è il tuo team. Sopra 75 stai costruendo qualcosa di solido. Sotto 40 devi intervenire oggi.\n\nSi aggiorna in tempo reale — ogni volta che un collaboratore fa qualcosa.",
    cta: "Capito →",
    icon: "💚",
  },
  {
    id: "leader_alerts",
    target: "tour-alerts",
    title: "Alert Intelligenti + Script 🎯",
    body: "Quando un collaboratore è in difficoltà, lo vedi qui — con lo script WhatsApp già scritto con il suo nome.\n\nUn tap copia il messaggio. Lo incolli su WhatsApp in 10 secondi. Il sistema analizza chi contattare prima — tu esegui.",
    cta: "Ottimo →",
    icon: "🎯",
  },
  {
    id: "leader_missions",
    target: "tour-leader-missions-tab",
    title: "Le tue Missioni 📋",
    body: "Anche tu hai un percorso. Missioni giornaliere, settimanali e mensili ti ricordano le azioni che fanno davvero la differenza: check-in personalizzati, celebrazioni pubbliche, sessioni formative.\n\nI leader che le seguono hanno team con il 70% di retention in più.",
    cta: "Tutto chiaro →",
    icon: "📋",
    isLast: true,
  },
];

// Tour secondario per chi ha il doppio ruolo — appare alla prima visita alla tab Team
export const TOUR_STEPS_DUAL = [
  {
    id: "dual_unlock",
    target: "tour-team-tab",
    title: "Hai sbloccato il tuo Team! 🏆",
    body: "Generando il codice invito hai attivato la funzione leader. Da qui gestisci chi si registra con il tuo codice.\n\nContinui il tuo percorso come collaboratore — e costruisci il tuo team in parallelo. Le due cose si moltiplicano.",
    cta: "Capito →",
    icon: "🏆",
  },
  {
    id: "dual_code",
    target: "tour-invite-code",
    title: "Condividi il Codice 🔑",
    body: "Questo è il codice da mandare a chi vuoi nel tuo team. Chiunque lo usi in fase di registrazione apparirà qui dentro.\n\nPuoi condividerlo via WhatsApp, Instagram, di persona — ovunque.",
    cta: "Condivido subito →",
    icon: "🔑",
  },
  {
    id: "dual_both",
    target: null,
    title: "Sei Collaboratore e Leader 💡",
    body: "Il tuo percorso personale continua nella tab Home — missioni, obiettivi, momentum.\n\nIl tuo team lo gestisci dalla tab Team. Quando uno dei tuoi collaboratori supera 5 missioni, può diventare leader a sua volta.\n\nCosì si costruisce una rete che si duplica da sola.",
    cta: "Partiamo! →",
    icon: "💡",
    isLast: true,
  },
];

// ─────────────────────────────────────────────────────────────
//  HOOK — gestisce la logica del tour
// ─────────────────────────────────────────────────────────────
export function useTour(role, hasBothRoles, dualTourSeen) {
  const { userProfile, updateProfile } = useAuth();

  const tp = userProfile?.tourProgress || {};

  // Quale tour è attivo?
  const activeTour = (() => {
    if (role === "leader") {
      if (!tp.leader_done) return "leader";
      return null;
    }
    // Collaboratore
    if (!tp.collab_done) return "collab";
    // Collaboratore con dual role — tour team mai visto
    if (hasBothRoles && !tp.dual_done) return "dual";
    return null;
  })();

  const steps = activeTour === "leader" ? TOUR_STEPS_LEADER
    : activeTour === "dual"   ? TOUR_STEPS_DUAL
    : activeTour === "collab" ? TOUR_STEPS_COLLABORATORE
    : [];

  // Step corrente: riprende dall'ultimo
  const savedStep = activeTour ? (tp[`${activeTour}_step`] || 0) : 0;
  const [currentStep, setCurrentStep] = useState(savedStep);
  const [visible, setVisible]         = useState(!!activeTour);

  // Salva step su Firestore (debounced)
  const saveStep = useCallback(async (tourKey, step) => {
    await updateProfile({
      tourProgress: {
        ...userProfile?.tourProgress,
        [`${tourKey}_step`]: step,
      },
    });
  }, [userProfile?.tourProgress, updateProfile]);

  const advance = useCallback(async () => {
    const next = currentStep + 1;
    if (next >= steps.length) {
      // Tour completato
      await updateProfile({
        tourProgress: {
          ...userProfile?.tourProgress,
          [`${activeTour}_done`]: true,
          [`${activeTour}_step`]: 0,
        },
      });
      setVisible(false);
    } else {
      setCurrentStep(next);
      await saveStep(activeTour, next);
    }
  }, [currentStep, steps.length, activeTour, userProfile?.tourProgress, updateProfile, saveStep]);

  const skipStep = useCallback(async () => {
    await advance();
  }, [advance]);

  const closeTour = useCallback(async () => {
    // Salva step corrente ma non segna done — ripartiamo da qui
    await saveStep(activeTour, currentStep);
    setVisible(false);
  }, [activeTour, currentStep, saveStep]);

  const completeTour = useCallback(async () => {
    await updateProfile({
      tourProgress: {
        ...userProfile?.tourProgress,
        [`${activeTour}_done`]: true,
        [`${activeTour}_step`]: 0,
      },
    });
    setVisible(false);
  }, [activeTour, userProfile?.tourProgress, updateProfile]);

  // Riapri tour dalle impostazioni
  const restartTour = useCallback(async (tourKey) => {
    await updateProfile({
      tourProgress: {
        ...userProfile?.tourProgress,
        [`${tourKey}_done`]: false,
        [`${tourKey}_step`]: 0,
      },
    });
    setCurrentStep(0);
    setVisible(true);
  }, [userProfile?.tourProgress, updateProfile]);

  return {
    visible,
    activeTour,
    steps,
    currentStep,
    advance,
    skipStep,
    closeTour,
    completeTour,
    restartTour,
  };
}

// ─────────────────────────────────────────────────────────────
//  SPOTLIGHT RENDERER
//  Trova l'elemento DOM tramite id, calcola bounding box, disegna
// ─────────────────────────────────────────────────────────────
function useSpotlight(targetId) {
  const [rect, setRect] = useState(null);
  const raf = useRef(null);

  useEffect(() => {
    if (!targetId) { setRect(null); return; }

    const measure = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
      raf.current = requestAnimationFrame(measure);
    };
    raf.current = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf.current);
  }, [targetId]);

  return rect;
}

// ─────────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPALE
// ─────────────────────────────────────────────────────────────
export default function OnboardingTour({
  role,
  hasBothRoles,
  onTabChange,    // per navigare l'app durante il tour
  onCopyCode,     // per copiare il codice invito dallo step leader
}) {
  const { T } = useTheme();
  const { userProfile, updateProfile } = useAuth();

  const tp          = userProfile?.tourProgress || {};
  const isLeader    = role === "leader";
  const dualDone    = tp.dual_done;

  const {
    visible, activeTour, steps, currentStep,
    advance, skipStep, closeTour, completeTour, restartTour,
  } = useTour(role, hasBothRoles, dualDone);

  const step    = steps[currentStep] || null;
  const spotRect = useSpotlight(visible && step ? step.target : null);

  if (!visible || !step) return null;

  // Padding attorno all'elemento spotlightato
  const PAD    = 10;
  const RADIUS = 14;

  // Posizione tooltip: sotto o sopra l'elemento
  const tooltipBelow = spotRect ? (spotRect.top + spotRect.height + PAD + 260 < window.innerHeight) : true;

  const handleCta = async () => {
    // Azioni speciali per step specifici
    if (step.id === "leader_invite") onCopyCode?.();
    if (step.id === "collab_first_lead") onTabChange?.("contatti");
    if (step.id === "dual_code") onCopyCode?.();

    if (step.isLast) {
      await completeTour();
    } else {
      await advance();
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, pointerEvents: "none" }}>

      {/* ── OVERLAY SCURO CON SPOTLIGHT ─────────────────── */}
      {spotRect ? (
        // SVG con buco ritagliato attorno all'elemento
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "all" }}
          onClick={closeTour}
        >
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={spotRect.left - PAD}
                y={spotRect.top  - PAD}
                width={spotRect.width  + PAD * 2}
                height={spotRect.height + PAD * 2}
                rx={RADIUS}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%" height="100%"
            fill="rgba(0,0,0,0.72)"
            mask="url(#tour-mask)"
          />
          {/* Bordo glow attorno all'elemento */}
          <rect
            x={spotRect.left - PAD}
            y={spotRect.top  - PAD}
            width={spotRect.width  + PAD * 2}
            height={spotRect.height + PAD * 2}
            rx={RADIUS}
            fill="none"
            stroke={T.accent}
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.8"
          />
        </svg>
      ) : (
        // Overlay pieno senza spotlight (step centrati)
        <div
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)", pointerEvents: "all" }}
          onClick={closeTour}
        />
      )}

      {/* ── TOOLTIP ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          pointerEvents: "all",
          ...(spotRect
            ? tooltipBelow
              ? { top: spotRect.top + spotRect.height + PAD + 12, left: Math.max(12, Math.min(spotRect.left, window.innerWidth - 320 - 12)) }
              : { bottom: window.innerHeight - spotRect.top + PAD + 12, left: Math.max(12, Math.min(spotRect.left, window.innerWidth - 320 - 12)) }
            : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
          ),
          width: "min(320px, calc(100vw - 24px))",
          background: T.card,
          border: `1px solid ${T.accentBorder}`,
          borderRadius: 20,
          boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${T.accent}22`,
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Accent bar top */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${T.accent}, ${T.accentSoft || T.accent})` }} />

        <div style={{ padding: "18px 20px 20px" }}>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= currentStep ? T.accent : T.border, transition: "background 0.3s" }} />
            ))}
          </div>

          {/* Icon + Step counter */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              {step.icon}
            </div>
            <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted, fontWeight: 600 }}>
              {currentStep + 1} / {steps.length}
            </div>
          </div>

          {/* Title */}
          <div style={{ fontSize: 17, fontWeight: 900, color: T.text, fontFamily: "'Playfair Display'", lineHeight: 1.25, marginBottom: 10 }}>
            {step.title}
          </div>

          {/* Body */}
          <div style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.75, marginBottom: 18, whiteSpace: "pre-line" }}>
            {step.body}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={handleCta}
              style={{ background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "12px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" }}
            >
              {step.cta}
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              {/* Salta step */}
              {!step.isLast && (
                <button
                  onClick={skipStep}
                  style={{ flex: 1, background: "none", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 50, padding: "9px 0", fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                >
                  Salta →
                </button>
              )}
              {/* Chiudi tour */}
              <button
                onClick={closeTour}
                style={{ flex: 1, background: "none", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 50, padding: "9px 0", fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
              >
                ✕ Chiudi
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── FRECCIA verso l'elemento (se spotRect) ──────── */}
      {spotRect && tooltipBelow && (
        <div style={{
          position: "absolute",
          pointerEvents: "none",
          top: spotRect.top + spotRect.height + PAD + 6,
          left: spotRect.left + spotRect.width / 2 - 8,
          width: 0, height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderBottom: `8px solid ${T.card}`,
        }} />
      )}
      {spotRect && !tooltipBelow && (
        <div style={{
          position: "absolute",
          pointerEvents: "none",
          bottom: window.innerHeight - spotRect.top + PAD + 6,
          left: spotRect.left + spotRect.width / 2 - 8,
          width: 0, height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: `8px solid ${T.card}`,
        }} />
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  BOTTONE "RIPRENDI TOUR" — da mettere nella tab Impostazioni
// ─────────────────────────────────────────────────────────────
export function RestartTourButton({ tourKey, label }) {
  const { T } = useTheme();
  const { userProfile, updateProfile } = useAuth();

  const restart = async () => {
    await updateProfile({
      tourProgress: {
        ...userProfile?.tourProgress,
        [`${tourKey}_done`]: false,
        [`${tourKey}_step`]: 0,
      },
    });
    window.location.reload(); // reload semplice per far ripartire il tour
  };

  return (
    <button
      onClick={restart}
      style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, borderRadius: 50, padding: "10px 20px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%" }}
    >
      🎓 {label || "Rivedi il tour guidato"}
    </button>
  );
}
