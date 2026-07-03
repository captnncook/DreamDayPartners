"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ScrollReveal from "@/components/ScrollReveal";
import { Check, ArrowRight, ChevronDown, LogOut } from "lucide-react";

/* ─── Data ─────────────────────────────────────────────── */

const FEATURES_COUPLES = [
  { title: "Nooit hetzelfde twee keer vertellen", desc: "Gastenaantal en dieetwensen vul je één keer in — cateraar, bakker en vervoerder lezen automatisch mee." },
  { title: "Eén draaiboek voor iedereen",         desc: "Fotograaf, DJ, band en vervoerder werken met dezelfde actuele tijdlijn, niet acht losse kopieën." },
  { title: "Altijd zicht op betaalstatus",        desc: "Aanbetaling, einddatum en eindbedrag van elke leverancier in één overzicht — geen losse facturen bijhouden." },
  { title: "Contracten & offertes centraal",      desc: "Alles wat je ontvangt staat gecategoriseerd in je dossier, niet verspreid over mail en WhatsApp." },
  { title: "Duidelijke goedkeuringen",            desc: "Weet precies welke versie van het moodboard of menu je hebt goedgekeurd — geen mailthread doorzoeken." },
  { title: "Geen telefooncentrale meer",          desc: "Leveranciers stemmen praktische logistiek rechtstreeks met elkaar af, in plaats van via jou." },
  { title: "Taken & deadlines op één plek",       desc: "Van verloving tot de grote dag — voortgang in één dashboard, niet drie losse apps." },
  { title: "Altijd gratis",                       desc: "Geen abonnement, geen creditcard, geen addertjes — voor altijd gratis voor bruidsparen." },
];

