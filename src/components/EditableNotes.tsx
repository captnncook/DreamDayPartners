"use client";
import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface Props {
  weddingId: string;
  initialNotes: string;
}

export default function EditableNotes({ weddingId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/weddings/${weddingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: draft }),
    });
    if (res.ok) {
      setNotes(draft);
      setEditing(false);
    }
    setSaving(false);
  }

  function cancel() {
    setDraft(notes);
    setEditing(false);
  }

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-2">
        <h3 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Notities</h3>
        {!editing && (
          <button
            onClick={() => { setDraft(notes); setEditing(true); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "0.25rem" }}
            title="Notities bewerken"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {editing ? (
        <>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            style={{
              width: "100%", fontSize: "0.875rem", lineHeight: 1.65, color: "var(--muted)",
              border: "1px solid var(--border)", borderRadius: "10px", padding: "0.5rem 0.625rem",
              resize: "vertical", outline: "none", marginBottom: "0.625rem",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={save}
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.875rem", borderRadius: "8px", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}
            >
              <Check className="w-3.5 h-3.5" /> {saving ? "Opslaan…" : "Opslaan"}
            </button>
            <button
              onClick={cancel}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: "8px", background: "var(--accent)", color: "var(--foreground)", border: "none", cursor: "pointer", fontSize: "0.8125rem" }}
            >
              <X className="w-3.5 h-3.5" /> Annuleren
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)", whiteSpace: "pre-wrap" }}>
          {notes || <span style={{ fontStyle: "italic" }}>Nog geen notities. Klik op het potlood om iets toe te voegen.</span>}
        </p>
      )}
    </div>
  );
}
