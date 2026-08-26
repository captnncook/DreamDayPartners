"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ChevronRight, Check, X } from "lucide-react";
import ClaimRequests from "@/components/admin/ClaimRequests";
import { formatDateRange } from "@/lib/dateRange";
import DatePicker from "@/components/DatePicker";
import { useLang } from "@/components/LangProvider";
import type { T } from "@/lib/i18n";

function priorityMeta(t: T): Record<string, { label: string; color: string; weight: number }> {
  return {
    high:   { label: t.dashboardPage.priorityHigh,   color: "var(--gold-deep)",   weight: 700 },
    medium: { label: t.dashboardPage.priorityMedium, color: "var(--foreground)",  weight: 500 },
    low:    { label: t.dashboardPage.priorityLow,    color: "var(--muted-light)", weight: 400 },
  };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}
function formatDateShort(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(iso));
}

type Wedding = { id: string; title: string; venue?: string | null; date: string; endDate?: string | null; status: string; days: number };
type Task = { id: string; title: string; priority: string; dueDate?: string; weddingId: string; weddingTitle: string };
type Stats = { total: number; upcoming30: number; thisYear: number };
type VendorRequest = { id: string; weddingTitle: string; weddingVenue?: string | null; weddingDate: string; weddingEndDate?: string | null };
type CoupleSetup = {
  weddingId: string;
  hasBudget: boolean;
  hasTasks: boolean;
  hasGuests: boolean;
  hasVendors: boolean;
  hasDraaiboek: boolean;
} | null;
type PaymentDeadline = { wvId: string; weddingId: string; vendorName: string; label: string; due: string; days: number };
type MyReview = { ratingQuality: number; ratingCommunication: number; ratingReliability: number; ratingValue: number; wouldRecommend: boolean; text: string | null };
type PastWeddingVendor = { wvId: string; vendorId: string; name: string; category: string; reviewLinkUrl: string | null; myReview: MyReview | null };

interface Props {
  user: { id: string; name: string; role: string };
  greeting: string;
  stats: Stats;
  weddings: Wedding[];
  tasks: Task[];
  vendorRequests?: VendorRequest[];
  taskProgress?: { total: number; done: number };
  coupleSetup?: CoupleSetup;
  paymentDeadlines?: PaymentDeadline[];
  pastWeddingVendors?: PastWeddingVendor[];
  vendorWeddingLimitInfo?: { atLimit: boolean; count: number; limit: number } | null;
}

