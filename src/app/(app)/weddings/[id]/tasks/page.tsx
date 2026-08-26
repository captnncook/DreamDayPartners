"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, RefreshCw, Circle, X } from "lucide-react";
import { SkeletonCard } from "@/components/Skeleton";
import DatePicker from "@/components/DatePicker";
import { useLang } from "@/components/LangProvider";
import type { T } from "@/lib/i18n";

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  category: string;
  status: string;
  priority: string;
  assignedUser?: { id: string; name: string } | null;
  vendorBookingId?: string | null;
};

type Member = { id: string; name: string; label: string };

// Statusicoon is functioneel: klikbaar als status-toggle
const STATUS_ICON_MAP: Record<string, React.ElementType> = { open: Circle, in_progress: RefreshCw, done: CheckCircle2 };
const STATUS_ICON_COLOR: Record<string, string> = { open: "var(--muted-light)", in_progress: "var(--gold-deep)", done: "var(--ink)" };
const PRIORITY_COLOR: Record<string, string> = {
  high:   "var(--gold-deep)",
  medium: "var(--muted)",
  low:    "var(--muted-light)",
};

function formatDate(d?: string) {
  if (!d) return null;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(d));
}

export default function TasksPage() {
  const { t } = useLang();
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [sort, setSort] = useState<"deadline" | "priority" | "status">("deadline");
  const [view, setView] = useState<"list" | "timeline">("list");
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", category: "general", priority: "medium", assignedTo: "" });
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/weddings/${id}/tasks`);
    const data = await res.json();
    setTasks(data.tasks ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch(`/api/weddings/${id}/members`).then(r => r.json()).then(d => setMembers(d.members ?? []));
  }, [id]);

  async function seedTasks() {
    if (!confirm(t.tasks.seedConfirm)) return;
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
    setForm({ title: "", description: "", dueDate: "", category: "general", priority: "medium", assignedTo: "" });
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
    if (!confirm(t.tasks.deleteConfirm)) return;
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
        <Link href={`/weddings/${id}`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>{t.vendors.back}</Link>
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{t.tasks.title}</h1>
          <button onClick={() => setShowForm(!showForm)} className="ddp-btn-primary">
            {showForm ? t.tasks.cancel : t.tasks.addTaskBtn}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 space-y-4 p-5" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
          <h3 className="dash-section-title">{t.tasks.newTaskFormTitle}</h3>
          <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder={t.tasks.namePlaceholder} className="ddp-input" />
          <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder={t.tasks.descPlaceholder} rows={2} className="ddp-input resize-none" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">{t.tasks.deadlineLabel}</label>
              <DatePicker value={form.dueDate} onChange={(v) => setForm((p) => ({ ...p, dueDate: v }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{t.tasks.assignLabel}</label>
              <select value={form.assignedTo} onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))} className="ddp-select">
                <option value="">{t.tasks.noneOption}</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.label})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{t.tasks.priorityLabel}</label>
              <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} className="ddp-select">
                <option value="high">{t.tasks.priority.high}</option>
                <option value="medium">{t.tasks.priority.medium}</option>
                <option value="low">{t.tasks.priority.low}</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="ddp-btn-primary w-full">
            {saving ? t.tasks.saving : t.tasks.createSubmit}
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {(["all", "open", "done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`ddp-chip${filter === f ? " active" : ""}`} style={{ padding: "0.35rem 0.875rem", fontSize: "var(--text-sm)" }}>
            {f === "all" ? t.tasks.filterAll : f === "open" ? t.tasks.filterOpen : t.tasks.filterDone}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}
            className="text-xs rounded-lg px-2 py-1.5 border"
            style={{ borderColor: "var(--border)", background: "white", cursor: "pointer" }}>
            <option value="deadline">{t.tasks.sortDeadline}</option>
            <option value="priority">{t.tasks.sortPriority}</option>
            <option value="status">{t.tasks.sortStatus}</option>
          </select>
          <button onClick={() => setView(v => v === "list" ? "timeline" : "list")}
            className="text-xs rounded-lg px-2 py-1.5 border"
            style={{ borderColor: "var(--border)", background: view === "timeline" ? "var(--ink)" : "white", color: view === "timeline" ? "white" : "var(--foreground)", cursor: "pointer" }}>
            {view === "list" ? t.tasks.viewTimeline : t.tasks.viewList}
          </button>
          <span className="text-xs" style={{ color: "var(--muted)" }}>{t.tasks.countTasks.replace("{n}", String(filtered.length))}</span>
        </div>
      </div>

      {view === "timeline" ? (
        <TimelineView tasks={filtered} onToggle={toggleStatus} t={t} />
      ) : (
      <div style={{ borderTop: "1px solid var(--border)" }}>
        {filtered.map((task) => {
          const daysLeft = task.dueDate ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000) : null;
          const isUrgent = daysLeft !== null && daysLeft <= 7 && task.status !== "done";
          const priorityColor = PRIORITY_COLOR[task.priority] ?? PRIORITY_COLOR.medium;
          const priorityLabel = t.tasks.priority[task.priority as keyof typeof t.tasks.priority] ?? task.priority;
          const isDone = task.status === "done";
          return (
          <div key={task.id} className="dash-row" style={{ alignItems: "flex-start" }}>
            <button onClick={() => toggleStatus(task)} className="mt-0.5 flex-shrink-0" title={t.tasks.statusChangeTooltip} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
              {(() => { const Icon = STATUS_ICON_MAP[task.status] ?? Circle; return <Icon className="w-5 h-5" style={{ color: STATUS_ICON_COLOR[task.status] ?? "var(--muted-light)" }} />; })()}
            </button>
            <div className="flex-1 min-w-0">
              {task.vendorBookingId ? (
                <Link href={`/weddings/${id}/vendors/${task.vendorBookingId}`} className="inline-flex items-center gap-1.5 group">
                  <span className={`text-sm ${isDone ? "line-through" : ""}`}
                    style={{ fontWeight: isUrgent ? 700 : isDone ? 400 : 500, color: isDone ? "var(--muted-light)" : "var(--foreground)" }}>
                    {task.title}
                  </span>
                  <span style={{ color: "var(--gold-deep)", fontWeight: 600 }}>→</span>
                </Link>
              ) : (
                <span className={`text-sm ${isDone ? "line-through" : ""}`}
                  style={{ fontWeight: isUrgent ? 700 : isDone ? 400 : 500, color: isDone ? "var(--muted-light)" : "var(--foreground)" }}>
                  {task.title}
                </span>
              )}
              {task.description && (
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{task.description}</p>
              )}
              <div className="flex items-center gap-2.5 mt-1 flex-wrap text-xs" style={{ color: "var(--muted)" }}>
                {!isDone && (
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: priorityColor }}>{priorityLabel}</span>
                )}
                {isUrgent && (
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold-deep)" }}>
                    {daysLeft !== null && daysLeft <= 0 ? t.tasks.dueTodayLabel : t.tasks.dueInDays.replace("{n}", String(daysLeft))}
                  </span>
                )}
                {task.dueDate && <span>{formatDate(task.dueDate)}</span>}
                <span style={{ color: "var(--muted-light)" }}>{t.tasks.status[task.status as keyof typeof t.tasks.status] ?? task.status}</span>
                {task.assignedUser && <span style={{ fontWeight: 600 }}>{task.assignedUser.name}</span>}
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)} className="flex-shrink-0 hover:opacity-70" style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex" }}><X className="w-4 h-4" /></button>
          </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            <p className="mb-3">{t.tasks.noTasksFound}</p>
            {tasks.length === 0 && (
              <button onClick={seedTasks} className="ddp-btn-secondary text-sm">
                {t.tasks.seedBtn}
              </button>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}

function TimelineView({ tasks, onToggle, t }: { tasks: Task[]; onToggle: (task: Task) => void; t: T }) {
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
            <span className="text-xs font-semibold" style={{ color: "var(--gold-deep)", textTransform: "capitalize" }}>{month}</span>
          </div>
          <div style={{ flex: 1, borderLeft: "2px solid var(--border)", paddingLeft: "1.25rem" }}>
            <div>
              {monthTasks.map(task => {
                const Icon = STATUS_ICON_MAP[task.status] ?? Circle;
                const priorityColor = PRIORITY_COLOR[task.priority] ?? PRIORITY_COLOR.medium;
                const priorityLabel = t.tasks.priority[task.priority as keyof typeof t.tasks.priority] ?? task.priority;
                return (
                  <div key={task.id} className="flex items-start gap-3 py-2" style={{ position: "relative", borderBottom: "1px solid var(--border)", opacity: task.status === "done" ? 0.55 : 1 }}>
                    <div style={{ position: "absolute", left: "-1.71rem", top: "0.55rem", background: "var(--background)", padding: "1px" }}>
                      <button onClick={() => onToggle(task)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                        <Icon className="w-4 h-4" style={{ color: STATUS_ICON_COLOR[task.status] }} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${task.status === "done" ? "line-through" : ""}`}>{task.title}</span>
                      <div className="flex gap-2.5 mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: priorityColor }}>{priorityLabel}</span>
                        {task.dueDate && <span>{formatDate(task.dueDate)}</span>}
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
            <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{t.tasks.noDate}</span>
          </div>
          <div style={{ flex: 1, borderLeft: "2px solid var(--border)", paddingLeft: "1.25rem" }}>
            <div>
              {noDate.map(t => (
                <div key={t.id} className="py-2" style={{ borderBottom: "1px solid var(--border)" }}>
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
