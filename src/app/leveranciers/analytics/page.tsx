"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Calendar, Euro, Star } from "lucide-react";

type AnalyticsData = {
  total: number;
  thisYear: number;
  upcoming: number;
  past: number;
  totalRevenue: number;
  monthsData: { name: string; count: number; revenue: number }[];
  byYear: { year: number; count: number }[];
};

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

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
      <div style={{ background: "var(--foreground)", padding: "1.25rem 1.25rem 2rem" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <Link href="/dashboard" className="inline-flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "1.5rem", display: "inline-flex" }}>
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "white" }}>Analytisch overzicht</h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>Jouw prestaties als leverancier</p>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "1.5rem auto", padding: "0 1.25rem 3rem" }}>
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ height: "100px", borderRadius: "16px",
                background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                backgroundSize: "200% 100%", animation: "skeleton-shimmer 1.5s infinite" }} />
            ))}
          </div>
        )}

        {error && <p style={{ color: "var(--danger)", textAlign: "center", padding: "2rem" }}>{error}</p>}

        {data && (
          <>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Totaal bruiloften", value: data.total, icon: <Star className="w-4 h-4" />, color: "var(--primary)" },
                { label: "Dit jaar", value: data.thisYear, icon: <Calendar className="w-4 h-4" />, color: "#7c3aed" },
                { label: "Aankomend", value: data.upcoming, icon: <TrendingUp className="w-4 h-4" />, color: "#16a34a" },
                { label: "Totale omzet", value: new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(data.totalRevenue), icon: <Euro className="w-4 h-4" />, color: "#d97706", tooltip: "Gebaseerd op bevestigde betalingen binnen dit platform" },
              ].map(({ label, value, icon, color, tooltip }) => (
                <div key={label} style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: typeof value === "string" ? "1.375rem" : "2rem", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "4px", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        {label}
                        {tooltip && (
                          <span style={{ position: "relative", display: "inline-flex" }}>
                            <span style={{ cursor: "help", color: "var(--muted)", fontSize: "0.6875rem", border: "1px solid var(--border)", borderRadius: "50%", width: "14px", height: "14px", display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                              onMouseEnter={e => { const t = e.currentTarget.nextElementSibling as HTMLElement; if (t) t.style.display = "block"; }}
                              onMouseLeave={e => { const t = e.currentTarget.nextElementSibling as HTMLElement; if (t) t.style.display = "none"; }}>?</span>
                            <span style={{ display: "none", position: "absolute", bottom: "120%", left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "white", fontSize: "0.6875rem", padding: "0.375rem 0.625rem", borderRadius: "8px", whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>{tooltip}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bruiloften per maand */}
            <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: "1px solid rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1.25rem" }}>Bruiloften per maand</h2>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "120px" }}>
                {data.monthsData.map(m => (
                  <div key={m.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      height: `${Math.max(4, (m.count / maxMonth) * 100)}px`,
                      background: m.count > 0 ? "var(--primary)" : "var(--color-blush-soft)",
                      transition: "height 0.3s ease",
                    }} />
                    <span style={{ fontSize: "0.5625rem", color: "var(--muted)", textAlign: "center" }}>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Omzet per maand */}
            {data.monthsData.some(m => m.revenue > 0) && (
              <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: "1px solid rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1.25rem" }}>Omzet per maand</h2>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "120px" }}>
                  {data.monthsData.map(m => (
                    <div key={m.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <div style={{
                        width: "100%", borderRadius: "4px 4px 0 0",
                        height: `${Math.max(4, (m.revenue / maxMonthRevenue) * 100)}px`,
                        background: m.revenue > 0 ? "#d97706" : "var(--color-blush-soft)",
                        transition: "height 0.3s ease",
                      }} />
                      <span style={{ fontSize: "0.5625rem", color: "var(--muted)", textAlign: "center" }}>{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Per jaar */}
            {data.byYear.length > 1 && (
              <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>Per jaar</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {data.byYear.map(({ year, count }) => (
                    <div key={year} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, minWidth: "48px" }}>{year}</span>
                      <div style={{ flex: 1, height: "8px", background: "var(--color-blush-soft)", borderRadius: "9999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "var(--primary)", borderRadius: "9999px", width: `${(count / (data.total || 1)) * 100}%` }} />
                      </div>
                      <span style={{ fontSize: "0.875rem", color: "var(--muted)", minWidth: "32px", textAlign: "right" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
