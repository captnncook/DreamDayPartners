import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

function euro(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

export default async function AllBudgetPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const myWeddings = await prisma.weddingTeamMember.findMany({ where: { userId: user.id } });
  const weddingIds = myWeddings.map((m) => m.weddingId);

  const weddings = await prisma.wedding.findMany({
    where: { id: { in: weddingIds } },
    include: { budget: { include: { items: true } } },
    orderBy: { date: "asc" },
  });

  const withBudget = weddings.filter((w) => w.budget);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Budget</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{withBudget.length} bruiloft{withBudget.length !== 1 ? "en" : ""} met budget</p>
      </div>

      {withBudget.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          Nog geen budgetten aangemaakt.
        </p>
      ) : (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {withBudget.map((w) => {
            const spent = w.budget!.items.reduce((s, i) => s + i.actual, 0);
            const total = w.budget!.totalAmount;
            const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
            const over = pct > 90;
            return (
              <Link key={w.id} href={`/weddings/${w.id}/budget`} className="dash-row" style={{ padding: "1.125rem 0.25rem", display: "block" }}>
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="font-serif" style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--foreground)" }}>{w.title}</span>
                  <span className="text-sm">
                    <span style={{ fontWeight: 700, color: over ? "var(--gold-deep)" : "var(--foreground)" }}>{euro(spent)}</span>
                    <span style={{ color: "var(--muted)" }}> van {euro(total)}</span>
                  </span>
                </div>
                <div style={{ height: "3px", borderRadius: "999px", background: "var(--border)", overflow: "hidden", margin: "0.625rem 0 0.375rem" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: over ? "var(--gold-deep)" : "var(--ink)" }} />
                </div>
                <div className="text-xs flex justify-between" style={{ color: "var(--muted)" }}>
                  <span style={{ fontWeight: over ? 700 : 400, color: over ? "var(--gold-deep)" : "var(--muted)" }}>{pct}% gebruikt</span>
                  <span>Resterend: {euro(total - spent)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
