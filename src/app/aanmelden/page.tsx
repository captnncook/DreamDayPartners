"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { APPLE_LOGIN_ENABLED } from "@/lib/featureFlags";
import DatePicker from "@/components/DatePicker";
import { useLang } from "@/components/LangProvider";

type Account = "couple" | "vendor" | null;
type AuthStep = "form" | "send-code" | "verify-code" | "choose-auth" | "password";

const VENDOR_CATEGORY_VALUES = [
  "weddingplanner", "fotograaf", "videograaf", "bloemist", "catering", "bakker", "dj", "liveband",
  "ceremoniespreker", "trouwlocatie", "haarstylist", "vervoer", "decoratie", "fotocabine",
  "bruidsmode", "herenmode", "juwelier", "overig",
] as const;

export default function AanmeldenPage() {
  return <Suspense><AanmeldenForm /></Suspense>;
}

// Bewaart de voortgang van de aanmeldwizard over een page refresh heen —
// wisselen naar de mailbox voor de verificatiecode en terugkomen zette
// anders alles terug naar stap 1, ook als de e-mail server-side al
// bevestigd was. Bewust geen wachtwoordvelden hierin (nooit onversleuteld
// in sessionStorage zetten).
const AANMELDEN_STORAGE_KEY = "dreamday-aanmelden-progress";

type StoredProgress = {
  account: Account;
  formStep: number;
  authStep: AuthStep;
  pendingId: string;
  verifiedToken: string;
  couple: { partner1: string; partner2: string; date: string; endDate: string; venue: string; venueVendorId: string; guestCount: string; email: string };
  multiDay: boolean;
  vendor: { businessName: string; category: string; contactPerson: string; phone: string; website: string; city: string; email: string };
};

