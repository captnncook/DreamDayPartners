"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";

export default function AddToCalendarButton({ title, date, description }: { title: string; date: string; description?: string }) {
  const [saving, setSaving] = useState(false);

  async function handleClick() {
    setSaving(true);
    try {
      const res = await fetch("/api/ics/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, description }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]+/gi, "-")}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      title="Voeg toe aan je eigen agenda"
      style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "var(--primary, var(--gold-deep))", fontSize: "0.75rem", fontWeight: 600, padding: 0 }}
    >
      <CalendarPlus size={13} /> Agenda
    </button>
  );
}
