"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type AnalyticsData = {
  total: number;
  thisYear: number;
  upcoming: number;
  past: number;
  totalRevenue: number;
  profileViews: number;
  monthsData: { name: string; count: number; revenue: number }[];
  byYear: { year: number; count: number }[];
  topCollaborators: { id: string; name: string; category: string; count: number }[];
};

function euro(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

export default function VendorAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/vendor/analytics")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => setData(d))
      .catch(() => setError("Kan analytics niet laden"))
      .finally(() => setLoading(false));
  }, []);

  const maxMonth = data ? Math.max(...data.monthsData.map(m => m.count), 1) : 1;
  const maxMonthRevenue = data ? Math.max(...data.monthsData.map(m => m.revenue), 1) : 1;
  const maxCollab = data ? Math.max(...data.topCollaborators.map(c => c.count), 1) : 1;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="dash-hero" style={{ borderRadius: 0, padding: "1.25rem 1.25rem 2rem" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6"
            style={{ color: "var(--ink-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Dashboard
          </Link>
          <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--ink-text)" }}>Analytisch overzicht</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--ink-muted)", marginTop: "0.25rem" }}>Jouw prestaties als leverancier</p>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>
        {loading && <p className="text-sm" style={{ color: "var(--muted)" }}>Laden…</p>}
        {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

        {data && (
          <>
            {/* Kerncijfers — inline, geen kaartgrid */}
            <div className="flex flex-wrap gap-x-8 gap-y-4 mb-8 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                { value: data.profileViews, label: "profielweergaven" },
                { value: data.total, label: "bruiloften totaal" },
                { value: data.thisYear, label: "dit jaar" },
                { value: data.upcoming, label: "aankomend" },
                { value: euro(data.totalRevenue), label: "totale omzet" },
              ].map((s) => (
                <div key={s.label}>
                  <span className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{s.value}</span>
                  <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "1px" }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Bruiloften per maand */}
            <section className="mb-8">
              <h2 className="dash-section-title mb-4">Bruiloften per maand</h2>
              <div className="flex items-end gap-1.5" style={{ height: "120px" }}>
                {data.monthsData.map(m => (
                  <div key={m.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{
                      width: "100%", borderRadius: "3px 3px 0 0",
                      height: `${Math.max(4, (m.count / maxMonth) * 100)}px`,
                      background: m.count > 0 ? "var(--ink)" : "var(--border)",
                      transition: "height 0.3s ease",
                    }} />
                    <span style={{ fontSize: "0.5625rem", color: "var(--muted)" }}>{m.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Omzet per maand */}
            {data.monthsData.some(m => m.revenue > 0) && (
              <section className="mb-8">
                <h2 className="dash-section-title mb-4">Omzet per maand</h2>
                <div className="flex items-end gap-1.5" style={{ height: "120px" }}>
                  {data.monthsData.map(m => (
                    <div key={m.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <div style={{
                        width: "100%", borderRadius: "3px 3px 0 0",
                        height: `${Math.max(4, (m.revenue / maxMonthRevenue) * 100)}px`,
                        background: m.revenue > 0 ? "var(--gold)" : "var(--border)",
                        transition: "height 0.3s ease",
                      }} />
                      <span style={{ fontSize: "0.5625rem", color: "var(--muted)" }}>{m.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Per jaar */}
            {data.byYear.length > 1 && (
              <section className="mb-8">
                <h2 className="dash-section-title mb-3">Per jaar</h2>
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {data.byYear.map(({ year, count }) => (
                    <div key={year} className="dash-row">
                      <span className="font-serif" style={{ fontSize: "0.9375rem", fontWeight: 700, minWidth: "48px" }}>{year}</span>
                      <div style={{ flex: 1, height: "3px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "var(--ink)", borderRadius: "999px", width: `${(count / (data.total || 1)) * 100}%` }} />
                      </div>
                      <span className="text-sm flex-shrink-0" style={{ color: "var(--muted)", minWidth: "24px", textAlign: "right" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Samenwerkingen */}
            {data.topCollaborators.length > 0 && (
              <section>
                <h2 className="dash-section-title mb-1">Vaakst mee samengewerkt</h2>
                <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Andere leveranciers op dezelfde bruiloften</p>
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {data.topCollaborators.map((c) => (
                    <div key={c.id} className="dash-row">
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-sm truncate" style={{ fontWeight: 700, color: "var(--foreground)" }}>{c.name}</div>
                        <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{c.category}</div>
                      </div>
                      <div style={{ width: "100px", height: "3px", background: "var(--border)", borderRadius: "999px", overflow: "hidden", flexShrink: 0 }}>
                        <div style={{ height: "100%", background: "var(--gold-deep)", borderRadius: "999px", width: `${(c.count / maxCollab) * 100}%` }} />
                      </div>
                      <span className="text-sm flex-shrink-0" style={{ fontWeight: 700, color: "var(--gold-deep)", minWidth: "20px", textAlign: "right" }}>{c.count}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