export default function DashboardClient({ user, greeting, stats, weddings, tasks: initialTasks, vendorRequests = [], taskProgress, coupleSetup, paymentDeadlines = [], pastWeddingVendors = [], vendorWeddingLimitInfo = null }: Props) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [requests, setRequests] = useState(vendorRequests);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [tasks, setTasks] = useState(initialTasks);
  // Sync met verse server-props na router.refresh() (bijv. na taken-seed),
  // anders blijft de lijst op de oude state hangen.
  useEffect(() => { setTasks(initialTasks); }, [initialTasks]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskWedding, setNewTaskWedding] = useState(weddings[0]?.id ?? "");
  const [savingTask, setSavingTask] = useState(false);
  const [reviewVendors, setReviewVendors] = useState(pastWeddingVendors);
  const [reviewTarget, setReviewTarget] = useState<PastWeddingVendor | null>(null);

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
    if (!confirm(t.dashboardPage.confirmDeleteTask)) return;
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
      <div className="mb-8" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-5)" }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: "clamp(1.5rem, 5vw, 2.125rem)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>
            {greeting}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}
          </p>
        </div>
        {user.role === "planner" && (
          <div style={{ display: "flex", gap: "var(--space-8)" }}>
            <StatInline value={stats.total} label={t.dashboardPage.statWeddings} />
            <StatInline value={stats.upcoming30} label={t.dashboardPage.statUpcoming30} />
          </div>
        )}
        {user.role === "vendor" && !vendorWeddingLimitInfo?.atLimit && (
          <Link href="/mijn-bruiloften" className="ddp-btn-secondary" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
            <Plus className="w-3.5 h-3.5" /> {t.dashboardPage.addWedding}
          </Link>
        )}
      </div>

      {/* Admin: accountverzoeken & platformactiviteit */}
      {user.role === "admin" && <AdminOverview t={t} />}

      {/* Gratis-limiet bereikt (leverancier) — blijft zichtbaar tot upgrade */}
      {user.role === "vendor" && vendorWeddingLimitInfo?.atLimit && (
        <section className="mb-8" style={{ background: "var(--sand)", borderLeft: "3px solid var(--gold)", borderRadius: "0 var(--radius-md) var(--radius-md) 0", padding: "1.25rem 1.5rem" }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--foreground)" }}>
                {t.dashboardPage.vendorLimitTitle.replace("{n}", String(vendorWeddingLimitInfo.limit))}
              </div>
              <p style={{ fontSize: "var(--text-base)", color: "var(--muted)", marginTop: "2px" }}>
                {t.dashboardPage.vendorLimitSub}
              </p>
            </div>
            <Link href="/leveranciers/mijn-profiel" className="ddp-btn-gold" style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "var(--text-base)", padding: "0.6rem 1.25rem", borderRadius: "var(--radius-full)", textDecoration: "none", whiteSpace: "nowrap" }}>
              {t.dashboardPage.upgradeToPremium}
            </Link>
          </div>
        </section>
      )}

      {/* Dream Team-uitnodigingen (leverancier) */}
      {user.role === "vendor" && requests.length > 0 && (
        <section className="mb-8">
          <h2 className="dash-section-title mb-3">{t.dashboardPage.newInvitationsTitle}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            {requests.map((r) => {
              const busy = processingRequest === r.id;
              return (
                <div key={r.id} style={{ borderLeft: "3px solid var(--gold)", background: "var(--sand)", borderRadius: "0 var(--radius-md) var(--radius-md) 0", padding: "1rem 1.25rem" }}>
                  <div className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--foreground)" }}>{r.weddingTitle}</div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", marginTop: "2px" }}>
                    {r.weddingVenue ? `${r.weddingVenue} · ` : ""}{formatDateRange(new Date(r.weddingDate), r.weddingEndDate ? new Date(r.weddingEndDate) : null)}
                  </div>
                  <p style={{ fontSize: "var(--text-base)", color: "var(--muted)", margin: "0.625rem 0" }}>
                    {t.dashboardPage.invitedToDreamTeam}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToRequest(r.id, "accept")}
                      disabled={busy}
                      className="ddp-btn-primary"
                      style={{ fontSize: "var(--text-base)", padding: "0.4rem 1rem" }}
                    >
                      <Check className="w-3.5 h-3.5" /> {busy ? t.dashboardPage.busy : t.vendors.accept}
                    </button>
                    <button
                      onClick={() => respondToRequest(r.id, "decline")}
                      disabled={busy}
                      className="ddp-btn-ghost"
                      style={{ fontSize: "var(--text-base)", padding: "0.4rem 0.875rem" }}
                    >
                      <X className="w-3.5 h-3.5" /> {t.vendors.decline}
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
          <div style={{ background: "var(--ink)", color: "var(--ink-text)", borderRadius: "var(--radius-lg)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-6)", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)" }}>{t.dashboardPage.today}</div>
              <div className="font-serif" style={{ fontSize: "var(--text-3xl)", fontWeight: 700, marginTop: "2px" }}>{w.title}</div>
              {w.venue && <div style={{ fontSize: "var(--text-base)", color: "var(--ink-muted)", marginTop: "2px" }}>{w.venue}</div>}
            </div>
            <Link
              href={`/weddings/${w.id}`}
              className="ddp-btn-gold"
              style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "var(--text-base)", padding: "0.6rem 1.25rem", borderRadius: "var(--radius-full)", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              {t.dashboardPage.openRunSheet}
            </Link>
          </div>
        </section>
      ))}

      {/* Naderende betaaldeadlines — feitelijk, uit echte boekingen */}
      {paymentDeadlines.length > 0 && (
        <section className="mb-8">
          <h2 className="dash-section-title mb-1">{t.dashboardPage.paymentDeadlinesTitle}</h2>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {paymentDeadlines.map((d) => {
              const urgent = d.days <= 3;
              const timing =
                d.days < 0 ? (Math.abs(d.days) === 1 ? t.dashboardPage.overdueOneDay : t.dashboardPage.overdueDays.replace("{n}", String(Math.abs(d.days))))
                : d.days === 0 ? t.dashboardPage.dueToday
                : (d.days === 1 ? t.dashboardPage.dueInOneDay : t.dashboardPage.dueInDays.replace("{n}", String(d.days)));
              return (
                <Link key={`${d.wvId}-${d.label}`} href={`/weddings/${d.weddingId}/vendors/${d.wvId}`} className="dash-row">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm" style={{ fontWeight: 600 }}>
                      {d.label} <span className="font-serif" style={{ fontWeight: 700 }}>{d.vendorName}</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{formatDate(d.due)}</div>
                  </div>
                  <span className="text-sm flex-shrink-0" style={{ fontWeight: 700, color: urgent ? "var(--gold-deep)" : "var(--muted)" }}>
                    {timing}
                  </span>
                  <span className="flex-shrink-0" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>→</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Signature-element: eerstvolgende bruiloft */}
      {heroWedding && <NextWeddingHero wedding={heroWedding} t={t} />}

      {/* Leverancier: agenda */}
      {user.role === "vendor" && weddings.length > 0 && (
        <section className="mb-8">
          <h2 className="dash-section-title mb-2">{t.dashboardPage.agendaTitle}</h2>
          <div>
            {[...weddings]
              .filter((w) => w.days >= -7)
              .sort((a, b) => a.days - b.days)
              .slice(0, 8)
              .map((w) => <WeddingRow key={w.id} wedding={w} t={t} />)}
          </div>
        </section>
      )}

      {/* Bruiloften — leverancier heeft de agenda hierboven al, admin beheert dit via de sidebar,
          bruidspaar heeft altijd maar één bruiloft (die staat al in de countdown hieronder) */}
      {user.role !== "vendor" && user.role !== "admin" && user.role !== "couple" && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="dash-section-title">{t.dashboardPage.weddingsTitle}</h2>
            {user.role === "planner" && (
              <Link href="/weddings/new" className="ddp-btn-primary" style={{ fontSize: "var(--text-base)", padding: "0.4rem 1rem" }}>
                <Plus className="w-3.5 h-3.5" /> {t.dashboardPage.newBtn}
              </Link>
            )}
          </div>

          {weddings.length === 0 ? (
            <div style={{ padding: "2.5rem 0", textAlign: "center" }}>
              <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>{t.dashboardPage.noWeddingsYet}</p>
              {user.role === "planner" && (
                <Link href="/weddings/new" className="ddp-btn-primary inline-flex mt-4 text-sm">{t.dashboardPage.createFirstWedding}</Link>
              )}
            </div>
          ) : restWeddings.length === 0 ? (
            heroWedding ? null : <p className="text-sm" style={{ color: "var(--muted)", padding: "1rem 0" }}>{t.dashboardPage.noOtherWeddingsPlanned}</p>
          ) : (
            <div>{restWeddings.map((w) => <WeddingRow key={w.id} wedding={w} t={t} />)}</div>
          )}
        </section>
      )}

      {/* Countdown (bruidspaar) */}
      {user.role === "couple" && weddings[0] && (
        <section className="mb-6">
          <div className="ddp-card text-center" style={{ background: "var(--sand)", borderColor: "var(--gold-light)" }}>
            <p className="font-serif text-sm mb-1" style={{ color: "var(--muted)" }}>{t.dashboardPage.countdownLabel}</p>
            <div style={{ fontSize: "3.5rem", fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1, color: "var(--gold-deep)", marginBottom: "4px" }}>
              {Math.max(0, weddings[0].days)}
            </div>
            <div className="font-serif" style={{ fontSize: "0.9rem", color: "var(--muted)" }}>{t.dashboardPage.daysUntilDreamDay}</div>
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--gold-light)" }}>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: "var(--muted)" }}>{t.dashboardPage.dateLabel}</span>
                <span className="font-medium">{formatDateRange(new Date(weddings[0].date), weddings[0].endDate ? new Date(weddings[0].endDate) : null)}</span>
              </div>
              {weddings[0].venue && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted)" }}>{t.dashboardPage.locationLabel}</span>
                  <span className="font-medium text-right" style={{ maxWidth: "60%" }}>{weddings[0].venue}</span>
                </div>
              )}
            </div>
            <Link
              href={`/weddings/${weddings[0].id}`}
              className="ddp-btn-gold mt-4"
              style={{ display: "inline-flex", background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "var(--text-base)", padding: "0.65rem 1.375rem", borderRadius: "var(--radius-full)", textDecoration: "none" }}
            >
              {t.dashboardPage.toOurWedding}
            </Link>
          </div>
        </section>
      )}

      {/* Setup-checklist (bruidspaar) — verdwijnt zodra alles is gestart */}
      {user.role === "couple" && coupleSetup && weddings[0] && weddings[0].days >= 0 && (
        <CoupleSetupChecklist setup={coupleSetup} onSeeded={() => router.refresh()} t={t} />
      )}

      {/* Reviews (bruidspaar) — verschijnt zodra de bruiloft achter de rug is */}
      {user.role === "couple" && weddings[0] && weddings[0].days < 0 && reviewVendors.length > 0 && (
        <section className="mb-8">
          <p style={{ fontSize: "var(--text-md)", color: "var(--muted)", lineHeight: 1.6, marginBottom: "var(--space-7)" }}>
            {t.dashboardPage.reviewsIntro}
          </p>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {reviewVendors.map((v) => (
              <div key={v.wvId} className="dash-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-serif" style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--foreground)" }}>{v.name}</div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", textTransform: "capitalize" }}>{v.category}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {v.reviewLinkUrl && (
                    <a href={v.reviewLinkUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--text-base)", color: "var(--muted)", textDecoration: "underline" }}>
                      {t.dashboardPage.reviewElsewhere}
                    </a>
                  )}
                  <button onClick={() => setReviewTarget(v)} className="ddp-btn-secondary" style={{ fontSize: "var(--text-base)", padding: "0.4rem 1rem" }}>
                    {v.myReview ? t.dashboardPage.editReview : t.dashboardPage.writeReview}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Vendor tasks */}
      {user.role === "vendor" && <VendorTasksSection weddings={weddings} t={t} />}

      {/* Taken — voor het bruidspaar niet meer relevant zodra de bruiloft achter de rug is */}
      {user.role !== "vendor" && user.role !== "admin" && !(user.role === "couple" && weddings[0] && weddings[0].days < 0) && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="dash-section-title">
                {user.role === "couple" ? t.tasks.title : t.dashboardPage.myTasks}
              </h2>
              {taskProgress && taskProgress.total > 0 && (
                <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", marginTop: "2px" }}>
                  {t.dashboardPage.doneOfTotal.replace("{done}", String(taskProgress.done)).replace("{total}", String(taskProgress.total))}
                </div>
              )}
            </div>
            {weddings.length > 0 && (
              <button
                onClick={() => setShowNewTask(true)}
                className="ddp-btn-primary"
                style={{ fontSize: "var(--text-base)", padding: "0.4rem 1rem" }}
              >
                <Plus className="w-3.5 h-3.5" /> {t.dashboardPage.taskBtn}
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
            <form onSubmit={addTask} style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginTop: "var(--space-5)", marginBottom: "var(--space-5)" }}>
              <input
                autoFocus
                type="text"
                placeholder={t.dashboardPage.taskPlaceholder}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="ddp-input"
                style={{ marginBottom: "var(--space-4)" }}
              />
              {weddings.length > 1 && (
                <select
                  value={newTaskWedding}
                  onChange={(e) => setNewTaskWedding(e.target.value)}
                  className="ddp-select"
                  style={{ marginBottom: "var(--space-4)" }}
                >
                  {weddings.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
                </select>
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={savingTask || !newTaskTitle.trim()} className="ddp-btn-primary" style={{ fontSize: "var(--text-base)", padding: "0.4rem 1rem" }}>
                  {savingTask ? t.dashboardPage.savingEllipsis : t.dashboardPage.addBtn}
                </button>
                <button type="button" onClick={() => { setShowNewTask(false); setNewTaskTitle(""); }} className="ddp-btn-ghost" style={{ fontSize: "var(--text-base)", padding: "0.4rem 0.875rem" }}>
                  {t.common.cancel}
                </button>
              </div>
            </form>
          )}

          {tasks.length === 0 && !showNewTask ? (
            <p className="text-sm" style={{ color: "var(--muted)", padding: "1.5rem 0" }}>{t.dashboardPage.noOpenTasks}</p>
          ) : (
            <div>
              {tasks.map((task) => {
                const meta = priorityMeta(t)[task.priority] ?? priorityMeta(t).medium;
                return (
                  <div key={task.id} className="dash-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--text-lg)", fontWeight: meta.weight, color: "var(--foreground)" }}>{task.title}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--muted)" }}>{task.weddingTitle}</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: meta.color }}>
                          {meta.label}
                        </span>
                        {task.dueDate && (
                          <span style={{ fontSize: "var(--text-sm)", color: "var(--muted)" }}>{formatDateShort(task.dueDate)}</span>
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

      {reviewTarget && weddings[0] && (
        <ReviewModal
          target={reviewTarget}
          weddingId={weddings[0].id}
          t={t}
          onClose={() => setReviewTarget(null)}
          onSaved={(myReview) => {
            setReviewVendors((prev) => prev.map((v) => (v.vendorId === reviewTarget.vendorId ? { ...v, myReview } : v)));
            setReviewTarget(null);
          }}
        />
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

function AdminOverview({ t }: { t: T }) {
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
        <StatInline value={loginsToday} label={t.dashboardPage.loginsToday} />
        <StatInline value={loginsWeek} label={t.dashboardPage.loginsWeek} />
        <div>
          <span className="font-serif" style={{ fontSize: "var(--text-4xl)", fontWeight: 700, letterSpacing: "-0.01em", color: errorCount7d > 0 ? "var(--gold-deep)" : "var(--foreground)" }}>{errorCount7d}</span>
          <span style={{ display: "block", fontSize: "var(--text-2xs)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "1px" }}>{t.dashboardPage.errorsThisWeek}</span>
        </div>
      </div>

      <ClaimRequests />

      {topVendors.length > 0 && (
        <section className="mb-8">
          <h2 className="dash-section-title mb-1">{t.dashboardPage.topVendorsTitle}</h2>
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
          <h2 className="dash-section-title mb-1">{t.dashboardPage.recentActivityTitle}</h2>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {events.map((e) => (
              <div key={e.id} className="dash-row">
                <div className="flex-1 min-w-0">
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: EVENT_META[e.type]?.color ?? "var(--muted)" }}>
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
      <span className="font-serif" style={{ fontSize: "var(--text-4xl)", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{value}</span>
      <span style={{ display: "block", fontSize: "var(--text-2xs)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "1px" }}>{label}</span>
    </div>
  );
}

function NextWeddingHero({ wedding, t }: { wedding: Wedding; t: T }) {
  const urgent = wedding.days <= 14;

  return (
    <section className="mb-8">
      <div className="ddp-section-label mb-2">{t.dashboardPage.nextWeddingLabel}</div>
      <div className="dash-hero" style={{ padding: "1.75rem", display: "flex", alignItems: "center", gap: "var(--space-8)", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "180px" }}>
          <div className="font-serif" style={{ fontSize: "var(--text-4xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--ink-text)" }}>
            {wedding.title}
          </div>
          <div style={{ fontSize: "var(--text-base)", color: "var(--ink-muted)", marginTop: "0.3rem" }}>
            {wedding.venue ? `${wedding.venue} · ` : ""}{formatDateRange(new Date(wedding.date), wedding.endDate ? new Date(wedding.endDate) : null)}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div className="font-serif" style={{ fontSize: "2.75rem", fontWeight: 700, lineHeight: 1, color: urgent ? "var(--gold)" : "var(--ink-text)", letterSpacing: "-0.02em" }}>
            {wedding.days}
          </div>
          <div style={{ fontSize: "var(--text-2xs)", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>
            {wedding.days === 0 ? t.dashboardPage.today.toLowerCase() : wedding.days === 1 ? t.dashboardPage.dayToGo : t.dashboardPage.daysToGo}
          </div>
        </div>

        <Link
          href={`/weddings/${wedding.id}`}
          className="ddp-btn-gold"
          style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "var(--text-base)", padding: "0.65rem 1.375rem", borderRadius: "var(--radius-full)", textDecoration: "none", whiteSpace: "nowrap" }}
        >
          {t.dashboardPage.openRunSheet}
        </Link>
      </div>
    </section>
  );
}

function WeddingRow({ wedding, t }: { wedding: Wedding; t: T }) {
  const d = new Date(wedding.date);
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("nl-NL", { month: "short" }).format(d);
  const isPast = wedding.days < 0;
  const urgent = wedding.days >= 0 && wedding.days <= 14;

  return (
    <Link href={`/weddings/${wedding.id}`} className="dash-row" style={{ opacity: isPast ? 0.55 : 1 }}>
      <div style={{ textAlign: "center", minWidth: "42px", flexShrink: 0 }}>
        <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", lineHeight: 1.1 }}>{day}</div>
        <div style={{ fontSize: "var(--text-2xs)", color: "var(--muted)", textTransform: "uppercase" }}>{month}</div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {wedding.title}
        </div>
        {wedding.venue && (
          <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {wedding.venue}
          </div>
        )}
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: "var(--text-lg)", fontWeight: urgent ? 700 : 600, color: urgent ? "var(--gold-deep)" : "var(--foreground)" }}>
          {isPast ? `${Math.abs(wedding.days)}${t.dashboardPage.agoSuffix}` : wedding.days === 0 ? t.dashboardPage.today : `${wedding.days}d`}
        </div>
      </div>
    </Link>
  );
}

function reviewCategories(t: T): { key: keyof Pick<MyReview, "ratingQuality" | "ratingCommunication" | "ratingReliability" | "ratingValue">; label: string }[] {
  return [
    { key: "ratingQuality", label: t.dashboardPage.ratingQuality },
    { key: "ratingCommunication", label: t.dashboardPage.ratingCommunication },
    { key: "ratingReliability", label: t.dashboardPage.ratingReliability },
    { key: "ratingValue", label: t.dashboardPage.ratingValue },
  ];
}

function StarPicker({ value, onChange, t }: { value: number; onChange: (v: number) => void; t: T }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "var(--text-3xl)", lineHeight: 1, color: "var(--gold)" }}
          aria-label={t.dashboardPage.starsAriaLabel.replace("{n}", String(n))}
        >
          {n <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

function ReviewModal({
  target, weddingId, onClose, onSaved, t,
}: {
  target: PastWeddingVendor;
  weddingId: string;
  onClose: () => void;
  onSaved: (review: MyReview) => void;
  t: T;
}) {
  const [ratings, setRatings] = useState({
    ratingQuality: target.myReview?.ratingQuality ?? 5,
    ratingCommunication: target.myReview?.ratingCommunication ?? 5,
    ratingReliability: target.myReview?.ratingReliability ?? 5,
    ratingValue: target.myReview?.ratingValue ?? 5,
  });
  const [wouldRecommend, setWouldRecommend] = useState(target.myReview?.wouldRecommend ?? true);
  const [text, setText] = useState(target.myReview?.text ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/catalogus/${target.vendorId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weddingId, ...ratings, wouldRecommend, text: text.trim() || null }),
    });
    if (res.ok) {
      onSaved({ ...ratings, wouldRecommend, text: text.trim() || null });
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? t.dashboardPage.saveFailed);
    }
    setSaving(false);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--background)", borderRadius: "16px", padding: "1.75rem", maxWidth: "420px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}
      >
        <h2 className="font-serif" style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "var(--space-1)" }}>{t.dashboardPage.reviewModalTitle.replace("{name}", target.name)}</h2>
        <p style={{ fontSize: "var(--text-base)", color: "var(--muted)", marginBottom: "var(--space-7)" }}>{t.dashboardPage.reviewModalSub}</p>

        <div className="flex flex-col gap-3 mb-4">
          {reviewCategories(t).map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span style={{ fontSize: "var(--text-md)", color: "var(--foreground)" }}>{label}</span>
              <StarPicker value={ratings[key]} onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))} t={t} />
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 mb-4" style={{ cursor: "pointer" }}>
          <input type="checkbox" checked={wouldRecommend} onChange={(e) => setWouldRecommend(e.target.checked)} />
          <span style={{ fontSize: "var(--text-md)", color: "var(--foreground)" }}>{t.dashboardPage.recommendLabel}</span>
        </label>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={t.dashboardPage.reviewTextPlaceholder}
          className="ddp-input resize-none mb-4"
        />

        {error && <p style={{ fontSize: "var(--text-base)", color: "var(--danger)", marginBottom: "var(--space-5)" }}>{error}</p>}

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="ddp-btn-primary">
            {saving ? t.dashboardPage.savingEllipsis : t.dashboardPage.postReview}
          </button>
          <button onClick={onClose} className="ddp-btn-secondary">{t.common.cancel}</button>
        </div>
      </div>
    </div>
  );
}

function VendorTasksSection({ weddings, t }: { weddings: Wedding[]; t: T }) {
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
    if (!confirm(t.dashboardPage.confirmDeleteTask)) return;
    await fetch(`/api/weddings/${weddingId}/tasks/${id}`, { method: "DELETE" });
    setTasks(prev => prev.filter(task => task.id !== id));
  }

  if (!loaded) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="dash-section-title">{t.dashboardPage.myTasks}</h2>
        {weddings.length > 0 && !adding && (
          <button onClick={() => setAdding(true)} className="ddp-btn-primary" style={{ fontSize: "var(--text-base)", padding: "0.4rem 1rem" }}>
            <Plus className="w-3.5 h-3.5" /> {t.dashboardPage.taskBtn}
          </button>
        )}
      </div>
      {adding && (
        <form onSubmit={addTask} style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginTop: "var(--space-5)", marginBottom: "var(--space-5)" }}>
          <input autoFocus type="text" placeholder={t.dashboardPage.taskPlaceholder} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="ddp-input" style={{ marginBottom: "var(--space-4)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            {weddings.length > 1 && (
              <select value={form.weddingId} onChange={e => setForm(f => ({ ...f, weddingId: e.target.value }))} className="ddp-select">
                {weddings.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
              </select>
            )}
            <DatePicker value={form.dueDate} onChange={v => setForm(f => ({ ...f, dueDate: v }))} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving || !form.title.trim()} className="ddp-btn-primary" style={{ fontSize: "var(--text-base)", padding: "0.4rem 1rem" }}>
              {saving ? t.dashboardPage.savingEllipsis : t.dashboardPage.addBtn}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="ddp-btn-ghost" style={{ fontSize: "var(--text-base)", padding: "0.4rem 0.875rem" }}>
              {t.common.cancel}
            </button>
          </div>
        </form>
      )}
      {tasks.length === 0 && !adding ? (
        <p className="text-sm" style={{ color: "var(--muted)", padding: "1.5rem 0" }}>{t.dashboardPage.noOpenTasks}</p>
      ) : (
        <div>
          {tasks.map(t => (
            <div key={t.id} className="dash-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "var(--text-lg)", fontWeight: 500, color: "var(--foreground)" }}>{t.title}</div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
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

function CoupleSetupChecklist({ setup, onSeeded, t }: {
  setup: NonNullable<CoupleSetup>;
  onSeeded: () => void;
  t: T;
}) {
  const [seeding, setSeeding] = useState(false);

  async function seedTasks() {
    setSeeding(true);
    const res = await fetch(`/api/weddings/${setup.weddingId}/tasks/seed`, { method: "POST" });
    setSeeding(false);
    if (res.ok) onSeeded();
  }

  // Alleen échte, controleerbare acties tellen als voltooid.
  const dp = t.dashboardPage;
  const steps: { key: string; label: string; sub: string; done: boolean; href?: string; action?: () => void }[] = [
    { key: "wedding", label: dp.stepWeddingLabel, sub: dp.stepWeddingSub, done: true },
    { key: "budget", label: dp.stepBudgetLabel, sub: dp.stepBudgetSub, done: setup.hasBudget, href: `/weddings/${setup.weddingId}/budget` },
    { key: "tasks", label: dp.stepTasksLabel, sub: dp.stepTasksSub, done: setup.hasTasks, action: seedTasks },
    { key: "guests", label: dp.stepGuestsLabel, sub: dp.stepGuestsSub, done: setup.hasGuests, href: "/guests" },
    { key: "vendors", label: dp.stepVendorsLabel, sub: dp.stepVendorsSub, done: setup.hasVendors, href: "/dream-team" },
    { key: "draaiboek", label: dp.stepDraaiboekLabel, sub: dp.stepDraaiboekSub, done: setup.hasDraaiboek, href: "/draaiboek" },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-baseline justify-between mb-2 gap-3 flex-wrap">
        <h2 className="dash-section-title">{dp.preparationTitle}</h2>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          {dp.startedOfTotal.split("{done}")[0]}
          <strong style={{ color: "var(--foreground)" }}>{doneCount}</strong>
          {dp.startedOfTotal.split("{done}")[1].replace("{total}", String(steps.length))}
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden mb-1" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full" style={{ width: `${(doneCount / steps.length) * 100}%`, background: "var(--gold)", transition: "width 500ms var(--ease-out)" }} />
      </div>
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        {steps.map((step) => {
          const inner = (
            <>
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: "20px", height: "20px", borderRadius: "50%", border: step.done ? "none" : "1.5px solid var(--border)", background: step.done ? "var(--gold)" : "transparent" }}
              >
                {step.done && <Check className="w-3 h-3" style={{ color: "var(--ink)" }} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm" style={{ fontWeight: step.done ? 500 : 600, color: step.done ? "var(--muted-light)" : "var(--foreground)" }}>
                  {step.label}
                </span>
                {!step.done && (
                  <span className="block text-xs mt-0.5" style={{ color: "var(--muted)" }}>{step.sub}</span>
                )}
              </span>
              {!step.done && (
                <span className="flex-shrink-0 text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                  {step.action ? (seeding ? dp.seeding : dp.prepareBtn) : "→"}
                </span>
              )}
            </>
          );

          if (step.done) {
            return <div key={step.key} className="dash-row">{inner}</div>;
          }
          if (step.action) {
            return (
              <button key={step.key} onClick={step.action} disabled={seeding} className="dash-row w-full text-left" style={{ background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                {inner}
              </button>
            );
          }
          return (
            <Link key={step.key} href={step.href!} className="dash-row">
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
