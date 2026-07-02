"use client";

import { useEffect, useState, useCallback } from "react";

type ClaimRequest = {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  vendor: { id: string; name: string; category: string; city: string | null };
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(iso));
}

export default function ClaimRequests() {
  const [requests, setRequests] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reminded, setReminded] = useState<Record<string, boolean>>({});

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

  async function remind(id: string) {
    setBusyId(id);
    await fetch(`/api/admin/claim-requests/${id}/remind`, { method: "POST" });
    setReminded((r) => ({ ...r, [id]: true }));
    setBusyId(null);
  }

  const pending = requests.filter((r) => r.status === "pending");
  const others = requests.filter((r) => r.status !== "pending");

  const statusColor: Record<string, string> = {
    approved: "var(--foreground)", completed: "var(--muted)", rejected: "var(--muted-light)",
  };
  const statusLabel: Record<string, string> = {
    approved: "Goedgekeurd (wacht op activatie)", completed: "Geactiveerd", rejected: "Afgewezen",
  };

  if (loading) return null;
  if (requests.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="dash-section-title mb-1">Profiel-claims</h2>
      <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
        Aanvragen van leveranciers die hun (geïmporteerde) profiel willen claimen.
      </p>

      {pending.length > 0 && (
        <div className="mb-2" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {pending.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3" style={{ background: "var(--sand)", borderLeft: "3px solid var(--gold)", borderRadius: "0 var(--radius-md) var(--radius-md) 0" }}>
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
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {others.map((r) => (
            <div key={r.id} className="dash-row">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.vendor.name}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{r.email} · {formatDate(r.createdAt)}</div>
              </div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: statusColor[r.status] ?? "var(--muted)", flexShrink: 0 }}>
                {statusLabel[r.status] ?? r.status}
              </span>
              {r.status === "approved" && (
                <button
                  onClick={() => remind(r.id)}
                  disabled={busyId === r.id || reminded[r.id]}
                  className="ddp-btn-ghost flex-shrink-0"
                  style={{ padding: "0.3rem 0.7rem", fontSize: "0.75rem" }}
                >
                  {reminded[r.id] ? "Verstuurd" : "Stuur herinnering"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
