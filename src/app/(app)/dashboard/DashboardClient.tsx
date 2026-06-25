"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, CheckSquare, Calendar, Sparkles, Trash2, Plus, MapPin, ChevronRight, Check, X } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = { Heart, CheckSquare, Calendar, Sparkles };

const STATUS_COLORS: Record<string, string> = {
  planning: "badge-info", intake: "badge-neutral", execution: "badge-warning", completed: "badge-success",
};
const STATUS_LABELS: Record<string, string> = {
  planning: "Planning", intake: "Intake", execution: "Uitvoering", completed: "Afgerond",
};
const PRIORITY_COLORS: Record<string, string> = {
  high: "badge-danger", medium: "badge-warning", low: "badge-neutral",
};
const PRIORITY_LABELS: Record<string, string> = { high: "Hoog", medium: "Middel", low: "Laag" };

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}
function formatDateShort(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(iso));
}

type Wedding = { id: string; title: string; venue?: string | null; date: string; status: string; isPremium: boolean; days: number };
type Task = { id: string; title: string; priority: string; dueDate?: string; weddingId: string; weddingTitle: string };
type StatCard = { label: string; value: number; icon: string };
type VendorRequest = { id: string; weddingTitle: string; weddingVenue?: string | null; weddingDate: string };

interface Props {
  user: { id: string; name: string; role: string };
  greeting: string;
  statsCards: StatCard[];
  weddings: Wedding[];
  tasks: Task[];
  vendorRequests?: VendorRequest[];
}

