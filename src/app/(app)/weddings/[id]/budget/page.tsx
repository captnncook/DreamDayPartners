"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type BudgetItem = {
  id: string;
  category: string;
  description: string;
  estimated: number;
  actual: number;
  payStatus: string;
  vendor?: { name: string } | null;
};

type Budget = {
  totalAmount: number;
  currency: string;
  items: BudgetItem[];
};

const PAY_COLORS: Record<string, string> = {
  pending: "badge-neutral", deposit_paid: "badge-warning", paid: "badge-success",
};
const PAY_LABELS: Record<string, string> = {
  pending: "Openstaand", deposit_paid: "Aanbetaald", paid: "Betaald",
};

function euro(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

export default function BudgetPage() {
  const { id } = useParams<{ id: string }>();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTotal, setEditTotal] = useState(false);
  const [newTotal, setNewTotal] = useState("");
  const [form, setForm] = useState({ category: "Catering", description: "", estimated: "", actual: "", payStatus: "pending" });
  const [saving, setSaving] = useState(false);

  async function deleteItem(itemId: string) {
    if (!confirm("Budgetpost verwijderen?")) return;
    await fetch(`/api/weddings/${id}/budget/${itemId}`, { method: "DELETE" });
    load();
  }

  async function cyclePayStatus(item: BudgetItem) {
    const next = item.payStatus === "pending" ? "deposit_paid" : item.payStatus === "deposit_paid" ? "paid" : "pending";
    await fetch(`/api/weddings/${id}/budget/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payStatus: next }),
    });
    load();
  }

  const load = useCallback(async () => {
    const res = await fetch(`/api/weddings/${id}/budget`);
    const data = await res.json();
    setBudget(data.budget);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleUpdateTotal(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/weddings/${id}/budget`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalAmount: parseFloat(newTotal) }),
    });
    setEditTotal(false);
    load();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/weddings/${id}/budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        estimated: parseFloat(form.estimated) || 0,
        actual: parseFloat(form.actual) || 0,
      }),
    });
    setForm({ category: "Catering", description: "", estimated: "", actual: "", payStatus: "pending" });
    setShowForm(false);
    setSaving(false);
    load();
  }

  if (loading) return <div className="p-8" style={{ color: "var(--muted)" }}>Laden...</div>;
  if (!budget) return <div className="p-8">Geen budget gevonden</div>;

  const totalEstimated = budget.items.reduce((s, i) => s + i.estimated, 0);
  const totalActual = budget.items.reduce((s, i) => s + i.actual, 0);
  const remaining = budget.totalAmount - totalActual;
  const pct = budget.totalAmount > 0 ? Math.min(100, Math.round((totalActual / budget.totalAmount) * 100)) : 0;

  const byCategory = budget.items.reduce<Record<string, BudgetItem[]>>((acc, item) => {
    acc[item.category] = [...(acc[item.category] ?? []), item];
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${id}`} className="text-sm hover:underline" style={{ color: "var(--muted)" }}>← Terug</Link>
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-bold">Budget</h1>
          <button onClick={() => setShowForm(!showForm)} className="ddp-btn-primary">
            {showForm ? "Annuleren" : "+ Post toevoegen"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="ddp-card col-span-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Totaalbudget</span>
            <button onClick={() => { setNewTotal(String(budget.totalAmount)); setEditTotal(true); }}
              className="text-xs" style={{ color: "var(--primary)" }}>Wijzigen</button>
          </div>
          {editTotal ? (
            <form onSubmit={handleUpdateTotal} className="flex gap-2 mt-2">
              <input type="number" value={newTotal} onChange={(e) => setNewTotal(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm" style={{ borderColor: "var(--border)" }} />
              <button type="submit" className="ddp-btn-primary px-3 py-1.5 text-xs">Opslaan</button>
              <button type="button" onClick={() => setEditTotal(false)} className="ddp-btn-secondary px-3 py-1.5 text-xs">✕</button>
            </form>
          ) : (
            <>
              <div className="text-3xl font-bold" style={{ color: "var(--primary)" }}>{euro(budget.totalAmount)}</div>
              <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: "var(--accent)" }}>
                <div className="h-full rounded-full" style={{
                  width: `${pct}%`,
                  background: pct > 90 ? "#e05252" : pct > 70 ? "var(--warning)" : "var(--success)",
                }} />
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{pct}% gebruikt</div>
            </>
          )}
        </div>
        <div className="ddp-card">
          <div className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Uitgegeven</div>
          <div className="text-xl font-bold">{euro(totalActual)}</div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>Geschat: {euro(totalEstimated)}</div>
        </div>
        <div className="ddp-card">
          <div className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Resterend</div>
          <div className="text-xl font-bold" style={{ color: remaining < 0 ? "#e05252" : "var(--success)" }}>
            {euro(Math.abs(remaining))}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{remaining < 0 ? "over budget!" : "beschikbaar"}</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="ddp-card mb-6 space-y-4">
          <h3 className="font-semibold">Budgetpost toevoegen</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Categorie</label>
              <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="Catering, Bloemen, etc." className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Omschrijving *</label>
              <input required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="bijv. Diner 80 personen" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Geschat bedrag (€)</label>
              <input type="number" step="0.01" value={form.estimated} onChange={(e) => setForm((p) => ({ ...p, estimated: e.target.value }))}
                placeholder="0,00" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Werkelijk bedrag (€)</label>
              <input type="number" step="0.01" value={form.actual} onChange={(e) => setForm((p) => ({ ...p, actual: e.target.value }))}
                placeholder="0,00" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Betalingsstatus</label>
              <select value={form.payStatus} onChange={(e) => setForm((p) => ({ ...p, payStatus: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
                {Object.entries(PAY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="ddp-btn-primary w-full">
            {saving ? "Opslaan..." : "Budgetpost toevoegen"}
          </button>
        </form>
      )}

      {Object.entries(byCategory).map(([category, items]) => {
        const catEstimated = items.reduce((s, i) => s + i.estimated, 0);
        const catActual = items.reduce((s, i) => s + i.actual, 0);
        return (
          <div key={category} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{category}</h3>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{euro(catActual)} / {euro(catEstimated)}</span>
            </div>
            <div className="ddp-card p-0 overflow-hidden">
              <table className="w-full">
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? "1px solid var(--border)" : undefined }}>
                      <td className="px-4 py-3 text-sm">{item.description}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{item.vendor?.name}</td>
                      <td className="px-4 py-3 text-sm text-right" style={{ color: "var(--muted)" }}>{euro(item.estimated)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{euro(item.actual)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => cyclePayStatus(item)}
                          className={`ddp-badge ${PAY_COLORS[item.payStatus]} cursor-pointer hover:opacity-80`}
                          title="Klik om status te wijzigen"
                        >
                          {PAY_LABELS[item.payStatus]}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteItem(item.id)} className="text-xs hover:opacity-70" style={{ color: "var(--muted)" }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {budget.items.length === 0 && (
        <div className="text-center py-12" style={{ color: "var(--muted)" }}>
          <div className="text-3xl mb-2">💶</div>
          <p>Nog geen budgetposten. Voeg de eerste post toe.</p>
        </div>
      )}
    </div>
  );
}
