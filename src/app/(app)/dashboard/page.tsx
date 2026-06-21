import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, CheckSquare, Calendar, Sparkles } from "lucide-react";

function daysUntil(date: Date) {
  const now = new Date();
  const diff = new Date(date).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  let weddings: Awaited<ReturnType<typeof prisma.wedding.findMany>>;

  if (user.role === "admin") {
    weddings = await prisma.wedding.findMany({
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
      take: 10,
    });
  } else if (user.role === "vendor") {
    weddings = await prisma.wedding.findMany({
      where: { vendors: { some: { vendor: { userId: user.id }, portalAccess: true } } },
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
    });
  } else {
    weddings = await prisma.wedding.findMany({
      where: { teamMembers: { some: { userId: user.id } } },
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
    });
  }

  const myTasks = user.role !== "vendor" ? await prisma.task.findMany({
    where: { assignedTo: user.id, status: { not: "done" } },
    include: { wedding: true },
    orderBy: { dueDate: "asc" },
    take: 5,
  }) : [];

  const greetings: Record<string, string> = {
    admin: "Platform overzicht",
    planner: `Goedemorgen, ${user.name.split(" ")[0]}`,
    team_member: `Goedemorgen, ${user.name.split(" ")[0]}`,
    couple: `Welkom, ${user.name.split(" ")[0]}`,
    vendor: `Welkom, ${user.name.split(" ")[0]}`,
  };

  const statusColors: Record<string, string> = {
    planning: "badge-info", intake: "badge-neutral", execution: "badge-warning", completed: "badge-success",
  };
  const statusLabels: Record<string, string> = {
    planning: "Planning", intake: "Intake", execution: "Uitvoering", completed: "Afgerond",
  };
  const priorityColors: Record<string, string> = {
    high: "badge-danger", medium: "badge-warning", low: "badge-neutral",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight">{greetings[user.role] ?? "Welkom"}</h1>
        <p className="text-sm mt-1.5" style={{ color: "var(--muted)" }}>
          {new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}
        </p>
      </div>

      {user.role !== "couple" && user.role !== "vendor" && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Bruiloften" value={weddings.length} icon={Heart} />
          <StatCard label="Open taken" value={myTasks.length} icon={CheckSquare} />
          <StatCard label="Komende 30 dagen" value={weddings.filter((w) => daysUntil(w.date) <= 30 && daysUntil(w.date) > 0).length} icon={Calendar} />
          <StatCard label="Dit jaar" value={weddings.filter((w) => new Date(w.date).getFullYear() === new Date().getFullYear()).length} icon={Sparkles} />
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base">
              {user.role === "vendor" ? "Jouw bruiloften" : user.role === "couple" ? "Onze bruiloft" : "Bruiloften"}
            </h2>
            {(user.role === "planner" || user.role === "admin") && (
              <Link href="/weddings/new" className="ddp-btn-primary text-xs px-3 py-1.5">+ Nieuwe bruiloft</Link>
            )}
          </div>

          {weddings.length === 0 ? (
            <div className="ddp-card text-center py-12" style={{ color: "var(--muted)" }}>
              <div className="flex justify-center mb-3">
                <Heart className="w-10 h-10" style={{ color: "var(--accent-dark)" }} />
              </div>
              <p className="font-medium">Nog geen bruiloften</p>
              {(user.role === "planner" || user.role === "admin") && (
                <Link href="/weddings/new" className="ddp-btn-primary inline-block mt-4 text-sm">Eerste bruiloft aanmaken</Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {weddings.map((w) => {
                const days = daysUntil(w.date);
                return (
                  <Link key={w.id} href={`/weddings/${w.id}`}
                    className="ddp-card ddp-card-hover flex items-center gap-4 cursor-pointer block">
                    <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: days < 30 ? "#e05252" : days < 90 ? "var(--warning)" : "var(--primary)" }}>
                      <span className="text-lg leading-none">{new Date(w.date).getDate()}</span>
                      <span style={{ fontSize: "0.6rem" }}>
                        {new Intl.DateTimeFormat("nl-NL", { month: "short" }).format(new Date(w.date))}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{w.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                        {w.venue ?? "Locatie onbekend"} · {formatDate(w.date)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`ddp-badge ${statusColors[w.status] ?? "badge-neutral"}`}>{statusLabels[w.status] ?? w.status}</span>
                        {w.isPremium && <span className="ddp-badge badge-premium">Premium</span>}
                        <span className="text-xs" style={{ color: "var(--muted)" }}>{w.weddingCode}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold" style={{ color: days < 30 ? "#e05252" : "var(--primary)" }}>{days > 0 ? days : 0}</div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>{days > 0 ? "dagen" : "geweest"}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {myTasks.length > 0 && (
            <div>
              <h2 className="font-semibold text-base mb-4">Mijn taken</h2>
              <div className="space-y-2">
                {myTasks.map((task) => (
                  <div key={task.id} className="ddp-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{task.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{task.wedding.title}</div>
                      </div>
                      <span className={`ddp-badge ${priorityColors[task.priority]} flex-shrink-0`}>{task.priority}</span>
                    </div>
                    {task.dueDate && (
                      <div className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--muted)" }}>
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.role === "couple" && weddings[0] && (
            <div>
              <h2 className="font-semibold text-base mb-4">Onze bruiloft</h2>
              <div className="ddp-card">
                <div className="text-3xl font-bold text-center mb-1" style={{ color: "var(--primary)" }}>
                  {Math.max(0, daysUntil(weddings[0].date))}
                </div>
                <div className="text-xs text-center" style={{ color: "var(--muted)" }}>dagen tot de grote dag!</div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted)" }}>Datum</span>
                    <span className="font-medium">{formatDate(weddings[0].date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted)" }}>Locatie</span>
                    <span className="font-medium text-right" style={{ maxWidth: "60%" }}>{weddings[0].venue ?? "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted)" }}>Code</span>
                    <span className="font-mono text-xs font-medium">{weddings[0].weddingCode}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="ddp-stat-card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: "var(--foreground)" }}>{value}</div>
          <div className="text-xs font-medium" style={{ color: "var(--muted)" }}>{label}</div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent)" }}>
          <Icon className="w-5 h-5" style={{ color: "var(--primary)" }} />
        </div>
      </div>
    </div>
  );
}
