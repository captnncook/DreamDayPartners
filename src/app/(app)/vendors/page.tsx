import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Phone } from "lucide-react";

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
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Leveranciers</h1>
      {weddings.map((w) => (
        <div key={w.id} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{w.title}</h2>
            <Link href={`/weddings/${w.id}/vendors`} className="text-sm" style={{ color: "var(--primary)" }}>Beheren →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {w.vendors.map((wv) => (
              <div key={wv.id} className="ddp-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent)" }}>
                    <Briefcase className="w-4 h-4" style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{wv.vendor.name}</div>
                    <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{wv.vendor.category}</div>
                  </div>
                </div>
                {wv.vendor.phone && <div className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}><Phone className="w-3 h-3" /> {wv.vendor.phone}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
