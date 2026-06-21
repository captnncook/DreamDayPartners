"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

type Vendor = { id: string; name: string; category: string; email?: string; phone?: string; contactPerson?: string };
type WeddingVendor = { id: string; status: string; portalAccess: boolean; notes?: string; vendor: Vendor };

const VENDOR_ICONS: Record<string, string> = {
  bloemist: "🌸", dj: "🎵", catering: "🍽️", fotograaf: "📷",
  locatie: "🏰", muziek: "🎶", video: "🎬", transport: "🚗", haar_make: "💄",
};

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLang();
  const tm = t.team;

  const [weddingVendors, setWeddingVendors] = useState<WeddingVendor[]>([]);
  const [weddingTitle, setWeddingTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [wvRes, wRes] = await Promise.all([
      fetch(`/api/weddings/${id}/vendors`),
      fetch(`/api/weddings/${id}`),
    ]);
    const [wvData, wData] = await Promise.all([wvRes.json(), wRes.json()]);
    setWeddingVendors(wvData.vendors ?? []);
    setWeddingTitle(wData.wedding?.title ?? "");
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-8" style={{ color: "var(--muted)" }}>{t.common.loading}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${id}`} className="text-sm hover:underline" style={{ color: "var(--muted)" }}>
          ← {t.tabs.overview}
        </Link>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{tm.title}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {tm.sub} {weddingTitle}
          </p>
        </div>
      </div>

      {weddingVendors.length === 0 ? (
        <div className="ddp-card text-center py-20" style={{ color: "var(--muted)" }}>
          <div className="text-5xl mb-4">🤝</div>
          <h2 className="font-semibold text-lg mb-2">{tm.noVendors}</h2>
          <p className="text-sm mb-6">{tm.noVendorsSub}</p>
          <Link href={`/weddings/${id}/vendors`} className="ddp-btn-primary">
            {tm.goToVendors}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {weddingVendors.map((wv) => {
            const icon = VENDOR_ICONS[wv.vendor.category] ?? "🤝";
            const statusLabel = tm.statusLabels[wv.status as keyof typeof tm.statusLabels] ?? wv.status;
            const statusColor =
              wv.status === "confirmed" ? "badge-success"
              : wv.status === "booked" ? "badge-info"
              : wv.status === "quote_received" ? "badge-warning"
              : "badge-neutral";

            return (
              <Link
                key={wv.id}
                href={`/weddings/${id}/vendors/${wv.id}`}
                className="ddp-card group hover:shadow-md transition-shadow block"
              >
                {/* Top: icon + name */}
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "var(--accent)" }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate group-hover:underline" style={{ color: "var(--primary)" }}>
                      {wv.vendor.name}
                    </h3>
                    <div className="text-xs capitalize mt-0.5" style={{ color: "var(--muted)" }}>
                      {wv.vendor.category}
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className={`ddp-badge ${statusColor}`}>{statusLabel}</span>
                      {wv.portalAccess && (
                        <span className="ddp-badge badge-premium" style={{ fontSize: "0.6rem" }}>
                          {tm.portal}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 text-xs border-t pt-3" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
                  {wv.vendor.contactPerson && <div>👤 {wv.vendor.contactPerson}</div>}
                  {wv.vendor.email && (
                    <div
                      className="truncate hover:underline"
                      style={{ color: "var(--primary)" }}
                      onClick={(e) => e.preventDefault()}
                    >
                      ✉️ {wv.vendor.email}
                    </div>
                  )}
                  {wv.vendor.phone && <div>📞 {wv.vendor.phone}</div>}
                  {wv.notes && <div className="italic pt-1">{wv.notes}</div>}
                </div>

                {/* CTA */}
                <div
                  className="mt-3 pt-3 border-t text-xs font-medium flex items-center justify-end gap-1"
                  style={{ borderColor: "var(--border)", color: "var(--primary)" }}
                >
                  {tm.viewDetail} →
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
