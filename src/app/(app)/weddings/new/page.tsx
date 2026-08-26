"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DatePicker from "@/components/DatePicker";
import { useLang } from "@/components/LangProvider";

export default function NewWeddingPage() {
  const { t } = useLang();
  const tn = t.weddingNew;
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
        setError(res.status === 409 ? tn.duplicateError.replace("{code}", data.weddingCode) : data.error ?? tn.genericError);
        return;
      }
      router.push(`/weddings/${data.wedding.id}`);
    } catch {
      setError(tn.connectionError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/weddings" className="text-sm" style={{ color: "var(--muted)" }}>{tn.backToWeddings}</Link>
        <h1 className="font-serif mt-4" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{tn.title}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{tn.subtitle}</p>
      </div>
      <form onSubmit={handleSubmit} className="ddp-card space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">{tn.titleLabel}</label>
          <input name="title" value={form.title} onChange={handleChange} required placeholder={tn.titlePlaceholder}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "var(--border)" }} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{tn.dateLabel}</label>
            <DatePicker value={form.date} onChange={(v) => setForm((prev) => ({ ...prev, date: v }))}
              className="w-full border rounded-lg px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{tn.venueLabel}</label>
            <input name="venue" value={form.venue} onChange={handleChange} placeholder={tn.venuePlaceholder}
              className="w-full border rounded-lg px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          </div>
        </div>
        <div className="p-4 rounded-lg" style={{ background: "var(--accent)" }}>
          <div className="text-sm font-semibold mb-3">{tn.coupleEmailsTitle}</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">{tn.email1Label}</label>
              <input name="coupleEmail1" type="email" value={form.coupleEmail1} onChange={handleChange} required
                placeholder="partner1@email.nl" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "white" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{tn.email2Label}</label>
              <input name="coupleEmail2" type="email" value={form.coupleEmail2} onChange={handleChange} required
                placeholder="partner2@email.nl" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "white" }} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{tn.notesLabel}</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder={tn.notesPlaceholder}
            className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none" style={{ borderColor: "var(--border)" }} />
        </div>
        {error && <div className="p-3 rounded-lg text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="ddp-btn-primary flex-1 py-2.5">{loading ? tn.creating : tn.create}</button>
          <Link href="/weddings" className="ddp-btn-secondary px-6 py-2.5">{tn.cancel}</Link>
        </div>
      </form>
    </div>
  );
}
