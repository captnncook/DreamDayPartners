"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DashboardEngine from "@/components/vendor-modules/DashboardEngine";
import { formatDateRange } from "@/lib/dateRange";
import { useLang } from "@/components/LangProvider";
import type { ComponentProps } from "react";

type OtherVendor = { id: string; name: string; category: string; email: string | null; phone: string | null };

type Props = {
  weddingId: string;
  weddingTitle: string;
  weddingDate: string;
  weddingEndDate: string | null;
  booking: {
    id: string;
    specificDate: string | null;
    vendor: { id: string; name: string; category: string; city: string | null; email: string | null; setupTime: string | null; teardownTime: string | null };
  };
  otherVendors: OtherVendor[];
  dashboardEngineProps: ComponentProps<typeof DashboardEngine>;
};

export default function VendorBookingClient({ weddingId, weddingTitle, weddingDate, weddingEndDate, booking, otherVendors, dashboardEngineProps }: Props) {
  const { t } = useLang();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      {/* Back navigation */}
      <div style={{ marginBottom: "var(--space-7)" }}>
        <Link
          href={`/weddings/${weddingId}`}
          style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-md)", color: "var(--muted)", textDecoration: "none" }}
        >
          <ChevronLeft size={16} />
          {weddingTitle}
        </Link>
      </div>

      {/* Header */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "var(--space-6)", background: "var(--blush-soft)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
          <div style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--primary)", flexShrink: 0 }}>
            {booking.vendor.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--charcoal)", letterSpacing: "-0.02em" }}>
              {booking.vendor.name}
            </h1>
            <div style={{ fontSize: "var(--text-md)", color: "var(--muted)", textTransform: "capitalize" }}>
              {booking.vendor.category}
              {booking.vendor.city && ` · ${booking.vendor.city}`}
            </div>
            {weddingEndDate && (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--gold-deep)", fontWeight: 600, marginTop: "2px" }}>
                {booking.specificDate
                  ? t.vendors.workingOnRange.replace("{range}", formatDateRange(new Date(booking.specificDate)))
                  : t.vendors.multiDayAllDays.replace("{range}", formatDateRange(new Date(weddingDate), weddingEndDate ? new Date(weddingEndDate) : null))}
              </div>
            )}
          </div>
          {booking.vendor.email && (
            <a href={`mailto:${booking.vendor.email}`} style={{ fontSize: "var(--text-base)", color: "var(--primary)", textDecoration: "none" }}>
              {t.vendors.contact}
            </a>
          )}
        </div>
      </div>

      {otherVendors.length > 0 && (
        <div className="card" style={{ padding: "1.25rem 1.5rem", marginBottom: "var(--space-6)" }}>
          <div className="ddp-section-label" style={{ marginBottom: "var(--space-4)" }}>{t.vendors.otherVendorsTitle}</div>
          <div style={{ display: "grid", gap: 0 }}>
            {otherVendors.map((v, i) => (
              <div key={v.id} className="dash-row" style={{ padding: "0.625rem 0", borderTop: i > 0 ? "1px solid var(--border)" : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-4)", width: "100%" }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{v.name}</span>
                    <span style={{ color: "var(--muted)", textTransform: "capitalize" }}> · {v.category}</span>
                  </div>
                  {v.email && (
                    <a href={`mailto:${v.email}`} style={{ fontSize: "var(--text-sm)", color: "var(--gold-deep)", fontWeight: 600, textDecoration: "none" }}>{t.vendors.contact}</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DashboardEngine {...dashboardEngineProps} />
    </div>
  );
}
