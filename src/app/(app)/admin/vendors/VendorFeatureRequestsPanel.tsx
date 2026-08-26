"use client";

import { useState, useEffect, useCallback } from "react";
import { MODULE_LABELS, type ModuleKey } from "@/lib/vendorTypeConfigs";
import { useLang } from "@/components/LangProvider";

type FeatureRequest = {
  id: string;
  moduleKey: string;
  message: string | null;
  status: string;
  createdAt: string;
  vendor: { id: string; name: string; category: string };
};

export default function VendorFeatureRequestsPanel() {
  const { t } = useLang();
  const tf = t.adminVendors.featureRequests;
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/feature-requests");
    if (res.ok) setRequests((await res.json()).requests ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function decide(id: string, action: "approve" | "reject") {
    setBusyId(id);
    const res = await fetch(`/api/admin/feature-requests/${id}/${action}`, { method: "POST" });
    if (res.ok) await load();
    setBusyId(null);
  }

  const pending = requests.filter((r) => r.status === "pending");
  const decided = requests.filter((r) => r.status !== "pending");

  if (loading || requests.length === 0) return null;

  return (
    <div className="ddp-card mb-6">
      <h2 className="font-semibold mb-1">{tf.title}</h2>
      <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
        {tf.subtitle}
      </p>

      {pending.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>{tf.none}</p>
      ) : (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {pending.map((r) => {
            const moduleLabel = MODULE_LABELS[r.moduleKey as ModuleKey] ?? r.moduleKey;
            const [before, after] = tf.requestsLine.split("{name}")[1].split("{module}");
            return (
              <div key={r.id} className="dash-row">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    {r.vendor.name} <span style={{ color: "var(--muted)", fontWeight: 400 }}>{before.trim()}</span> {moduleLabel}{after}
                  </div>
                  {r.message && <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{r.message}</div>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => decide(r.id, "reject")} disabled={busyId === r.id} className="text-xs" style={{ color: "var(--muted)", fontWeight: 600 }}>
                    {tf.reject}
                  </button>
                  <button onClick={() => decide(r.id, "approve")} disabled={busyId === r.id} className="ddp-btn-secondary" style={{ fontSize: "var(--text-sm)", padding: "0.3rem 0.75rem" }}>
                    {tf.approve}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {decided.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs cursor-pointer" style={{ color: "var(--muted)", fontWeight: 600 }}>
            {tf.decidedSummary
              .replace("{n}", String(decided.length))
              .replace("{suffix}", decided.length === 1 ? "" : "e")
              .replace("{plural}", decided.length === 1 ? "" : "en")}
          </summary>
          <div style={{ borderTop: "1px solid var(--border)", marginTop: "var(--space-3)" }}>
            {decided.map((r) => (
              <div key={r.id} className="dash-row">
                <div className="flex-1 min-w-0 text-sm">
                  {r.vendor.name} · {MODULE_LABELS[r.moduleKey as ModuleKey] ?? r.moduleKey}
                </div>
                <span className="text-xs flex-shrink-0" style={{ fontWeight: 700, color: r.status === "approved" ? "var(--gold-deep)" : "var(--muted)" }}>
                  {r.status === "approved" ? tf.approved : tf.rejectedStatus}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
