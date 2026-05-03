// src/components/CompanySetup.jsx
// Wizard di configurazione azienda per leader (multi-company support)

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { usePlan } from "../context/PlanContext";
import { getSectorList, getSectorById } from "../data/sectors";
import { PaywallModal } from "./PricingScreen";

export default function CompanySetup({ onComplete, isEdit = false }) {
  const { userProfile, updateProfile } = useAuth();
  const { T } = useTheme();
  const { can } = usePlan();

  const existing = userProfile?.company || {};

  const [step, setStep]         = useState(0);
  const [companyName, setCompanyName] = useState(existing.name || "");
  const [sector, setSector]     = useState(existing.sectorId || "");
  const [accentColor, setAccentColor] = useState(existing.accentColor || "#B8860B");
  const [website, setWebsite]   = useState(existing.website || "");
  const [saving, setSaving]     = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const sectors = getSectorList();
  const selectedSector = getSectorById(sector);

  const STEPS = [
    { id: "name",   label: "Nome azienda" },
    { id: "sector", label: "Settore" },
    { id: "brand",  label: "Brand" },
    { id: "done",   label: "Fatto" },
  ];

  const save = async () => {
    setSaving(true);
    await updateProfile({
      company: {
        name:        companyName,
        sectorId:    sector,
        accentColor,
        website,
        configuredAt: new Date().toISOString(),
      },
      companySetupDone: true,
    });
    setSaving(false);
    onComplete();
  };

  const card = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, boxShadow: T.shadowCard };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, padding: "32px 20px 40px", fontFamily: "'Playfair Display', Georgia, serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap'); * { box-sizing:border-box; margin:0; padding:0; } input { background:${T.inputBg}; border:1px solid ${T.border}; border-radius:10px; color:${T.text}; padding:11px 14px; font-family:'DM Sans',sans-serif; font-size:14px; width:100%; outline:none; } input:focus { border-color:${T.accent}; } input::placeholder { color:${T.muted}; }`}</style>

      {showPaywall && <PaywallModal feature="branding" onClose={() => setShowPaywall(false)} />}

      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: T.accent, fontFamily: "'DM Sans'", letterSpacing: 4, textTransform: "uppercase", marginBottom: 6 }}>Lead Finder</div>
          <div style={{ fontSize: 26, fontWeight: 900 }}>{isEdit ? "Modifica azienda" : "Configura la tua azienda"}</div>
          <div style={{ fontSize: 13, color: T.muted, fontFamily: "'DM Sans'", marginTop: 4 }}>Personalizza Lead Finder per il tuo network</div>
        </div>

        {/* Progress steps */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 50, background: i <= step ? T.accent : T.border, transition: "background 0.3s" }} />
          ))}
        </div>

        {/* STEP 0 — Nome azienda */}
        {step === 0 && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Come si chiama la tua azienda?</div>
            <div style={{ fontSize: 13, color: T.muted, fontFamily: "'DM Sans'", marginBottom: 20 }}>Verrà mostrato ai tuoi collaboratori nell'app.</div>
            <input
              placeholder="Es. Sorgenta, Herbalife, Amway..."
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              style={{ marginBottom: 20 }}
              autoFocus
            />
            <button
              disabled={!companyName.trim()}
              onClick={() => setStep(1)}
              style={{ width: "100%", background: companyName.trim() ? T.accent : T.border, color: companyName.trim() ? "#0a0a0f" : T.muted, border: "none", borderRadius: 50, padding: "13px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 15, cursor: companyName.trim() ? "pointer" : "not-allowed" }}
            >
              Continua →
            </button>
          </div>
        )}

        {/* STEP 1 — Settore */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>In quale settore opera?</div>
            <div style={{ fontSize: 13, color: T.muted, fontFamily: "'DM Sans'", marginBottom: 20 }}>Personalizziamo script e missioni per il tuo mercato.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {sectors.map(s => (
                <div
                  key={s.id}
                  onClick={() => setSector(s.id)}
                  style={{ ...card, cursor: "pointer", display: "flex", gap: 14, alignItems: "center", border: `2px solid ${sector === s.id ? s.color : T.border}`, background: sector === s.id ? `${s.color}12` : T.card, transition: "all 0.15s" }}
                >
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{s.label}</div>
                    <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.4, marginTop: 2 }}>{s.description}</div>
                  </div>
                  {sector === s.id && <span style={{ color: s.color, fontSize: 18, flexShrink: 0 }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ background: T.surface, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 50, padding: "12px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Indietro</button>
              <button disabled={!sector} onClick={() => setStep(2)} style={{ background: sector ? T.accent : T.border, color: sector ? "#0a0a0f" : T.muted, border: "none", borderRadius: 50, padding: "12px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, cursor: sector ? "pointer" : "not-allowed" }}>Continua →</button>
            </div>
          </div>
        )}

        {/* STEP 2 — Brand color (solo Pro) */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Colore brand</div>
            <div style={{ fontSize: 13, color: T.muted, fontFamily: "'DM Sans'", marginBottom: 20 }}>Il colore principale dell'app per il tuo team.</div>

            {!can.customBranding() ? (
              // Locked per Starter
              <div style={{ ...card, background: T.surface, textAlign: "center", padding: 24, marginBottom: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6 }}>Branding personalizzato</div>
                <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, marginBottom: 16, lineHeight: 1.5 }}>Disponibile con Leader Pro. Prova gratis 14 giorni.</div>
                <button onClick={() => setShowPaywall(true)} style={{ background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "10px 24px", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Sblocca con Pro
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                {/* Preset colors */}
                <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Scegli un preset</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                  {["#B8860B", "#1A5FA8", "#1A7A4A", "#C05A1A", "#6B4FA8", "#C0392B", "#2C3E50"].map(c => (
                    <div
                      key={c}
                      onClick={() => setAccentColor(c)}
                      style={{ width: 40, height: 40, borderRadius: "50%", background: c, cursor: "pointer", border: accentColor === c ? `3px solid ${T.text}` : "3px solid transparent", transition: "all 0.15s" }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: T.muted, marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Oppure colore personalizzato</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: 48, height: 48, padding: 2, borderRadius: 10, cursor: "pointer" }} />
                  <input value={accentColor} onChange={e => setAccentColor(e.target.value)} placeholder="#B8860B" style={{ flex: 1 }} />
                </div>
              </div>
            )}

            {/* Anteprima */}
            <div style={{ ...card, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Sans'", color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Anteprima</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accentColor}20`, border: `2px solid ${accentColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{selectedSector.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{companyName || "La tua azienda"}</div>
                  <div style={{ fontSize: 12, fontFamily: "'DM Sans'", color: accentColor, fontWeight: 700 }}>{selectedSector.label}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ background: T.surface, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 50, padding: "12px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Indietro</button>
              <button onClick={() => setStep(3)} style={{ background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "12px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Continua →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — Done */}
        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{selectedSector.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Tutto pronto!</div>
            <div style={{ fontSize: 14, fontFamily: "'DM Sans'", color: T.muted, lineHeight: 1.6, marginBottom: 28 }}>
              Lead Finder è configurato per <strong style={{ color: T.text }}>{companyName}</strong> nel settore <strong style={{ color: T.text }}>{selectedSector.label}</strong>.<br /><br />
              I tuoi collaboratori vedranno script e missioni personalizzati per il tuo mercato.
            </div>

            {/* Recap */}
            <div style={{ ...card, textAlign: "left", marginBottom: 24 }}>
              {[
                { label: "Azienda", value: companyName },
                { label: "Settore", value: selectedSector.label },
                { label: "Script inclusi", value: `${Object.keys(selectedSector.scripts).length} template` },
                { label: "Post ideas", value: `${selectedSector.post_ideas.length} idee pronte` },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.muted }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontFamily: "'DM Sans'", color: T.text, fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <button onClick={save} disabled={saving} style={{ width: "100%", background: T.accent, color: "#0a0a0f", border: "none", borderRadius: 50, padding: "15px 0", fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 16, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Salvataggio..." : "Vai alla dashboard →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