const VENDOR_STORIES: { value: string; label: string; pain: string; solution: string }[] = [
  {
    value: "weddingplanner", label: "Weddingplanner",
    pain: "Jij coördineert 12+ leveranciers, vaak via vijf losse tools naast elkaar — en volgens onderzoek gaat tot 70% van je tijd naar administratie in plaats van naar het vak zelf.",
    solution: "DreamDay geeft je per bruiloft één overzicht: status van elke leverancier, openstaande deliverables, betalingen en het complete draaiboek — zonder zelf alles handmatig te synchroniseren.",
  },
  {
    value: "fotograaf", label: "Fotograaf",
    pain: "Voor elk uur achter de camera gaat er net zoveel tijd naar niet-gefactureerde administratie: offertes op maat, contracten, en steeds opnieuw het tijdschema doornemen.",
    solution: "Je shotlist en leveringen (sneak peek, bestanden, album) staan met een duidelijke goedkeuringsstatus klaar, in hetzelfde draaiboek als de videograaf.",
  },
  {
    value: "videograaf", label: "Videograaf",
    pain: "Jij en de fotograaf vragen vaak los van elkaar dezelfde ceremonie-informatie op bij het bruidspaar — en als er iets verschuift, hoort niet iedereen het tegelijk.",
    solution: "Eén gedeeld draaiboek per fase betekent dat jullie nooit meer los van elkaar dezelfde tijden hoeven te reconstrueren.",
  },
  {
    value: "bloemist", label: "Bloemist",
    pain: "Het lastige deel van bloemwerk is niet het boeket — het is de aanpassing twee weken van tevoren, de gewijzigde tafelindeling, of niet weten wie het aanspreekpunt is.",
    solution: "Gastenaantallen, tafelindeling en het opbouwschema staan centraal bij — inclusief de toegangstijd van de locatie, zodat je dat niet zelf hoeft na te vragen.",
  },
  {
    value: "catering", label: "Catering",
    pain: "Het definitieve gastenaantal, allergieën en dieetwensen achterhaal je nu vaak tot op het laatste moment via losse mailtjes.",
    solution: "DreamDay leest automatisch mee met de actuele gastenlijst van het bruidspaar — geen aparte spreadsheet meer opvragen en samenvoegen.",
  },
  {
    value: "bakker", label: "Bruidstaart & Bakker",
    pain: "Een taart bakken op het verkeerde gastenaantal kost een hele laag — of je bakt juist te weinig voor een uitgebreidere gastenlijst.",
    solution: "Dezelfde automatische koppeling met de gastenlijst, plus een heldere goedkeuringsstatus voor smaakproef en ontwerp.",
  },
  {
    value: "dj", label: "DJ",
    pain: "Must-play-lijst, geluidsgrens van de locatie en het exacte moment van de eerste dans komen nu via drie verschillende kanalen binnen.",
    solution: "De geluidsgrens van de locatie staat al vooraf ingevuld, en je fase-indeling hangt direct aan de rest van het draaiboek.",
  },
  {
    value: "liveband", label: "Liveband",
    pain: "Opbouw, stroomvoorziening en soundcheck regelen — en dan ook nog het repertoire afstemmen op het exacte moment van de speeches.",
    solution: "Logistiek zoals vermogen, podiumafmeting en kleedkamer, plus je definitieve setlist, staan vooraf vast — gekoppeld aan het draaiboek.",
  },
  {
    value: "ceremoniespreker", label: "Ceremoniespreker",
    pain: "Een ceremonie schrijven begint met een uitgebreide vragenlijst over het bruidspaar, en eindigt met uitzoeken wie de repetitie regelt.",
    solution: "Het liefdesverhaal en de voorkeuren staan gestructureerd vast, met een duidelijke goedkeuringsstatus voor je concept- en definitieve script.",
  },
  {
    value: "trouwlocatie", label: "Trouwlocatie",
    pain: "Bij tientallen tot honderden bruiloften per jaar leg je bij elke nieuwe leverancier weer dezelfde huisregels uit.",
    solution: "Sluitingstijd, geluidsgrens en cateringbeleid staan één keer vast — automatisch zichtbaar voor elke leverancier die het bruidspaar boekt.",
  },
  {
    value: "haarstylist", label: "Haar & Make-up",
    pain: "Als hair & makeup uitloopt, verschuift de rest van de hele dag — en dat gebeurt vaak omdat niemand vooraf de tijd per persoon heeft berekend.",
    solution: "Aantal personen en behandeltijd worden vooraf vastgelegd, met ingebouwde bufferruimte in het draaiboek.",
  },
  {
    value: "vervoer", label: "Vervoer",
    pain: "Meerdere ophaallocaties, tijden die achterwaarts vanaf de ceremonie berekend moeten worden — en één verkeerde inschatting verschuift de hele dag.",
    solution: "Je rittenplanner hangt in hetzelfde draaiboek als de rest van de dag, dus een verschuiving is direct voor iedereen zichtbaar.",
  },
  {
    value: "decoratie", label: "Decoratie & Styling",
    pain: "De styling kan pas als de tent staat, de bloemen komen na de styling — en één leverancier die uitloopt, verschuift de hele opbouw.",
    solution: "Het gedeelde opbouwschema en de moodboard-goedkeuring laten precies zien wanneer wie aan de beurt is.",
  },
  {
    value: "fotocabine", label: "Fotocabine",
    pain: "Wie een dag wacht met reageren op een aanvraag, is de boeking vaak al kwijt aan een concurrent.",
    solution: "Aanvragen en bruiloftsdetails staan op één centrale plek, zodat je binnen minuten kan reageren in plaats van dagen.",
  },
];

const FEATURES_VENDORS = [
  { title: "Draaiboek & planning",    desc: "Ontvang je schema direct in het portaal. Altijd up-to-date, nooit verwarring." },
  { title: "Direct communiceren",     desc: "Chat met de planner en het bruidspaar vanuit één plek." },
  { title: "Documenten & offertes",   desc: "Upload contracten en offertes veilig in de cloud." },
  { title: "Meerdere bruiloften",     desc: "Beheer al je klantbruiloften vanuit één overzichtelijk dashboard." },
  { title: "Premium profiel",         desc: "Presenteer jezelf als betrouwbare leverancier in onze catalogus." },
  { title: "Analytisch dashboard",    desc: "Inzicht in je prestaties. Groei je bedrijf slimmer." },
];

