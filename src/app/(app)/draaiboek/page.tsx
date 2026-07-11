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

  // Een bruidspaar heeft altijd maar één bruiloft — spring de keuzelijst over.
  if (user.role === "couple" && weddings.length === 1) {
    redirect(`/weddings/${weddings[0].id}/draaiboek`);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Draaiboeken</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {user.role === "vendor" ? "Jouw onderdelen in het draaiboek" : "Overzicht van alle draaiboeken"}
        </p>
      </div>

      {weddings.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          Geen draaiboeken gevonden.
        </p>
      ) : (
        weddings.map((w) => (
          <section key={w.id} className="mb-8">
            <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
              <div>
                <h2 className="dash-section-title">{w.title}</h2>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(w.date))}
                </div>
              </div>
              <Link href={`/weddings/${w.id}/draaiboek`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>Openen</Link>
            </div>
            {w.draaiboeken.map((d) => (
              <div key={d.id} className="mb-3">
                <div className="ddp-section-label mb-1 mt-3">{d.title} — v{d.version}</div>
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {d.items.slice(0, 5).map((item) => (
                    <div key={item.id} className="dash-row" style={{ padding: "0.55rem 0.25rem" }}>
                      <span className="text-sm font-mono flex-shrink-0" style={{ fontWeight: 700, width: "3rem", color: "var(--gold-deep)" }}>{item.startTime}</span>
                      <span className="text-sm" style={{ flex: 1, minWidth: 0 }}>{item.title}</span>
                      {item.vendor && (
                        <span className="font-serif text-xs flex-shrink-0" style={{ fontWeight: 700, color: "var(--muted)" }}>{item.vendor.name}</span>
                      )}
                    </div>
                  ))}
                </div>
                {d.items.length > 5 && (
                  <div className="text-xs mt-1.5" style={{ color: "var(--muted-light)" }}>+ {d.items.length - 5} meer</div>
                )}
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
