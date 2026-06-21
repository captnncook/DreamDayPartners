import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import TabNav from "./TabNav";
import {
  Calendar, MapPin, CheckCircle2, RefreshCw, Circle,
  Briefcase, ClipboardList, Users, FolderOpen, Euro, MessageCircle, Handshake,
} from "lucide-react";

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
    <div className="px-4 py-6 md:p-8 max-w-6xl mx-auto">

      {/* Breadcrumb */}
      <Link
        href="/weddings"
        className="inline-flex items-center gap-1 mb-5 text-sm"
        style={{ color: "var(--primary)" }}
      >
        ← Bruiloften
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1
              style={{
                fontSize: "clamp(1.375rem, 5vw, 1.875rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--foreground)",
              }}
            >
              {wedding.title}
            </h1>
            <span className={`ddp-badge ${statusColors[wedding.status] ?? "badge-neutral"}`}>
              {statusLabels[wedding.status] ?? wedding.status}
            </span>
            {wedding.isPremium && <span className="ddp-badge badge-premium">Premium</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(wedding.date)}
            </span>
            {wedding.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {wedding.venue}
              </span>
            )}
            <span className="font-mono text-xs opacity-60">{wedding.weddingCode}</span>
          </div>
        </div>

        {/* Days counter */}
        <div
          className="text-center flex-shrink-0 px-4 py-3 rounded-2xl"
          style={{ background: days < 30 ? "var(--danger-bg)" : "var(--accent)" }}
        >
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: days < 30 ? "var(--danger)" : "var(--primary)",
            }}
          >
            {days > 0 ? days : 0}
          </div>
          <div style={{ fontSize: "0.6875rem", color: "var(--muted)", marginTop: "2px" }}>
            {days > 0 ? "dagen" : "geleden"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabNav id={id} />

      {/* Content — responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left / main column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Quick stats — Apple big numbers */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: guestConfirmed, sub: `van ${wedding._count.guests} gasten`, label: "Bevestigd" },
              { value: tasksOpen,      sub: `${tasksDone} afgerond`,               label: "Taken open" },
              { value: wedding.vendors.length, sub: "gekoppeld",                  label: "Leveranciers" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="ddp-card text-center py-5"
                style={{ padding: "1.25rem 0.75rem" }}
              >
                <div
                  style={{
                    fontSize: "clamp(1.75rem, 6vw, 2.5rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    color: "var(--primary)",
                    marginBottom: "4px",
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--muted)", lineHeight: 1.3 }}>
                  <div className="font-semibold" style={{ color: "var(--foreground)", fontSize: "0.75rem" }}>{stat.label}</div>
                  <div>{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Budget */}
          {wedding.budget && (
            <div className="ddp-card">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>Budget</h3>
                <Link
                  href={`/weddings/${id}/budget`}
                  className="ddp-btn-ghost"
                  style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}
                >
                  Details →
                </Link>
              </div>
              <div className="flex justify-between mb-3" style={{ fontSize: "0.875rem" }}>
                <span style={{ fontWeight: 600 }}>€{spent.toLocaleString("nl-NL")}</span>
                <span style={{ color: "var(--muted)" }}>van €{totalBudget.toLocaleString("nl-NL")}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${budgetPct}%`,
                    background: budgetPct > 90 ? "var(--danger)" : budgetPct > 70 ? "var(--warning)" : "var(--gradient-primary)",
                  }}
                />
              </div>
              <div className="text-right mt-1.5" style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                {budgetPct}% gebruikt
              </div>
            </div>
          )}

          {/* Recent tasks */}
          <div className="ddp-card">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>Recente taken</h3>
              <Link
                href={`/weddings/${id}/tasks`}
                className="ddp-btn-ghost"
                style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}
              >
                Alle taken →
              </Link>
            </div>
            <div className="space-y-1">
              {wedding.tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                  style={{ background: "rgba(0,0,0,0.02)" }}
                >
                  {task.status === "done"
                    ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                    : task.status === "in_progress"
                    ? <RefreshCw className="w-4 h-4 flex-shrink-0" style={{ color: "var(--warning)" }} />
                    : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted-light)" }} />}
                  <span
                    className="flex-1 text-sm truncate"
                    style={{
                      textDecoration: task.status === "done" ? "line-through" : "none",
                      color: task.status === "done" ? "var(--muted)" : "var(--foreground)",
                    }}
                  >
                    {task.title}
                  </span>
                  {task.assignedUser && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: "var(--primary)", fontSize: "0.625rem" }}
                      title={task.assignedUser.name}
                    >
                      {task.assignedUser.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
              {wedding.tasks.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>Nog geen taken</p>
              )}
            </div>
          </div>

          {/* Vendors */}
          <div className="ddp-card">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>Leveranciers</h3>
              <Link
                href={`/weddings/${id}/vendors`}
                className="ddp-btn-ghost"
                style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}
              >
                Beheren →
              </Link>
            </div>
            <div className="space-y-2">
              {wedding.vendors.map((wv) => (
                <div key={wv.id} className="flex items-center gap-3 py-1.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--accent)" }}
                  >
                    <Briefcase className="w-4 h-4" style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{wv.vendor.name}</div>
                    <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{wv.vendor.category}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {wv.portalAccess && <span className="ddp-badge badge-premium" style={{ fontSize: "0.6rem" }}>Portal</span>}
                    <span className={`ddp-badge ${vendorStatusColors[wv.status] ?? "badge-neutral"}`}>
                      {vendorStatusLabels[wv.status] ?? wv.status}
                    </span>
                  </div>
                </div>
              ))}
              {wedding.vendors.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>Nog geen leveranciers</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Team */}
          <div className="ddp-card">
            <h3 className="mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>Team</h3>
            <div className="space-y-3">
              {wedding.teamMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: "var(--primary)" }}
                  >
                    {m.user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.user.name}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {m.role === "couple" ? "Bruidspaar" : m.role === "planner" ? "Planner" : "Teamlid"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {wedding.notes && (
            <div className="ddp-card">
              <h3 className="mb-2" style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>Notities</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{wedding.notes}</p>
            </div>
          )}

          {/* Quick links */}
          <div className="ddp-card">
            <h3 className="mb-3" style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>Snelle toegang</h3>
            <div className="space-y-0.5">
              {[
                { href: `/weddings/${id}/team`,      label: "Dream Day Team",  icon: Handshake },
                { href: `/weddings/${id}/draaiboek`, label: "Draaiboek",       icon: ClipboardList },
                { href: `/weddings/${id}/guests`,    label: "Gastenlijst",     icon: Users },
                { href: `/weddings/${id}/files`,     label: "Bestanden",       icon: FolderOpen },
                { href: `/weddings/${id}/budget`,    label: "Budget",          icon: Euro, hide: user.role === "couple" },
                { href: `/weddings/${id}/messages`,  label: "Berichten",       icon: MessageCircle },
              ].filter((l) => !l.hide).map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ color: "var(--foreground)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
