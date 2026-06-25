"use client";
import { useState } from "react";
import type { TimelineBlockTemplate } from "@/lib/vendorTypeConfigs";

interface TimelineBlock {
  id: string;
  startTime: string;
  duration: number;
  title: string;
  description?: string | null;
  location?: string | null;
  phase?: string | null;
}

interface Props {
  blocks: TimelineBlock[];
  templates: TimelineBlockTemplate[];
  weddingId: string;
  wvId: string;
  isPlanner: boolean;
  isVendor: boolean;
}

function timeOptions() {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++)
    for (let m = 0; m < 60; m += 10)
      opts.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  return opts;
}

function addMinutes(time: string, mins: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function diffMinutes(from: string, to: string) {
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  return th * 60 + tm - (fh * 60 + fm);
}

const TIME_OPTS = timeOptions();
const emptyForm = { startTime: "09:00", endTime: "09:30", description: "" };

const inputStyle = { padding: "0.5rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border)", fontSize: "0.875rem", background: "white", width: "100%", boxSizing: "border-box" as const };
const selectStyle = { padding: "0.375rem 0.5rem", borderRadius: "0.375rem", border: "1px solid var(--border)", fontSize: "0.875rem", background: "white" };

export default function TimelinePlanner({ blocks: initial, templates, weddingId, wvId, isPlanner, isVendor }: Props) {
  const [blocks, setBlocks] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const canEdit = isPlanner || isVendor;

  function endOf(b: TimelineBlock) { return addMinutes(b.startTime, b.duration); }

  async function saveNew() {
    const duration = diffMinutes(form.startTime, form.endTime);
    if (duration <= 0) { alert("Eindtijd moet na starttijd liggen"); return; }
    setSaving(true);
    const res = await fetch(`/api/weddings/${weddingId}/vendors/${wvId}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime: form.startTime, duration, title: form.description || "Levering", notes: form.description }),
    });
    if (res.ok) {
      const { item } = await res.json();
      setBlocks(prev => [...prev, { id: item.id, startTime: item.startTime, duration: item.duration, title: item.title, description: item.notes ?? null, location: null, phase: null }]
        .sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
    setSaving(false);
    setAdding(false);
    setForm(emptyForm);
  }

  async function saveEdit(id: string) {
    const duration = diffMinutes(form.startTime, form.endTime);
    if (duration <= 0) { alert("Eindtijd moet na starttijd liggen"); return; }
    setSaving(true);
    const res = await fetch(`/api/weddings/${weddingId}/vendors/${wvId}/schedule/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime: form.startTime, duration, title: form.description || "Levering", notes: form.description }),
    });
    if (res.ok) {
      setBlocks(prev => prev.map(b => b.id === id
        ? { ...b, startTime: form.startTime, duration, title: form.description || "Levering", description: form.description }
        : b).sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
    setSaving(false);
    setEditingId(null);
  }

  async function del(id: string) {
    if (!confirm("Tijdlijn item verwijderen?")) return;
    const res = await fetch(`/api/weddings/${weddingId}/vendors/${wvId}/schedule/${id}`, { method: "DELETE" });
    if (res.ok) setBlocks(prev => prev.filter(b => b.id !== id));
  }

  function startEdit(b: TimelineBlock) {
    setForm({ startTime: b.startTime, endTime: endOf(b), description: b.description ?? b.title ?? "" });
    setEditingId(b.id);
    setAdding(false);
  }

  function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
      <select value={value} onChange={e => onChange(e.target.value)} style={selectStyle}>
        {TIME_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    );
  }

  function EntryForm({ onSave, onCancel, saveLabel }: { onSave: () => void; onCancel: () => void; saveLabel: string }) {
    return (
      <div style={{ background: "var(--accent)", borderRadius: "0.625rem", padding: "1rem", display: "grid", gap: "0.625rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Van</span>
          <TimeSelect value={form.startTime} onChange={v => setForm(f => ({ ...f, startTime: v }))} />
          <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>tot</span>
          <TimeSelect value={form.endTime} onChange={v => setForm(f => ({ ...f, endTime: v }))} />
        </div>
        <input
          placeholder="Wat moet er geleverd worden?"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          style={inputStyle}
        />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={onSave} disabled={saving}
            style={{ padding: "0.375rem 0.875rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            {saving ? "Opslaan..." : saveLabel}
          </button>
          <button onClick={onCancel}
            style={{ padding: "0.375rem 0.875rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.06)", color: "var(--muted)", border: "none", cursor: "pointer", fontSize: "0.8125rem" }}>
            Annuleren
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tijdlijn</h3>
        {canEdit && !adding && !editingId && (
          <button onClick={() => { setAdding(true); setForm(emptyForm); }}
            style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            + Toevoegen
          </button>
        )}
      </div>

      {adding && <div style={{ marginBottom: "0.75rem" }}><EntryForm onSave={saveNew} onCancel={() => setAdding(false)} saveLabel="Toevoegen" /></div>}

      {blocks.length === 0 && !adding && (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>
          Nog geen tijden ingepland.{canEdit ? " Klik op '+ Toevoegen'." : ""}
        </p>
      )}

      <div style={{ display: "grid", gap: "0.5rem" }}>
        {blocks.map(b => (
          <div key={b.id}>
            {editingId === b.id
              ? <EntryForm onSave={() => saveEdit(b.id)} onCancel={() => setEditingId(null)} saveLabel="Opslaan" />
              : (
                <div style={{ display: "flex", gap: "0.75rem", padding: "0.75rem", background: "var(--blush-soft)", borderRadius: "0.5rem", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: "6.5rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--charcoal)" }}>{b.startTime} – {endOf(b)}</span>
                  </div>
                  <div style={{ flex: 1, fontSize: "0.875rem", color: "var(--charcoal)" }}>{b.description || b.title}</div>
                  {canEdit && (
                    <div style={{ display: "flex", gap: "0.625rem", flexShrink: 0 }}>
                      <button onClick={() => startEdit(b)} style={{ fontSize: "0.75rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>✏️</button>
                      <button onClick={() => del(b.id)} style={{ fontSize: "0.75rem", color: "#e53e3e", background: "none", border: "none", cursor: "pointer" }}>🗑️</button>
                    </div>
                  )}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
