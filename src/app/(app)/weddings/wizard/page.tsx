"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { n: 1, label: "Jullie namen" },
  { n: 2, label: "De grote dag" },
  { n: 3, label: "Budget" },
  { n: 4, label: "Bevestigen" },
];

export default function WeddingWizardPage() {
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
          <h1 className="font-serif mt-3" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Begin jullie dream day</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>In een paar stappen klaar. Alles kun je later aanpassen</p>
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
                <h2 className="text-lg font-semibold">Hoe heten jullie?</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>De namen van het bruidspaar</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Partner 1</label>
                  <input
                    value={form.partner1}
                    onChange={(e) => set("partner1", e.target.value)}
                    placeholder="bijv. Emma"
                    className="w-full border rounded-xl px-4 py-3 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Partner 2</label>
                  <input
                    value={form.partner2}
                    onChange={(e) => set("partner2", e.target.value)}
                    placeholder="bijv. Thomas"
                    className="w-full border rounded-xl px-4 py-3 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </div>
              {form.partner1 && form.partner2 && (
                <div className="font-serif p-3 rounded-xl text-center text-sm" style={{ fontWeight: 700, background: "var(--accent)", color: "var(--primary)" }}>
                  Bruiloft {form.partner1} & {form.partner2}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Datum + locatie */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">De grote dag</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Wanneer en waar is de bruiloft?</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Trouwdatum *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
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
                De bruiloft duurt meerdere dagen
              </label>
              {multiDay && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Laatste dag</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    min={form.date || new Date().toISOString().split("T")[0]}
                    className="w-full border rounded-xl px-4 py-3 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">Locatie / Trouwzaal</label>
                <input
                  value={form.venue}
                  onChange={(e) => set("venue", e.target.value)}
                  placeholder="bijv. Kasteel de Haar, Utrecht"
                  className="w-full border rounded-xl px-4 py-3 text-sm"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Verwacht aantal gasten</label>
                <input
                  type="number"
                  value={form.guestCount}
                  onChange={(e) => set("guestCount", e.target.value)}
                  placeholder="bijv. 80"
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
                <h2 className="text-lg font-semibold">Budget</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Een indicatie helpt ons bij de planning. Je kunt dit later aanpassen.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Totaalbudget (€)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "var(--muted)" }}>€</span>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => set("budget", e.target.value)}
                    placeholder="15.000"
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
                <label className="block text-sm font-medium mb-1.5">Notities / wensen</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="bijv. Stijl: Romantisch en sfeervol. We willen graag live muziek..."
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
                <h2 className="text-lg font-semibold">Klaar voor jullie dream day?</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Controleer de gegevens en start jullie bruiloft.</p>
              </div>
              <div className="space-y-3 rounded-xl p-4" style={{ background: "var(--accent)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted)" }}>Bruidspaar</span>
                  <span className="font-medium">
                    {form.partner1 && form.partner2 ? `${form.partner1} & ${form.partner2}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted)" }}>Datum</span>
                  <span className="font-medium">
                    {form.date ? new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(form.date)) : "—"}
                  </span>
                </div>
                {form.venue && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted)" }}>Locatie</span>
                    <span className="font-medium">{form.venue}</span>
                  </div>
                )}
                {form.guestCount && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted)" }}>Gasten</span>
                    <span className="font-medium">{form.guestCount} personen</span>
                  </div>
                )}
                {form.budget && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted)" }}>Budget</span>
                    <span className="font-medium">€{parseFloat(form.budget).toLocaleString("nl-NL")}</span>
                  </div>
                )}
                {form.notes && (
                  <div className="text-sm pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                    <span style={{ color: "var(--muted)" }}>Notities: </span>{form.notes}
                  </div>
                )}
              </div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Je wordt ingelogd als bruidspaar en krijgt direct toegang tot jouw bruiloftspagina.
              </p>
            </div>
          )}

          {/* Navigatie */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={prev} className="ddp-btn-secondary flex-1">
                ← Terug
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={next}
                disabled={step === 2 && !form.date}
                className="ddp-btn-primary flex-1"
              >
                Volgende →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="ddp-btn-primary flex-1 py-3"
              >
                {saving ? "Aanmaken..." : "Bruiloft aanmaken"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "var(--muted)" }}>
          <Link href="/login">← Terug naar inloggen</Link>
        </p>
      </div>
    </div>
  );
}
