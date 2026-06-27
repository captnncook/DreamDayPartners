"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, RefreshCw, Circle, Calendar, User, X, CheckSquare } from "lucide-react";
import { SkeletonCard } from "@/components/Skeleton";

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

const STATUS_ICON_MAP: Record<string, React.ElementType> = { open: Circle, in_progress: RefreshCw, done: CheckCircle2 };
const STATUS_ICON_COLOR: Record<string, string> = { open: "var(--muted-light)", in_progress: "var(--warning)", done: "var(--success)" };
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
  const [sort, setSort] = useState<"deadline" | "priority" | "status">("deadline");
  const [view, setView] = useState<"list" | "timeline">("list");
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", category: "general", priority: "medium" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/weddings/${id}/tasks`);
    const data = await res.json();
    setTasks(data.tasks ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function seedTasks() {
    if (!confirm("20 standaardtaken toevoegen?")) return;
    await fetch(`/api/weddings/${id}/tasks/seed`, { method: "POST" });
    load();
  }

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
    if (!confirm("Taak verwijderen?")) return;
    await fetch(`/api/weddings/${id}/tasks/${taskId}`, { method: "DELETE" });
    load();
  }

  const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const STATUS_ORDER: Record<string, number> = { in_progress: 0, open: 1, done: 2 };

  const filtered = tasks
    .filter((t) => filter === "all" ? true : filter === "done" ? t.status === "done" : t.status !== "done")
    .sort((a, b) => {
      if (sort === "deadline") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sort === "priority") return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
      return (STATUS_ORDER[a.status] ?? 1) - (STATUS_ORDER[b.status] ?? 1);
    });

  if (loading) return <div className="p-8 max-w-4xl mx-auto space-y-3">{Array.from({length:5}).map((_,i)=><SkeletonCard key={i} rows={2}/>)}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${id}`} className="text-sm" style={{ color: "var(--muted)" }}>← Terug</Link>
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

      <div className="flex flex-wrap gap-2 mb-4 items-center">
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
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="text-xs" style={{ color: "var(--muted)" }}>Sorteren:</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}
            className="text-xs rounded-lg px-2 py-1.5 border"
            style={{ borderColor: "var(--border)", background: "white", cursor: "pointer" }}>
            <option value="deadline">Deadline</option>
            <option value="priority">Prioriteit</option>
            <option value="status">Status</option>
          </select>
          <button onClick={() => setView(v => v === "list" ? "timeline" : "list")}
            className="text-xs rounded-lg px-2 py-1.5 border"
            style={{ borderColor: "var(--border)", background: view === "timeline" ? "var(--primary)" : "white", color: view === "timeline" ? "white" : "var(--foreground)", cursor: "pointer" }}>
            {view === "list" ? "Tijdlijn" : "Lijst"}
          </button>
          <span className="text-xs" style={{ color: "var(--muted)" }}>{filtered.length} taken</span>
        </div>
      </div>

      {view === "timeline" ? (
        <TimelineView tasks={filtered} onToggle={toggleStatus} />
      ) : (
      <div className="space-y-2">
        {filtered.map((task) => {
          const daysLeft = task.dueDate ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000) : null;
          const isUrgent = daysLeft !== null && daysLeft <= 7 && task.status !== "done";
          return (
          <div key={task.id} className="ddp-card flex items-start gap-4" style={isUrgent ? { borderColor: "var(--danger)", background: "var(--danger-bg)" } : {}}>
            <button onClick={() => toggleStatus(task)} className="mt-0.5 flex-shrink-0" title="Status wijzigen">
              {(() => { const Icon = STATUS_ICON_MAP[task.status] ?? Circle; return <Icon className="w-5 h-5" style={{ color: STATUS_ICON_COLOR[task.status] ?? "var(--muted-light)" }} />; })()}
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
                {task.dueDate && <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}><Calendar className="w-3 h-3" />{formatDate(task.dueDate)}</span>}
                {task.assignedUser && <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}><User className="w-3 h-3" />{task.assignedUser.name}</span>}
                <span className="text-xs" style={{ color: "var(--muted)" }}>{STATUS_LABELS[task.status]}</span>
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)} className="flex-shrink-0 hover:opacity-70" style={{ color: "var(--muted)" }}><X className="w-4 h-4" /></button>
          </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            <div className="flex justify-center mb-2"><CheckSquare className="w-8 h-8" style={{ color: "var(--accent-dark)" }} /></div>
            <p className="mb-3">Geen taken gevonden</p>
            {tasks.length === 0 && (
              <button onClick={seedTasks} className="ddp-btn-secondary text-sm">
                Gebruik standaardchecklist (20 taken)
              </button>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}

function TimelineView({ tasks, onToggle }: { tasks: Task[]; onToggle: (t: Task) => void }) {
  const withDate = tasks.filter(t => t.dueDate);
  const noDate = tasks.filter(t => !t.dueDate);

  const byMonth = withDate.reduce<Record<string, Task[]>>((acc, t) => {
    const key = new Date(t.dueDate!).toLocaleDateString("nl-NL", { year: "numeric", month: "long" });
    acc[key] = [...(acc[key] ?? []), t];
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(byMonth).map(([month, monthTasks]) => (
        <div key={month} className="mb-6 flex gap-4">
          <div style={{ width: "100px", flexShrink: 0, paddingTop: "0.25rem" }}>
            <span className="text-xs font-semibold" style={{ color: "var(--primary)", textTransform: "capitalize" }}>{month}</span>
          </div>
          <div style={{ flex: 1, borderLeft: "2px solid var(--border)", paddingLeft: "1.25rem" }}>
            <div className="space-y-2">
              {monthTasks.map(t => {
                const Icon = STATUS_ICON_MAP[t.status] ?? Circle;
                return (
                  <div key={t.id} className="flex items-start gap-3" style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "-1.625rem", top: "0.125rem", background: "white", padding: "1px" }}>
                      <button onClick={() => onToggle(t)}>
                        <Icon className="w-4 h-4" style={{ color: STATUS_ICON_COLOR[t.status] }} />
                      </button>
                    </div>
                    <div className="ddp-card py-2 px-3 flex-1" style={{ opacity: t.status === "done" ? 0.6 : 1 }}>
                      <span className={`text-sm font-medium ${t.status === "done" ? "line-through" : ""}`}>{t.title}</span>
                      <div className="flex gap-2 mt-1">
                        <span className={`ddp-badge ${PRIORITY_COLORS[t.priority]}`} style={{ fontSize: "0.65rem" }}>{PRIORITY_LABELS[t.priority]}</span>
                        {t.dueDate && <span className="text-xs" style={{ color: "var(--muted)" }}>{formatDate(t.dueDate)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
      {noDate.length > 0 && (
        <div className="mb-6 flex gap-4">
          <div style={{ width: "100px", flexShrink: 0, paddingTop: "0.25rem" }}>
            <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Geen datum</span>
          </div>
          <div style={{ flex: 1, borderLeft: "2px solid var(--border)", paddingLeft: "1.25rem" }}>
            <div className="space-y-2">
              {noDate.map(t => (
                <div key={t.id} className="ddp-card py-2 px-3">
                  <span className="text-sm font-medium">{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
