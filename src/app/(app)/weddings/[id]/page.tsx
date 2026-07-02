import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import VendorDashboardInline from "@/components/VendorDashboardInline";
import VendorNotesEditor from "@/components/VendorNotesEditor";
import TabNav from "./TabNav";
import { getServerLang } from "@/lib/server-lang";

function formatDate(date: Date, lang: string) {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

function daysUntil(date: Date) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function WeddingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;
  const { lang, t } = await getServerLang();
  const tw = t.wedding;

  // Role-based access filter
  const accessWhere =
    user.role === "admin"
      ? { id }
      : user.role === "vendor"
      ? { id, vendors: { some: { vendor: { userId: user.id }, portalAccess: true } } }
      : { id, teamMembers: { some: { userId: user.id } } };

  let wedding;
  try {
    wedding = await prisma.wedding.findFirst({
      where: accessWhere,
      include: {
        owner: true,
        teamMembers: { include: { user: true } },
        vendors: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
                category: true,
                contactPerson: true,
                email: true,
                phone: true,
                userId: true,
              },
            },
          },
        },
        budget: { include: { items: true } },
        tasks: {
          include: { assignedUser: { select: { id: true, name: true } } },
          orderBy: { dueDate: "asc" },
          take: 5,
        },
        guests: { select: { id: true, rsvpStatus: true } },
        draaiboeken: {
          include: {
            items: {
              orderBy: { sortOrder: "asc" },
              take: 8,
              include: { vendor: { select: { name: true } } },
            },
          },
          take: 1,
        },
        _count: { select: { guests: true, tasks: true } },
      },
    });
  } catch (err) {
    console.error("[WeddingDetailPage] DB error:", err);
    throw new Error(`Database fout: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!wedding) notFound();

  // For vendor users: find their own Vendor.id so we can filter the dashboard list
  let ownVendorId: string | null = null;
  if (user.role === "vendor") {
    const ownVendor = await prisma.vendor.findFirst({ where: { userId: user.id }, select: { id: true } });
    ownVendorId = ownVendor?.id ?? null;
  }

  const days = daysUntil(wedding.date);
  const totalBudget = wedding.budget?.totalAmount ?? 0;
  const spent = wedding.budget?.items.reduce((s, i) => s + (i.actual ?? 0), 0) ?? 0;
  const budgetPct = totalBudget > 0 ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0;
  const tasksDone = wedding.tasks.filter((t) => t.status === "done").length;
  const tasksOpen = wedding.tasks.filter((t) => t.status !== "done").length;
  const guestConfirmed = wedding.guests.filter((g) => g.rsvpStatus === "confirmed").length;
  const draaiboek = wedding.draaiboeken[0] ?? null;

  const isVendor = user.role === "vendor";
  const urgent = days >= 0 && days <= 14;
  const d = new Date(wedding.date);
  const dayNum = d.getDate();
  const monthShort = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "nl-NL", { month: "short" }).format(d).toUpperCase();

  return (
    <div className="px-4 py-6 md:p-8 max-w-5xl mx-auto">

      {/* Breadcrumb */}
      <Link href="/dashboard" className="inline-flex items-center gap-1 mb-5 text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
        {tw.backToDashboard}
      </Link>

      {/* Header — dark hero met gouden datumring */}
      <div className="dash-hero mb-6" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", gap: "1.375rem", flexWrap: "wrap" }}>
        <div className="dash-ring" style={{ width: "64px", height: "64px" }}>
          <span className="dash-ring-month" style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.08em" }}>{monthShort}</span>
          <span className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1 }}>{dayNum}</span>
        </div>

        <div style={{ flex: 1, minWidth: "200px" }}>
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <h1 className="font-serif" style={{ fontSize: "clamp(1.25rem, 4.5vw, 1.625rem)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--ink-text)" }}>
              {wedding.title}
            </h1>
            {wedding.isPremium && (
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gold)" }}>Premium</span>
            )}
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            {formatDate(wedding.date, lang)}{wedding.venue ? ` · ${wedding.venue}` : ""}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="font-serif" style={{ fontSize: "2.25rem", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", color: urgent ? "var(--gold)" : "var(--ink-text)" }}>
            {Math.max(0, days)}
          </div>
          <div style={{ fontSize: "0.625rem", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>
            {days > 0 ? tw.days : tw.passed}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabNav id={id} isVendor={isVendor} />

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main column */}
        <div className="lg:col-span-2">

          {/* Inline stats — geen kaartgrid */}
          {!isVendor && (
            <div className="flex flex-wrap gap-x-8 gap-y-3 mb-8 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                { value: guestConfirmed, label: `${tw.confirmed} · ${tw.of} ${wedding._count.guests} ${tw.guests}` },
                { value: tasksOpen, label: `${tw.tasksOpen} · ${tasksDone} ${tw.completed}` },
                { value: wedding.vendors.length, label: tw.vendors },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{stat.value}</span>
                  <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "1px" }}>{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Draaiboek preview */}
          {draaiboek && (
            <section className="mb-8">
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="dash-section-title">{tw.runSheet}</h3>
                <Link href={`/weddings/${id}/draaiboek`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                  {tw.full}
                </Link>
              </div>
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {draaiboek.items.map((item) => (
                  <div key={item.id} className="dash-row" style={{ padding: "0.6rem 0.25rem" }}>
                    <span className="font-mono text-sm flex-shrink-0" style={{ fontWeight: 700, width: "3.25rem", color: "var(--gold-deep)" }}>{item.startTime}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.title}</div>
                      {item.location && <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{item.location}</div>}
                    </div>
                    {item.vendor && (
                      <span className="font-serif text-xs flex-shrink-0" style={{ fontWeight: 700, color: "var(--muted)" }}>{item.vendor.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Taken — niet voor vendors */}
          {!isVendor && (
            <section className="mb-8">
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="dash-section-title">{tw.recentTasks}</h3>
                <Link href={`/weddings/${id}/tasks`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                  {tw.allTasks}
                </Link>
              </div>
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {wedding.tasks.length === 0 && (
                  <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>{tw.noTasks}</p>
                )}
                {wedding.tasks.slice(0, 4).map((task) => {
                  const isDone = task.status === "done";
                  return (
                    <div key={task.id} className="dash-row" style={{ padding: "0.6rem 0.25rem" }}>
                      <span
                        className={`flex-1 text-sm truncate${isDone ? " line-through" : ""}`}
                        style={{ color: isDone ? "var(--muted-light)" : "var(--foreground)", fontWeight: isDone ? 400 : 500 }}
                      >
                        {task.title}
                      </span>
                      {task.status === "in_progress" && (
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold-deep)", flexShrink: 0 }}>Bezig</span>
                      )}
                      {task.assignedUser && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--gold)", color: "var(--ink)", fontSize: "0.625rem" }}>
                          {task.assignedUser.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Budget — niet voor vendors */}
          {!isVendor && wedding.budget && (
            <section className="mb-8">
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="dash-section-title">{tw.budget}</h3>
                <Link href={`/weddings/${id}/budget`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                  {tw.details}
                </Link>
              </div>
              <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex justify-between mb-2" style={{ fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: 700, color: budgetPct > 90 ? "var(--gold-deep)" : "var(--foreground)" }}>
                    €{spent.toLocaleString(lang === "en" ? "en-GB" : "nl-NL")}
                  </span>
                  <span style={{ color: "var(--muted)" }}>{tw.of} €{totalBudget.toLocaleString(lang === "en" ? "en-GB" : "nl-NL")}</span>
                </div>
                <div style={{ height: "3px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${budgetPct}%`, background: budgetPct > 90 ? "var(--gold-deep)" : "var(--ink)" }} />
                </div>
                <div className="text-right mt-1.5" style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{budgetPct}{tw.used}</div>
              </div>
            </section>
          )}

          {/* Leveranciers */}
          <section className="mb-8">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="dash-section-title">{tw.dreamTeam}</h3>
              {!isVendor && (
                <Link href={`/weddings/${id}/vendors`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                  {tw.manage}
                </Link>
              )}
            </div>
            {wedding.vendors.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>{tw.noVendors}</p>
            ) : (
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {wedding.vendors.map((wv) => (
                  <div key={wv.id} className="dash-row">
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-sm truncate" style={{ fontWeight: 700, color: "var(--foreground)" }}>{wv.vendor.name}</div>
                      <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{wv.vendor.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Vendor-specifieke dashboards */}
          {(() => {
            const visibleVendors = isVendor
              ? wedding.vendors.filter((wv) => wv.vendor.id === ownVendorId)
              : wedding.vendors;
            if (visibleVendors.length === 0) return null;
            return (
              <div className="space-y-4">
                {!isVendor && (
                  <h2 className="dash-section-title">{tw.vendorDashboards}</h2>
                )}
                {visibleVendors.map((wv) => (
                  <VendorDashboardInline
                    key={wv.id}
                    weddingId={id}
                    wvId={wv.id}
                    vendorName={wv.vendor.name}
                    vendorCategory={wv.vendor.category}
                    userRole={user.role}
                    userId={user.id}
                    vendorUserId={wv.vendor.userId}
                  />
                ))}
              </div>
            );
          })()}
        </div>

        {/* Sidebar */}
        <div>

          {/* Team */}
          <section className="mb-8">
            <h3 className="dash-section-title mb-1">{tw.team}</h3>
            <div style={{ borderTop: "1px solid var(--border)" }}>
              {wedding.teamMembers.map((m) => (
                <div key={m.id} className="dash-row" style={{ padding: "0.6rem 0.25rem" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "var(--gold)", color: "var(--ink)" }}>
                    {m.user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.user.name}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {tw.roles[m.role as keyof typeof tw.roles] ?? m.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {!isVendor && wedding.notes && (
            <section className="mb-8">
              <h3 className="dash-section-title mb-1">{tw.notes}</h3>
              <p className="text-sm leading-relaxed pt-3" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>{wedding.notes}</p>
            </section>
          )}

          {/* Eigen notities — alleen zichtbaar en bewerkbaar voor de leverancier zelf */}
          {isVendor && (() => {
            const ownWv = wedding.vendors.find((wv) => wv.vendor.id === ownVendorId);
            if (!ownWv) return null;
            return (
              <section>
                <h3 className="dash-section-title mb-1">Mijn notities</h3>
                <VendorNotesEditor weddingId={id} wvId={ownWv.id} initialNotes={ownWv.notes ?? ""} />
              </section>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
