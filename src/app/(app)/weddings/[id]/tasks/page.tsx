"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  category: string;
  status: string;
  priority: string;
  assignedUser?: { id: string; name: string } | null;
};

const STATUS_ICONS: Record<string, string> = { open: "⭕", in_progress: "🔄", done: "✅" };
const PRIORITY_COLORS: Record<string, string> = { high: "badge-danger", medium: "badge-warning", low: "badge-neutral" };
const PRIORITY_LABELS: Record<string, string> = { high: "Hoog", medium: "Middel", low: "Laag" };
const STATUS_LABELS: Record<string, string> = { open: "Open", in_progress: "Bezig", done: "Klaar" };

function formatDate(d?: string) {
  if (!d) return null;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(d));
}

export default function TasksPage() {
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", category: "general", priority: "medium" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/weddings/${id}/tasks`);
    const data = await res.json();
    setTasks(data.tasks ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/weddings/${id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", dueDate: "", category: "general", priority: "medium" });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function toggleStatus(task: Task) {
    const next = task.status === "open" ? "in_progress" : task.status === "in_progress" ? "done" : "open";
    await fetch(`/api/weddings/${id}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, status: next }),
    });
    load();
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/weddings/${id}/tasks/${taskId}`, { method: "DELETE" });
    load();
  }

  const filtered = tasks.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.status === "done" : t.status !== "done"
  );

  if (loading) return <div className="p-8" style={{ color: "var(--muted)" }}>Laden...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${id}`} className="text-sm hover:underline" style={{ color: "var(--muted)" }}>← Terug</Link>
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-bold">Taken</h1>
          <button onClick={() => setShowForm(!showForm)} className="ddp-btn-primary">
            {showForm ? "Annuleren" : "+ Taak toevoegen"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="ddp-card mb-6 space-y-4">
          <h3 className="font-semibold">Nieuwe taak</h3>
          <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Taaknaam" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
          <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Omschrijving (optioneel)" rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none" style={{ borderColor: "var(--border)" }} />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Deadline</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Categorie</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
                {["general","venue","catering","decoration","legal","clothing","music","photo"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Prioriteit</label>
              <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
                <option value="high">Hoog</option>
                <option value="medium">Middel</option>
                <option value="low">Laag</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="ddp-btn-primary w-full">
            {saving ? "Opslaan..." : "Taak aanmaken"}
          </button>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        {(["all", "open", "done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: filter === f ? "var(--primary)" : "var(--accent)",
              color: filter === f ? "white" : "var(--foreground)",
            }}>
            {f === "all" ? "Alles" : f === "open" ? "Open" : "Klaar"}
          </button>
        ))}
        <span className="text-sm ml-2" style={{ color: "var(--muted)", lineHeight: "2" }}>{filtered.length} taken</span>
      </div>

      <div className="space-y-2">
        {filtered.map((task) => (
          <div key={task.id} className="ddp-card flex items-start gap-4">
            <button onClick={() => toggleStatus(task)} className="mt-0.5 text-xl flex-shrink-0" title="Status wijzigen">
              {STATUS_ICONS[task.status] ?? "⭕"}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium text-sm ${task.status === "done" ? "line-through" : ""}`}
                  style={{ color: task.status === "done" ? "var(--muted)" : undefined }}>
                  {task.title}
                </span>
                <span className={`ddp-badge ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                <span className="ddp-badge badge-neutral">{task.category}</span>
              </div>
              {task.description && (
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{task.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                {task.dueDate && <span className="text-xs" style={{ color: "var(--muted)" }}>📅 {formatDate(task.dueDate)}</span>}
                {task.assignedUser && <span className="text-xs" style={{ color: "var(--muted)" }}>👤 {task.assignedUser.name}</span>}
                <span className="text-xs" style={{ color: "var(--muted)" }}>{STATUS_LABELS[task.status]}</span>
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)} className="text-xs flex-shrink-0 hover:opacity-70" style={{ color: "var(--muted)" }}>✕</button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            <div className="text-3xl mb-2">✅</div>
            <p>Geen taken gevonden</p>
          </div>
        )}
      </div>
    </div>
  );
}
