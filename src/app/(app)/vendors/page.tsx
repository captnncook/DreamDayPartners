import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const VENDOR_ICONS: Record<string, string> = { bloemist: "🌸", dj: "🎵", catering: "🍽️", fotograaf: "📷", locatie: "🏰", default: "🤝" };

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

  return (
    <div className="px-4 py-5 md:px-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Leveranciers</h1>
      {weddings.map((w) => (
        <div key={w.id} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{w.title}</h2>
            <Link href={`/weddings/${w.id}/vendors`} className="text-sm" style={{ color: "var(--primary)" }}>Beheren →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {w.vendors.map((wv) => (
              <div key={wv.id} className="ddp-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{VENDOR_ICONS[wv.vendor.category] ?? VENDOR_ICONS.default}</span>
                  <div>
                    <div className="font-medium text-sm">{wv.vendor.name}</div>
                    <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{wv.vendor.category}</div>
                  </div>
                </div>
                {wv.vendor.phone && <div className="text-xs" style={{ color: "var(--muted)" }}>📞 {wv.vendor.phone}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
