import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AllDraaiboekPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  let weddings;
  if (user.role === "vendor") {
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    weddings = await prisma.wedding.findMany({
      where: { vendors: { some: { vendor: { userId: user.id }, portalAccess: true } } },
      include: { draaiboeken: { include: { items: { where: vendor ? { vendorId: vendor.id } : undefined, include: { vendor: true }, orderBy: { sortOrder: "asc" } } } } },
    });
  } else {
    weddings = await prisma.wedding.findMany({
      where: { teamMembers: { some: { userId: user.id } } },
      include: { draaiboeken: { include: { items: { include: { vendor: true }, orderBy: { sortOrder: "asc" } } } } },
      orderBy: { date: "asc" },
    });
  }

  return (
    <div className="px-4 py-5 md:px-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Draaiboeken</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{user.role === "vendor" ? "Jouw onderdelen in het draaiboek" : "Overzicht van alle draaiboeken"}</p>
      {weddings.length === 0 ? (
        <div className="ddp-card text-center py-12" style={{ color: "var(--muted)" }}><div className="text-4xl mb-3">📋</div><p>Geen draaiboeken gevonden</p></div>
      ) : (
        <div className="space-y-6">
          {weddings.map((w) => (
            <div key={w.id} className="ddp-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold">{w.title}</h2>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(w.date))}</div>
                </div>
                <Link href={`/weddings/${w.id}/draaiboek`} className="text-sm" style={{ color: "var(--primary)" }}>Openen →</Link>
              </div>
              {w.draaiboeken.map((d) => (
                <div key={d.id}>
                  <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>{d.title} — v{d.version}</div>
                  <div className="space-y-1">
                    {d.items.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-1">
                        <span className="text-sm font-mono font-bold w-12 flex-shrink-0" style={{ color: "var(--primary)" }}>{item.startTime}</span>
                        <span className="text-sm">{item.title}</span>
                        {item.vendor && <span className="ddp-badge badge-info text-xs">{item.vendor.name}</span>}
                      </div>
                    ))}
                    {d.items.length > 5 && <div className="text-xs" style={{ color: "var(--muted)" }}>+ {d.items.length - 5} meer...</div>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