function loadStoredProgress(): Partial<StoredProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(AANMELDEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function AanmeldenForm() {
  const { t, toggle } = useLang();
  const s = t.signup;
  const VENDOR_CATEGORIES = VENDOR_CATEGORY_VALUES.map((value) => ({ value, label: t.vendorCatalog.categories[value] }));
  const router = useRouter();
  const searchParams = useSearchParams();
  const restored = useRef(loadStoredProgress()).current;
  const [account, setAccount] = useState<Account>(restored.account ?? null);
  const [formStep, setFormStep] = useState(restored.formStep ?? 0); // which data-entry step (0 = choose)
  const [authStep, setAuthStep] = useState<AuthStep>(restored.authStep ?? "form"); // what phase we're in
  const [error, setError] = useState("");

  // Pending registration state
  const [pendingId, setPendingId] = useState(restored.pendingId ?? "");
  const [verifiedToken, setVerifiedToken] = useState(restored.verifiedToken ?? "");
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Password state — nooit bewaard over een refresh heen, moet opnieuw ingevuld worden.
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [couple, setCouple] = useState(restored.couple ?? {
    partner1: "", partner2: "", date: "", endDate: "", venue: "", venueVendorId: "", guestCount: "", email: "",
  });
  const [multiDay, setMultiDay] = useState(restored.multiDay ?? false);
  const [vendor, setVendor] = useState(restored.vendor ?? {
    businessName: "", category: "", contactPerson: "", phone: "", website: "", city: "", email: "",
  });

  // Voortgang bewaren bij elke relevante wijziging. authStep "password"
  // slaan we op als "choose-auth" op — het wachtwoord zelf gaat nooit mee,
  // dus na een refresh moet de gebruiker eerst weer "Account aanmaken met
  // wachtwoord" kiezen i.p.v. op een leeg wachtwoordscherm te landen.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (account === null && formStep === 0) {
      sessionStorage.removeItem(AANMELDEN_STORAGE_KEY);
      return;
    }
    const toStore: StoredProgress = {
      account, formStep,
      authStep: authStep === "password" ? "choose-auth" : authStep,
      pendingId, verifiedToken, couple, multiDay, vendor,
    };
    sessionStorage.setItem(AANMELDEN_STORAGE_KEY, JSON.stringify(toStore));
  }, [account, formStep, authStep, pendingId, verifiedToken, couple, multiDay, vendor]);

  // Duplicaat-check op bedrijfsnaam (fuzzy): null = nog niet gecheckt
  type NameMatch = { id: string; name: string; city: string | null; category: string; hasAccount: boolean };
  const [nameMatches, setNameMatches] = useState<NameMatch[] | null>(null);
  const [checkingName, setCheckingName] = useState(false);

  // Trouwlocatie-autocomplete: zoekt terwijl je typt naar bestaande
  // trouwlocaties in de catalogus. Vindt niets? Dan blijft het gewoon een
  // vrij tekstveld, want niet elke bruiloft is op een geregistreerde locatie
  // (huisadres, tuinfeest, tentfeest ...).
  type VenueMatch = { id: string; name: string; city: string | null };
  const [venueMatches, setVenueMatches] = useState<VenueMatch[]>([]);
  const [venueOpen, setVenueOpen] = useState(false);
  const venueWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = couple.venue.trim();
    if (q.length < 2) { setVenueMatches([]); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalogus/search-venues?search=${encodeURIComponent(q)}`);
        if (cancelled) return;
        const data = res.ok ? await res.json() : null;
        if (cancelled) return;
        // Bij een fout of lege respons de lijst leegmaken i.p.v. de resultaten
        // van een eerdere (inmiddels irrelevante) zoekopdracht te laten staan.
        setVenueMatches(((data?.vendors ?? []) as VenueMatch[]).slice(0, 5));
      } catch {
        if (!cancelled) setVenueMatches([]);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [couple.venue]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (venueWrapRef.current && !venueWrapRef.current.contains(e.target as Node)) setVenueOpen(false);
    }
    if (venueOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [venueOpen]);

  // Blade-overgang tussen de keuzestap en de eerste formulierstap — een
  // geskewde balk (kleur = gekozen pad) veegt over de kaart, dekt hem
  // volledig af (het moment waarop we de content wisselen) en veegt door
  // om de nieuwe stap te onthullen. Zie ook prevFormStep() voor de
  // omgekeerde beweging bij "terug".
  //
  // "armed" bepaalt of de balk op zijn start- of eindpositie staat voor de
  // huidige fase. We renderen eerst ongewapend (startpositie, geen
  // transition) zodat de browser die daadwerkelijk schildert, en wapenen
  // hem pas een paar frames later — anders wordt de eerste klassewissel in
  // dezelfde render nooit als een "verandering" herkend en start er nooit
  // een transition (en vuurt transitionend dus ook nooit).
  const [blade, setBlade] = useState<null | { color: "vendor" | "couple"; stage: "cover" | "reveal" }>(null);
  const [bladeArmed, setBladeArmed] = useState(false);
  const bladeTargetRef = useRef<{ toAccount: Account; toFormStep: number } | null>(null);
  const reducedMotionRef = useRef(false);
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!blade || bladeArmed) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setBladeArmed(true));
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [blade, bladeArmed]);

  function runBladeTransition(color: "vendor" | "couple", target: { toAccount: Account; toFormStep: number }) {
    if (reducedMotionRef.current) {
      setAccount(target.toAccount);
      setFormStep(target.toFormStep);
      setError("");
      return;
    }
    bladeTargetRef.current = target;
    setBladeArmed(false);
    setBlade({ color, stage: "cover" });
  }

  function onBladeTransitionEnd() {
    if (!blade) return;
    if (blade.stage === "cover") {
      const target = bladeTargetRef.current;
      if (target) {
        setAccount(target.toAccount);
        setFormStep(target.toFormStep);
        setError("");
        setNameMatches(null);
      }
      setBladeArmed(false);
      setBlade((b) => (b ? { ...b, stage: "reveal" } : null));
    } else {
      setBlade(null);
      bladeTargetRef.current = null;
    }
  }

  // translateX per fase: "cover" gaat van buiten beeld naar het midden
  // (0%), "reveal" gaat van het midden verder naar de andere kant (140%).
  const bladeX = !blade ? "-140%" : blade.stage === "cover" ? (bladeArmed ? "0%" : "-140%") : (bladeArmed ? "140%" : "0%");

  useEffect(() => {
    // Als er al opgeslagen voortgang is (sessionStorage, bijv. na e-mailverificatie),
    // mag een ?type=vendor/couple deep-link die niet zomaar terugzetten naar stap 1 —
    // anders verliest iemand die de wizard-link met querystring opnieuw opent alsnog
    // alles, ook al is het exact hetzelfde probleem dat de sessionStorage-restore
    // net had moeten oplossen.
    const hasRestoredProgress = restored.authStep !== undefined && restored.authStep !== "form" || (restored.formStep ?? 0) > 0;
    if (hasRestoredProgress) return;

    const email = searchParams.get("email");
    const name = searchParams.get("name") ?? "";
    const provider = searchParams.get("provider");
    const date = searchParams.get("date");
    const type = searchParams.get("type");
    if (email && provider) {
      setCouple(c => ({ ...c, email, partner1: name }));
      setAccount("couple");
      setFormStep(1);
    } else if (email && type === "couple") {
      // Vanuit de "1-klik uitnodigen"-mail van een leverancier: e-mail (en
      // evt. datum) staan al vast, alleen de rest van het formulier nog in.
      setCouple(c => ({ ...c, email, date: date ?? c.date }));
      setAccount("couple");
      setFormStep(1);
    }
    // ?type=vendor|couple slaat de keuzestap over (bijv. vanaf de prijzensectie)
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
    runBladeTransition(a === "vendor" ? "vendor" : "couple", { toAccount: a, toFormStep: 1 });
  }

  async function nextFormStep() {
    setError("");
    // Zonder deze check kon "Volgende" hier ook zonder ingevulde trouwdatum
    // worden aangeklikt — de server vulde dan stilzwijgend een datum van
    // exact 365 dagen vanaf vandaag in, zonder dat het bruidspaar ooit te
    // zien kreeg dat dit een gegokte placeholder was.
    if (account === "couple" && formStep === 2 && !couple.date) {
      setError(s.errorDateRequired);
      return;
    }
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
    if (formStep === 1) {
      runBladeTransition(account === "vendor" ? "vendor" : "couple", { toAccount: null, toFormStep: 0 });
      return;
    }
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
    if (!email) { setError(s.errorEmailRequired); return; }
    setSendingCode(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: account, data: getFormData() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? s.errorSendCode); return; }
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
      if (!res.ok) { setError(data.error ?? s.errorVerifyCode); return; }
      setVerifiedToken(data.verifiedToken);
      setAuthStep("choose-auth");
    } finally {
      setVerifyingCode(false);
    }
  }

  async function handlePasswordSubmit() {
    if (password.length < 8) { setError(s.errorPasswordLength); return; }
    if (password !== passwordConfirm) { setError(s.errorPasswordMismatch); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiedToken, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? s.errorAccountCreate); return; }
      sessionStorage.removeItem(AANMELDEN_STORAGE_KEY);
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
      <div className="px-5 md:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/images/logo.svg" alt="DreamDay Platform" width={28} height={28} />
          <span className="font-serif" style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.02em", color: "var(--foreground)" }}>
            DreamDay<span style={{ color: "var(--primary)" }}> Platform</span>
          </span>
        </Link>
        <button onClick={toggle} style={{ color: "var(--muted)", fontSize: "var(--text-base)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
          {t.common.switchLang}
        </button>
      </div>

      <div className="flex items-start justify-center px-4 pb-16 pt-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-7">
            <h1 className="font-serif text-2xl" style={{ fontWeight: 700, color: "var(--foreground)" }}>{s.pageTitle}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {account === null ? s.subChoose : s.subSteps}
            </p>
          </div>

          {account && (
            <div className="mb-6">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "var(--primary)", transition: "width 500ms var(--ease-out)" }} />
              </div>
            </div>
          )}

          <div className="ddp-card shadow-lg auth-stage" style={{ padding: formStep === 0 ? 0 : undefined }}>
            {blade && (
              <div
                className={`auth-blade auth-blade--${blade.color}`}
                style={{ transform: `skewX(-8deg) translateX(${bladeX})` }}
                onTransitionEnd={onBladeTransitionEnd}
              />
            )}
            {/* ── STAP 0: Keuze ── */}
            {formStep === 0 && (
              <div className="auth-choice-split">
                <button onClick={() => chooseAccount("vendor")} className="auth-choice-pane auth-choice-pane--vendor">
                  <div className="font-serif" style={{ fontWeight: 700, fontSize: "1.15rem" }}>{s.choiceVendorTitle}</div>
                  <div className="text-sm" style={{ color: "var(--ink-muted)" }}>{s.choiceVendorDesc}</div>
                  <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--gold)", fontWeight: 600, marginTop: "var(--space-1)" }}>
                    {s.chooseCta} <ArrowRight className="w-4 h-4" />
                  </span>
                </button>

                <button onClick={() => chooseAccount("couple")} className="auth-choice-pane auth-choice-pane--couple">
                  <div className="font-serif" style={{ fontWeight: 700, fontSize: "1.15rem" }}>{s.choiceCoupleTitle}</div>
                  <div className="text-sm" style={{ color: "var(--muted)" }}>{s.choiceCoupleDesc}</div>
                  <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600, marginTop: "var(--space-1)" }}>
                    {s.chooseCta} <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            )}

            {formStep !== 0 && (
              <div style={{ padding: "1.75rem" }}>

            {/* ── BRUIDSPAAR stap 1 ── */}
            {account === "couple" && authStep === "form" && formStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">{s.coupleStep1Title}</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{s.coupleStep1Sub}</p>
                </div>
                <Field label={s.partner1Label}>
                  <input value={couple.partner1} onChange={e => setCouple({ ...couple, partner1: e.target.value })} placeholder={s.partner1Placeholder} className="ddp-input" />
                </Field>
                <Field label={s.partner2Label}>
                  <input value={couple.partner2} onChange={e => setCouple({ ...couple, partner2: e.target.value })} placeholder={s.partner2Placeholder} className="ddp-input" />
                </Field>
                {couple.partner1 && couple.partner2 && (
                  <div className="font-serif p-3 rounded-xl text-center text-sm" style={{ fontWeight: 700, background: "var(--sand)", color: "var(--gold-deep)" }}>
                    {s.weddingOfPrefix} {couple.partner1} &amp; {couple.partner2}
                  </div>
                )}
              </div>
            )}

            {account === "couple" && authStep === "form" && formStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">{s.coupleStep2Title}</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{s.coupleStep2Sub}</p>
                </div>
                <Field label={s.dateLabel}>
                  <DatePicker value={couple.date} onChange={v => setCouple({ ...couple, date: v })} min={new Date().toISOString().split("T")[0]} />
                </Field>
                <label className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={multiDay}
                    onChange={e => { setMultiDay(e.target.checked); if (!e.target.checked) setCouple(c => ({ ...c, endDate: "" })); }}
                    style={{ width: "1rem", height: "1rem", accentColor: "var(--gold)" }}
                  />
                  {s.multiDayLabel}
                </label>
                {multiDay && (
                  <Field label={s.endDateLabel}>
                    <DatePicker value={couple.endDate} onChange={v => setCouple({ ...couple, endDate: v })} min={couple.date || new Date().toISOString().split("T")[0]} />
                  </Field>
                )}
                <Field label={s.venueLabel}>
                  <div ref={venueWrapRef} style={{ position: "relative" }}>
                    <input
                      value={couple.venue}
                      onChange={e => { setCouple({ ...couple, venue: e.target.value, venueVendorId: "" }); setVenueOpen(true); }}
                      onFocus={() => setVenueOpen(true)}
                      placeholder={s.venuePlaceholder}
                      className="ddp-input"
                      autoComplete="off"
                    />
                    {venueOpen && venueMatches.length > 0 && (
                      <div className="ddp-suggest-panel">
                        {venueMatches.map(v => (
                          <button
                            key={v.id}
                            type="button"
                            className="ddp-suggest-row"
                            onClick={() => { setCouple(c => ({ ...c, venue: v.city ? `${v.name}, ${v.city}` : v.name, venueVendorId: v.id })); setVenueOpen(false); }}
                          >
                            <span style={{ fontWeight: 600 }}>{v.name}</span>
                            {v.city && <span style={{ color: "var(--muted)" }}>, {v.city}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
                    {s.venueHint}
                  </p>
                </Field>
                <Field label={s.guestCountLabel}>
                  <input type="number" min={1} value={couple.guestCount} onChange={e => setCouple({ ...couple, guestCount: e.target.value })} placeholder={s.guestCountPlaceholder} className="ddp-input" />
                </Field>
              </div>
            )}

            {account === "couple" && authStep === "form" && formStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">{s.coupleStep3Title}</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{s.coupleStep3Sub}</p>
                </div>
                <Field label={s.emailLabel}>
                  <input type="email" value={couple.email} onChange={e => setCouple({ ...couple, email: e.target.value })} placeholder={s.emailPlaceholderCouple} className="ddp-input" />
                </Field>
              </div>
            )}

            {/* ── LEVERANCIER stap 1 ── */}
            {account === "vendor" && authStep === "form" && formStep === 1 && !(nameMatches && nameMatches.length > 0) && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">{s.vendorStep1Title}</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{s.vendorStep1Sub}</p>
                </div>
                <Field label={s.businessNameLabel}>
                  <input value={vendor.businessName} onChange={e => { setVendor({ ...vendor, businessName: e.target.value }); setNameMatches(null); }} placeholder={s.businessNamePlaceholder} className="ddp-input" />
                </Field>
                <Field label={s.categoryLabel}>
                  <select value={vendor.category} onChange={e => setVendor({ ...vendor, category: e.target.value })} className="ddp-input">
                    <option value="">{s.categoryPlaceholder}</option>
                    {VENDOR_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
              </div>
            )}

            {/* ── LEVERANCIER duplicaat-check: bedrijf lijkt al te bestaan ── */}
            {account === "vendor" && authStep === "form" && formStep === 1 && nameMatches && nameMatches.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{s.duplicateTitle}</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    {nameMatches.length === 1 ? s.duplicateSubOne : s.duplicateSubMany}
                    {" "}&ldquo;{vendor.businessName}&rdquo;. {s.duplicateSubSuffix}
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
                            {s.duplicateHasAccount}{" "}
                            <Link href="/login" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>{s.duplicateLoginLink}</Link>
                          </span>
                        ) : (
                          <Link href={`/leveranciers/${m.id}`} className="text-sm flex-shrink-0" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                            {s.duplicateClaimLink}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {s.duplicateHint}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setNameMatches(null); }} className="ddp-btn-secondary flex-1">
                    <ArrowLeft className="w-4 h-4" /> {s.duplicateBack}
                  </button>
                  <button onClick={() => { setNameMatches([]); setFormStep(2); }} className="ddp-btn-primary flex-1">
                    {s.duplicateNewBusiness} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {account === "vendor" && authStep === "form" && formStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">{s.vendorStep2Title}</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{s.vendorStep2Sub}</p>
                </div>
                <Field label={s.contactPersonLabel}>
                  <input value={vendor.contactPerson} onChange={e => setVendor({ ...vendor, contactPerson: e.target.value })} placeholder={s.contactPersonPlaceholder} className="ddp-input" />
                </Field>
                <Field label={s.phoneLabel}>
                  <input value={vendor.phone} onChange={e => setVendor({ ...vendor, phone: e.target.value })} placeholder="06-12345678" className="ddp-input" />
                </Field>
                <Field label={s.cityLabel}>
                  <input value={vendor.city} onChange={e => setVendor({ ...vendor, city: e.target.value })} placeholder={s.cityPlaceholder} className="ddp-input" />
                </Field>
                <Field label={s.websiteLabel}>
                  <input value={vendor.website} onChange={e => setVendor({ ...vendor, website: e.target.value })} placeholder="https://…" className="ddp-input" />
                </Field>
              </div>
            )}

            {account === "vendor" && authStep === "form" && formStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">{s.vendorStep3Title}</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{s.vendorStep3Sub}</p>
                </div>
                <Field label={s.emailLabel}>
                  <input type="email" value={vendor.email} onChange={e => setVendor({ ...vendor, email: e.target.value })} placeholder={s.emailPlaceholderVendor} className="ddp-input" autoFocus />
                </Field>
              </div>
            )}

            {/* ── VERIFICATIECODE ── */}
            {authStep === "verify-code" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">{s.verifyTitle}</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    {s.verifySub} <strong>{currentEmail}</strong>.
                  </p>
                </div>
                <Field label={s.codeLabel}>
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
                  {verifyingCode ? s.codeCheckingBtn : s.codeConfirmBtn}
                </button>
                <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
                  {s.noCodeText}{" "}
                  <button className="underline" style={{ color: "var(--primary)" }} onClick={() => { setAuthStep("form"); setCode(""); setError(""); }}>
                    {s.resendBtn}
                  </button>
                </p>
              </div>
            )}

            {/* ── KIES INLOGMETHODE ── */}
            {authStep === "choose-auth" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Check className="w-5 h-5" style={{ color: "var(--success)" }} /> {s.chooseAuthTitle}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{s.chooseAuthSub}</p>
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
                  {s.googleBtn}
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
                    {s.appleBtn}
                  </a>
                )}

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{s.orDivider}</span>
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                </div>

                <button
                  onClick={() => setAuthStep("password")}
                  className="ddp-btn-secondary w-full"
                >
                  {s.passwordChoiceBtn}
                </button>
              </div>
            )}

            {/* ── WACHTWOORD INSTELLEN ── */}
            {authStep === "password" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">{s.passwordTitle}</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{s.passwordSub}</p>
                </div>
                <Field label={s.passwordLabel}>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={s.passwordPlaceholder}
                      className="ddp-input pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(sp => !sp)}
                      aria-label={showPassword ? s.hidePassword : s.showPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--muted)" }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
                <Field label={s.passwordConfirmLabel}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    placeholder={s.passwordConfirmPlaceholder}
                    className="ddp-input"
                  />
                </Field>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={saving}
                  className="ddp-btn-primary w-full"
                >
                  {saving ? s.creatingAccountBtn : s.createAccountBtn}
                </button>
                <button onClick={() => setAuthStep("choose-auth")} className="text-xs text-center w-full" style={{ color: "var(--muted)" }}>
                  {s.otherMethodBtn}
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
                  <ArrowLeft className="w-4 h-4" /> {s.backBtn}
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
                    {checkingName ? s.checkingBtn : <>{s.nextBtn} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                ) : (
                  // Last form step = email step → send code
                  <button
                    onClick={handleSendCode}
                    disabled={sendingCode || !currentEmail}
                    className="ddp-btn-primary flex-1"
                  >
                    {sendingCode ? s.sendingCodeBtn : s.sendCodeBtn}
                  </button>
                )}
              </div>
            )}
              </div>
            )}
          </div>

          <p className="text-center text-xs mt-4" style={{ color: "var(--muted)" }}>
            {s.alreadyAccount} <Link href="/login" style={{ color: "var(--primary)" }}>{s.loginLink}</Link>
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
