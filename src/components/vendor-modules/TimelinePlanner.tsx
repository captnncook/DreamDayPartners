"use client";
import { useState } from "react";
import { Pencil, Trash2, Download } from "lucide-react";
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

const inputStyle = { padding: "0.5rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border)", fontSize: "var(--text-md)", background: "white", width: "100%", boxSizing: "border-box" as const };
const selectStyle = { padding: "0.375rem 0.5rem", borderRadius: "0.375rem", border: "1px solid var(--border)", fontSize: "var(--text-md)", background: "white" };

// Top-level so React never remounts them on parent re-render
function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={selectStyle}>
      {TIME_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

interface EntryFormProps {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
}

function EntryForm({ form, setForm, saving, onSave, onCancel, saveLabel }: EntryFormProps) {
  return (
    <div style={{ background: "var(--accent)", borderRadius: "0.625rem", padding: "1rem", display: "grid", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--text-base)", color: "var(--muted)" }}>Van</span>
        <TimeSelect value={form.startTime} onChange={v => setForm(f => ({ ...f, startTime: v }))} />
        <span style={{ fontSize: "var(--text-base)", color: "var(--muted)" }}>tot</span>
        <TimeSelect value={form.endTime} onChange={v => setForm(f => ({ ...f, endTime: v }))} />
      </div>
      <input
        placeholder="Wat moet er geleverd worden?"
        value={form.description}
        onChange={e => { const val = e.target.value; setForm(f => ({ ...f, description: val })); }}
        style={inputStyle}
      />
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button onClick={onSave} disabled={saving}
          style={{ padding: "0.375rem 0.875rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "var(--text-base)", fontWeight: 600 }}>
          {saving ? "Opslaan..." : saveLabel}
        </button>
        <button onClick={onCancel}
          style={{ padding: "0.375rem 0.875rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.06)", color: "var(--muted)", border: "none", cursor: "pointer", fontSize: "var(--text-base)" }}>
          Annuleren
        </button>
      </div>
    </div>
  );
}

function exportTimelineCsv(blocks: TimelineBlock[], endOf: (b: TimelineBlock) => string) {
  const header = "Starttijd,Eindtijd,Omschrijving";
  const rows = blocks.map(b => `"${b.startTime}","${endOf(b)}","${b.description || b.title}"`);
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "tijdlijn.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function TimelinePlanner({ blocks: initial, templates, weddingId, wvId, isPlanner, isVendor }: Props) {
  const [blocks, setBlocks] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [syncingDraaiboek, setSyncingDraaiboek] = useState(false);

  const canEdit = isPlanner || isVendor;

  function endOf(b: TimelineBlock) { return addMinutes(b.startTime, b.duration); }

  async function applyTemplate() {
    if (!templates || templates.length === 0) return;
    setShowTemplateConfirm(false);
    setLoadingTemplate(true);
    let currentTime = "09:00";
    const created: typeof blocks = [];
    for (const tpl of templates) {
      const dur = tpl.defaultDuration ?? 60;
      const res = await fetch(`/api/weddings/${weddingId}/vendors/${wvId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: currentTime, duration: dur, title: tpl.label, notes: tpl.label }),
      });
      if (res.ok) {
        const { item } = await res.json();
        created.push({ id: item.id, startTime: item.startTime, duration: item.duration, title: item.title, description: item.notes ?? null, location: null, phase: tpl.phase ?? null });
      }
      currentTime = addMinutes(currentTime, dur);
    }
    setBlocks(created.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    setLoadingTemplate(false);
  }

  // Deze tijdlijn was een eenmalige kopie zonder terugkoppeling naar het
  // Draaiboek — wijzigt het bruidspaar later de tijden daar, dan liep de
  // leverancier gewoon verouderd. Dit haalt de actuele (voor deze
  // leverancier zichtbare) draaiboek-items op en werkt tijden bij op
  // titel-match; items die alleen in de eigen tijdlijn staan blijven
  // ongemoeid, en nieuwe draaiboek-items worden toegevoegd.
  async function syncFromDraaiboek() {
    setSyncingDraaiboek(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/draaiboek`);
      if (!res.ok) return;
      const data = await res.json();
      type DraaiboekItem = { title: string; startTime: string; duration: number; description?: string | null };
      const items: DraaiboekItem[] = data.draaiboeken?.[0]?.items ?? [];
      if (items.length === 0) return;

      const next = [...blocks];
      for (const di of items) {
        const match = next.find(b => b.title.trim().toLowerCase() === di.title.trim().toLowerCase());
        if (match) {
          if (match.startTime !== di.startTime || match.duration !== di.duration) {
            const r = await fetch(`/api/weddings/${weddingId}/vendors/${wvId}/schedule/${match.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ startTime: di.startTime, duration: di.duration, title: match.title, notes: match.description }),
            });
            if (r.ok) { match.startTime = di.startTime; match.duration = di.duration; }
          }
        } else {
          const r = await fetch(`/api/weddings/${weddingId}/vendors/${wvId}/schedule`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startTime: di.startTime, duration: di.duration, title: di.title, notes: di.description }),
          });
          if (r.ok) {
            const { item } = await r.json();
            next.push({ id: item.id, startTime: item.startTime, duration: item.duration, title: item.title, description: item.notes ?? null, location: null, phase: null });
          }
        }
      }
      setBlocks(next.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    } finally {
      setSyncingDraaiboek(false);
    }
  }

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

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tijdlijn</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--muted)", marginTop: "2px" }}>Opbouw- en bezorgtijden voor deze bruiloft.</p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
          {blocks.length > 0 && (
            <button onClick={() => exportTimelineCsv(blocks, endOf)}
              title="Exporteer tijdlijn als CSV"
              style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
              <Download className="w-3.5 h-3.5" /> Exporteren
            </button>
          )}
          {canEdit && blocks.length > 0 && !adding && !editingId && (
            <button onClick={syncFromDraaiboek} disabled={syncingDraaiboek}
              title="Haalt de actuele tijden uit het Draaiboek en werkt overeenkomende items bij"
              style={{ fontSize: "var(--text-base)", color: "var(--muted)", background: "none", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.3rem 0.625rem", cursor: "pointer", fontWeight: 600 }}>
              {syncingDraaiboek ? "Synchroniseren…" : "Vernieuwen vanuit draaiboek"}
            </button>
          )}
          {canEdit && templates && templates.length > 0 && blocks.length > 0 && !adding && !editingId && (
            <button onClick={() => setShowTemplateConfirm(true)} disabled={loadingTemplate}
              style={{ fontSize: "var(--text-base)", color: "var(--primary)", background: "var(--color-blush-soft)", border: "1px solid var(--color-blush)", borderRadius: "8px", padding: "0.3rem 0.625rem", cursor: "pointer", fontWeight: 600 }}>
              {loadingTemplate ? "Laden…" : "Template"}
            </button>
          )}
          {canEdit && !adding && !editingId && (
            <button onClick={() => { setAdding(true); setForm(emptyForm); }}
              style={{ fontSize: "var(--text-base)", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              + Toevoegen
            </button>
          )}
        </div>
      </div>

      {adding && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <EntryForm form={form} setForm={setForm} saving={saving} onSave={saveNew} onCancel={() => setAdding(false)} saveLabel="Toevoegen" />
        </div>
      )}

      {blocks.length === 0 && !adding && (
        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
          <p style={{ fontSize: "var(--text-md)", color: "var(--muted)", fontStyle: "italic", marginBottom: "var(--space-5)" }}>
            Nog geen tijden ingepland.
          </p>
          {canEdit && templates && templates.length > 0 && (
            <button
              onClick={() => setShowTemplateConfirm(true)}
              disabled={loadingTemplate}
              style={{ fontSize: "var(--text-base)", color: "var(--primary)", background: "var(--color-blush-soft)", border: "1px solid var(--color-blush)", borderRadius: "8px", padding: "0.4rem 0.875rem", cursor: "pointer", fontWeight: 600 }}
            >
              {loadingTemplate ? "Template laden…" : "Template toepassen"}
            </button>
          )}
        </div>
      )}

      {showTemplateConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", maxWidth: "380px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            <h3 style={{ fontWeight: 700, fontSize: "var(--text-xl)", marginBottom: "var(--space-3)" }}>Template toepassen?</h3>
            <p style={{ fontSize: "var(--text-md)", color: "var(--muted)", marginBottom: "var(--space-5)" }}>
              Dit voegt {templates.length} tijdblokken toe aan de tijdlijn. Bestaande items worden niet verwijderd.
            </p>
            <ul style={{ fontSize: "var(--text-base)", color: "var(--foreground)", marginBottom: "var(--space-6)", paddingLeft: "1rem" }}>
              {templates.slice(0, 6).map(t => <li key={t.key} style={{ marginBottom: "0.2rem" }}>{t.label}{t.defaultDuration ? ` (${t.defaultDuration} min)` : ""}</li>)}
              {templates.length > 6 && <li style={{ color: "var(--muted)" }}>+ {templates.length - 6} meer…</li>}
            </ul>
            <div style={{ display: "flex", gap: "var(--space-4)" }}>
              <button onClick={applyTemplate} style={{ flex: 1, background: "var(--primary)", color: "white", border: "none", borderRadius: "10px", padding: "0.625rem", cursor: "pointer", fontWeight: 600, fontSize: "var(--text-md)" }}>
                Toepassen
              </button>
              <button onClick={() => setShowTemplateConfirm(false)} style={{ flex: 1, background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.625rem", cursor: "pointer", fontWeight: 600, fontSize: "var(--text-md)", color: "var(--foreground)" }}>
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        {blocks.map(b => (
          <div key={b.id}>
            {editingId === b.id
              ? <EntryForm form={form} setForm={setForm} saving={saving} onSave={() => saveEdit(b.id)} onCancel={() => setEditingId(null)} saveLabel="Opslaan" />
              : (
                <div style={{ display: "flex", gap: "var(--space-5)", padding: "0.75rem", background: "var(--blush-soft)", borderRadius: "0.5rem", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: "6.5rem" }}>
                    <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--charcoal)" }}>{b.startTime} – {endOf(b)}</span>
                  </div>
                  <div style={{ flex: 1, fontSize: "var(--text-md)", color: "var(--charcoal)" }}>{b.description || b.title}</div>
                  {canEdit && (
                    <div style={{ display: "flex", gap: "var(--space-4)", flexShrink: 0 }}>
                      <button onClick={() => startEdit(b)} style={{ color: "var(--primary)", background: "none", border: "none", cursor: "pointer", display: "flex" }}><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => del(b.id)} style={{ color: "#e53e3e", background: "none", border: "none", cursor: "pointer", display: "flex" }}><Trash2 className="w-3.5 h-3.5" /></button>
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
