"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewWeddingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", date: "", venue: "", coupleEmail1: "", coupleEmail2: "", notes: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(res.status === 409 ? `Er bestaat al een bruiloft met code ${data.weddingCode} voor dit koppel op deze datum.` : data.error ?? "Er is iets misgegaan");
        return;
      }
      router.push(`/weddings/${data.wedding.id}`);
    } catch {
      setError("Verbindingsfout, probeer opnieuw");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/weddings" className="text-sm" style={{ color: "var(--muted)" }}>← Terug naar bruiloften</Link>
        <h1 className="text-2xl font-bold mt-4">Nieuwe bruiloft aanmaken</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Op basis van de e-mailadressen en trouwdatum wordt automatisch een unieke WeddingID aangemaakt.</p>
      </div>
      <form onSubmit={handleSubmit} className="ddp-card space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Naam bruiloft *</label>
          <input name="title" value={form.title} onChange={handleChange} required placeholder="bijv. Bruiloft Emma & Thomas"
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "var(--border)" }} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Trouwdatum *</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} required
              className="w-full border rounded-lg px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Locatie</label>
            <input name="venue" value={form.venue} onChange={handleChange} placeholder="bijv. Kasteel de Haar"
              className="w-full border rounded-lg px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          </div>
        </div>
        <div className="p-4 rounded-lg" style={{ background: "var(--accent)" }}>
          <div className="text-sm font-semibold mb-3">Bruidspaar e-mailadressen</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Partner 1 e-mail *</label>
              <input name="coupleEmail1" type="email" value={form.coupleEmail1} onChange={handleChange} required
                placeholder="partner1@email.nl" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "white" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Partner 2 e-mail *</label>
              <input name="coupleEmail2" type="email" value={form.coupleEmail2} onChange={handleChange} required
                placeholder="partner2@email.nl" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "white" }} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Notities</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Thema, speciale wensen, etc."
            className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none" style={{ borderColor: "var(--border)" }} />
        </div>
        {error && <div className="p-3 rounded-lg text-sm" style={{ background: "#fde8e8", color: "var(--danger)" }}>{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="ddp-btn-primary flex-1 py-2.5">{loading ? "Aanmaken..." : "Bruiloft aanmaken"}</button>
          <Link href="/weddings" className="ddp-btn-secondary px-6 py-2.5">Annuleren</Link>
        </div>
      </form>
    </div>
  );
}
