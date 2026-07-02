"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ChevronRight, Check, X } from "lucide-react";
import ClaimRequests from "@/components/admin/ClaimRequests";

const PRIORITY_META: Record<string, { label: string; color: string; weight: number }> = {
  high:   { label: "Urgent", color: "var(--gold-deep)",   weight: 700 },
  medium: { label: "Middel", color: "var(--foreground)",  weight: 500 },
  low:    { label: "Laag",   color: "var(--muted-light)", weight: 400 },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}
function formatDateShort(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(iso));
}

type Wedding = { id: string; title: string; venue?: string | null; date: string; status: string; isPremium: boolean; days: number };
type Task = { id: string; title: string; priority: string; dueDate?: string; weddingId: string; weddingTitle: string };
type Stats = { total: number; upcoming30: number; thisYear: number };
type VendorRequest = { id: string; weddingTitle: string; weddingVenue?: string | null; weddingDate: string };

interface Props {
  user: { id: string; name: string; role: string };
  greeting: string;
  stats: Stats;
  weddings: Wedding[];
  tasks: Task[];
  vendorRequests?: VendorRequest[];
  taskProgress?: { total: number; done: number };
}

export default function DashboardClient({ user, greeting, stats, weddings, tasks: initialTasks, vendorRequests = [], taskProgress }: Props) {
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
    if (!confirm("Taak verwijderen?")) return;
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

  // De eerstvolgende bruiloft krijgt een eigen, prominente plek (niet voor bruidspaar — die heeft al een eigen countdown-blok).
  const sortedWeddings = [...weddings].sort((a, b) => {
    const aUp = a.days >= 0, bUp = b.days >= 0;
    if (aUp && !bUp) return -1;
    if (!aUp && bUp) return 1;
    return a.days - b.days;
  });
  const heroWedding = (user.role === "planner" || user.role === "team_member")
    ? sortedWeddings.find((w) => w.days >= 0) ?? null
    : null;
  const restWeddings = heroWedding ? sortedWeddings.filter((w) => w.id !== heroWedding.id) : sortedWeddings;

  return (
    <div className="px-4 py-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: "clamp(1.5rem, 5vw, 2.125rem)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>
            {greeting}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}
          </p>
        </div>
        {user.role === "planner" && (
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <StatInline value={stats.total} label="bruiloften" />
            <StatInline value={stats.upcoming30} label="komende 30 dagen" />
          </div>
        )}
      </div>

      {/* Admin: accountverzoeken & platformactiviteit */}
      {user.role === "admin" && <AdminOverview />}

      {/* Dream Team-uitnodigingen (leverancier) */}
      {user.role === "vendor" && requests.length > 0 && (
        <section className="mb-8">
          <h2 className="dash-section-title mb-3">Nieuwe uitnodigingen</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {requests.map((r) => {
              const busy = processingRequest === r.id;
              return (
                <div key={r.id} style={{ borderLeft: "3px solid var(--gold)", background: "var(--sand)", borderRadius: "0 var(--radius-md) var(--radius-md) 0", padding: "1rem 1.25rem" }}>
                  <div className="font-serif" style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--foreground)" }}>{r.weddingTitle}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
                    {r.weddingVenue ? `${r.weddingVenue} · ` : ""}{formatDate(r.weddingDate)}
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--muted)", margin: "0.625rem 0" }}>
                    Je bent uitgenodigd voor het Dream Team van deze bruiloft.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToRequest(r.id, "accept")}
                      disabled={busy}
                      className="ddp-btn-primary"
                      style={{ fontSize: "0.8125rem", padding: "0.4rem 1rem" }}
                    >
                      <Check className="w-3.5 h-3.5" /> {busy ? "Bezig…" : "Accepteren"}
                    </button>
                    <button
                      onClick={() => respondToRequest(r.id, "decline")}
                      disabled={busy}
                      className="ddp-btn-ghost"
                      style={{ fontSize: "0.8125rem", padding: "0.4rem 0.875rem" }}
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

      {/* Vandaag: trouwdag (leverancier) */}
      {user.role === "vendor" && weddings.filter((w) => w.days === 0).map((w) => (
        <section key={w.id} className="mb-8">
          <div style={{ background: "var(--ink)", color: "var(--ink-text)", borderRadius: "var(--radius-lg)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)" }}>Vandaag</div>
              <div className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2px" }}>{w.title}</div>
              {w.venue && <div style={{ fontSize: "0.8125rem", color: "var(--ink-muted)", marginTop: "2px" }}>{w.venue}</div>}
            </div>
            <Link
              href={`/weddings/${w.id}`}
              style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "0.8125rem", padding: "0.6rem 1.25rem", borderRadius: "var(--radius-full)", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Open draaiboek
            </Link>
          </div>
        </section>
      ))}

      {/* Signature-element: eerstvolgende bruiloft */}
      {heroWedding && <NextWeddingHero wedding={heroWedding} />}

      {/* Leverancier: agenda */}
      {user.role === "vendor" && weddings.length > 0 && (
        <section className="mb-8">
          <h2 className="dash-section-title mb-2">Agenda</h2>
          <div>
            {[...weddings]
              .filter((w) => w.days >= -7)
              .sort((a, b) => a.days - b.days)
              .slice(0, 8)
              .map((w) => <WeddingRow key={w.id} wedding={w} />)}
          </div>
        </section>
      )}

      {/* Bruiloften — leverancier heeft de agenda hierboven al, admin beheert dit via de sidebar */}
      {user.role !== "vendor" && user.role !== "admin" && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="dash-section-title">
              {user.role === "couple" ? "Onze bruiloft" : "Bruiloften"}
            </h2>
            {user.role === "planner" && (
              <Link href="/weddings/new" className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.4rem 1rem" }}>
                <Plus className="w-3.5 h-3.5" /> Nieuw
              </Link>
            )}
          </div>

          {weddings.length === 0 ? (
            <div style={{ padding: "2.5rem 0", textAlign: "center" }}>
              <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>Nog geen bruiloften</p>
              {user.role === "planner" && (
                <Link href="/weddings/new" className="ddp-btn-primary inline-flex mt-4 text-sm">Eerste bruiloft aanmaken</Link>
              )}
            </div>
          ) : restWeddings.length === 0 ? (
            heroWedding ? null : <p className="text-sm" style={{ color: "var(--muted)", padding: "1rem 0" }}>Geen andere bruiloften gepland.</p>
          ) : (
            <div>{restWeddings.map((w) => <WeddingRow key={w.id} wedding={w} />)}</div>
          )}
        </section>
      )}

      {/* Countdown (bruidspaar) */}
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

      {/* Vendor tasks */}
      {user.role === "vendor" && <VendorTasksSection weddings={weddings} />}

      {/* Taken */}
      {user.role !== "vendor" && user.role !== "admin" && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="dash-section-title">
                {user.role === "couple" ? "Taken" : "Mijn taken"}
              </h2>
              {taskProgress && taskProgress.total > 0 && (
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
                  {taskProgress.done} van {taskProgress.total} afgerond
                </div>
              )}
            </div>
            {weddings.length > 0 && (
              <button
                onClick={() => setShowNewTask(true)}
                className="ddp-btn-primary"
                style={{ fontSize: "0.8125rem", padding: "0.4rem 1rem" }}
              >
                <Plus className="w-3.5 h-3.5" /> Taak
              </button>
            )}
          </div>

          {taskProgress && taskProgress.total > 0 && (
            <div style={{ height: "3px", borderRadius: "999px", background: "var(--border)", overflow: "hidden", margin: "0.75rem 0 1rem" }}>
              <div style={{ height: "100%", width: `${Math.round((taskProgress.done / taskProgress.total) * 100)}%`, background: "var(--gold)" }} />
            </div>
          )}

          {/* New task form */}
          {showNewTask && (
            <form onSubmit={addTask} style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginTop: "0.75rem", marginBottom: "0.75rem" }}>
              <input
                autoFocus
                type="text"
                placeholder="Taak omschrijving…"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="ddp-input"
                style={{ marginBottom: "0.625rem" }}
              />
              {weddings.length > 1 && (
                <select
                  value={newTaskWedding}
                  onChange={(e) => setNewTaskWedding(e.target.value)}
                  className="ddp-select"
                  style={{ marginBottom: "0.625rem" }}
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
            <p className="text-sm" style={{ color: "var(--muted)", padding: "1.5rem 0" }}>Geen openstaande taken.</p>
          ) : (
            <div>
              {tasks.map((task) => {
                const meta = PRIORITY_META[task.priority] ?? PRIORITY_META.medium;
                return (
                  <div key={task.id} className="dash-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.9375rem", fontWeight: meta.weight, color: "var(--foreground)" }}>{task.title}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{task.weddingTitle}</span>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: meta.color }}>
                          {meta.label}
                        </span>
                        {task.dueDate && (
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{formatDateShort(task.dueDate)}</span>
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
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

const EVENT_META: Record<string, { color: string }> = {
  password_reset:     { color: "var(--muted)" },
  email_change:       { color: "var(--foreground)" },
  vendor_type_change: { color: "var(--foreground)" },
  claim_approved:     { color: "var(--gold-deep)" },
  claim_rejected:     { color: "var(--muted-light)" },
  claim_reminder:     { color: "var(--gold-deep)" },
  account_created:    { color: "var(--gold-deep)" },
  error:               { color: "var(--gold-deep)" },
};

type AdminEvent = { id: string; type: string; label: string; message: string; targetEmail?: string | null; createdAt: string };
type TopVendor = { id: string; name: string; category: string; viewCount: number };

function AdminOverview() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [topVendors, setTopVendors] = useState<TopVendor[]>([]);
  const [loginsToday, setLoginsToday] = useState(0);
  const [loginsWeek, setLoginsWeek] = useState(0);
  const [errorCount7d, setErrorCount7d] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/overview").then(r => r.ok ? r.json() : null).then(d => {
      if (d) {
        setEvents(d.recentEvents ?? []);
        setTopVendors(d.topVendors ?? []);
        setLoginsToday(d.loginsToday ?? 0);
        setLoginsWeek(d.loginsWeek ?? 0);
        setErrorCount7d(d.errorCount7d ?? 0);
      }
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  return (
    <>
      {/* Platformactiviteit — inline cijfers, geen kaartgrid */}
      <div className="flex flex-wrap gap-x-8 gap-y-3 mb-8 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <StatInline value={loginsToday} label="logins vandaag" />
        <StatInline value={loginsWeek} label="logins deze week" />
        <div>
          <span className="font-serif" style={{ fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.01em", color: errorCount7d > 0 ? "var(--gold-deep)" : "var(--foreground)" }}>{errorCount7d}</span>
          <span style={{ display: "block", fontSize: "0.625rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "1px" }}>fouten deze week</span>
        </div>
      </div>

      <ClaimRequests />

      {topVendors.length > 0 && (
        <section className="mb-8">
          <h2 className="dash-section-title mb-1">Meest bekeken profielen</h2>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {topVendors.map((v) => (
              <Link key={v.id} href={`/leveranciers/${v.id}`} className="dash-row">
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-sm truncate" style={{ fontWeight: 700, color: "var(--foreground)" }}>{v.name}</div>
                  <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{v.category}</div>
                </div>
                <div className="text-sm flex-shrink-0" style={{ fontWeight: 700, color: "var(--gold-deep)" }}>{v.viewCount}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section>
          <h2 className="dash-section-title mb-1">Recente activiteit</h2>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {events.map((e) => (
              <div key={e.id} className="dash-row">
                <div className="flex-1 min-w-0">
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: EVENT_META[e.type]?.color ?? "var(--muted)" }}>
                    {e.label}
                  </span>
                  <div className="text-sm mt-0.5" style={{ color: "var(--foreground)" }}>{e.message}</div>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: "var(--muted-light)" }}>{formatDateShort(e.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function StatInline({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: "right" }}>
      <span className="font-serif" style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{value}</span>
      <span style={{ display: "block", fontSize: "0.625rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "1px" }}>{label}</span>
    </div>
  );
}

function NextWeddingHero({ wedding }: { wedding: Wedding }) {
  const d = new Date(wedding.date);
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("nl-NL", { month: "short" }).format(d).toUpperCase();
  const urgent = wedding.days <= 14;

  return (
    <section className="mb-8">
      <div className="ddp-section-label mb-2">Eerstvolgende bruiloft</div>
      <div className="dash-hero" style={{ padding: "1.75rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
        <div className="dash-ring" style={{ width: "76px", height: "76px" }}>
          <span className="dash-ring-month" style={{ fontSize: "0.5625rem", fontWeight: 700, letterSpacing: "0.08em" }}>{month}</span>
          <span className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>{day}</span>
        </div>

        <div style={{ flex: 1, minWidth: "180px" }}>
          <div className="font-serif" style={{ fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--ink-text)" }}>
            {wedding.title}
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--ink-muted)", marginTop: "0.3rem" }}>
            {wedding.venue ? `${wedding.venue} · ` : ""}{formatDate(wedding.date)}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div className="font-serif" style={{ fontSize: "2.75rem", fontWeight: 700, lineHeight: 1, color: urgent ? "var(--gold)" : "var(--ink-text)", letterSpacing: "-0.02em" }}>
            {wedding.days}
          </div>
          <div style={{ fontSize: "0.625rem", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>
            {wedding.days === 0 ? "vandaag" : wedding.days === 1 ? "dag te gaan" : "dagen te gaan"}
          </div>
        </div>

        <Link
          href={`/weddings/${wedding.id}`}
          style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "0.8125rem", padding: "0.65rem 1.375rem", borderRadius: "var(--radius-full)", textDecoration: "none", whiteSpace: "nowrap" }}
        >
          Open draaiboek
        </Link>
      </div>
    </section>
  );
}

function WeddingRow({ wedding }: { wedding: Wedding }) {
  const d = new Date(wedding.date);
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("nl-NL", { month: "short" }).format(d);
  const isPast = wedding.days < 0;
  const urgent = wedding.days >= 0 && wedding.days <= 14;

  return (
    <Link href={`/weddings/${wedding.id}`} className="dash-row" style={{ opacity: isPast ? 0.55 : 1 }}>
      <div style={{ textAlign: "center", minWidth: "42px", flexShrink: 0 }}>
        <div style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", lineHeight: 1.1 }}>{day}</div>
        <div style={{ fontSize: "0.625rem", color: "var(--muted)", textTransform: "uppercase" }}>{month}</div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-serif" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {wedding.title}
        </div>
        {wedding.venue && (
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {wedding.venue}
          </div>
        )}
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: "0.9375rem", fontWeight: urgent ? 700 : 600, color: urgent ? "var(--gold-deep)" : "var(--foreground)" }}>
          {isPast ? `${Math.abs(wedding.days)}d geleden` : wedding.days === 0 ? "Vandaag" : `${wedding.days}d`}
        </div>
      </div>
    </Link>
  );
}

function VendorTasksSection({ weddings }: { weddings: Wedding[] }) {
  const [tasks, setTasks] = useState<Array<{ id: string; title: string; dueDate?: string; weddingId: string; weddingTitle: string }>>([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", weddingId: weddings[0]?.id ?? "", dueDate: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/vendor/tasks").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.tasks) setTasks(d.tasks);
      setLoaded(true);
    });
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.weddingId) return;
    setSaving(true);
    const res = await fetch("/api/vendor/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const d = await res.json();
      setTasks(prev => [...prev, d.task]);
      setForm({ title: "", weddingId: weddings[0]?.id ?? "", dueDate: "" });
      setAdding(false);
    }
    setSaving(false);
  }

  async function deleteTask(id: string, weddingId: string) {
    if (!confirm("Taak verwijderen?")) return;
    await fetch(`/api/weddings/${weddingId}/tasks/${id}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  if (!loaded) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="dash-section-title">Mijn taken</h2>
        {weddings.length > 0 && !adding && (
          <button onClick={() => setAdding(true)} className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.4rem 1rem" }}>
            <Plus className="w-3.5 h-3.5" /> Taak
          </button>
        )}
      </div>
      {adding && (
        <form onSubmit={addTask} style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginTop: "0.75rem", marginBottom: "0.75rem" }}>
          <input autoFocus type="text" placeholder="Taak omschrijving…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="ddp-input" style={{ marginBottom: "0.625rem" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.625rem" }}>
            {weddings.length > 1 && (
              <select value={form.weddingId} onChange={e => setForm(f => ({ ...f, weddingId: e.target.value }))} className="ddp-select">
                {weddings.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
              </select>
            )}
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="ddp-input" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving || !form.title.trim()} className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.4rem 1rem" }}>
              {saving ? "Opslaan…" : "Toevoegen"}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="ddp-btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.4rem 0.875rem" }}>
              Annuleren
            </button>
          </div>
        </form>
      )}
      {tasks.length === 0 && !adding ? (
        <p className="text-sm" style={{ color: "var(--muted)", padding: "1.5rem 0" }}>Geen openstaande taken.</p>
      ) : (
        <div>
          {tasks.map(t => (
            <div key={t.id} className="dash-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--foreground)" }}>{t.title}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>{t.weddingTitle}</span>
                  {t.dueDate && <span>{formatDateShort(t.dueDate)}</span>}
                </div>
              </div>
              <button onClick={() => deleteTask(t.id, t.weddingId)} style={{ padding: "5px", borderRadius: "6px", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
