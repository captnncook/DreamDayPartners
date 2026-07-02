"use client";

import { useState, useRef, useEffect } from "react";

export default function VendorNotesEditor({ weddingId, wvId, initialNotes }: { weddingId: string; wvId: string; initialNotes: string }) {
  const [value, setValue] = useState(initialNotes);
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function save(next: string) {
    setSaving(true);
    await fetch(`/api/weddings/${weddingId}/vendors/${wvId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: next }),
    });
    setSaving(false);
    setSaved(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    setValue(next);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(next), 800);
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Eigen aantekeningen over deze bruiloft — alleen voor jou zichtbaar…"
        rows={4}
        className="ddp-input resize-none"
        style={{ fontSize: "0.875rem" }}
      />
      <div className="text-xs mt-1.5" style={{ color: "var(--muted-light)" }}>
        {saving ? "Opslaan…" : saved ? "Opgeslagen" : ""}
      </div>
    </div>
  );
}
