"use client";

import { useState } from "react";
import { Film, ExternalLink } from "lucide-react";

const FILM_PHASES = ["Opnames", "Rough cut", "Final cut", "Geleverd"] as const;

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

export default function VideoDelivery({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const [editing, setEditing] = useState(false);
  const [phase, setPhase] = useState((intakeData.filmPhase as string) ?? "");
  const [deliveryDate, setDeliveryDate] = useState((intakeData.filmDeliveryDate as string) ?? "");
  const [filmLink, setFilmLink] = useState((intakeData.filmLink as string) ?? "");
  const [filmNote, setFilmNote] = useState((intakeData.filmNote as string) ?? "");

  function save() {
    onUpdate({ filmPhase: phase, filmDeliveryDate: deliveryDate, filmLink: filmLink.trim(), filmNote: filmNote.trim() });
    setEditing(false);
  }

  const hasContent = phase || deliveryDate || filmLink || filmNote;
  const phaseIndex = FILM_PHASES.indexOf(phase as typeof FILM_PHASES[number]);

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <h3 className="font-semibold text-sm">Trouwfilm levering</h3>
        </div>
        {canEdit && (
          <button onClick={() => setEditing(!editing)} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
            {editing ? "Annuleren" : "Bewerken"}
          </button>
        )}
      </div>

      {/* Phase progress bar */}
      {phase && !editing && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            {FILM_PHASES.map((p, i) => (
              <div key={p} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: "2rem", height: "2rem", borderRadius: "50%",
                  background: i <= phaseIndex ? "var(--primary)" : "var(--accent)",
                  border: `2px solid ${i <= phaseIndex ? "var(--primary)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6875rem", fontWeight: 700,
                  color: i <= phaseIndex ? "white" : "var(--muted)",
                  zIndex: 1,
                }}>
                  {i < phaseIndex ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: "0.625rem", color: i <= phaseIndex ? "var(--primary)" : "var(--muted)", marginTop: "0.25rem", textAlign: "center", fontWeight: i === phaseIndex ? 700 : 400 }}>{p}</span>
              </div>
            ))}
          </div>
          <div style={{ height: "4px", background: "var(--accent)", borderRadius: "2px", margin: "0 1rem", position: "relative" }}>
            <div style={{ height: "100%", background: "var(--primary)", borderRadius: "2px", width: phaseIndex >= 0 ? `${(phaseIndex / (FILM_PHASES.length - 1)) * 100}%` : "0%" }} />
          </div>
        </div>
      )}

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Bewerkfase</label>
            <select value={phase} onChange={e => setPhase(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white" style={{ borderColor: "var(--border)" }}>
              <option value="">Kies fase…</option>
              {FILM_PHASES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Verwachte leverdatum film</label>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Filmlink (bijv. Vimeo, WeTransfer)</label>
            <input type="url" value={filmLink} onChange={e => setFilmLink(e.target.value)}
              placeholder="https://…" className="w-full border rounded-lg px-3 py-2 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Toelichting / wachtwoord</label>
            <input type="text" value={filmNote} onChange={e => setFilmNote(e.target.value)}
              placeholder="Bijv. wachtwoord: bruiloft2026" className="w-full border rounded-lg px-3 py-2 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
          </div>
          <button onClick={save} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
            Opslaan
          </button>
        </div>
      ) : !hasContent ? (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>
          {canEdit ? "Voeg de bewerkfase en filmlink toe zodra de opnames klaar zijn." : "Nog geen film beschikbaar."}
        </p>
      ) : (
        <div className="space-y-2">
          {deliveryDate && (
            <div className="flex justify-between text-sm" style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>Verwachte leverdatum</span>
              <span style={{ fontWeight: 600 }}>
                {new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(deliveryDate))}
              </span>
            </div>
          )}
          {filmLink && (
            <div className="flex justify-between items-center text-sm" style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>Film</span>
              <a href={filmLink} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                Bekijk film <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
          {filmNote && (
            <div className="flex justify-between text-sm" style={{ padding: "0.5rem 0" }}>
              <span style={{ color: "var(--muted)" }}>Toelichting</span>
              <span>{filmNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
