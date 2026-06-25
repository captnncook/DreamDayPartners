import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar, MapPin, CheckCircle2, RefreshCw, Circle,
  Users, Euro, MessageCircle, ClipboardList, ChevronRight,
  Clock, FileText, Handshake,
} from "lucide-react";
import VendorDashboardInline from "@/components/VendorDashboardInline";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

function formatTime(time: string) {
  return time;
}

function daysUntil(date: Date) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function WeddingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;

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

  const days = daysUntil(wedding.date);
  const totalBudget = wedding.budget?.totalAmount ?? 0;
  const spent = wedding.budget?.items.reduce((s, i) => s + (i.actual ?? 0), 0) ?? 0;
  const budgetPct = totalBudget > 0 ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0;
  const tasksDone = wedding.tasks.filter((t) => t.status === "done").length;
  const tasksOpen = wedding.tasks.filter((t) => t.status !== "done").length;
  const guestConfirmed = wedding.guests.filter((g) => g.rsvpStatus === "confirmed").length;
  const draaiboek = wedding.draaiboeken[0] ?? null;

  const statusColors: Record<string, string> = {
    planning: "badge-info", intake: "badge-neutral", execution: "badge-warning", completed: "badge-success",
  };
  const statusLabels: Record<string, string> = {
    planning: "Planning", intake: "Intake", execution: "Uitvoering", completed: "Afgerond",
  };
  const vendorStatusLabels: Record<string, string> = {
    lead: "Lead", contacted: "Gecontacteerd", quote_received: "Offerte", booked: "Geboekt",
    confirmed: "Bevestigd", in_progress: "Bezig", ready: "Klaar", completed: "Afgerond",
  };
  const vendorStatusColors: Record<string, string> = {
    lead: "badge-neutral", contacted: "badge-neutral", quote_received: "badge-warning",
    booked: "badge-info", confirmed: "badge-success", in_progress: "badge-info",
    ready: "badge-champagne", completed: "badge-success",
  };

  const isVendor = user.role === "vendor";

  return (
    <div className="px-4 py-6 md:p-8 max-w-5xl mx-auto">

      {/* Breadcrumb */}
      <Link href="/dashboard" className="inline-flex items-center gap-1 mb-5 text-sm" style={{ color: "var(--primary)" }}>
        ← Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 style={{ fontSize: "clamp(1.25rem, 5vw, 1.75rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--foreground)" }}>
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
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center flex-shrink-0 px-5 py-3 rounded-2xl" style={{ background: days < 30 ? "var(--danger-bg)" : "var(--accent)" }}>
          <div style={{ fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: days < 30 ? "var(--danger)" : "var(--primary)" }}>
            {Math.max(0, days)}
          </div>
          <div style={{ fontSize: "0.6875rem", color: "var(--muted)", marginTop: "2px" }}>
            {days > 0 ? "dagen" : "geweest"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {[
          { href: `/weddings/${id}`, label: "Overzicht" },
          !isVendor && { href: `/weddings/${id}/tasks`, label: "Taken" },
          !isVendor && { href: `/weddings/${id}/guests`, label: "Gasten" },
          !isVendor && { href: `/weddings/${id}/budget`, label: "Budget" },
          { href: `/weddings/${id}/draaiboek`, label: "Draaiboek" },
          { href: `/weddings/${id}/messages`, label: "Berichten" },
          !isVendor && { href: `/weddings/${id}/vendors`, label: "Leveranciers" },
          { href: `/weddings/${id}/team`, label: "Team" },
        ].filter(Boolean).map((tab) => {
          if (!tab) return null;
          return (
            <Link key={tab.href} href={tab.href}
              className="flex-shrink-0 px-4 py-2 rounded-full font-medium whitespace-nowrap"
              style={{ fontSize: "0.8125rem", background: "rgba(0,0,0,0.05)", color: "var(--muted)", letterSpacing: "-0.01em" }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Stats — alleen voor niet-vendors */}
          {!isVendor && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: guestConfirmed, sub: `van ${wedding._count.guests} gasten`, label: "Bevestigd" },
                { value: tasksOpen, sub: `${tasksDone} afgerond`, label: "Taken open" },
                { value: wedding.vendors.length, sub: "gekoppeld", label: "Leveranciers" },
              ].map((stat) => (
                <div key={stat.label} className="ddp-card text-center" style={{ padding: "1.25rem 0.75rem" }}>
                  <div style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: "var(--primary)", marginBottom: "4px" }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--muted)", lineHeight: 1.3 }}>
                    <div className="font-semibold" style={{ color: "var(--foreground)", fontSize: "0.75rem" }}>{stat.label}</div>
                    <div>{stat.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Draaiboek preview */}
          {draaiboek && (
            <div className="ddp-card">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>
                  <ClipboardList className="w-4 h-4 inline mr-2" style={{ color: "var(--primary)" }} />
                  Draaiboek
                </h3>
                <Link href={`/weddings/${id}/draaiboek`} className="ddp-btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}>
                  Volledig →
                </Link>
              </div>
              <div className="space-y-1">
                {draaiboek.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }}>
                    <div className="flex items-center gap-1 flex-shrink-0" style={{ color: "var(--muted)", minWidth: "52px" }}>
                      <Clock className="w-3 h-3" />
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{formatTime(item.startTime)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.title}</div>
                      {item.location && <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{item.location}</div>}
                    </div>
                    {item.vendor && (
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>{item.vendor.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Taken — niet voor vendors */}
          {!isVendor && (
            <div className="ddp-card">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>Recente taken</h3>
                <Link href={`/weddings/${id}/tasks`} className="ddp-btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}>
                  Alle taken →
                </Link>
              </div>
              <div className="space-y-1">
                {wedding.tasks.length === 0 && (
                  <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>Nog geen taken</p>
                )}
                {wedding.tasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }}>
                    {task.status === "done"
                      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                      : task.status === "in_progress"
                      ? <RefreshCw className="w-4 h-4 flex-shrink-0" style={{ color: "var(--warning)" }} />
                      : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted-light)" }} />}
                    <span className="flex-1 text-sm truncate" style={{ textDecoration: task.status === "done" ? "line-through" : "none", color: task.status === "done" ? "var(--muted)" : "var(--foreground)" }}>
                      {task.title}
                    </span>
                    {task.assignedUser && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "var(--primary)", fontSize: "0.625rem" }}>
                        {task.assignedUser.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget — niet voor vendors */}
          {!isVendor && wedding.budget && (
            <div className="ddp-card">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>
                  <Euro className="w-4 h-4 inline mr-2" style={{ color: "var(--primary)" }} />
                  Budget
                </h3>
                <Link href={`/weddings/${id}/budget`} className="ddp-btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}>
                  Details →
                </Link>
              </div>
              <div className="flex justify-between mb-2" style={{ fontSize: "0.875rem" }}>
                <span style={{ fontWeight: 600 }}>€{spent.toLocaleString("nl-NL")}</span>
                <span style={{ color: "var(--muted)" }}>van €{totalBudget.toLocaleString("nl-NL")}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? "var(--danger)" : budgetPct > 70 ? "var(--warning)" : "var(--gradient-primary)" }} />
              </div>
              <div className="text-right mt-1.5" style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{budgetPct}% gebruikt</div>
            </div>
          )}

          {/* Leveranciers */}
          <div className="ddp-card">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>Dream Team</h3>
              {!isVendor && (
                <Link href={`/weddings/${id}/vendors`} className="ddp-btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}>
                  Beheren →
                </Link>
              )}
            </div>
            {wedding.vendors.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>Nog geen leveranciers</p>
            ) : (
              <div className="space-y-2">
                {wedding.vendors.map((wv) => (
                  <Link key={wv.id} href={`/weddings/${id}/vendors/${wv.id}`} className="flex items-center gap-3 py-2 px-2 rounded-xl -mx-2" style={{ textDecoration: "none", color: "inherit", background: "transparent", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: "var(--accent)", color: "var(--primary)" }}>
                      {wv.vendor.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{wv.vendor.name}</div>
                      <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{wv.vendor.category}</div>
                    </div>
                    <span className={`ddp-badge ${vendorStatusColors[wv.status] ?? "badge-neutral"}`} style={{ fontSize: "0.6rem" }}>
                      {vendorStatusLabels[wv.status] ?? wv.status}
                    </span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted)" }} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Vendor-specifieke dashboards */}
          {wedding.vendors.length > 0 && (
            <div className="space-y-4">
              <h2 style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em", color: "var(--foreground)" }}>
                Leverancier Dashboards
              </h2>
              {wedding.vendors.map((wv) => (
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
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Team */}
          <div className="ddp-card">
            <h3 className="mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>
              <Handshake className="w-4 h-4 inline mr-2" style={{ color: "var(--primary)" }} />
              Team
            </h3>
            <div className="space-y-3">
              {wedding.teamMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: "var(--primary)" }}>
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
              <h3 className="mb-2" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Notities</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{wedding.notes}</p>
            </div>
          )}

          {/* Snelle toegang */}
          <div className="ddp-card">
            <h3 className="mb-3" style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>Snelle toegang</h3>
            <div className="space-y-0.5">
              {[
                { href: `/weddings/${id}/draaiboek`, label: "Draaiboek", icon: ClipboardList },
                { href: `/weddings/${id}/messages`, label: "Berichten", icon: MessageCircle },
                !isVendor && { href: `/weddings/${id}/guests`, label: "Gastenlijst", icon: Users },
                !isVendor && { href: `/weddings/${id}/budget`, label: "Budget", icon: Euro },
                !isVendor && { href: `/weddings/${id}/files`, label: "Bestanden", icon: FileText },
                { href: `/weddings/${id}/team`, label: "Team", icon: Handshake },
              ].filter(Boolean).map((link) => {
                if (!link) return null;
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-black/4"
                    style={{ color: "var(--foreground)" }}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
                      {link.label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--muted-light)" }} />
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
