"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/components/LangProvider";

type Signal = { id: string; kind: string; ip: string | null; email: string | null; createdAt: string };
type IpRow = { ip: string; count: number; notable: boolean };

export default function ActivityClient() {
  const { t } = useLang();
  const aa = t.adminActivity;
  const [recent, setRecent] = useState<Signal[]>([]);
  const [perIp, setPerIp] = useState<IpRow[]>([]);
  const [threshold, setThreshold] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/activity")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setRecent(d.recent ?? []);
          setPerIp(d.perIp ?? []);
          setThreshold(d.notableThreshold ?? 8);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const kindLabel: Record<string, string> = {
    register: aa.kindRegister, rsvp: aa.kindRsvp, vendor_contact: aa.kindVendorContact, login_failed: aa.kindLoginFailed,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{aa.pageTitle}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)", maxWidth: "560px" }}>{aa.subtitle}</p>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>{aa.loading}</p>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="dash-section-title mb-1">{aa.perIpTitle}</h2>
            {perIp.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>{aa.perIpEmpty}</p>
            ) : (
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {perIp.map((row) => (
                  <div key={row.ip} className="dash-row">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-mono">{row.ip}</span>
                      {row.notable && (
                        <div className="text-xs mt-0.5" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                          {aa.notableNote.replace("{n}", String(threshold))}
                        </div>
                      )}
                    </div>
                    <div className="text-sm flex-shrink-0" style={{ fontWeight: row.notable ? 700 : 500, color: row.notable ? "var(--gold-deep)" : "var(--foreground)" }}>
                      {aa.timesLabel.replace("{n}", String(row.count))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="dash-section-title mb-1">{aa.recentTitle}</h2>
            {recent.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>{aa.recentEmpty}</p>
            ) : (
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {recent.map((s) => (
                  <div key={s.id} className="dash-row">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm">{kindLabel[s.kind] ?? s.kind}</span>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                        {s.email ?? "—"} {s.ip ? `· ${s.ip}` : ""}
                      </div>
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
                      {new Date(s.createdAt).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
