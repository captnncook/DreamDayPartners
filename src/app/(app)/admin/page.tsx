import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BulkVendorImport from "./BulkVendorImport";
import ClaimRequests from "./ClaimRequests";
import GeocodeVendors from "./GeocodeVendors";

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

  const roleLabels: Record<string, string> = { admin: "Admin", planner: "Planner", couple: "Bruidspaar", vendor: "Leverancier", team_member: "Teamlid" };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Platform Beheer</h1>
        <div className="flex gap-6">
          {[
            { val: userCount, label: "Gebruikers" },
            { val: weddingCount, label: "Bruiloften" },
            { val: vendorCount, label: "Leveranciers" },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: "right" }}>
              <span className="font-serif" style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{val}</span>
              <span style={{ display: "block", fontSize: "0.625rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "1px" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <ClaimRequests />

      <div className="mb-8">
        <BulkVendorImport />
      </div>
      <GeocodeVendors />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="dash-section-title mb-1">Gebruikers</h2>
          <div style={{ borderTop: "1px solid var(--border)", overflowX: "auto" }}>
            <table className="w-full" style={{ minWidth: "360px" }}>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-1 py-3">
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>{u.email}</div>
                    </td>
                    <td className="px-1 py-3">
                      <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: u.role === "admin" ? "var(--gold-deep)" : "var(--muted)" }}>
                        {roleLabels[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-1 py-3 text-right">
                      {u.isPremium
                        ? <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold-deep)" }}>Premium</span>
                        : <span className="text-xs" style={{ color: "var(--muted-light)" }}>Gratis</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="dash-section-title mb-1">Bruiloften</h2>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {weddings.map((w) => (
              <div key={w.id} className="dash-row">
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-sm truncate" style={{ fontWeight: 700 }}>{w.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {w.weddingCode} · {w.owner.name}
                    {w.isPremium && (
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold-deep)", marginLeft: "0.5rem" }}>Premium</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-right flex-shrink-0" style={{ color: "var(--muted)" }}>
                  <div>{w._count.guests} gasten</div>
                  <div>{w._count.vendors} leveranciers</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
