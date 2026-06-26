"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, Store, ArrowRight, ArrowLeft, Check } from "lucide-react";

type Account = "couple" | "vendor" | null;

const VENDOR_CATEGORIES = [
  { value: "weddingplanner", label: "Weddingplanner" },
  { value: "fotograaf", label: "Fotograaf" },
  { value: "videograaf", label: "Videograaf" },
  { value: "bloemist", label: "Bloemist" },
  { value: "catering", label: "Catering" },
  { value: "bakker", label: "Bruidstaart & Bakker" },
  { value: "dj", label: "DJ" },
  { value: "liveband", label: "Liveband & Muziek" },
  { value: "ceremoniespreker", label: "Ceremoniespreker" },
  { value: "trouwlocatie", label: "Trouwlocatie" },
  { value: "haarstylist", label: "Haar & Make-up" },
  { value: "vervoer", label: "Vervoer" },
  { value: "decoratie", label: "Decoratie & Styling" },
  { value: "fotocabine", label: "Fotocabine" },
  { value: "overig", label: "Overig" },
];

export default function AanmeldenPage() {
  return <Suspense><AanmeldenForm /></Suspense>;
}

function AanmeldenForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [account, setAccount] = useState<Account>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [couple, setCouple] = useState({
    partner1: "", partner2: "", date: "", venue: "", guestCount: "", budget: "", email: "",
  });
  const [vendor, setVendor] = useState({
    businessName: "", category: "", contactPerson: "", phone: "", website: "", city: "", description: "", email: "",
  });

  useEffect(() => {
    const email = searchParams.get("email");
    const name = searchParams.get("name") ?? "";
    const provider = searchParams.get("provider");
    if (email && provider) {
      // Pre-fill for OAuth new user — skip to couple registration with email pre-filled
      setCouple(c => ({ ...c, email, partner1: name }));
      setAccount("couple");
      setStep(1);
    }
  }, [searchParams]);

  const totalSteps = account === "couple" ? 4 : account === "vendor" ? 4 : 1;

  function chooseAccount(a: Account) {
    setAccount(a);
    setStep(1);
    setError("");
  }

  function next() { setStep((s) => Math.min(s + 1, totalSteps)); }
  function prev() {
    setError("");
    if (step === 1) { setAccount(null); setStep(0); return; }
    setStep((s) => Math.max(s - 1, 1));
  }

  async function submit() {
    setSaving(true);
    setError("");
    const payload =
      account === "couple"
        ? { type: "couple", ...couple }
        : { type: "vendor", ...vendor };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Er ging iets mis. Probeer het opnieuw.");
        setSaving(false);
        return;
      }
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Verbindingsfout, probeer het opnieuw.");
      setSaving(false);
    }
  }

  const progress = account ? (step / totalSteps) * 100 : 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Logo linksboven — terug naar home */}
      <div className="px-5 md:px-10 py-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/logo.png" alt="DreamDay Partners" width={28} height={28} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>
            DreamDay<span style={{ color: "var(--primary)" }}> Partners</span>
          </span>
        </Link>
      </div>

      <div className="flex items-start justify-center px-4 pb-16 pt-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Begin gratis</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {account === null
                ? "Voor wie maken we een account aan?"
                : "Nog een paar stappen — je kunt alles later aanpassen."}
            </p>
          </div>

          {/* Progress (alleen na keuze) */}
          {account && (
            <div className="mb-6">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--primary)" }} />
              </div>
            </div>
          )}

          <div className="ddp-card shadow-lg">
            {/* Stap 0: keuze bruidspaar of leverancier */}
            {step === 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => chooseAccount("couple")}
                  className="w-full text-left rounded-2xl p-5 flex items-center gap-4 transition-all"
                  style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent)" }}>
                    <Heart className="w-6 h-6" style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Wij zijn een bruidspaar</div>
                    <div className="text-sm" style={{ color: "var(--muted)" }}>Plan jullie bruiloft — gratis, voor altijd.</div>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ color: "var(--muted)" }} />
                </button>

                <button
                  onClick={() => chooseAccount("vendor")}
                  className="w-full text-left rounded-2xl p-5 flex items-center gap-4 transition-all"
                  style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent)" }}>
                    <Store className="w-6 h-6" style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Ik ben een leverancier</div>
                    <div className="text-sm" style={{ color: "var(--muted)" }}>Presenteer je bedrijf en beheer je bruiloften.</div>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ color: "var(--muted)" }} />
                </button>
              </div>
            )}

            {/* ── BRUIDSPAAR ── */}
            {account === "couple" && step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Hoe heten jullie?</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>De namen van het bruidspaar</p>
                </div>
                <Field label="Partner 1">
                  <input value={couple.partner1} onChange={(e) => setCouple({ ...couple, partner1: e.target.value })} placeholder="bijv. Emma" className="ddp-input" />
                </Field>
                <Field label="Partner 2">
                  <input value={couple.partner2} onChange={(e) => setCouple({ ...couple, partner2: e.target.value })} placeholder="bijv. Thomas" className="ddp-input" />
                </Field>
                {couple.partner1 && couple.partner2 && (
                  <div className="p-3 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2" style={{ background: "var(--accent)", color: "var(--primary)" }}>
                    <Heart className="w-4 h-4 fill-current" /> Bruiloft {couple.partner1} &amp; {couple.partner2}
                  </div>
                )}
              </div>
            )}

            {account === "couple" && step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">De grote dag</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Wanneer en waar is de bruiloft?</p>
                </div>
                <Field label="Trouwdatum">
                  <input type="date" value={couple.date} onChange={(e) => setCouple({ ...couple, date: e.target.value })} min={new Date().toISOString().split("T")[0]} className="ddp-input" />
                </Field>
                <Field label="Locatie / Trouwzaal">
                  <input value={couple.venue} onChange={(e) => setCouple({ ...couple, venue: e.target.value })} placeholder="bijv. Kasteel de Haar, Utrecht" className="ddp-input" />
                </Field>
                <Field label="Verwacht aantal gasten">
                  <input type="number" min={1} value={couple.guestCount} onChange={(e) => setCouple({ ...couple, guestCount: e.target.value })} placeholder="bijv. 80" className="ddp-input" />
                </Field>
              </div>
            )}

            {account === "couple" && step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Budget &amp; account</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Een indicatie helpt bij de planning.</p>
                </div>
                <Field label="Totaalbudget (€)">
                  <input type="number" min={0} step={500} value={couple.budget} onChange={(e) => setCouple({ ...couple, budget: e.target.value })} placeholder="15000" className="ddp-input" />
                </Field>
                <Field label="Jouw e-mailadres *">
                  <input type="email" value={couple.email} onChange={(e) => setCouple({ ...couple, email: e.target.value })} placeholder="jij@voorbeeld.nl" className="ddp-input" />
                </Field>
              </div>
            )}

            {account === "couple" && step === 4 && (
              <Summary
                rows={[
                  ["Bruidspaar", couple.partner1 && couple.partner2 ? `${couple.partner1} & ${couple.partner2}` : "—"],
                  ["Datum", couple.date ? new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(couple.date)) : "—"],
                  ["Locatie", couple.venue || "—"],
                  ["Gasten", couple.guestCount ? `${couple.guestCount} personen` : "—"],
                  ["Budget", couple.budget ? `€${parseFloat(couple.budget).toLocaleString("nl-NL")}` : "—"],
                  ["E-mail", couple.email || "—"],
                ]}
                note="Je wordt direct ingelogd en krijgt toegang tot jullie bruiloftspagina."
              />
            )}

            {/* ── LEVERANCIER ── */}
            {account === "vendor" && step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Over je bedrijf</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Hoe heet je en wat doe je?</p>
                </div>
                <Field label="Bedrijfsnaam *">
                  <input value={vendor.businessName} onChange={(e) => setVendor({ ...vendor, businessName: e.target.value })} placeholder="bijv. Lichtvang Fotografie" className="ddp-input" />
                </Field>
                <Field label="Categorie *">
                  <select value={vendor.category} onChange={(e) => setVendor({ ...vendor, category: e.target.value })} className="ddp-input">
                    <option value="">Kies een categorie…</option>
                    {VENDOR_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
              </div>
            )}

            {account === "vendor" && step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Contactgegevens</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Zo bereiken bruidsparen je.</p>
                </div>
                <Field label="Contactpersoon">
                  <input value={vendor.contactPerson} onChange={(e) => setVendor({ ...vendor, contactPerson: e.target.value })} placeholder="bijv. Lara Vermeer" className="ddp-input" />
                </Field>
                <Field label="Telefoon">
                  <input value={vendor.phone} onChange={(e) => setVendor({ ...vendor, phone: e.target.value })} placeholder="06-12345678" className="ddp-input" />
                </Field>
                <Field label="Plaats">
                  <input value={vendor.city} onChange={(e) => setVendor({ ...vendor, city: e.target.value })} placeholder="bijv. Haarlem" className="ddp-input" />
                </Field>
                <Field label="Website">
                  <input value={vendor.website} onChange={(e) => setVendor({ ...vendor, website: e.target.value })} placeholder="https://…" className="ddp-input" />
                </Field>
              </div>
            )}

            {account === "vendor" && step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Profiel &amp; account</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Vertel kort wat je aanbiedt.</p>
                </div>
                <Field label="Korte omschrijving">
                  <textarea value={vendor.description} onChange={(e) => setVendor({ ...vendor, description: e.target.value })} rows={3} placeholder="Waar ben je goed in?" className="ddp-input resize-none" />
                </Field>
                <Field label="Jouw e-mailadres *">
                  <input type="email" value={vendor.email} onChange={(e) => setVendor({ ...vendor, email: e.target.value })} placeholder="jij@bedrijf.nl" className="ddp-input" />
                </Field>
              </div>
            )}

            {account === "vendor" && step === 4 && (
              <Summary
                rows={[
                  ["Bedrijf", vendor.businessName || "—"],
                  ["Categorie", VENDOR_CATEGORIES.find((c) => c.value === vendor.category)?.label ?? "—"],
                  ["Contactpersoon", vendor.contactPerson || "—"],
                  ["Plaats", vendor.city || "—"],
                  ["E-mail", vendor.email || "—"],
                ]}
                note="Je wordt direct ingelogd en kunt je profiel verder aanvullen."
              />
            )}

            {error && (
              <div className="text-sm p-3 rounded-lg mt-4" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                {error}
              </div>
            )}

            {/* Navigatie */}
            {step > 0 && (
              <div className="flex gap-3 mt-6">
                <button onClick={prev} className="ddp-btn-secondary flex-1">
                  <ArrowLeft className="w-4 h-4" /> Terug
                </button>
                {step < totalSteps ? (
                  <button
                    onClick={next}
                    disabled={
                      (account === "couple" && step === 3 && !couple.email) ||
                      (account === "vendor" && step === 1 && (!vendor.businessName || !vendor.category)) ||
                      (account === "vendor" && step === 3 && !vendor.email)
                    }
                    className="ddp-btn-primary flex-1"
                  >
                    Volgende <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={submit} disabled={saving} className="ddp-btn-primary flex-1 py-3">
                    {saving ? "Account aanmaken…" : "Account aanmaken"}
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-center text-xs mt-4" style={{ color: "var(--muted)" }}>
            Al een account? <Link href="/login" style={{ color: "var(--primary)" }}>Inloggen</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Summary({ rows, note }: { rows: [string, string][]; note: string }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Check className="w-5 h-5" style={{ color: "var(--success)" }} /> Bijna klaar
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Controleer je gegevens.</p>
      </div>
      <div className="space-y-3 rounded-xl p-4" style={{ background: "var(--accent)" }}>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm gap-4">
            <span style={{ color: "var(--muted)" }}>{k}</span>
            <span className="font-medium text-right">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: "var(--muted)" }}>{note}</p>
    </div>
  );
}
