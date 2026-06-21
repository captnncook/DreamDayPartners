import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Heart, Handshake } from "lucide-react";

export default async function AdminPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const [userCount, weddingCount, vendorCount] = await Promise.all([
    prisma.user.count(), prisma.wedding.count(), prisma.vendor.count(),
  ]);

  const users = await prisma.user.findMany({ orderBy: { role: "asc" } });
  const weddings = await prisma.wedding.findMany({
    include: { owner: true, _count: { select: { guests: true, vendors: true } } },
    orderBy: { date: "asc" },
  });

  const roleColors: Record<string, string> = { admin: "badge-danger", planner: "badge-info", couple: "badge-success", vendor: "badge-warning", team_member: "badge-neutral" };
  const roleLabels: Record<string, string> = { admin: "Admin", planner: "Planner", couple: "Bruidspaar", vendor: "Leverancier", team_member: "Teamlid" };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Platform Beheer</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {([
          { Icon: Users, val: userCount, label: "Gebruikers" },
          { Icon: Heart, val: weddingCount, label: "Bruiloften" },
          { Icon: Handshake, val: vendorCount, label: "Leveranciers" },
        ] as const).map(({ Icon, val, label }) => (
          <div key={label} className="ddp-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent)" }}>
              <Icon className="w-6 h-6" style={{ color: "var(--primary)" }} />
            </div>
            <div><div className="text-3xl font-bold">{val}</div><div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-4">Gebruikers</h2>
          <div className="ddp-card p-0 overflow-hidden">
            <table className="w-full">
              <thead><tr style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
                {["Naam","Rol","Premium"].map((h) => <th key={h} className="text-xs font-semibold text-left px-4 py-3" style={{ color: "var(--muted)" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid var(--border)" : undefined }}>
                    <td className="px-4 py-3"><div className="text-sm font-medium">{u.name}</div><div className="text-xs" style={{ color: "var(--muted)" }}>{u.email}</div></td>
                    <td className="px-4 py-3"><span className={`ddp-badge ${roleColors[u.role] ?? "badge-neutral"}`}>{roleLabels[u.role] ?? u.role}</span></td>
                    <td className="px-4 py-3">{u.isPremium ? <span className="ddp-badge badge-premium">Premium</span> : <span className="text-xs" style={{ color: "var(--muted)" }}>Gratis</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="font-semibold mb-4">Bruiloften</h2>
          <div className="space-y-2">
            {weddings.map((w) => (
              <div key={w.id} className="ddp-card p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{w.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{w.weddingCode} · {w.owner.name}</div>
                </div>
                <div className="text-xs text-right" style={{ color: "var(--muted)" }}>
                  <div>{w._count.guests} gasten</div><div>{w._count.vendors} leveranciers</div>
                </div>
                {w.isPremium && <span className="ddp-badge badge-premium">Premium</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
