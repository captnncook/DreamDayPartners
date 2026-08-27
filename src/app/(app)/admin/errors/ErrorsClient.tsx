"use client";

import { useState, useEffect, useCallback } from "react";
import { useLang } from "@/components/LangProvider";

type ErrorLogRow = {
  id: string;
  message: string;
  stack: string | null;
  digest: string | null;
  source: string;
  route: string | null;
  method: string | null;
  statusCode: number | null;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  requestId: string | null;
  context: string | null;
  status: string;
  createdAt: string;
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export default function ErrorsClient() {
  const { t } = useLang();
  const e = t.adminErrors;
  const [errors, setErrors] = useState<ErrorLogRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ new: 0, seen: 0, resolved: 0 });
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/errors?${params}`);
    const data = await res.json();
    setErrors(data.errors ?? []);
    setCounts(data.countByStatus ?? { new: 0, seen: 0, resolved: 0 });
    setLoading(false);
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function setRowStatus(id: string, newStatus: string) {
    setErrors((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    await fetch(`/api/admin/errors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  async function deleteRow(id: string) {
    if (!confirm(e.deleteConfirm)) return;
    setErrors((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/admin/errors/${id}`, { method: "DELETE" });
    load();
  }

  function copyForDeveloper(row: ErrorLogRow) {
    const parts = [
      `${e.message ?? "Message"}: ${row.message}`,
      `${e.route}: ${row.method ?? ""} ${row.route ?? "-"}${row.statusCode ? ` (${row.statusCode})` : ""}`,
      `${e.source}: ${row.source}`,
      `${e.time}: ${row.createdAt}`,
      `${e.user}: ${row.userEmail ?? e.noUser}${row.userRole ? ` (${row.userRole})` : ""}`,
      row.digest ? `Digest: ${row.digest}` : null,
      row.stack ? `\n${e.stackTrace}:\n${row.stack}` : null,
      row.context ? `\n${e.context}:\n${row.context}` : null,
    ].filter(Boolean).join("\n");
    navigator.clipboard?.writeText(parts).then(() => {
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const filters = [
    { value: "", label: e.filterAll },
    { value: "new", label: `${e.filterNew} (${counts.new ?? 0})` },
    { value: "seen", label: `${e.filterSeen} (${counts.seen ?? 0})` },
    { value: "resolved", label: `${e.filterResolved} (${counts.resolved ?? 0})` },
  ];

  const sourceLabel: Record<string, string> = { api: e.sourceApi, server: e.sourceServer, client: e.sourceClient };
  const statusLabel: Record<string, string> = { new: e.statusNew, seen: e.statusSeen, resolved: e.statusResolved };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{e.pageTitle}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)", maxWidth: "560px" }}>{e.subtitle}</p>
      </div>

      <div className="flex gap-1 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className="ddp-btn-ghost"
            style={{
              fontSize: "var(--text-base)",
              fontWeight: status === f.value ? 700 : 500,
              color: status === f.value ? "var(--foreground)" : "var(--muted)",
              padding: "0.4rem 0.875rem",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>{e.loading}</p>
      ) : errors.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>{e.empty}</p>
      ) : (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {errors.map((row) => {
            const isOpen = openId === row.id;
            return (
              <div key={row.id} className="dash-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "var(--space-2)" }}>
                <button
                  onClick={() => setOpenId(isOpen ? null : row.id)}
                  className="w-full text-left flex items-start justify-between gap-4"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm truncate"
                      style={{ fontWeight: row.status === "new" ? 700 : 500, color: row.status === "resolved" ? "var(--muted)" : "var(--foreground)" }}
                    >
                      {row.message}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {sourceLabel[row.source] ?? row.source}
                      {row.route ? ` · ${row.method ?? ""} ${row.route}` : ""}
                      {row.statusCode ? ` (${row.statusCode})` : ""}
                      {row.userEmail ? ` · ${row.userEmail}` : ""}
                    </div>
                  </div>
                  <div className="text-xs flex-shrink-0 text-right" style={{ color: row.status === "new" ? "var(--gold-deep)" : "var(--muted)", fontWeight: row.status === "new" ? 700 : 500 }}>
                    <div>{statusLabel[row.status] ?? row.status}</div>
                    <div style={{ color: "var(--muted)", fontWeight: 500 }}>{formatTime(row.createdAt)}</div>
                  </div>
                </button>

                {isOpen && (
                  <div className="text-xs" style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
                    {row.stack && (
                      <div className="mb-2">
                        <div className="ddp-section-label mb-1">{e.stackTrace}</div>
                        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "var(--sand)", borderRadius: "8px", padding: "0.75rem", maxHeight: "260px", overflow: "auto", fontFamily: "monospace", fontSize: "0.7rem" }}>
                          {row.stack}
                        </pre>
                      </div>
                    )}
                    {row.context && (
                      <div className="mb-2">
                        <div className="ddp-section-label mb-1">{e.context}</div>
                        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "var(--sand)", borderRadius: "8px", padding: "0.75rem", maxHeight: "180px", overflow: "auto", fontFamily: "monospace", fontSize: "0.7rem" }}>
                          {row.context}
                        </pre>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {row.status !== "seen" && <button onClick={() => setRowStatus(row.id, "seen")} className="ddp-btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "var(--text-sm)" }}>{e.markSeen}</button>}
                      {row.status !== "resolved" && <button onClick={() => setRowStatus(row.id, "resolved")} className="ddp-btn-primary" style={{ padding: "0.4rem 0.75rem", fontSize: "var(--text-sm)" }}>{e.markResolved}</button>}
                      {row.status === "resolved" && <button onClick={() => setRowStatus(row.id, "new")} className="ddp-btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "var(--text-sm)" }}>{e.reopen}</button>}
                      <button onClick={() => copyForDeveloper(row)} className="ddp-btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "var(--text-sm)" }}>
                        {copiedId === row.id ? e.copiedMsg : e.copyBtn}
                      </button>
                      <button onClick={() => deleteRow(row.id)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "var(--text-sm)", cursor: "pointer", padding: "0.4rem 0.75rem" }}>
                        {e.deleteBtn}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
