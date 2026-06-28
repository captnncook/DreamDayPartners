"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Check, ArrowRight, ChevronDown } from "lucide-react";

/* ─── Data ─────────────────────────────────────────────── */

const FEATURES_COUPLES = [
  { title: "Alle leveranciers op één plek",  desc: "Zoek, vergelijk en voeg je bloemist, DJ en fotograaf toe — zonder eindeloos googelen." },
  { title: "Contact via de app",             desc: "Geen losse gesprekken meer. Alles staat in je account, altijd terug te vinden." },
  { title: "Offertes & facturen geregeld",   desc: "Nooit meer zoeken in je mail. Alles wat je ontvangt staat netjes in je dossier." },
  { title: "Draaiboek voor jullie dag",      desc: "Een minuut-voor-minuut tijdlijn die je deelt met je dream team." },
  { title: "Overzicht & planning",           desc: "Van verloving tot de grote dag — taken, deadlines en voortgang in één dashboard." },
  { title: "Gastenlijst & RSVP",            desc: "Wie er komt, dieetwensen en bevestigingen — bijgehouden zonder gedoe." },
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
  { q: "Is DreamDay Partners gratis voor bruidsparen?", a: "Ja, volledig. Bruidsparen betalen nooit iets — geen proefperiode, geen verborgen kosten. Het platform is voor altijd gratis voor jullie." },
  { q: "Hoe vind ik leveranciers?", a: "Via de leveranciersdatabase zoek je op categorie — van fotograaf tot caterer. Je voegt ze toe aan jullie bruiloft en communiceert direct via de app." },
  { q: "Wat zit er in premium voor leveranciers?", a: "Met het premium abonnement beheer je onbeperkt bruiloften, bewerk je het draaiboek, upload je documenten, heb je toegang tot een analytisch dashboard en profiteer je van prioriteit support." },
  { q: "Hoe werkt het contact met leveranciers?", a: "Alles loopt via de ingebouwde chat. Geen losse apps, geen mailtjes kwijt — alle gesprekken staan in je account." },
  { q: "Wat is een draaiboek?", a: "Het draaiboek is een minuut-voor-minuut tijdlijn van jullie trouwdag. Je vult het samen met je planner in en deelt het met alle leveranciers." },
  { q: "Kan ik de app ook gebruiken zonder weddingplanner?", a: "Absoluut. DreamDay Partners is ontworpen zodat bruidsparen zelf de regie kunnen houden — met of zonder professionele planner." },
];

/* ─── Sub-components ────────────────────────────────────── */

