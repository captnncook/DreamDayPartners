"use client";

import { useState, useEffect, useCallback } from "react";

type Note = { id: string; text: string; authorName: string; createdAt: string };

export default function AdminNotes({ targetType, targetId }: { targetType: string; targetId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/notes?targetType=${targetType}&targetId=${targetId}`);
    const data = await res.json();
    setNotes(data.notes ?? []);
    setLoading(false);
  }, [targetType, targetId]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!text.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, text }),
    });
    if (res.ok) {
      const data = await res.json();
      setNotes((n) => [data.note, ...n]);
      setText("");
    }
    setSaving(false);
  }

  return (
    <div style={{ padding: "1rem", background: "var(--sand)", borderRadius: "10px" }}>
      <div className="flex gap-2 mb-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Interne notitie toevoegen…"
          className="ddp-input flex-1 text-sm"
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
        />
        <button onClick={handleAdd} disabled={saving || !text.trim()} className="ddp-btn-primary text-sm" style={{ padding: "0.5rem 1rem" }}>
          {saving ? "…" : "Toevoegen"}
        </button>
      </div>
      {loading ? (
        <p className="text-xs" style={{ color: "var(--muted)" }}>Laden…</p>
      ) : notes.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--muted)" }}>Nog geen notities.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="text-xs" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
              <p style={{ color: "var(--foreground)" }}>{n.text}</p>
              <p style={{ color: "var(--muted)", marginTop: "2px" }}>
                {n.authorName} · {new Date(n.createdAt).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
