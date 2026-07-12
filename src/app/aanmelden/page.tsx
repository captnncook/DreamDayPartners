"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { APPLE_LOGIN_ENABLED } from "@/lib/featureFlags";

type Account = "couple" | "vendor" | null;
type AuthStep = "form" | "send-code" | "verify-code" | "choose-auth" | "password";

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
  const [formStep, setFormStep] = useState(0); // which data-entry step (0 = choose)
  const [authStep, setAuthStep] = useState<AuthStep>("form"); // what phase we're in
  const [error, setError] = useState("");

  // Pending registration state
  const [pendingId, setPendingId] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Password state
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [couple, setCouple] = useState({
    partner1: "", partner2: "", date: "", endDate: "", venue: "", guestCount: "", budget: "", email: "",
  });
  const [multiDay, setMultiDay] = useState(false);
  const [vendor, setVendor] = useState({
    businessName: "", category: "", contactPerson: "", phone: "", website: "", city: "", email: "",
  });

  // Duplicaat-check op bedrijfsnaam (fuzzy): null = nog niet gecheckt
  type NameMatch = { id: string; name: string; city: string | null; category: string; hasAccount: boolean };
  const [nameMatches, setNameMatches] = useState<NameMatch[] | null>(null);
  const [checkingName, setCheckingName] = useState(false);

  useEffect(() => {
    const email = searchParams.get("email");
    const name = searchParams.get("name") ?? "";
    const provider = searchParams.get("provider");
    if (email && provider) {
      setCouple(c => ({ ...c, email, partner1: name }));
      setAccount("couple");
      setFormStep(1);
    }
    // ?type=vendor|couple slaat de keuzestap over (bijv. vanaf de prijzensectie)
    const type = searchParams.get("type");
    if (!email && (type === "vendor" || type === "couple")) {
      setAccount(type);
      setFormStep(1);
    }
    const err = searchParams.get("error");
    if (err) setError(decodeURIComponent(err));
  }, [searchParams]);

  // Both couple and vendor have email on step 3; data steps before that differ
  const coupleFormSteps = 3;
  const vendorFormSteps = 3;

  function chooseAccount(a: Account) {
    setAccount(a);
    setFormStep(1);
    setError("");
  }

  async function nextFormStep() {
    setError("");
    // Leverancier stap 1: controleer eerst of het bedrijf (bijna) al in de
    // catalogus staat, zodat we een bestaand profiel kunnen laten claimen
    // in plaats van een duplicaat aan te maken.
    if (account === "vendor" && formStep === 1 && nameMatches === null) {
      setCheckingName(true);
      try {
        const res = await fetch(`/api/catalogus/check-name?name=${encodeURIComponent(vendor.businessName)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.matches) && data.matches.length > 0) {
            setNameMatches(data.matches);
            return; // toon eerst de "is dit jouw bedrijf?"-tussenstap
          }
        }
      } catch {
        // check is best-effort; bij een netwerkfout gewoon doorgaan
      } finally {
        setCheckingName(false);
      }
    }
    setNameMatches(null);
    setFormStep(s => s + 1);
  }

  function prevFormStep() {
    setError("");
    setNameMatches(null);
    if (formStep === 1) { setAccount(null); setFormStep(0); return; }
    setFormStep(s => s - 1);
  }

  function getEmail() {
    return account === "couple" ? couple.email : vendor.email;
  }

  function getFormData() {
    return account === "couple" ? couple : vendor;
  }

  const maxFormSteps = account === "couple" ? coupleFormSteps : vendorFormSteps;

  async function handleSendCode() {
    const email = getEmail();
    if (!email) { setError("Vul je e-mailadres in"); return; }
    setSendingCode(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: account, data: getFormData() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Fout bij versturen"); return; }
      setPendingId(data.pendingId);
      setAuthStep("verify-code");
    } finally {
      setSendingCode(false);
    }
  }

  async function handleVerifyCode() {
    setVerifyingCode(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Onjuiste code"); return; }
      setVerifiedToken(data.verifiedToken);
      setAuthStep("choose-auth");
    } finally {
      setVerifyingCode(false);
    }
  }

  async function handlePasswordSubmit() {
    if (password.length < 8) { setError("Wachtwoord moet minimaal 8 tekens zijn"); return; }
    if (password !== passwordConfirm) { setError("Wachtwoorden komen niet overeen"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiedToken, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Fout bij aanmaken"); return; }
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  // Progress bar calculation
  const totalVisualSteps = account === "couple" ? 6 : 6;
  const currentVisualStep = (() => {
    if (authStep === "form") return formStep;
    if (authStep === "verify-code") return (account === "couple" ? 4 : 4);
    if (authStep === "choose-auth" || authStep === "password") return (account === "couple" ? 5 : 5);
    return formStep;
  })();
  const progress = account ? (currentVisualStep / totalVisualSteps) * 100 : 0;

  const currentEmail = getEmail();

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="px-5 md:px-10 py-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/images/logo.svg" alt="DreamDay Platform" width={28} height={28} />
          <span className="font-serif" style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.02em", color: "var(--foreground)" }}>
            DreamDay<span style={{ color: "var(--primary)" }}> Platform</span>
          </span>
        </Link>
      </div>

      <div className="flex items-start justify-center px-4 pb-16 pt-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-7">
            <h1 className="font-serif text-2xl" style={{ fontWeight: 700, color: "var(--foreground)" }}>Begin gratis</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {account === null ? "Voor wie maken we een account aan?" : "Nog een paar stappen. Je kunt alles later aanpassen."}
            </p>
          </div>

          {account && (
            <div className="mb-6">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "var(--primary)", transition: "width 500ms var(--ease-out)" }} />
              </div>
            </div>
          )}

          <div className="ddp-card shadow-lg">
            {/* ── STAP 0: Keuze ── */}
            {formStep === 0 && (
              <div>
                <button onClick={() => chooseAccount("couple")} className="dash-row w-full text-left flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-serif" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Wij zijn een bruidspaar</div>
                    <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Plan jullie bruiloft, gratis, voor altijd.</div>
                  </div>
                  <ArrowRight className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gold-deep)" }} />
                </button>

                <button onClick={() => chooseAccount("vendor")} className="dash-row w-full text-left flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-serif" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Ik ben een leverancier</div>
                    <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Presenteer je bedrijf en beheer je bruiloften.</div>
                  </div>
                  <ArrowRight className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gold-deep)" }} />
                </button>
              </div>
            )}

            {/* ── BRUIDSPAAR stap 1 ── */}
            {account === "couple" && authStep === "form" && formStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Hoe heten jullie?</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>De namen van het bruidspaar</p>
                </div>
                <Field label="Partner 1">
                  <input value={couple.partner1} onChange={e => setCouple({ ...couple, partner1: e.target.value })} placeholder="bijv. Emma" className="ddp-input" />
                </Field>
                <Field label="Partner 2">
                  <input value={couple.partner2} onChange={e => setCouple({ ...couple, partner2: e.target.value })} placeholder="bijv. Thomas" className="ddp-input" />
                </Field>
                {couple.partner1 && couple.partner2 && (
                  <div className="font-serif p-3 rounded-xl text-center text-sm" style={{ fontWeight: 700, background: "var(--accent)", color: "var(--primary)" }}>
                    Bruiloft {couple.partner1} &amp; {couple.partner2}
                  </div>
                )}
              </div>
            )}

            {account === "couple" && authStep === "form" && formStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">De grote dag</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Wanneer en waar is de bruiloft?</p>
                </div>
                <Field label="Trouwdatum">
                  <input type="date" value={couple.date} onChange={e => setCouple({ ...couple, date: e.target.value })} min={new Date().toISOString().split("T")[0]} className="ddp-input" />
                </Field>
                <label className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={multiDay}
                    onChange={e => { setMultiDay(e.target.checked); if (!e.target.checked) setCouple(c => ({ ...c, endDate: "" })); }}
                    style={{ width: "1rem", height: "1rem", accentColor: "var(--gold)" }}
                  />
                  Onze bruiloft duurt meerdere dagen
                </label>
                {multiDay && (
                  <Field label="Laatste dag">
                    <input type="date" value={couple.endDate} onChange={e => setCouple({ ...couple, endDate: e.target.value })} min={couple.date || new Date().toISOString().split("T")[0]} className="ddp-input" />
                  </Field>
                )}
                <Field label="Locatie / Trouwzaal">
                  <input value={couple.venue} onChange={e => setCouple({ ...couple, venue: e.target.value })} placeholder="bijv. Kasteel de Haar, Utrecht" className="ddp-input" />
                </Field>
                <Field label="Verwacht aantal gasten">
                  <input type="number" min={1} value={couple.guestCount} onChange={e => setCouple({ ...couple, guestCount: e.target.value })} placeholder="bijv. 80" className="ddp-input" />
                </Field>
              </div>
            )}

            {account === "couple" && authStep === "form" && formStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Budget &amp; account</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Bijna klaar! Vul je e-mailadres in.</p>
                </div>
                <Field label="Totaalbudget (€)">
                  <input type="number" min={0} step={500} value={couple.budget} onChange={e => setCouple({ ...couple, budget: e.target.value })} placeholder="15000" className="ddp-input" />
                </Field>
                <Field label="Jouw e-mailadres *">
                  <input type="email" value={couple.email} onChange={e => setCouple({ ...couple, email: e.target.value })} placeholder="jij@voorbeeld.nl" className="ddp-input" />
                </Field>
              </div>
            )}

            {/* ── LEVERANCIER stap 1 ── */}
            {account === "vendor" && authStep === "form" && formStep === 1 && !(nameMatches && nameMatches.length > 0) && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Over je bedrijf</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Hoe heet je en wat doe je?</p>
                </div>
                <Field label="Bedrijfsnaam *">
                  <input value={vendor.businessName} onChange={e => { setVendor({ ...vendor, businessName: e.target.value }); setNameMatches(null); }} placeholder="bijv. Lichtvang Fotografie" className="ddp-input" />
                </Field>
                <Field label="Categorie *">
                  <select value={vendor.category} onChange={e => setVendor({ ...vendor, category: e.target.value })} className="ddp-input">
                    <option value="">Kies een categorie…</option>
                    {VENDOR_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
              </div>
            )}

            {/* ── LEVERANCIER duplicaat-check: bedrijf lijkt al te bestaan ── */}
            {account === "vendor" && authStep === "form" && formStep === 1 && nameMatches && nameMatches.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Staat jouw bedrijf al in de catalogus?</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    We vonden {nameMatches.length === 1 ? "een profiel dat lijkt" : "profielen die lijken"} op
                    {" "}&ldquo;{vendor.businessName}&rdquo;. Claim je bestaande profiel in plaats van een dubbel profiel aan te maken.
                  </p>
                </div>
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {nameMatches.map((m) => {
                    const catLabel = VENDOR_CATEGORIES.find((c) => c.value === m.category)?.label ?? m.category;
                    return (
                      <div key={m.id} className="dash-row" style={{ flexWrap: "wrap" }}>
                        <div className="flex-1 min-w-0" style={{ minWidth: "160px" }}>
                          <div className="font-serif text-sm truncate" style={{ fontWeight: 700 }}>{m.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                            {catLabel}{m.city ? ` · ${m.city}` : ""}
                          </div>
                        </div>
                        {m.hasAccount ? (
                          <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
                            Heeft al een account —{" "}
                            <Link href="/login" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>inloggen</Link>
                          </span>
                        ) : (
                          <Link href={`/leveranciers/${m.id}`} className="text-sm flex-shrink-0" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                            Dit is mijn bedrijf →
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Via &ldquo;Dit is mijn bedrijf&rdquo; kom je op het profiel, waar je het met je e-mailadres kunt claimen.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setNameMatches(null); }} className="ddp-btn-secondary flex-1">
                    <ArrowLeft className="w-4 h-4" /> Terug
                  </button>
                  <button onClick={() => { setNameMatches([]); setFormStep(2); }} className="ddp-btn-primary flex-1">
                    Nee, nieuw bedrijf <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {account === "vendor" && authStep === "form" && formStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Contactgegevens</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Zo bereiken bruidsparen je.</p>
                </div>
                <Field label="Contactpersoon">
                  <input value={vendor.contactPerson} onChange={e => setVendor({ ...vendor, contactPerson: e.target.value })} placeholder="bijv. Lara Vermeer" className="ddp-input" />
                </Field>
                <Field label="Telefoon">
                  <input value={vendor.phone} onChange={e => setVendor({ ...vendor, phone: e.target.value })} placeholder="06-12345678" className="ddp-input" />
                </Field>
                <Field label="Plaats">
                  <input value={vendor.city} onChange={e => setVendor({ ...vendor, city: e.target.value })} placeholder="bijv. Haarlem" className="ddp-input" />
                </Field>
                <Field label="Website">
                  <input value={vendor.website} onChange={e => setVendor({ ...vendor, website: e.target.value })} placeholder="https://…" className="ddp-input" />
                </Field>
              </div>
            )}

            {account === "vendor" && authStep === "form" && formStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">E-mailadres</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>We sturen een verificatiecode naar dit adres.</p>
                </div>
                <Field label="Jouw e-mailadres *">
                  <input type="email" value={vendor.email} onChange={e => setVendor({ ...vendor, email: e.target.value })} placeholder="jij@bedrijf.nl" className="ddp-input" autoFocus />
                </Field>
              </div>
            )}

            {/* ── VERIFICATIECODE ── */}
            {authStep === "verify-code" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Controleer je inbox</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    We hebben een 6-cijferige code gestuurd naar <strong>{currentEmail}</strong>.
                  </p>
                </div>
                <Field label="Verificatiecode">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="ddp-input text-center text-2xl tracking-widest font-bold"
                    autoFocus
                  />
                </Field>
                <button
                  onClick={handleVerifyCode}
                  disabled={verifyingCode || code.length !== 6}
                  className="ddp-btn-primary w-full"
                >
                  {verifyingCode ? "Controleren…" : "Code bevestigen"}
                </button>
                <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
                  Geen code ontvangen?{" "}
                  <button className="underline" style={{ color: "var(--primary)" }} onClick={() => { setAuthStep("form"); setCode(""); setError(""); }}>
                    Stuur opnieuw
                  </button>
                </p>
              </div>
            )}

            {/* ── KIES INLOGMETHODE ── */}
            {authStep === "choose-auth" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Check className="w-5 h-5" style={{ color: "var(--success)" }} /> E-mail bevestigd
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Kies hoe je wilt inloggen.</p>
                </div>

                <a
                  href={`/api/auth/google?pending=${verifiedToken}`}
                  className="ddp-btn-secondary w-full"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Doorgaan met Google
                </a>

                {APPLE_LOGIN_ENABLED && (
                  <a
                    href={`/api/auth/apple?pending=${verifiedToken}`}
                    className="ddp-btn-secondary w-full"
                    style={{ background: "#000", color: "#fff", borderColor: "#000" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 814 1000" fill="white">
                      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-150.3-96.3C27.2 761.6-.5 679.9-.5 601.7c0-237.2 154.4-362.7 306.3-362.7 78.3 0 143.4 51.5 192.4 51.5 46.8 0 120.3-54.7 211.3-54.7zm-174.5-92.3c37.5-44.8 64.4-107.3 64.4-169.8 0-8.7-.6-17.4-2-25.4-61 2.3-134 40.8-178.1 91.4-34.2 38.8-66.5 101.3-66.5 164.6 0 9.6 1.6 19.2 2.3 22.4 3.9.6 10.3 1.6 16.6 1.6 54.7 0 123.4-36.6 163.3-84.8z"/>
                    </svg>
                    Doorgaan met Apple
                  </a>
                )}

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  <span className="text-xs" style={{ color: "var(--muted)" }}>of</span>
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                </div>

                <button
                  onClick={() => setAuthStep("password")}
                  className="ddp-btn-secondary w-full"
                >
                  Account aanmaken met wachtwoord
                </button>
              </div>
            )}

            {/* ── WACHTWOORD INSTELLEN ── */}
            {authStep === "password" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Kies een wachtwoord</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Minimaal 8 tekens.</p>
                </div>
                <Field label="Wachtwoord">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimaal 8 tekens"
                      className="ddp-input pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--muted)" }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
                <Field label="Wachtwoord herhalen">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    placeholder="Herhaal je wachtwoord"
                    className="ddp-input"
                  />
                </Field>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={saving}
                  className="ddp-btn-primary w-full"
                >
                  {saving ? "Account aanmaken…" : "Account aanmaken"}
                </button>
                <button onClick={() => setAuthStep("choose-auth")} className="text-xs text-center w-full" style={{ color: "var(--muted)" }}>
                  ← Andere inlogmethode kiezen
                </button>
              </div>
            )}

            {error && (
              <div className="text-sm p-3 rounded-lg mt-4" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                {error}
              </div>
            )}

            {/* ── Navigatie (alleen tijdens form-invul fase; de duplicaat-check
                 tussenstap heeft eigen knoppen) ── */}
            {authStep === "form" && formStep > 0 && !(account === "vendor" && formStep === 1 && nameMatches && nameMatches.length > 0) && (
              <div className="flex gap-3 mt-6">
                <button onClick={prevFormStep} className="ddp-btn-secondary flex-1">
                  <ArrowLeft className="w-4 h-4" /> Terug
                </button>
                {formStep < maxFormSteps ? (
                  <button
                    onClick={nextFormStep}
                    disabled={
                      checkingName ||
                      (account === "vendor" && formStep === 1 && (!vendor.businessName || !vendor.category))
                    }
                    className="ddp-btn-primary flex-1"
                  >
                    {checkingName ? "Controleren…" : <>Volgende <ArrowRight className="w-4 h-4" /></>}
                  </button>
                ) : (
                  // Last form step = email step → send code
                  <button
                    onClick={handleSendCode}
                    disabled={sendingCode || !currentEmail}
                    className="ddp-btn-primary flex-1"
                  >
                    {sendingCode ? "Code versturen…" : "Code versturen →"}
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