const HOW_IT_WORKS = [
  { n: "01", title: "Stel je dream team samen", desc: "Kies je leveranciers uit de database met alle trouwcategorieën.", img: "/images/dreamday-button.png" },
  { n: "02", title: "Regel alles in de app",    desc: "Contact, offertes en facturen op één plek — geen losse mailtjes meer.", img: "/images/dashboard-laptop.png" },
  { n: "03", title: "Maak je draaiboek",        desc: "En geniet van een dag die vlekkeloos verloopt. Zonder gedoe.", img: "/images/app-ipad.png" },
];

const FAQS = [
  { q: "Is DreamDay Platform gratis voor bruidsparen?", a: "Ja, volledig. Bruidsparen betalen nooit iets — geen proefperiode, geen verborgen kosten. Het platform is voor altijd gratis voor jullie." },
  { q: "Hoe vind ik leveranciers?", a: "Via de leveranciersdatabase zoek je op categorie — van fotograaf tot caterer. Je voegt ze toe aan jullie bruiloft en communiceert direct via de app." },
  { q: "Wat zit er in premium voor leveranciers?", a: "Met het premium abonnement beheer je onbeperkt bruiloften, bewerk je het draaiboek, upload je documenten, heb je toegang tot een analytisch dashboard en profiteer je van prioriteit support." },
  { q: "Hoe werkt het contact met leveranciers?", a: "Alles loopt via de ingebouwde chat. Geen losse apps, geen mailtjes kwijt — alle gesprekken staan in je account." },
  { q: "Wat is een draaiboek?", a: "Het draaiboek is een minuut-voor-minuut tijdlijn van jullie trouwdag. Je vult het samen met je planner in en deelt het met alle leveranciers." },
  { q: "Kan ik de app ook gebruiken zonder weddingplanner?", a: "Absoluut. DreamDay Platform is ontworpen zodat bruidsparen zelf de regie kunnen houden — met of zonder professionele planner." },
];

/* ─── Sub-components ────────────────────────────────────── */

function FeatureCard({ title, desc, delay = 0 }: { title: string; desc: string; delay?: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div
        className="ddp-feature-card"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "1.625rem",
          border: "1px solid rgba(0,0,0,0.05)",
          height: "100%",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          {title}
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.7 }}>{desc}</p>
      </div>
    </ScrollReveal>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.10)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between gap-4"
        style={{ background: "none", border: "none", cursor: "pointer", padding: "1.375rem 0" }}
      >
        <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{q}</span>
        <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }} />
      </button>
      {open && (
        <p style={{ fontSize: "0.9375rem", color: "var(--muted)", lineHeight: 1.7, paddingBottom: "1.375rem" }}>{a}</p>
      )}
    </div>
  );
}

