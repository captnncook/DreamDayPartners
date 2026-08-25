"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { X, Paperclip } from "lucide-react";
import { SkeletonCard, SkeletonBlock } from "@/components/Skeleton";

type BudgetItem = {
  id: string;
  category: string;
  description: string;
  estimated: number;
  actual: number;
  payStatus: string;
  vendor?: { name: string } | null;
  invoiceUrl?: string | null;
};

type Budget = {
  totalAmount: number;
  currency: string;
  items: BudgetItem[];
};

const PAY_META: Record<string, { label: string; color: string; weight: number }> = {
  pending:      { label: "Openstaand", color: "var(--gold-deep)",   weight: 700 },
  deposit_paid: { label: "Aanbetaald", color: "var(--muted)",       weight: 600 },
  paid:         { label: "Betaald",    color: "var(--muted-light)", weight: 400 },
};
const PAY_LABELS: Record<string, string> = {
  pending: "Openstaand", deposit_paid: "Aanbetaald", paid: "Betaald",
};

function euro(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

// Indicatieve verdeling van een gemiddeld Nederlands bruiloftsbudget
// (circa €20.000 totaal) over de meest voorkomende categorieën — geen harde
// data, maar genoeg houvast om te zien of je zelf duidelijk boven of onder
// het gebruikelijke uitgeeft aan een categorie, zodat je bewust kunt kiezen:
// budget bijstellen, of verwachtingen bijstellen.
const AVERAGE_TOTAL_BUDGET = 20000;
const CATEGORY_BENCHMARKS: { match: string[]; pct: number }[] = [
  { match: ["locatie", "trouwlocatie", "venue", "zaal"], pct: 0.28 },
  { match: ["catering", "eten", "drinken", "diner", "buffet"], pct: 0.22 },
  { match: ["fotografie", "fotograaf", "foto"], pct: 0.08 },
  { match: ["videografie", "videograaf", "video"], pct: 0.05 },
  { match: ["bloemen", "bloemist", "decoratie", "styling"], pct: 0.08 },
  { match: ["dj", "band", "muziek", "entertainment"], pct: 0.06 },
  { match: ["bruidsmode", "kleding", "jurk", "pak", "herenmode"], pct: 0.08 },
  { match: ["trouwring", "juwelier", "ring"], pct: 0.04 },
  { match: ["vervoer", "auto", "trouwauto"], pct: 0.02 },
  { match: ["uitnodiging", "drukwerk", "papeterie"], pct: 0.02 },
  { match: ["visagie", "haarstyling", "haar", "make-up", "makeup"], pct: 0.03 },
  { match: ["taart", "bakker"], pct: 0.02 },
];

function categoryBenchmark(category: string): number | null {
  const c = category.trim().toLowerCase();
  if (!c) return null;
  const hit = CATEGORY_BENCHMARKS.find((b) => b.match.some((m) => c.includes(m)));
  return hit ? Math.round(hit.pct * AVERAGE_TOTAL_BUDGET) : null;
}

export default function BudgetPage() {
  const { id } = useParams<{ id: string }>();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [confirmedGuests, setConfirmedGuests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTotal, setEditTotal] = useState(false);
  const [newTotal, setNewTotal] = useState("");
  const [form, setForm] = useState({ category: "Catering", description: "", estimated: "", actual: "", payStatus: "pending", invoiceUrl: "" });
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
    const [budgetRes, guestsRes] = await Promise.all([
      fetch(`/api/weddings/${id}/budget`),
      fetch(`/api/weddings/${id}/guests`),
    ]);
    const budgetData = await budgetRes.json();
    const guestsData = await guestsRes.json();
    setBudget(budgetData.budget);
    const confirmed = (guestsData.guests ?? []).filter((g: { rsvpStatus: string }) => g.rsvpStatus === "confirmed").length;
    setConfirmedGuests(confirmed);
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
        invoiceUrl: form.invoiceUrl || null,
      }),
    });
    setForm({ category: "Catering", description: "", estimated: "", actual: "", payStatus: "pending", invoiceUrl: "" });
    setShowForm(false);
    setSaving(false);
    load();
  }

  if (loading) return <div className="p-8 max-w-5xl mx-auto"><div className="grid grid-cols-4 gap-4 mb-6">{Array.from({length:4}).map((_,i)=><SkeletonCard key={i} rows={3}/>)}</div><div className="space-y-3">{Array.from({length:4}).map((_,i)=><SkeletonBlock key={i} style={{height:"3rem"}}/>)}</div></div>;
  if (!budget) return <div className="p-8">Geen budget gevonden</div>;

  const totalEstimated = budget.items.reduce((s, i) => s + i.estimated, 0);
  const totalActual = budget.items.reduce((s, i) => s + i.actual, 0);
  const remaining = budget.totalAmount - totalActual;
  const pct = budget.totalAmount > 0 ? Math.min(100, Math.round((totalActual / budget.totalAmount) * 100)) : 0;

  const byCategory = budget.items.reduce<Record<string, BudgetItem[]>>((acc, item) => {
    acc[item.category] = [...(acc[item.category] ?? []), item];
    return acc;
  }, {});

  const costPerGuest = confirmedGuests > 0 ? totalActual / confirmedGuests : null;

  const categoryTotals = Object.entries(byCategory).map(([cat, items]) => ({
    cat,
    actual: items.reduce((s, i) => s + i.actual, 0),
    estimated: items.reduce((s, i) => s + i.estimated, 0),
  })).sort((a, b) => b.actual - a.actual);
  const maxCategoryActual = Math.max(...categoryTotals.map(c => c.actual), 1);
  const estimatedOverBudget = budget.totalAmount > 0 && totalEstimated > budget.totalAmount;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${id}`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>← Terug</Link>
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Budget</h1>
          <button onClick={() => setShowForm(!showForm)} className="ddp-btn-primary">
            {showForm ? "Annuleren" : "+ Post toevoegen"}
          </button>
        </div>
      </div>

      {/* Budgetoverzicht — donker paneel met inline cijfers */}
      <div className="dash-hero mb-6" style={{ padding: "1.5rem 1.75rem" }}>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)" }}>Totaalbudget</div>
            {editTotal ? (
              <form onSubmit={handleUpdateTotal} className="flex gap-2 mt-2">
                <input type="number" value={newTotal} onChange={(e) => setNewTotal(e.target.value)} autoFocus
                  className="flex-1 rounded-lg px-3 py-1.5 text-sm" style={{ border: "none", minWidth: "120px" }} />
                <button type="submit" className="ddp-btn-gold" style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "var(--text-sm)", padding: "0.35rem 0.875rem", borderRadius: "var(--radius-full)", border: "none", cursor: "pointer" }}>Opslaan</button>
                <button type="button" onClick={() => setEditTotal(false)} style={{ background: "none", border: "none", color: "var(--ink-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}><X className="w-4 h-4" /></button>
              </form>
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="font-serif" style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--ink-text)" }}>{euro(budget.totalAmount)}</span>
                <button onClick={() => { setNewTotal(String(budget.totalAmount)); setEditTotal(true); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "var(--text-sm)", color: "var(--gold)", fontWeight: 600, padding: 0 }}>Wijzigen</button>
              </div>
            )}
          </div>
          <div className="flex gap-7 flex-wrap">
            {[
              { value: euro(totalActual), label: "Uitgegeven" },
              { value: euro(Math.abs(remaining)), label: remaining < 0 ? "Over budget" : "Resterend", warn: remaining < 0 },
              { value: costPerGuest !== null ? euro(costPerGuest) : euro(0), label: `Per bevestigde gast (${confirmedGuests})` },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "right" }}>
                <div className="font-serif" style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: s.warn ? "var(--gold)" : "var(--ink-text)" }}>{s.value}</div>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "1px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: "3px", borderRadius: "999px", background: "var(--ink-line)", overflow: "hidden", marginTop: "1.125rem" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--gold)" }} />
        </div>
        <div className="text-xs mt-1.5" style={{ color: "var(--ink-muted)" }}>{pct}% gebruikt · geschat {euro(totalEstimated)}</div>
        {estimatedOverBudget && (
          <div className="text-xs mt-1.5" style={{ color: "var(--gold)", fontWeight: 700 }}>
            Let op: jullie geschatte kosten ({euro(totalEstimated)}) liggen al boven het totaalbudget ({euro(budget.totalAmount)}), ook al is dit nog niet allemaal uitgegeven.
          </div>
        )}
      </div>

      {categoryTotals.length > 0 && (
        <section className="mb-8">
          <h3 className="dash-section-title mb-2">Kosten per categorie</h3>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
            Ter vergelijking: het gemiddelde bedrag dat Nederlandse stellen per categorie uitgeven (bij een totaalbudget
            van circa {euro(AVERAGE_TOTAL_BUDGET)}). Je mag daar prima overheen gaan — dit helpt vooral om te zien of
            je budget of je verwachtingen bijgesteld moeten worden.
          </p>
          <div className="pt-3 space-y-2.5" style={{ borderTop: "1px solid var(--border)" }}>
            {categoryTotals.map(({ cat, actual, estimated }) => {
              const compareAmount = actual > 0 ? actual : estimated;
              const benchmark = categoryBenchmark(cat);
              const overBenchmark = benchmark !== null && compareAmount > benchmark * 1.15;
              return (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{cat}</span>
                  <span style={{ color: overBenchmark ? "var(--gold-deep)" : "var(--muted)", fontWeight: overBenchmark ? 700 : 400 }}>
                    {euro(actual)}
                    {benchmark !== null && <span style={{ color: "var(--muted-light)", fontWeight: 400 }}> · gemiddeld {euro(benchmark)}</span>}
                  </span>
                </div>
                <div style={{ height: "3px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--ink)", width: `${Math.round((actual / maxCategoryActual) * 100)}%`, transition: "width 0.5s ease" }} />
                </div>
              </div>
              );
            })}
          </div>
        </section>
      )}

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
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1">Offerte / factuurlink (optioneel)</label>
              <input type="url" value={form.invoiceUrl} onChange={(e) => setForm((p) => ({ ...p, invoiceUrl: e.target.value }))}
                placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
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
          <div key={category} className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="dash-section-title">{category}</h3>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{euro(catActual)} / {euro(catEstimated)}</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", overflowX: "auto" }}>
              <table className="w-full" style={{ minWidth: "560px" }}>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-2 py-3 text-sm">{item.description}</td>
                      <td className="px-2 py-3 text-xs font-serif" style={{ color: "var(--muted)", fontWeight: 700 }}>{item.vendor?.name}</td>
                      <td className="px-2 py-3 text-sm text-right" style={{ color: "var(--muted)" }}>{euro(item.estimated)}</td>
                      <td className="px-2 py-3 text-sm text-right font-medium">{euro(item.actual)}</td>
                      <td className="px-2 py-3 text-right">
                        {(() => {
                          const meta = PAY_META[item.payStatus] ?? PAY_META.pending;
                          return (
                            <button
                              onClick={() => cyclePayStatus(item)}
                              title="Klik om status te wijzigen"
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "var(--text-xs)", fontWeight: meta.weight, textTransform: "uppercase", letterSpacing: "0.05em", color: meta.color, whiteSpace: "nowrap" }}
                            >
                              {PAY_LABELS[item.payStatus]}
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-2 py-3">
                        {item.invoiceUrl ? (
                          <a href={item.invoiceUrl} target="_blank" rel="noopener noreferrer" title="Offerte / factuur bekijken" style={{ color: "var(--gold-deep)", display: "flex" }}>
                            <Paperclip className="w-3.5 h-3.5" />
                          </a>
                        ) : null}
                      </td>
                      <td className="px-2 py-3">
                        <button onClick={() => deleteItem(item.id)} className="text-xs hover:opacity-70" style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", display: "flex" }}><X className="w-3.5 h-3.5" /></button>
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
        <p className="text-sm text-center py-12" style={{ color: "var(--muted)" }}>
          Nog geen budgetposten. Voeg de eerste post toe.
        </p>
      )}
    </div>
  );
}
