"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

type VendorRow = { id: string; name: string; category: string; phone: string | null };
type WeddingWithVendors = { id: string; title: string; vendors: { id: string; vendor: VendorRow }[] };

export default function AllVendorsClient({ weddings }: { weddings: WeddingWithVendors[] }) {
  const { t } = useLang();
  const total = weddings.reduce((s, w) => s + w.vendors.length, 0);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{t.vendors.allVendorsTitle}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {t.vendors.summary
            .replace("{n}", String(total)).replace("{s}", total !== 1 ? "s" : "")
            .replace("{m}", String(weddings.length)).replace("{plural}", weddings.length !== 1 ? "en" : "")}
        </p>
      </div>

      {weddings.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          {t.vendors.noWeddingsWithVendors}
        </p>
      ) : (
        weddings.map((w) => (
          <section key={w.id} className="mb-8">
            <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
              <h2 className="dash-section-title">{w.title}</h2>
              <Link href={`/weddings/${w.id}/vendors`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>{t.vendors.manage}</Link>
            </div>
            {w.vendors.length === 0 ? (
              <p className="text-sm py-4" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>{t.vendors.noneLinkedYet}</p>
            ) : (
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {w.vendors.map((wv) => (
                  <div key={wv.id} className="dash-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="font-serif" style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--foreground)" }}>{wv.vendor.name}</span>
                      <span className="capitalize" style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginLeft: "var(--space-4)" }}>
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
