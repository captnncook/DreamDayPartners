import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

const VENDOR_ICONS: Record<string, string> = {
  bloemist: "🌸", dj: "🎵", catering: "🍽️", fotograaf: "📷", locatie: "🏰",
  muziek: "🎶", video: "🎬", transport: "🚗", haar_make: "💄", default: "🤝",
};
const STATUS_COLORS: Record<string, string> = {
  contacted: "badge-neutral", quote_received: "badge-warning", booked: "badge-info", confirmed: "badge-success",
};
const STATUS_LABELS: Record<string, string> = {
  contacted: "Gecontacteerd", quote_received: "Offerte ontvangen", booked: "Geboekt", confirmed: "Bevestigd",
};

export default async function VendorsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    select: { id: true, title: true, isPremium: true },
  });
  if (!wedding) notFound();

  const weddingVendors = await prisma.weddingVendor.findMany({
    where: { weddingId: id },
    include: { vendor: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${id}`} className="text-sm hover:underline" style={{ color: "var(--muted)" }}>← Terug</Link>
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-bold">Leveranciers</h1>
        </div>
      </div>

      {!wedding.isPremium && (
        <div className="ddp-card mb-6 flex items-center gap-4" style={{ background: "#fef9ec", border: "1px solid #f5d080" }}>
          <span className="text-2xl">⭐</span>
          <div>
            <div className="font-semibold text-sm">Leveranciersportaal is een Premium functie</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Met een Premium account kunnen leveranciers inloggen en hun eigen draaiboek-items en communicatie bekijken.
            </div>
          </div>
          <button className="ddp-btn-primary ml-auto flex-shrink-0 text-sm">Upgrade naar Premium</button>
        </div>
      )}

      {weddingVendors.length === 0 ? (
        <div className="ddp-card text-center py-16" style={{ color: "var(--muted)" }}>
          <div className="text-4xl mb-3">🤝</div>
          <h2 className="font-semibold text-lg mb-2">Nog geen leveranciers</h2>
          <p className="text-sm">Voeg leveranciers toe om ze te koppelen aan deze bruiloft</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {weddingVendors.map((wv) => (
            <div key={wv.id} className="ddp-card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "var(--accent)" }}>
                  {VENDOR_ICONS[wv.vendor.category] ?? VENDOR_ICONS.default}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{wv.vendor.name}</h3>
                    <span className={`ddp-badge ${STATUS_COLORS[wv.status] ?? "badge-neutral"}`}>
                      {STATUS_LABELS[wv.status] ?? wv.status}
                    </span>
                    {wv.portalAccess && <span className="ddp-badge badge-premium">Portal</span>}
                  </div>
                  <div className="text-xs capitalize mt-0.5" style={{ color: "var(--muted)" }}>{wv.vendor.category}</div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs" style={{ color: "var(--muted)" }}>
                {wv.vendor.contactPerson && (
                  <div className="flex items-center gap-2"><span>👤</span><span>{wv.vendor.contactPerson}</span></div>
                )}
                {wv.vendor.email && (
                  <div className="flex items-center gap-2">
                    <span>✉️</span>
                    <a href={`mailto:${wv.vendor.email}`} className="hover:underline" style={{ color: "var(--primary)" }}>{wv.vendor.email}</a>
                  </div>
                )}
                {wv.vendor.phone && (
                  <div className="flex items-center gap-2"><span>📞</span><span>{wv.vendor.phone}</span></div>
                )}
                {wv.notes && (
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                    <div className="font-medium text-xs mb-0.5">Notities</div>
                    <p>{wv.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {wv.portalAccess ? "✅ Leverancier heeft portaltoegang" : "Geen portaltoegang"}
                </span>
                {wedding.isPremium && (
                  <button className="text-xs" style={{ color: "var(--primary)" }}>
                    {wv.portalAccess ? "Toegang intrekken" : "Portal uitnodigen"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
