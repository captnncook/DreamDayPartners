import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

export default async function WeddingsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role === "couple" || user.role === "vendor") redirect("/dashboard");

  const weddings = await prisma.wedding.findMany({
    where: user.role === "admin" ? {} : { teamMembers: { some: { userId: user.id } } },
    include: {
      owner: true,
      teamMembers: { include: { user: true } },
      _count: { select: { guests: true, tasks: true, vendors: true } },
    },
    orderBy: { date: "asc" },
  });

  const statusColors: Record<string, string> = {
    planning: "badge-info", intake: "badge-neutral", execution: "badge-warning", completed: "badge-success",
  };
  const statusLabels: Record<string, string> = {
    planning: "Planning", intake: "Intake", execution: "Uitvoering", completed: "Afgerond",
  };

  return (
    <div className="px-4 py-5 md:px-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Bruiloften</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{weddings.length} bruiloft{weddings.length !== 1 ? "en" : ""}</p>
        </div>
        <Link href="/weddings/new" className="ddp-btn-primary">+ Nieuwe bruiloft</Link>
      </div>

      {weddings.length === 0 ? (
        <div className="ddp-card text-center py-20" style={{ color: "var(--muted)" }}>
          <div className="text-5xl mb-4">💍</div>
          <h2 className="font-semibold text-lg mb-2">Nog geen bruiloften</h2>
          <p className="text-sm mb-6">Maak de eerste bruiloft aan om te beginnen</p>
          <Link href="/weddings/new" className="ddp-btn-primary">Bruiloft aanmaken</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {weddings.map((w) => {
            const days = Math.ceil((new Date(w.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <Link key={w.id} href={`/weddings/${w.id}`}
                className="ddp-card flex items-center gap-6 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0"
                  style={{ background: days < 30 ? "#e05252" : days < 90 ? "var(--warning)" : "var(--primary)" }}>
                  <span className="text-xl font-bold leading-none">{new Date(w.date).getDate()}</span>
                  <span className="text-xs opacity-90">{new Intl.DateTimeFormat("nl-NL", { month: "short" }).format(new Date(w.date))}</span>
                  <span className="text-xs opacity-75">{new Date(w.date).getFullYear()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{w.title}</h3>
                    {w.isPremium && <span className="ddp-badge badge-premium">Premium</span>}
                    <span className={`ddp-badge ${statusColors[w.status] ?? "badge-neutral"}`}>{statusLabels[w.status] ?? w.status}</span>
                  </div>
                  <div className="text-sm" style={{ color: "var(--muted)" }}>{w.venue ?? "Locatie onbekend"} · {formatDate(w.date)}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: "var(--muted)" }}>
                    <span>👥 {w._count.guests} gasten</span>
                    <span>✅ {w._count.tasks} taken</span>
                    <span>🤝 {w._count.vendors} leveranciers</span>
                    <span className="font-mono">{w.weddingCode}</span>
                  </div>
                </div>
                <div className="flex -space-x-2 flex-shrink-0">
                  {w.teamMembers.slice(0, 4).map((m) => (
                    <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "var(--primary)" }} title={m.user.name}>
                      {m.user.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold" style={{ color: days < 30 ? "#e05252" : "var(--primary)" }}>{days > 0 ? days : 0}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{days > 0 ? "dagen" : "geweest"}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
