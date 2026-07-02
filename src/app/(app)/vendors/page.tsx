import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AllVendorsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const myWeddings = await prisma.weddingTeamMember.findMany({ where: { userId: user.id } });
  const weddingIds = myWeddings.map((m) => m.weddingId);

  const weddings = await prisma.wedding.findMany({
    where: { id: { in: weddingIds } },
    include: { vendors: { include: { vendor: true } } },
    orderBy: { date: "asc" },
  });

  const total = weddings.reduce((s, w) => s + w.vendors.length, 0);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Onze leveranciers</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{total} leverancier{total !== 1 ? "s" : ""} over {weddings.length} bruiloft{weddings.length !== 1 ? "en" : ""}</p>
      </div>

      {weddings.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          Nog geen bruiloften met leveranciers.
        </p>
      ) : (
        weddings.map((w) => (
          <section key={w.id} className="mb-8">
            <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
              <h2 className="dash-section-title">{w.title}</h2>
              <Link href={`/weddings/${w.id}/vendors`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>Beheren</Link>
            </div>
            {w.vendors.length === 0 ? (
              <p className="text-sm py-4" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>Nog geen leveranciers gekoppeld.</p>
            ) : (
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {w.vendors.map((wv) => (
                  <div key={wv.id} className="dash-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="font-serif" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--foreground)" }}>{wv.vendor.name}</span>
                      <span className="capitalize" style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginLeft: "0.625rem" }}>
                        {wv.vendor.category}
                      </span>
                    </div>
                    {wv.vendor.phone && <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>{wv.vendor.phone}</span>}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
}
