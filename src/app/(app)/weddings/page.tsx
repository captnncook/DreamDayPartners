import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  planning:  { label: "Planning",   color: "var(--muted)" },
  intake:    { label: "Intake",     color: "var(--muted)" },
  execution: { label: "Uitvoering", color: "var(--gold-deep)" },
  completed: { label: "Afgerond",   color: "var(--muted-light)" },
};

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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Bruiloften</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{weddings.length} bruiloft{weddings.length !== 1 ? "en" : ""}</p>
        </div>
        <Link href="/weddings/new" className="ddp-btn-primary">+ Nieuwe bruiloft</Link>
      </div>

      {weddings.length === 0 ? (
        <div className="text-center py-20" style={{ borderTop: "1px solid var(--border)" }}>
          <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--foreground)" }}>Nog geen bruiloften</h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Maak de eerste bruiloft aan om te beginnen</p>
          <Link href="/weddings/new" className="ddp-btn-primary">Bruiloft aanmaken</Link>
        </div>
      ) : (
        <div>
          {weddings.map((w) => {
            const days = Math.ceil((new Date(w.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isPast = days < 0;
            const urgent = days >= 0 && days <= 14;
            const status = STATUS_META[w.status] ?? { label: w.status, color: "var(--muted)" };
            const day = new Date(w.date).getDate();
            const month = new Intl.DateTimeFormat("nl-NL", { month: "short" }).format(new Date(w.date));
            const year = new Date(w.date).getFullYear();

            return (
              <Link
                key={w.id}
                href={`/weddings/${w.id}`}
                className="dash-row"
                style={{ padding: "1.25rem 0.25rem", gap: "1.5rem", opacity: isPast ? 0.6 : 1 }}
              >
                <div style={{ textAlign: "center", minWidth: "58px", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", lineHeight: 1.05 }}>{day}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--muted)", textTransform: "uppercase" }}>{month} {year}</div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="font-serif" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--foreground)" }}>{w.title}</h3>
                    {w.isPremium && (
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold-deep)" }}>Premium</span>
                    )}
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: "var(--muted)" }}>{w.venue ?? "Locatie onbekend"} · {formatDate(w.date)}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--muted)" }}>
                    <span>{w._count.guests} gasten</span>
                    <span>{w._count.tasks} taken</span>
                    <span>{w._count.vendors} leveranciers</span>
                    <span className="font-mono">{w.weddingCode}</span>
                  </div>
                </div>

                {w.teamMembers.length > 0 && (
                  <div className="flex -space-x-2 flex-shrink-0">
                    {w.teamMembers.slice(0, 4).map((m) => (
                      <div
                        key={m.id}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "var(--gold)", color: "var(--ink)", border: "2px solid var(--background)" }}
                        title={m.user.name}
                      >
                        {m.user.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-right flex-shrink-0" style={{ minWidth: "72px" }}>
                  <div style={{ fontSize: "1.0625rem", fontWeight: urgent ? 700 : 600, color: urgent ? "var(--gold-deep)" : "var(--foreground)" }}>
                    {isPast ? Math.abs(days) : days}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {isPast ? "geweest" : "dagen"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
