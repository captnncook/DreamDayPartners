"use client";

import { useEffect, useState, useCallback } from "react";

type ClaimRequest = {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  vendor: { id: string; name: string; category: string; city: string | null };
};

export default function ClaimRequests() {
  const [requests, setRequests] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/claim-requests");
    if (res.ok) {
      const data = await res.json();
      setRequests(data.requests ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function decide(id: string, action: "approve" | "reject") {
    setBusyId(id);
    await fetch(`/api/admin/claim-requests/${id}/${action}`, { method: "POST" });
    await load();
    setBusyId(null);
  }

  const pending = requests.filter((r) => r.status === "pending");
  const others = requests.filter((r) => r.status !== "pending");

  const statusColor: Record<string, string> = {
    pending: "var(--gold-deep)", approved: "var(--foreground)", completed: "var(--muted)", rejected: "var(--muted-light)",
  };
  const statusLabel: Record<string, string> = {
    pending: "In afwachting", approved: "Goedgekeurd (wacht op activatie)", completed: "Geactiveerd", rejected: "Afgewezen",
  };

  if (loading) return null;
  if (requests.length === 0) return null;

  return (
    <div className="ddp-card mb-8">
      <h2 className="font-semibold mb-1">Profiel-claims</h2>
      <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
        Aanvragen van leveranciers die hun (geïmporteerde) profiel willen claimen.
      </p>

      {pending.length > 0 && (
        <div className="space-y-2 mb-4">
          {pending.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--sand)", borderLeft: "3px solid var(--gold)", borderRadius: "0 var(--radius-md) var(--radius-md) 0" }}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.vendor.name}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{r.email} · {r.vendor.category}{r.vendor.city ? ` · ${r.vendor.city}` : ""}</div>
              </div>
              <button
                onClick={() => decide(r.id, "approve")}
                disabled={busyId === r.id}
                className="ddp-btn-primary"
                style={{ padding: "0.4rem 0.9rem", fontSize: "0.8125rem" }}
              >
                Goedkeuren
              </button>
              <button
                onClick={() => decide(r.id, "reject")}
                disabled={busyId === r.id}
                className="ddp-btn-secondary"
                style={{ padding: "0.4rem 0.9rem", fontSize: "0.8125rem" }}
              >
                Afwijzen
              </button>
            </div>
          ))}
        </div>
      )}

      {others.length > 0 && (
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Profiel", "E-mail", "Status"].map((h) => (
                <th key={h} className="text-xs font-semibold text-left px-2 py-2" style={{ color: "var(--muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {others.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-2 py-2 text-sm">{r.vendor.name}</td>
                <td className="px-2 py-2 text-xs" style={{ color: "var(--muted)" }}>{r.email}</td>
                <td className="px-2 py-2">
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: statusColor[r.status] ?? "var(--muted)" }}>{statusLabel[r.status] ?? r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
