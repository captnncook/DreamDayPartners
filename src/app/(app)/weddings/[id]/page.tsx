import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import TabNav from "./TabNav";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

function daysUntil(date: Date) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function WeddingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    include: {
      owner: true,
      teamMembers: { include: { user: true } },
      vendors: { include: { vendor: true } },
      budget: { include: { items: true } },
      tasks: { include: { assignedUser: true }, orderBy: { dueDate: "asc" }, take: 5 },
      guests: true,
      draaiboeken: true,
      _count: { select: { guests: true, tasks: true } },
    },
  });

  if (!wedding) notFound();

  const days = daysUntil(wedding.date);
  const totalBudget = wedding.budget?.totalAmount ?? 0;
  const spent = wedding.budget?.items.reduce((s, i) => s + i.actual, 0) ?? 0;
  const budgetPct = totalBudget > 0 ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0;

  const tasksDone = wedding.tasks.filter((t) => t.status === "done").length;
  const tasksOpen = wedding.tasks.filter((t) => t.status !== "done").length;

  const guestConfirmed = wedding.guests.filter((g) => g.rsvpStatus === "confirmed").length;

  const statusColors: Record<string, string> = {
    planning: "badge-info", intake: "badge-neutral", execution: "badge-warning", completed: "badge-success",
  };
  const statusLabels: Record<string, string> = {
    planning: "Planning", intake: "Intake", execution: "Uitvoering", completed: "Afgerond",
  };
  const vendorStatusLabels: Record<string, string> = {
    contacted: "Gecontacteerd", quote_received: "Offerte", booked: "Geboekt", confirmed: "Bevestigd",
  };
  const vendorStatusColors: Record<string, string> = {
    contacted: "badge-neutral", quote_received: "badge-warning", booked: "badge-info", confirmed: "badge-success",
  };


  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/weddings" className="text-sm hover:underline" style={{ color: "var(--muted)" }}>
          ← Bruiloften
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{wedding.title}</h1>
            <span className={`ddp-badge ${statusColors[wedding.status] ?? "badge-neutral"}`}>
              {statusLabels[wedding.status] ?? wedding.status}
            </span>
            {wedding.isPremium && <span className="ddp-badge badge-premium">Premium</span>}
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
            <span>📅 {formatDate(wedding.date)}</span>
            {wedding.venue && <span>📍 {wedding.venue}</span>}
            <span className="font-mono text-xs">{wedding.weddingCode}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold" style={{ color: days < 30 ? "#e05252" : "var(--primary)" }}>
            {days > 0 ? days : 0}
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>{days > 0 ? "dagen" : "dagen geleden"}</div>
        </div>
      </div>

      {/* Tabs */}
      <TabNav id={id} />

      {/* Overview grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: stats */}
        <div className="col-span-2 space-y-5">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="ddp-card text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{guestConfirmed}</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>van {wedding._count.guests} gasten bevestigd</div>
            </div>
            <div className="ddp-card text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{tasksOpen}</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>taken open ({tasksDone} klaar)</div>
            </div>
            <div className="ddp-card text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{wedding.vendors.length}</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>leveranciers</div>
            </div>
          </div>

          {/* Budget */}
          {wedding.budget && (
            <div className="ddp-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Budget</h3>
                <Link href={`/weddings/${id}/budget`} className="text-xs" style={{ color: "var(--primary)" }}>
                  Details →
                </Link>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>€{spent.toLocaleString("nl-NL")} uitgegeven</span>
                <span style={{ color: "var(--muted)" }}>van €{totalBudget.toLocaleString("nl-NL")}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--accent)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${budgetPct}%`,
                    background: budgetPct > 90 ? "#e05252" : budgetPct > 70 ? "var(--warning)" : "var(--primary)",
                  }}
                />
              </div>
              <div className="text-xs mt-1 text-right" style={{ color: "var(--muted)" }}>{budgetPct}%</div>
            </div>
          )}

          {/* Recent tasks */}
          <div className="ddp-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Recente taken</h3>
              <Link href={`/weddings/${id}/tasks`} className="text-xs" style={{ color: "var(--primary)" }}>
                Alle taken →
              </Link>
            </div>
            <div className="space-y-2">
              {wedding.tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center gap-3 py-1.5">
                  <span className="text-sm">
                    {task.status === "done" ? "✅" : task.status === "in_progress" ? "🔄" : "⭕"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${task.status === "done" ? "line-through" : ""}`} style={{ color: task.status === "done" ? "var(--muted)" : undefined }}>
                      {task.title}
                    </span>
                  </div>
                  {task.assignedUser && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                      style={{ background: "var(--primary)" }}
                      title={task.assignedUser.name}
                    >
                      {task.assignedUser.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
              {wedding.tasks.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>Nog geen taken</p>
              )}
            </div>
          </div>

          {/* Vendors */}
          <div className="ddp-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Leveranciers</h3>
              <Link href={`/weddings/${id}/vendors`} className="text-xs" style={{ color: "var(--primary)" }}>
                Beheren →
              </Link>
            </div>
            <div className="space-y-2">
              {wedding.vendors.map((wv) => (
                <div key={wv.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: "var(--accent)" }}>
                    {wv.vendor.category === "bloemist" ? "🌸" : wv.vendor.category === "dj" ? "🎵" : wv.vendor.category === "catering" ? "🍽️" : "🤝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{wv.vendor.name}</div>
                    <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{wv.vendor.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {wv.portalAccess && <span className="ddp-badge badge-premium" style={{ fontSize: "0.6rem" }}>Portal</span>}
                    <span className={`ddp-badge ${vendorStatusColors[wv.status] ?? "badge-neutral"}`}>
                      {vendorStatusLabels[wv.status] ?? wv.status}
                    </span>
                  </div>
                </div>
              ))}
              {wedding.vendors.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>Nog geen leveranciers gekoppeld</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: team + notes */}
        <div className="space-y-5">
          <div className="ddp-card">
            <h3 className="font-semibold text-sm mb-3">Team</h3>
            <div className="space-y-3">
              {wedding.teamMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: "var(--primary)" }}
                  >
                    {m.user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.user.name}</div>
                    <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>
                      {m.role === "couple" ? "Bruidspaar" : m.role === "planner" ? "Planner" : "Teamlid"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {wedding.notes && (
            <div className="ddp-card">
              <h3 className="font-semibold text-sm mb-2">Notities</h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{wedding.notes}</p>
            </div>
          )}

          {/* Quick links */}
          <div className="ddp-card">
            <h3 className="font-semibold text-sm mb-3">Snelle toegang</h3>
            <div className="space-y-1">
              {[
                { href: `/weddings/${id}/team`, label: "🤝 Dream Day Team", show: true },
                { href: `/weddings/${id}/draaiboek`, label: "📋 Draaiboek openen", show: true },
                { href: `/weddings/${id}/guests`, label: "👥 Gastenlijst", show: true },
                { href: `/weddings/${id}/files`, label: "📂 Bestanden", show: true },
                { href: `/weddings/${id}/budget`, label: "💶 Budget bekijken", show: user.role !== "couple" },
                { href: `/weddings/${id}/messages`, label: "💬 Berichten", show: true },
              ].filter((l) => l.show).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
