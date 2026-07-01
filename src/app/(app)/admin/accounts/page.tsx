"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Trash2, Mail, Edit2, Check, X, Upload, ChevronDown, Save, Star } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  vendorType: string | null;
  isPremium: boolean;
  hasPassword: boolean;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", planner: "Weddingplanner", couple: "Bruidspaar",
  vendor: "Leverancier", team_member: "Teamlid",
};

const ROLE_BADGE: Record<string, string> = {
  admin: "badge-danger", planner: "badge-info", couple: "badge-warning",
  vendor: "badge-neutral", team_member: "badge-neutral",
};

export default function AccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  // Track pending premium changes: userId -> new value
  const [pendingPremium, setPendingPremium] = useState<Record<string, boolean>>({});

  // CSV import state
  const [showImport, setShowImport] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [sendInvite, setSendInvite] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ total: number; created: number; skipped: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    const res = await fetch(`/api/admin/accounts?${params}`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }, [q, role]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  function setMsg(id: string, msg: string) {
    setFeedback(f => ({ ...f, [id]: msg }));
    setTimeout(() => setFeedback(f => { const n = { ...f }; delete n[id]; return n; }), 3000);
  }

  async function handleDelete(u: User) {
    if (!confirm(`Account van ${u.name} (${u.email}) permanent verwijderen?`)) return;
    setSaving(u.id);
    const res = await fetch(`/api/admin/accounts/${u.id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(us => us.filter(x => x.id !== u.id));
    } else {
      const d = await res.json();
      setMsg(u.id, d.error ?? "Fout bij verwijderen");
    }
    setSaving(null);
  }

  async function handleResetPassword(u: User) {
    if (!confirm(`Wachtwoordreset-e-mail sturen naar ${u.email}?`)) return;
    setSaving(u.id);
    const res = await fetch(`/api/admin/accounts/${u.id}/reset-password`, { method: "POST" });
    setMsg(u.id, res.ok ? "✓ E-mail verstuurd" : "Fout bij versturen");
    setSaving(null);
  }

  async function handleSaveEmail(u: User) {
    if (!editEmail || editEmail === u.email) { setEditId(null); return; }
    setSaving(u.id);
    const res = await fetch(`/api/admin/accounts/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: editEmail }),
    });
    const d = await res.json();
    if (res.ok) {
      setUsers(us => us.map(x => x.id === u.id ? { ...x, email: editEmail } : x));
      setMsg(u.id, "✓ E-mail bijgewerkt");
    } else {
      setMsg(u.id, d.error ?? "Fout bij opslaan");
    }
    setEditId(null);
    setSaving(null);
  }

  async function handleSavePremium(u: User) {
    const newVal = pendingPremium[u.id];
    setSaving(u.id);
    const res = await fetch(`/api/admin/accounts/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPremium: newVal }),
    });
    if (res.ok) {
      setUsers(us => us.map(x => x.id === u.id ? { ...x, isPremium: newVal } : x));
      setPendingPremium(p => { const n = { ...p }; delete n[u.id]; return n; });
      setMsg(u.id, newVal ? "✓ Premium toegekend — e-mail verstuurd" : "✓ Premium verwijderd");
    } else {
      const d = await res.json();
      setMsg(u.id, d.error ?? "Fout bij opslaan");
    }
    setSaving(null);
  }

  async function handleImport() {
    if (!csvFile) return;
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append("file", csvFile);
    fd.append("sendInvite", String(sendInvite));
    const res = await fetch("/api/admin/accounts/import", { method: "POST", body: fd });
    const data = await res.json();
    setImportResult(data);
    setImporting(false);
    if (res.ok) load();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Accountbeheer</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{users.length} accounts gevonden</p>
        </div>
        <button
          onClick={() => setShowImport(s => !s)}
          className="ddp-btn-secondary flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> CSV import
          <ChevronDown className="w-3 h-3" style={{ transform: showImport ? "rotate(180deg)" : undefined, transition: "transform .2s" }} />
        </button>
      </div>

      {/* CSV import panel */}
      {showImport && (
        <div className="ddp-card mb-6 space-y-4">
          <h2 className="font-semibold">Massa-import via CSV</h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Kolommen (kommagescheiden): <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--accent)" }}>name, email, role, vendorType, city, phone, website</code><br />
            <span className="text-xs">Role: vendor / couple / planner / team_member — standaard: vendor. Bestaande e-mailadressen worden overgeslagen.</span>
          </p>
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={e => setCsvFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={sendInvite} onChange={e => setSendInvite(e.target.checked)} className="w-4 h-4" />
            Activatie-e-mail sturen (link geldig 7 dagen)
          </label>
          {importResult && (
            <div className="text-sm p-3 rounded-lg space-y-1" style={{ background: "var(--accent)" }}>
              <p><strong>{importResult.created}</strong> aangemaakt, <strong>{importResult.skipped}</strong> overgeslagen van {importResult.total} rijen.</p>
              {importResult.errors.length > 0 && (
                <details>
                  <summary className="cursor-pointer text-xs" style={{ color: "var(--danger)" }}>{importResult.errors.length} fouten</summary>
                  <ul className="mt-1 space-y-0.5">
                    {importResult.errors.map((e, i) => <li key={i} className="text-xs" style={{ color: "var(--danger)" }}>{e}</li>)}
                  </ul>
                </details>
              )}
            </div>
          )}
          <button
            onClick={handleImport}
            disabled={!csvFile || importing}
            className="ddp-btn-primary"
          >
            {importing ? "Importeren…" : "Importeren"}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Zoeken op naam of e-mail…"
            className="ddp-input w-full pl-9"
          />
        </div>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="ddp-input"
          style={{ width: "180px" }}
        >
          <option value="">Alle rollen</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="ddp-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
              {["Naam", "E-mail", "Rol", "Premium", "Aangemaakt", "Acties"].map(h => (
                <th key={h} className="text-xs font-semibold text-left px-4 py-3" style={{ color: "var(--muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded" style={{ width: `${60 + j * 10}%`, background: "var(--border)", animation: "skeleton-shimmer 1.5s infinite" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: "var(--muted)" }}>Geen accounts gevonden</td></tr>
            ) : users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3" style={{ color: "var(--muted)", maxWidth: "220px" }}>
                  {editId === u.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        className="ddp-input py-1 text-xs flex-1"
                        autoFocus
                        onKeyDown={e => { if (e.key === "Enter") handleSaveEmail(u); if (e.key === "Escape") setEditId(null); }}
                      />
                      <button onClick={() => handleSaveEmail(u)} className="p-1 rounded hover:opacity-70" style={{ color: "var(--success)" }}><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditId(null)} className="p-1 rounded hover:opacity-70" style={{ color: "var(--muted)" }}><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <span className="truncate block">{u.email}</span>
                  )}
                  {feedback[u.id] && <span className="text-xs block mt-0.5" style={{ color: feedback[u.id].startsWith("✓") ? "var(--success)" : "var(--danger)" }}>{feedback[u.id]}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`ddp-badge ${ROLE_BADGE[u.role] ?? "badge-neutral"}`}>
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                  {u.role === "vendor" && u.vendorType && (
                    <span className="ddp-badge badge-neutral ml-1 text-xs">{u.vendorType}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const current = pendingPremium[u.id] ?? u.isPremium;
                    const isDirty = u.id in pendingPremium;
                    return (
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={current}
                            onChange={e => setPendingPremium(p => ({ ...p, [u.id]: e.target.checked }))}
                          />
                          <div
                            className="w-9 h-5 rounded-full transition-colors"
                            style={{ background: current ? "var(--primary)" : "var(--border)" }}
                          />
                          <div
                            className="absolute w-4 h-4 bg-white rounded-full shadow transition-transform"
                            style={{ left: "2px", top: "2px", transform: current ? "translateX(16px)" : "translateX(0)" }}
                          />
                        </label>
                        {current && !isDirty && <Star className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />}
                        {isDirty && (
                          <button
                            onClick={() => handleSavePremium(u)}
                            disabled={saving === u.id}
                            title="Opslaan"
                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold transition-opacity"
                            style={{ background: "var(--primary)", color: "white", opacity: saving === u.id ? 0.6 : 1 }}
                          >
                            <Save className="w-3 h-3" />
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                  {new Date(u.createdAt).toLocaleDateString("nl-NL")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditId(u.id); setEditEmail(u.email); }}
                      title="E-mail wijzigen"
                      className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                      style={{ color: "var(--muted)" }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleResetPassword(u)}
                      disabled={saving === u.id}
                      title="Wachtwoordreset sturen"
                      className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                      style={{ color: "var(--primary)" }}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={saving === u.id}
                      title="Account verwijderen"
                      className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                      style={{ color: "var(--danger)" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
