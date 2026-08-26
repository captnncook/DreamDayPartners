"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DatePicker from "@/components/DatePicker";
import { useLang } from "@/components/LangProvider";

type Step = 1 | 2 | 3 | 4;

export default function WeddingWizardPage() {
  const { t } = useLang();
  const tw = t.weddingWizard;
  const STEPS = [
    { n: 1, label: tw.steps.names },
    { n: 2, label: tw.steps.bigDay },
    { n: 3, label: tw.steps.budget },
    { n: 4, label: tw.steps.confirm },
  ];
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [multiDay, setMultiDay] = useState(false);
  const [form, setForm] = useState({
    partner1: "",
    partner2: "",
    date: "",
    endDate: "",
    venue: "",
    guestCount: "",
    budget: "",
    notes: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function next() { setStep((s) => (s < 4 ? (s + 1) as Step : s)); }
  function prev() { setStep((s) => (s > 1 ? (s - 1) as Step : s)); }

  async function handleSubmit() {
    setSaving(true);

    // Log in als bruidspaar demo user
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "emma@example.com" }),
    });

    // Maak bruiloft aan
    const title = form.partner1 && form.partner2
      ? `Bruiloft ${form.partner1} & ${form.partner2}`
      : "Mijn Bruiloft";

    const res = await fetch("/api/weddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        date: form.date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        endDate: multiDay && form.endDate ? form.endDate : null,
        venue: form.venue || null,
        budget: form.budget ? parseFloat(form.budget) : null,
        notes: form.notes || null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (data.wedding?.id) {
      router.push(`/weddings/${data.wedding.id}`);
    } else {
      router.push("/weddings");
    }
  }

  const progress = ((step - 1) / 3) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Image src="/images/logo.svg" alt="DreamDay Platform" width={56} height={56} />
          </div>
          <h1 className="font-serif mt-3" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{tw.heading}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{tw.subheading}</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col items-center" style={{ width: "25%" }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1"
                  style={{
                    background: step >= s.n ? "var(--primary)" : "var(--border)",
                    color: step >= s.n ? "white" : "var(--muted)",
                    transition: "background 180ms var(--ease-out), color 180ms var(--ease-out)",
                  }}
                >
                  {step > s.n ? "" : s.n}
                </div>
                <span className="text-xs text-center hidden sm:block" style={{ color: step === s.n ? "var(--primary)" : "var(--muted)" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "var(--primary)", transition: "width 500ms var(--ease-out)" }} />
          </div>
        </div>

        {/* Card */}
        <div className="ddp-card shadow-lg">
          {/* Step 1: Namen */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">{tw.step1Title}</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{tw.step1Sub}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{tw.partner1Label}</label>
                  <input
                    value={form.partner1}
                    onChange={(e) => set("partner1", e.target.value)}
                    placeholder={tw.partner1Placeholder}
                    className="w-full border rounded-xl px-4 py-3 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{tw.partner2Label}</label>
                  <input
                    value={form.partner2}
                    onChange={(e) => set("partner2", e.target.value)}
                    placeholder={tw.partner2Placeholder}
                    className="w-full border rounded-xl px-4 py-3 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </div>
              {form.partner1 && form.partner2 && (
                <div className="font-serif p-3 rounded-xl text-center text-sm" style={{ fontWeight: 700, background: "var(--accent)", color: "var(--primary)" }}>
                  {tw.weddingOf.replace("{p1}", form.partner1).replace("{p2}", form.partner2)}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Datum + locatie */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">{tw.step2Title}</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{tw.step2Sub}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{tw.dateLabel}</label>
                <DatePicker
                  value={form.date}
                  onChange={(v) => set("date", v)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border rounded-xl px-4 py-3 text-sm"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <label className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={multiDay}
                  onChange={(e) => { setMultiDay(e.target.checked); if (!e.target.checked) set("endDate", ""); }}
                  style={{ width: "1rem", height: "1rem", accentColor: "var(--gold)" }}
                />
                {tw.multiDayLabel}
              </label>
              {multiDay && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">{tw.lastDayLabel}</label>
                  <DatePicker
                    value={form.endDate}
                    onChange={(v) => set("endDate", v)}
                    min={form.date || new Date().toISOString().split("T")[0]}
                    className="w-full border rounded-xl px-4 py-3 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">{tw.venueLabel}</label>
                <input
                  value={form.venue}
                  onChange={(e) => set("venue", e.target.value)}
                  placeholder={tw.venuePlaceholder}
                  className="w-full border rounded-xl px-4 py-3 text-sm"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{tw.guestCountLabel}</label>
                <input
                  type="number"
                  value={form.guestCount}
                  onChange={(e) => set("guestCount", e.target.value)}
                  placeholder={tw.guestCountPlaceholder}
                  min={1}
                  className="w-full border rounded-xl px-4 py-3 text-sm"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">{tw.step3Title}</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{tw.step3Sub}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{tw.totalBudgetLabel}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "var(--muted)" }}>€</span>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => set("budget", e.target.value)}
                    placeholder={tw.budgetPlaceholder}
                    min={0}
                    step={500}
                    className="w-full border rounded-xl pl-8 pr-4 py-3 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["10000", "15000", "20000", "25000", "30000", "50000"].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => set("budget", b)}
                    className="py-2 rounded-xl text-xs font-medium"
                    style={{
                      background: form.budget === b ? "var(--primary)" : "var(--accent)",
                      color: form.budget === b ? "white" : "var(--foreground)",
                      transition: "background 180ms var(--ease-out), color 180ms var(--ease-out)",
                    }}
                  >
                    €{parseInt(b).toLocaleString("nl-NL")}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{tw.notesLabel}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder={tw.notesPlaceholder}
                  rows={3}
                  className="w-full border rounded-xl px-4 py-3 text-sm resize-none"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
            </div>
          )}

          {/* Step 4: Bevestigen */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">{tw.step4Title}</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{tw.step4Sub}</p>
              </div>
              <div className="space-y-3 rounded-xl p-4" style={{ background: "var(--accent)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted)" }}>{tw.summaryCouple}</span>
                  <span className="font-medium">
                    {form.partner1 && form.partner2 ? `${form.partner1} & ${form.partner2}` : tw.notFilledIn}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted)" }}>{tw.summaryDate}</span>
                  <span className="font-medium">
                    {form.date ? new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(form.date)) : tw.notFilledIn}
                  </span>
                </div>
                {form.venue && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted)" }}>{tw.summaryVenue}</span>
                    <span className="font-medium">{form.venue}</span>
                  </div>
                )}
                {form.guestCount && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted)" }}>{tw.summaryGuests}</span>
                    <span className="font-medium">{form.guestCount} {tw.summaryGuestsUnit}</span>
                  </div>
                )}
                {form.budget && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted)" }}>{tw.summaryBudget}</span>
                    <span className="font-medium">€{parseFloat(form.budget).toLocaleString("nl-NL")}</span>
                  </div>
                )}
                {form.notes && (
                  <div className="text-sm pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                    <span style={{ color: "var(--muted)" }}>{tw.summaryNotes} </span>{form.notes}
                  </div>
                )}
              </div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {tw.loginNotice}
              </p>
            </div>
          )}

          {/* Navigatie */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={prev} className="ddp-btn-secondary flex-1">
                {tw.back}
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={next}
                disabled={step === 2 && !form.date}
                className="ddp-btn-primary flex-1"
              >
                {tw.next}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="ddp-btn-primary flex-1 py-3"
              >
                {saving ? tw.creating : tw.create}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "var(--muted)" }}>
          <Link href="/login">{tw.backToLogin}</Link>
        </p>
      </div>
    </div>
  );
}
