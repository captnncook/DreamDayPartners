"use client";

import { useState } from "react";
import { Palette, ExternalLink } from "lucide-react";

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner?: boolean;
}

export default function MoodboardUploader({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const moodboardUrl = intakeData?.moodboardUrl as string | undefined;
  const moodboardNotes = intakeData?.moodboardNotes as string | undefined;
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(moodboardUrl ?? "");
  const [notes, setNotes] = useState(moodboardNotes ?? "");

  function save() {
    onUpdate({ moodboardUrl: url.trim(), moodboardNotes: notes.trim() });
    setEditing(false);
  }

  const hasContent = moodboardUrl || moodboardNotes;

  return (
    <div className="ddp-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Palette className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Moodboard & Stijl</h3>
        </div>
        {canEdit && (
          <button onClick={() => setEditing(!editing)} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
            {editing ? "Annuleren" : hasContent ? "Bewerken" : "Toevoegen"}
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: "0.25rem" }}>
              Link naar moodboard (Pinterest, Canva, Google Foto&apos;s…)
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.pinterest.com/…"
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", fontSize: "0.875rem", background: "white", color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: "0.25rem" }}>
              Notities / stijlomschrijving
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Bijv. romantisch, luchtig, veel bloemen, blush tinten…"
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", fontSize: "0.875rem", background: "white", color: "var(--foreground)", resize: "vertical" }}
            />
          </div>
          <p style={{ fontSize: "0.6875rem", color: "var(--muted)" }}>
            Wordt ingevuld door het bruidspaar of de planner. De haarstylist/visagist kan dit raadplegen ter voorbereiding.
          </p>
          <button
            onClick={save}
            style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, width: "fit-content" }}
          >
            Opslaan
          </button>
        </div>
      ) : hasContent ? (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {moodboardUrl && (
            <a href={moodboardUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "var(--primary)", fontWeight: 600 }}>
              <ExternalLink className="w-4 h-4" /> Moodboard bekijken
            </a>
          )}
          {moodboardNotes && (
            <p style={{ fontSize: "0.875rem", color: "var(--foreground)", lineHeight: 1.6, background: "var(--color-blush-soft)", padding: "0.75rem", borderRadius: "0.5rem", margin: 0 }}>
              {moodboardNotes}
            </p>
          )}
        </div>
      ) : (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>
          {canEdit
            ? "Voeg een moodboard-link of stijlomschrijving toe als referentie voor de sessie."
            : "Nog geen moodboard gedeeld."}
        </p>
      )}
    </div>
  );
}
