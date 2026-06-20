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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Budget overzicht</h1>
      <div className="space-y-4">
        {weddings.map((w) => {
          if (!w.budget) return null;
          const spent = w.budget.items.reduce((s, i) => s + i.actual, 0);
          const total = w.budget.totalAmount;
          const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
          return (
            <div key={w.id} className="ddp-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">{w.title}</h2>
                <Link href={`/weddings/${w.id}/budget`} className="text-sm" style={{ color: "var(--primary)" }}>Details →</Link>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{euro(spent)} uitgegeven</span>
                <span style={{ color: "var(--muted)" }}>van {euro(total)}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--accent)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 90 ? "#e05252" : pct > 70 ? "var(--warning)" : "var(--success)" }} />
              </div>
              <div className="text-xs mt-1 flex justify-between" style={{ color: "var(--muted)" }}>
                <span>{pct}% gebruikt</span>
                <span>Resterend: {euro(total - spent)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