function FeatureCard({ title, desc, delay = 0 }: { title: string; desc: string; delay?: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "1.625rem",
          border: "1px solid rgba(0,0,0,0.05)",
          transition: "box-shadow 0.3s, transform 0.3s",
          height: "100%",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.10)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
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

/* ─── Page ──────────────────────────────────────────────── */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [heroPassed, setHeroPassed] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroPassed(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setLoggedIn(Boolean(d?.user)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#ffffff", color: "var(--foreground)" }}>

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
          transition: "all 0.3s",
        }}
      >
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/images/logo.svg" alt="DreamDay Partners" width={28} height={28} />
          <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>
            DreamDay<span style={{ color: "var(--primary)" }}> Partners</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-0 flex-1 justify-center">
          {[
            { href: "#hoe-het-werkt", label: "Hoe het werkt" },
            { href: "/leveranciers",  label: "Vind leveranciers" },
            { href: "#prijzen",       label: "Prijzen" },
            { href: "#faq",           label: "FAQ" },
          ].map((l) => (
            <a key={l.href} href={l.href} className="ddp-btn-ghost" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--foreground)", padding: "0.35rem 0.7rem" }}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {loggedIn ? (
            <>
              <button
                onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => { window.location.href = "/login"; })}
                className="ddp-btn-ghost hidden sm:inline-flex"
                style={{ fontSize: "0.8125rem", color: "var(--foreground)", padding: "0.35rem 0.75rem" }}
              >
                Uitloggen
              </button>
              <Link href="/dashboard" className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.45rem 1.125rem" }}>
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="ddp-btn-ghost hidden sm:inline-flex" style={{ fontSize: "0.8125rem", color: "var(--foreground)", padding: "0.35rem 0.75rem" }}>
                Inloggen
              </Link>
              <Link href="/aanmelden" className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.45rem 1.125rem" }}>
                Begin gratis
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Sticky mobile CTA ────────────────────────────── */}
      {heroPassed && !loggedIn && (
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            padding: "0.875rem 1.25rem",
            display: "flex",
            gap: "0.625rem",
          }}
        >
          <Link
            href="/aanmelden"
            className="ddp-btn-primary"
            style={{ flex: 1, justifyContent: "center", padding: "0.75rem", fontSize: "0.9375rem" }}
          >
            Begin gratis
          </Link>
          <Link
            href="/leveranciers"
            className="ddp-btn-secondary"
            style={{ flex: 1, justifyContent: "center", padding: "0.75rem", fontSize: "0.9375rem" }}
          >
            Vind leveranciers
          </Link>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ background: "#ffffff", minHeight: "90vh", display: "flex", alignItems: "center" }}>
        <div className="w-full px-5 md:px-10 py-20 md:py-28" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">
            {/* Text */}
            <div className="lg:w-1/2 animate-fade-in">
              <h1
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
                <span style={{ color: "var(--primary)", background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
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
                <Link href="/leveranciers" style={{ fontSize: "0.9375rem", color: "var(--muted)", textDecoration: "underline", textUnderlineOffset: "3px", padding: "0.75rem 0.25rem" }}>
                  Vind jouw Dream Partner
                </Link>
              </div>
            </div>

            {/* Hero image */}
            <div className="lg:w-1/2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
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
      <section className="px-5 py-24 md:py-32" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
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
                <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "1.25rem" }}>
                  Een bruiloft plannen.{" "}
                  <span style={{ color: "var(--muted)", fontWeight: 500 }}>Voelt al snel als een tweede baan.</span>
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <p style={{ fontSize: "1.0625rem", color: "var(--muted)", lineHeight: 1.75, marginBottom: "1.25rem" }}>
                  Losse mailtjes, WhatsApp-groepen vol offertes en een Excel die steeds minder overzicht geeft. Je wil trouwen, geen projectmanager worden.
                </p>
                <p style={{ fontSize: "1.0625rem", color: "var(--foreground)", lineHeight: 1.75, fontWeight: 500 }}>
                  DreamDay Partners brengt rust: alles op één plek, samen geregeld.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hoe het werkt ────────────────────────────────── */}
      <section id="hoe-het-werkt" className="px-5 py-24 md:py-32" style={{ background: "#f5f5f7" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Hoe het werkt</p>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "4rem", maxWidth: "520px" }}>
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
      <section id="stellen" className="px-5 py-24 md:py-32" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* Left: text + features grid */}
            <div className="flex-1">
              <ScrollReveal>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Voor bruidsparen</p>
                <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "0.75rem" }}>
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
      <section id="leveranciers" className="px-5 py-24 md:py-32" style={{ background: "#f5f5f7" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <div className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-16 items-start">
            {/* Right (visually): features */}
            <div className="flex-1">
              <ScrollReveal>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Voor leveranciers</p>
                <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "0.75rem" }}>
                  Beheer al je bruiloften{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>op één plek.</span>
                </h2>
                <p style={{ fontSize: "1rem", color: "var(--muted)", lineHeight: 1.65, marginBottom: "2.5rem", maxWidth: "400px" }}>
                  Als bloemist, DJ of fotograaf heb je altijd meerdere bruiloften tegelijk. DreamDay Partners geeft je één helder overzicht.
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

      {/* ── Early access / beta ───────────────────────────── */}
      <section className="px-5 py-24 md:py-32" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <ScrollReveal>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "var(--gradient-primary)", borderRadius: "999px", padding: "0.25rem 0.875rem", fontSize: "0.6875rem", fontWeight: 700, color: "white", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Beta
              </span>
              <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Beperkte toegang · Wees er vroeg bij</span>
            </div>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "1rem" }}>
              Wees één van de eersten.{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>En help mee bouwen.</span>
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--muted)", lineHeight: 1.7, maxWidth: "520px", marginBottom: "3rem" }}>
              DreamDay Partners is momenteel in bèta. Vroege gebruikers krijgen directe toegang, persoonlijke support en de kans om het platform mee te vormen.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: "✦", title: "Vroege toegang", desc: "Registreer nu en gebruik het platform terwijl het groeit. Jouw feedback vormt de volgende versie." },
              { icon: "✦", title: "Directe support", desc: "Tijdens de bèta heb je direct contact met het team. Geen wachtrij, geen bot." },
              { icon: "✦", title: "Gratis voor bruidsparen", desc: "Nu, later, altijd. Bruidsparen betalen nooit voor DreamDay Partners." },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 100}>
                <div style={{ background: "#f5f5f7", borderRadius: "20px", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.04)", height: "100%" }}>
                  <div style={{ fontSize: "1.25rem", color: "var(--primary)", marginBottom: "0.75rem" }}>{item.icon}</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>{item.title}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prijzen ──────────────────────────────────────── */}
      <section id="prijzen" className="px-5 py-24 md:py-32" style={{ background: "#f5f5f7" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Transparante prijzen</p>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "0.75rem" }}>
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
                <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1.5rem" }}>Per maand · Gratis proberen, 1 bruiloft inbegrepen</div>
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
              <div style={{ background: "var(--foreground)", borderRadius: "20px", padding: "2rem", position: "relative", overflow: "hidden" }}>
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
      <section id="faq" className="px-5 py-24 md:py-32" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>Vragen</p>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "3rem" }}>
              Veel gestelde vragen.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <div style={{ background: "#f5f5f7", borderRadius: "20px", padding: "0 1.75rem", border: "1px solid rgba(0,0,0,0.04)" }}>
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Afsluitende CTA met gouden logo ──────────────── */}
      <section className="relative overflow-hidden py-0" style={{ background: "var(--foreground)", minHeight: "420px", display: "flex", alignItems: "center" }}>
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
            <h2 style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)", fontWeight: 700, letterSpacing: "-0.055em", lineHeight: 1.04, color: "white", marginBottom: "1.25rem" }}>
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
      <footer className="px-5 py-10" style={{ background: "var(--foreground)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-5" style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <div className="flex items-center gap-2">
            <Image src="/images/logo-wit.svg" alt="DreamDay Partners" width={26} height={26} />
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "rgba(255,255,255,0.80)", letterSpacing: "-0.02em" }}>DreamDay Partners</span>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {[
              { href: "#hoe-het-werkt", label: "Hoe het werkt" },
              { href: "/leveranciers",  label: "Vind leveranciers" },
              { href: "#prijzen",       label: "Prijzen" },
              { href: "#faq",           label: "FAQ" },
              { href: "/login",         label: "Inloggen" },
            ].map((l) => (
              <a key={l.href} href={l.href} style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.40)", textDecoration: "none" }}>{l.label}</a>
            ))}
          </div>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>© 2026 DreamDay Partners</p>
        </div>
      </footer>
    </div>
  );
}