export default function DashboardClient({ user, greeting, statsCards, weddings, tasks: initialTasks, vendorRequests = [] }: Props) {
  const router = useRouter();
  const [requests, setRequests] = useState(vendorRequests);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [tasks, setTasks] = useState(initialTasks);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskWedding, setNewTaskWedding] = useState(weddings[0]?.id ?? "");
  const [savingTask, setSavingTask] = useState(false);

  async function respondToRequest(wvId: string, action: "accept" | "decline") {
    setProcessingRequest(wvId);
    const res = await fetch(`/api/vendor/requests/${wvId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== wvId));
      // Ververs zodat een geaccepteerde bruiloft in de lijst verschijnt.
      if (action === "accept") router.refresh();
    }
    setProcessingRequest(null);
  }

  async function deleteTask(taskId: string, weddingId: string) {
    await fetch(`/api/weddings/${weddingId}/tasks/${taskId}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskWedding) return;
    setSavingTask(true);
    const res = await fetch(`/api/weddings/${newTaskWedding}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle, priority: "medium", category: "general" }),
    });
    if (res.ok) {
      const data = await res.json();
      const wedding = weddings.find((w) => w.id === newTaskWedding);
      setTasks((prev) => [...prev, { ...data.task, weddingTitle: wedding?.title ?? "" }]);
      setNewTaskTitle("");
      setShowNewTask(false);
    }
    setSavingTask(false);
  }

  return (
    <div className="px-4 py-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontSize: "clamp(1.375rem, 5vw, 1.875rem)", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--foreground)" }}>
          {greeting}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}
        </p>
      </div>

      {/* Stats */}
      {statsCards.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {statsCards.map((s) => {
            const Icon = ICON_MAP[s.icon] ?? Heart;
            return (
              <div key={s.label} className="ddp-card" style={{ padding: "1rem 1.125rem" }}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: "var(--foreground)", marginBottom: "3px" }}>{s.value}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 500 }}>{s.label}</div>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-blush-soft)" }}>
                    <Icon className="w-4 h-4" style={{ color: "var(--color-charcoal)" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dream Team-uitnodigingen (leverancier) */}
      {user.role === "vendor" && requests.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3" style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Nieuwe uitnodigingen
          </h2>
          <div className="space-y-2.5">
            {requests.map((r) => {
              const busy = processingRequest === r.id;
              return (
                <div key={r.id} className="ddp-card" style={{ padding: "1rem", borderColor: "var(--color-blush)", background: "var(--color-blush-soft)" }}>
                  <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--foreground)" }}>{r.weddingTitle}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                    {r.weddingVenue && <><MapPin className="w-3 h-3 flex-shrink-0" /><span>{r.weddingVenue}</span><span>·</span></>}
                    <span>{formatDate(r.weddingDate)}</span>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--muted)", margin: "0.625rem 0" }}>
                    Je bent uitgenodigd voor het Dream Team van deze bruiloft.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToRequest(r.id, "accept")}
                      disabled={busy}
                      className="ddp-btn-primary"
                      style={{ fontSize: "0.8125rem", padding: "0.4rem 1rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                    >
                      <Check className="w-3.5 h-3.5" /> {busy ? "Bezig…" : "Accepteren"}
                    </button>
                    <button
                      onClick={() => respondToRequest(r.id, "decline")}
                      disabled={busy}
                      className="ddp-btn-ghost"
                      style={{ fontSize: "0.8125rem", padding: "0.4rem 0.875rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                    >
                      <X className="w-3.5 h-3.5" /> Afwijzen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Bruiloften */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {user.role === "vendor" ? "Jouw bruiloften" : user.role === "couple" ? "Onze bruiloft" : "Bruiloften"}
          </h2>
          {(user.role === "planner" || user.role === "admin") && (
            <Link href="/weddings/new" className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.35rem 0.875rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Plus className="w-3.5 h-3.5" /> Nieuw
            </Link>
          )}
        </div>

        {weddings.length === 0 ? (
          <div className="ddp-card text-center py-10" style={{ color: "var(--muted)" }}>
            <Heart className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--accent-dark)" }} />
            <p className="font-medium text-sm">Nog geen bruiloften</p>
            {(user.role === "planner" || user.role === "admin") && (
              <Link href="/weddings/new" className="ddp-btn-primary inline-block mt-4 text-sm">Eerste bruiloft aanmaken</Link>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {weddings.map((w) => (
              <WeddingCard key={w.id} wedding={w} />
            ))}
          </div>
        )}
      </section>

      {/* Couple countdown */}
      {user.role === "couple" && weddings[0] && (
        <section className="mb-6">
          <div className="ddp-card text-center" style={{ background: "var(--color-blush-soft)", borderColor: "var(--color-blush)" }}>
            <p className="font-serif text-sm mb-1" style={{ color: "var(--muted)" }}>Nog</p>
            <div style={{ fontSize: "3.5rem", fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1, color: "var(--color-charcoal)", marginBottom: "4px" }}>
              {Math.max(0, weddings[0].days)}
            </div>
            <div className="font-serif" style={{ fontSize: "0.9rem", color: "var(--muted)" }}>dagen tot jullie dream day</div>
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--color-blush)" }}>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: "var(--muted)" }}>Datum</span>
                <span className="font-medium">{formatDate(weddings[0].date)}</span>
              </div>
              {weddings[0].venue && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted)" }}>Locatie</span>
                  <span className="font-medium text-right" style={{ maxWidth: "60%" }}>{weddings[0].venue}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Taken */}
      {user.role !== "vendor" && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Mijn taken</h2>
            {weddings.length > 0 && (
              <button
                onClick={() => setShowNewTask(true)}
                className="ddp-btn-primary"
                style={{ fontSize: "0.8125rem", padding: "0.35rem 0.875rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
              >
                <Plus className="w-3.5 h-3.5" /> Taak
              </button>
            )}
          </div>

          {/* New task form */}
          {showNewTask && (
            <form onSubmit={addTask} className="ddp-card mb-3" style={{ padding: "1rem" }}>
              <input
                autoFocus
                type="text"
                placeholder="Taak omschrijving…"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  outline: "none",
                  marginBottom: "0.625rem",
                }}
              />
              {weddings.length > 1 && (
                <select
                  value={newTaskWedding}
                  onChange={(e) => setNewTaskWedding(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.875rem",
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                    outline: "none",
                    marginBottom: "0.625rem",
                  }}
                >
                  {weddings.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
                </select>
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={savingTask || !newTaskTitle.trim()} className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.4rem 1rem" }}>
                  {savingTask ? "Opslaan…" : "Toevoegen"}
                </button>
                <button type="button" onClick={() => { setShowNewTask(false); setNewTaskTitle(""); }} className="ddp-btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.4rem 0.875rem" }}>
                  Annuleren
                </button>
              </div>
            </form>
          )}

          {tasks.length === 0 && !showNewTask ? (
            <div className="ddp-card text-center py-8" style={{ color: "var(--muted)" }}>
              <CheckSquare className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--accent-dark)" }} />
              <p className="font-medium text-sm">Geen openstaande taken</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="ddp-card flex items-start gap-3" style={{ padding: "0.875rem 1rem" }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{task.weddingTitle}</span>
                      <span className={`ddp-badge ${PRIORITY_COLORS[task.priority]}`} style={{ fontSize: "0.6rem" }}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
                          <Calendar className="w-3 h-3" /> {formatDateShort(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link
                      href={`/weddings/${task.weddingId}/tasks`}
                      style={{ padding: "5px", borderRadius: "6px", color: "var(--muted)", display: "flex" }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteTask(task.id, task.weddingId)}
                      style={{ padding: "5px", borderRadius: "6px", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", display: "flex" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function WeddingCard({ wedding }: { wedding: Wedding }) {
  const day = new Date(wedding.date).getDate();
  const month = new Intl.DateTimeFormat("nl-NL", { month: "short" }).format(new Date(wedding.date));
  const urgent = wedding.days < 30;
  const soon = wedding.days < 90;
  const badgeBg = urgent ? "var(--danger-bg)" : soon ? "var(--warning-bg)" : "var(--color-champagne)";
  const badgeColor = urgent ? "var(--danger)" : soon ? "var(--warning)" : "#7a5c1a";

  return (
    <Link href={`/weddings/${wedding.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="ddp-card ddp-card-hover" style={{ padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
        {/* Date badge */}
        <div style={{ width: "44px", height: "44px", minWidth: "44px", borderRadius: "12px", background: "var(--color-blush-soft)", border: "1px solid var(--color-blush)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "1.125rem", fontWeight: 700, lineHeight: 1, color: "var(--color-charcoal)" }}>{day}</span>
          <span style={{ fontSize: "0.5625rem", fontWeight: 600, lineHeight: 1, marginTop: "1px", textTransform: "uppercase", color: "var(--muted)" }}>{month}</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {wedding.title}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
            {wedding.venue && <><MapPin className="w-3 h-3 flex-shrink-0" /><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{wedding.venue}</span><span>·</span></>}
            <span style={{ whiteSpace: "nowrap" }}>{new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(wedding.date))}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`ddp-badge ${STATUS_COLORS[wedding.status] ?? "badge-neutral"}`} style={{ fontSize: "0.6rem" }}>
              {STATUS_LABELS[wedding.status] ?? wedding.status}
            </span>
            {wedding.isPremium && <span className="ddp-badge badge-champagne" style={{ fontSize: "0.6rem" }}>Premium</span>}
          </div>
        </div>

        {/* Days */}
        <div style={{ textAlign: "right", flexShrink: 0, background: badgeBg, borderRadius: "10px", padding: "0.35rem 0.6rem", minWidth: "48px" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: badgeColor }}>
            {Math.max(0, wedding.days)}
          </div>
          <div style={{ fontSize: "0.6rem", color: badgeColor, marginTop: "1px", opacity: 0.8 }}>
            {wedding.days > 0 ? "dagen" : "geweest"}
          </div>
        </div>
      </div>
    </Link>
  );
}