function SidebarItem({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left"
      style={{
        fontSize: "0.9375rem", fontWeight: isActive ? 700 : 500, padding: "0.625rem 1rem",
        borderRadius: "10px", border: "none", cursor: "pointer",
        transition: "background 140ms var(--ease-out), color 140ms var(--ease-out), border-color 140ms var(--ease-out), transform 100ms var(--ease-out)",
        background: isActive ? "var(--accent-soft)" : "transparent",
        color: isActive ? "var(--foreground)" : "var(--muted)",
        borderLeft: `3px solid ${isActive ? "var(--primary)" : "transparent"}`,
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {label}
    </button>
  );
}

function VendorStoryPicker() {
  const [active, setActive] = useState<string>("bruidspaar");
  const story = VENDOR_STORIES.find((s) => s.value === active);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex flex-col gap-1 lg:w-64 flex-shrink-0">
        <SidebarItem label="Bruidspaar" isActive={active === "bruidspaar"} onClick={() => setActive("bruidspaar")} />
        <div style={{ height: "1px", background: "rgba(0,0,0,0.10)", margin: "0.75rem 0.25rem" }} />
        {VENDOR_STORIES.map((s) => (
          <SidebarItem key={s.value} label={s.label} isActive={active === s.value} onClick={() => setActive(s.value)} />
        ))}
      </div>

      {/* Dropdown — mobile/tablet only */}
      <div className="lg:hidden">
        <select
          value={active}
          onChange={(e) => setActive(e.target.value)}
          className="ddp-select"
          style={{ fontWeight: 700, fontSize: "1rem" }}
        >
          <option value="bruidspaar">Bruidspaar</option>
          <optgroup label="Leveranciers">
            {VENDOR_STORIES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {active === "bruidspaar" ? (
          <div key="bruidspaar" className="animate-fade-in">
            <p className="ddp-section-label mb-4" style={{ color: "var(--primary)" }}>Voor het bruidspaar</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FEATURES_COUPLES.map((f) => (
                <FeatureCard key={f.title} title={f.title} desc={f.desc} />
              ))}
            </div>
          </div>
        ) : story ? (
          <div key={story.value} className="animate-fade-in" style={{ background: "white", borderRadius: "20px", padding: "2rem", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p className="ddp-section-label mb-3" style={{ color: "var(--primary)" }}>{story.label} — de vervelende realiteit</p>
            <p style={{ fontSize: "1.0625rem", color: "var(--foreground)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
              {story.pain}
            </p>
            <p className="ddp-section-label mb-3" style={{ color: "var(--primary)" }}>Wat DreamDay oplost</p>
            <p style={{ fontSize: "1.0625rem", color: "var(--muted)", lineHeight: 1.7 }}>
              {story.solution}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setLoggedIn(Boolean(d?.user)))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setLoggedIn(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center px-5 md:px-10"
        style={{
          height: "56px",
          gap: "1rem",
          background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.80)",
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
          transition: "background 200ms var(--ease-out), border-color 200ms var(--ease-out)",
        }}
      >
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/images/logo.svg" alt="DreamDay Partners" width={28} height={28} />
          <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>
            DreamDay<span className="hidden sm:inline" style={{ color: "var(--primary)" }}> Platform</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-0 flex-1 justify-center">
          {[
            { href: "#hoe-het-werkt", label: "Hoe het werkt" },
            { href: "#prijzen",       label: "Prijzen" },
            { href: "#faq",           label: "FAQ" },
            { href: "/leveranciers",  label: "Vind leveranciers" },
          ].map((l) => (
            <a key={l.href} href={l.href} className="ddp-btn-ghost" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--foreground)", padding: "0.35rem 0.7rem" }}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {loggedIn ? (
            <>
              <Link href="/dashboard" className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.45rem 1.125rem" }}>
                Profiel
              </Link>
              <button
                onClick={handleLogout}
                className="ddp-btn-ghost"
                style={{ fontSize: "0.8125rem", color: "var(--muted)", padding: "0.45rem 0.625rem" }}
                title="Uitloggen"
                aria-label="Uitloggen"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="hidden sm:block">
                <Link href="/login" className="ddp-btn-ghost" style={{ fontSize: "0.8125rem", color: "var(--foreground)", padding: "0.35rem 0.75rem" }}>
                  Inloggen
                </Link>
              </div>
              <Link href="/aanmelden" className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.45rem 0.875rem" }}>
                Begin gratis
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "var(--background)", minHeight: "90vh", display: "flex", alignItems: "center" }}>
        <div className="w-full px-5 md:px-10 py-20 md:py-28" style={{ maxWidth: "clamp(1200px, 82vw, 1600px)", margin: "0 auto" }}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">
            {/* Text */}
            <div className="lg:w-1/2 animate-fade-in">
              <h1
                className="font-serif"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 5rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.055em",
                  lineHeight: 1.02,
                  color: "var(--foreground)",
                  marginBottom: "1.5rem",
                }}
              >
                Samen naar jullie dream day,{" "}
                <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  zonder de stress.
                </span>
              </h1>
              <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.125rem)", color: "var(--muted)", maxWidth: "440px", lineHeight: 1.7, marginBottom: "2.5rem" }}>
                Stel je dream team van leveranciers samen, regel offertes en facturen en maak je draaiboek — alles in één app.
              </p>
              <div className="flex flex-wrap gap-3 mb-6" style={{ position: "relative", zIndex: 1 }}>
                <Link href="/aanmelden" className="ddp-btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.875rem" }}>
                  Begin gratis
                </Link>
                <Link href="/leveranciers" className="ddp-btn-secondary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.875rem", borderColor: "var(--color-charcoal)", color: "var(--color-charcoal)" }}>
                  Vind jouw Dream Partner!
                </Link>
              </div>
            </div>

            {/* Hero image */}
            <div className="lg:w-1/2 animate-fade-in" style={{ animationDelay: "0.2s", position: "relative" }}>
              {/* Zachte gloed erachter — vult de ruimte rond het beeld op grote schermen, i.p.v. lege witruimte */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: "-12%",
                  background: "var(--gradient-primary)",
                  opacity: 0.14,
                  filter: "blur(80px)",
                  borderRadius: "50%",
                  zIndex: 0,
                }}
              />
              <div style={{ borderRadius: "24px", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.15)", position: "relative" }}>
                <Image
                  src="/images/hero-bride-phone.png"
                  alt="Bruid plant haar bruiloft met DreamDay Partners"
                  width={700}
                  height={467}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── "The Future" brand strip ──────────────────────── */}
      <ScrollReveal>
        <div style={{ position: "relative", overflow: "hidden", maxHeight: "340px" }}>
          <Image
            src="/images/future-planning.png"
            alt="The Future of Wedding Planning"
            width={1400}
            height={560}
            style={{ width: "100%", height: "340px", objectFit: "cover", objectPosition: "center 30%" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="text-center px-5">
              <p style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 700, color: "white", letterSpacing: "-0.04em", lineHeight: 1.15, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
                De toekomst van bruiloftplanning.
              </p>
              <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.7)", marginTop: "0.75rem" }}>
                Alles wat je nodig hebt, op één plek.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Herkenning ───────────────────────────────────── */}
      <section className="px-5 py-24 md:py-32" style={{ background: "var(--background)" }}>
        <div style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto" }}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-20">
            <ScrollReveal className="lg:w-2/5 lg:flex-shrink-0">
              <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.10)" }}>
                <Image
                  src="/images/bride-sofa.png"
                  alt="Bruid plant ontspannen haar bruiloft"
                  width={600}
                  height={400}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            </ScrollReveal>
            <div className="lg:flex-1">
              <ScrollReveal>
                <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "1.25rem" }}>
                  Een bruiloft plannen.{" "}
                  <span style={{ color: "var(--muted)", fontWeight: 500 }}>Voelt al snel als een tweede baan.</span>
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <p style={{ fontSize: "1.0625rem", color: "var(--muted)", lineHeight: 1.75, marginBottom: "1.25rem" }}>
                  Losse mailtjes, WhatsApp-groepen vol offertes en een Excel die steeds minder overzicht geeft. Je wil trouwen, geen projectmanager worden.
                </p>
                <p style={{ fontSize: "1.0625rem", color: "var(--foreground)", lineHeight: 1.75, fontWeight: 500 }}>
                  DreamDay Platform brengt rust: alles op één plek, samen geregeld.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hoe het werkt ────────────────────────────────── */}
      <section id="hoe-het-werkt" className="px-5 py-24 md:py-32" style={{ background: "var(--sand)" }}>
        <div style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Hoe het werkt</p>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "4rem", maxWidth: "520px" }}>
              Drie stappen.{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>Dat is alles.</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.n} delay={i * 100}>
                <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", height: "100%" }}>
                  <div style={{ position: "relative", height: "200px" }}>
                    <Image src={step.img} alt={step.title} fill style={{ objectFit: "cover" }} />
                    <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", borderRadius: "10px", padding: "4px 10px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "white", letterSpacing: "0.05em" }}>{step.n}</span>
                    </div>
                  </div>
                  <div style={{ padding: "1.375rem 1.5rem 1.5rem" }}>
                    <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", marginBottom: "0.5rem" }}>{step.title}</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.65 }}>{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Functies voor bruidsparen ─────────────────────── */}
      <section id="stellen" className="px-5 py-24 md:py-32" style={{ background: "var(--background)" }}>
        <div style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto" }}>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* Left: text + features grid */}
            <div className="flex-1">
              <ScrollReveal>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Voor bruidsparen</p>
                <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "0.75rem" }}>
                  Altijd gratis.{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>Voor altijd.</span>
                </h2>
                <p style={{ fontSize: "1rem", color: "var(--muted)", lineHeight: 1.65, marginBottom: "2.5rem", maxWidth: "400px" }}>
                  Maak een account en begin direct. Geen abonnement, geen proefperiode — ooit.
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {FEATURES_COUPLES.map((f, i) => (
                  <FeatureCard key={f.title} title={f.title} desc={f.desc} delay={i * 60} />
                ))}
              </div>

              <ScrollReveal>
                <Link href="/aanmelden" className="ddp-btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.875rem" }}>
                  Begin gratis <ArrowRight className="w-4 h-4" />
                </Link>
              </ScrollReveal>
            </div>

            {/* Right: image */}
            <ScrollReveal className="lg:w-80 lg:flex-shrink-0" delay={150}>
              <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", position: "sticky", top: "80px" }}>
                <Image
                  src="/images/app-ipad.png"
                  alt="DreamDay app op iPad"
                  width={480}
                  height={360}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <div style={{ padding: "1.25rem", background: "white" }}>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                    Alle functies beschikbaar op elk apparaat — telefoon, tablet of laptop.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Voor leveranciers ────────────────────────────── */}
      <section id="leveranciers" className="px-5 py-24 md:py-32" style={{ background: "var(--sand)" }}>
        <div style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto" }}>
          <div className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-16 items-start">
            {/* Right (visually): features */}
            <div className="flex-1">
              <ScrollReveal>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Voor leveranciers</p>
                <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "0.75rem" }}>
                  Beheer al je bruiloften{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>op één plek.</span>
                </h2>
                <p style={{ fontSize: "1rem", color: "var(--muted)", lineHeight: 1.65, marginBottom: "2.5rem", maxWidth: "400px" }}>
                  Als bloemist, DJ of fotograaf heb je altijd meerdere bruiloften tegelijk. DreamDay Platform geeft je één helder overzicht.
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {FEATURES_VENDORS.map((f, i) => (
                  <FeatureCard key={f.title} title={f.title} desc={f.desc} delay={i * 60} />
                ))}
              </div>

              <ScrollReveal>
                <Link href="/login" className="ddp-btn-secondary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.875rem" }}>
                  Word leverancier
                </Link>
              </ScrollReveal>
            </div>

            {/* Left: image */}
            <ScrollReveal className="lg:w-80 lg:flex-shrink-0" delay={150}>
              <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", position: "sticky", top: "80px" }}>
                <Image
                  src="/images/planner-outdoor.png"
                  alt="Weddingplanner buiten met tablet"
                  width={480}
                  height={360}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <div style={{ padding: "1.25rem", background: "white" }}>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                    Altijd up-to-date, ook onderweg op locatie.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Per leveranciersoort ──────────────────────────── */}
      <section className="px-5 py-24 md:py-32" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Voor elke leveranciersoort</p>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "0.75rem", maxWidth: "640px" }}>
              Wat kost jou nu tijd?{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>Kies je vak.</span>
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--muted)", marginBottom: "2.5rem", maxWidth: "520px" }}>
              Elke leveranciersoort heeft zijn eigen administratieve rompslomp. Klik hieronder en zie precies wat DreamDay voor jou oplost.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <VendorStoryPicker />
          </ScrollReveal>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────── */}
      <section className="px-5 py-24 md:py-32" style={{ background: "var(--background)" }}>
        <div style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Ervaringen</p>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "3.5rem" }}>
              Bruidsparen gingen{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>je voor.</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Featured photo quote */}
            <ScrollReveal delay={0} className="md:col-span-1">
              <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", height: "220px" }}>
                  <Image src="/images/bride-sofa.png" alt="Tevreden bruid" fill style={{ objectFit: "cover", objectPosition: "center top" }} />
                </div>
                <div style={{ padding: "1.5rem", background: "white", flex: 1 }}>
                  <p style={{ fontSize: "0.9375rem", color: "var(--foreground)", lineHeight: 1.7, marginBottom: "1rem", fontStyle: "italic" }}>
                    &ldquo;Eindelijk één plek voor alles. We hadden nooit gedacht dat plannen zo overzichtelijk kon zijn.&rdquo;
                  </p>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)" }}>Emma & Thomas</p>
                </div>
              </div>
            </ScrollReveal>

            <div className="md:col-span-2 grid grid-cols-1 gap-4">
              {[
                { quote: "De combinatie van leveranciers, chat en draaiboek op één plek is echt een game changer.", name: "Sophie & Lars" },
                { quote: "Op onze trouwdag hoefden we nergens aan te denken. Alles was geregeld dankzij DreamDay.", name: "Nora & Daan" },
              ].map((r, i) => (
                <ScrollReveal key={i} delay={(i + 1) * 100}>
                  <div style={{ background: "var(--sand)", borderRadius: "20px", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.04)", height: "100%" }}>
                    <p style={{ fontSize: "0.9375rem", color: "var(--foreground)", lineHeight: 1.7, marginBottom: "1.25rem", fontStyle: "italic" }}>
                      &ldquo;{r.quote}&rdquo;
                    </p>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)" }}>{r.name}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>
            * Reviews worden aangevuld zodra we echte ervaringen hebben ontvangen.
          </p>
        </div>
      </section>

      {/* ── Prijzen ──────────────────────────────────────── */}
      <section id="prijzen" className="px-5 py-24 md:py-32" style={{ background: "var(--sand)" }}>
        <div style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Transparante prijzen</p>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "0.75rem" }}>
              Eerlijk geprijsd.
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--muted)", marginBottom: "3.5rem" }}>
              Bruidsparen betalen nooit iets. Leveranciers kiezen wat bij hen past.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <ScrollReveal delay={0}>
              <div style={{ background: "white", borderRadius: "20px", padding: "2rem", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="ddp-badge badge-rose mb-5">Bruidspaar</div>
                <div style={{ fontSize: "2.75rem", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1, marginBottom: "4px" }}>Gratis</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1.5rem" }}>Voor altijd — geen creditcard nodig</div>
                <ul className="space-y-3 mb-7">
                  {["Leveranciersdatabase", "Contact via de app", "Offertes & facturen", "Draaiboek", "Gastenlijst & RSVP", "Budgetbeheer"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5" style={{ fontSize: "0.875rem" }}>
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/aanmelden" className="ddp-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                  Begin gratis
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <div style={{ background: "white", borderRadius: "20px", padding: "2rem", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="ddp-badge badge-neutral mb-5">Leverancier · Free</div>
                <div style={{ fontSize: "2.75rem", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1, marginBottom: "4px" }}>€0</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1.5rem" }}>Per maand</div>
                <ul className="space-y-3 mb-7">
                  {["Portaaltoegang (1 bruiloft)", "Draaiboek inzien", "Bestanden ontvangen", "Chatten met planner", "Basisprofiel"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5" style={{ fontSize: "0.875rem" }}>
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="ddp-btn-secondary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                  Word leverancier
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={160}>
              <div style={{ background: "var(--ink)", borderRadius: "20px", padding: "2rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "var(--gradient-primary)", borderRadius: "999px", color: "white", fontSize: "0.625rem", fontWeight: 700, padding: "3px 10px", letterSpacing: "0.05em" }}>
                  POPULAIRST
                </div>
                <div className="ddp-badge badge-premium mb-5">Dream Day Pro</div>
                <div style={{ fontSize: "2.75rem", fontWeight: 700, letterSpacing: "-0.04em", color: "white", lineHeight: 1, marginBottom: "4px" }}>€29</div>
                <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.5rem" }}>Per maand · Maandelijks opzegbaar</div>
                <ul className="space-y-3 mb-7">
                  {["Onbeperkt bruiloften", "Draaiboek bewerken", "Volledig bestandsbeheer", "Geavanceerde chat", "Premium profiel", "Analytisch dashboard", "Prioriteit support"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.85)" }}>
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary-light)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="ddp-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                  Pro starten
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="px-5 py-24 md:py-32" style={{ background: "var(--background)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Vragen</p>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "3rem" }}>
              Veel gestelde vragen.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <div style={{ background: "var(--sand)", borderRadius: "20px", padding: "0 1.75rem", border: "1px solid rgba(0,0,0,0.04)" }}>
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Afsluitende CTA met gouden logo ──────────────── */}
      <section className="relative overflow-hidden py-0" style={{ background: "var(--ink)", minHeight: "420px", display: "flex", alignItems: "center" }}>
        {/* Background image */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Image
            src="/images/logo-3d-gold.png"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center", opacity: 0.18 }}
          />
        </div>
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "560px", margin: "0 auto", padding: "5rem 1.25rem", textAlign: "center" }}>
          <ScrollReveal>
            <h2 className="font-serif" style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)", fontWeight: 700, letterSpacing: "-0.055em", lineHeight: 1.04, color: "white", marginBottom: "1.25rem" }}>
              Klaar om met plezier te plannen?
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.50)", marginBottom: "2.5rem", lineHeight: 1.6 }}>
              Sluit je aan bij honderden koppels die hun dream day plannen zonder de stress.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/aanmelden" className="inline-flex items-center gap-2 font-semibold" style={{ background: "white", color: "var(--foreground)", borderRadius: "999px", padding: "0.875rem 2.125rem", fontSize: "0.9375rem", textDecoration: "none" }}>
                Begin gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/leveranciers" className="inline-flex items-center font-medium" style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)", borderRadius: "999px", padding: "0.875rem 2.125rem", fontSize: "0.9375rem", textDecoration: "none" }}>
                Vind jouw Dream Partner
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="px-5 py-10" style={{ background: "var(--ink)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-5" style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto" }}>
          <div className="flex items-center gap-2">
            <Image src="/images/logo-wit.svg" alt="DreamDay Platform" width={26} height={26} />
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "rgba(255,255,255,0.80)", letterSpacing: "-0.02em" }}>DreamDay Platform</span>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {[
              { href: "#hoe-het-werkt", label: "Hoe het werkt" },
              { href: "#prijzen",       label: "Prijzen" },
              { href: "#faq",           label: "FAQ" },
              { href: "/leveranciers",  label: "Vind leveranciers" },
              { href: "/login",         label: "Inloggen" },
            ].map((l) => (
              <a key={l.href} href={l.href} style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.40)", textDecoration: "none" }}>{l.label}</a>
            ))}
          </div>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>© 2026 DreamDay Platform</p>
        </div>
      </footer>
    </div>
  );
}
