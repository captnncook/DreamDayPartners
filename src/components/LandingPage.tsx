"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  CheckSquare, Users, Euro, ClipboardList, Briefcase,
  MessageCircle, FolderOpen, Check, ArrowRight, ChevronDown,
  Shield, Star, Calendar,
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────────── */

const FEATURES_COUPLES = [
  { icon: Briefcase,     title: "Alle leveranciers op één plek",  desc: "Zoek, vergelijk en voeg je bloemist, DJ en fotograaf toe — zonder eindeloos googelen." },
  { icon: MessageCircle, title: "Contact via de app",             desc: "Geen losse gesprekken meer. Alles staat in je account, altijd terug te vinden." },
  { icon: Euro,          title: "Offertes & facturen geregeld",   desc: "Nooit meer zoeken in je mail. Alles wat je ontvangt staat netjes in je dossier." },
  { icon: ClipboardList, title: "Draaiboek voor jullie dag",      desc: "Een minuut-voor-minuut tijdlijn die je deelt met je dream team." },
  { icon: CheckSquare,   title: "Overzicht & planning",           desc: "Van verloving tot de grote dag — taken, deadlines en voortgang in één dashboard." },
  { icon: Users,         title: "Gastenlijst & RSVP",            desc: "Wie er komt, dieetwensen en bevestigingen — bijgehouden zonder gedoe." },
];

const FEATURES_VENDORS = [
  { icon: Calendar,      title: "Draaiboek & planning",    desc: "Ontvang je schema direct in het portaal. Altijd up-to-date, nooit verwarring." },
  { icon: MessageCircle, title: "Direct communiceren",     desc: "Chat met de planner en het bruidspaar vanuit één plek." },
  { icon: FolderOpen,    title: "Documenten & offertes",   desc: "Upload contracten en offertes veilig in de cloud." },
  { icon: Briefcase,     title: "Meerdere bruiloften",     desc: "Beheer al je klantbruiloften vanuit één overzichtelijk dashboard." },
  { icon: Shield,        title: "Premium profiel",         desc: "Presenteer jezelf als betrouwbare leverancier." },
  { icon: Star,          title: "Analytisch dashboard",    desc: "Inzicht in je prestaties. Groei je bedrijf slimmer." },
];

const HOW_IT_WORKS = [
  { n: "01", title: "Stel je dream team samen", desc: "Kies je leveranciers uit de database met alle trouwcategorieën." },
  { n: "02", title: "Regel alles in de app",    desc: "Contact, offertes en facturen op één plek — geen losse mailtjes meer." },
  { n: "03", title: "Maak je draaiboek",        desc: "En geniet van een dag die vlekkeloos verloopt. Zonder gedoe." },
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

function FeatureCard({ title, desc, delay = 0 }: { icon?: React.ElementType; title: string; desc: string; delay?: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div
        className="group flex flex-col"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "1.75rem",
          border: "1px solid rgba(0,0,0,0.05)",
          transition: "box-shadow 0.3s, transform 0.3s",
          cursor: "default",
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
        <h3 className="font-semibold mb-2" style={{ fontSize: "1rem", color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
      </div>
    </ScrollReveal>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between py-5 gap-4"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.01em" }}>
          {q}
        </span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0"
          style={{ color: "var(--muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }}
        />
      </button>
      {open && (
        <p style={{ fontSize: "0.9375rem", color: "var(--muted)", lineHeight: 1.7, paddingBottom: "1.25rem" }}>
          {a}
        </p>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */

export default function LandingPage({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#ffffff", color: "var(--foreground)" }}>

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 px-5 md:px-10 h-12"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          background: scrolled ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.72)",
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
          transition: "all 0.3s",
        }}
      >
        {/* Logo — links */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="DreamDay Partners" width={28} height={28} />
          <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>
            DreamDay<span style={{ color: "var(--primary)" }}> Partners</span>
          </span>
        </Link>

        {/* Nav items — gecentreerd */}
        <div className="hidden md:flex items-center gap-0">
          {[
            { href: "#hoe-het-werkt", label: "Hoe het werkt" },
            { href: "/leveranciers",  label: "Leveranciers" },
            { href: "#prijzen",       label: "Prijzen" },
            { href: "#faq",           label: "FAQ" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="ddp-btn-ghost"
              style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--foreground)", padding: "0.35rem 0.7rem" }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Knoppen — rechts */}
        <div className="flex items-center gap-2 justify-end">
          {isLoggedIn ? (
            <Link href="/dashboard" className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.45rem 1.125rem" }}>
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="ddp-btn-ghost hidden sm:inline-flex"
                style={{ fontSize: "0.8125rem", color: "var(--foreground)", padding: "0.35rem 0.75rem" }}
              >
                Inloggen
              </Link>
              <Link href="/weddings/wizard" className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.45rem 1.125rem" }}>
                Begin gratis
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-5 pt-24 pb-32" style={{ background: "#ffffff" }}>

        <div className="animate-fade-in">
          <h1
            style={{
              fontSize: "clamp(2.75rem, 9vw, 6rem)",
              fontWeight: 700,
              letterSpacing: "-0.055em",
              lineHeight: 1.02,
              color: "var(--foreground)",
              maxWidth: "840px",
              marginBottom: "1.5rem",
            }}
          >
            Samen naar jullie dream day,{" "}
            <span
              style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              zonder de stress.
            </span>
          </h1>
        </div>

        <div className="animate-fade-in delay-200">
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.1875rem)",
              color: "var(--muted)",
              maxWidth: "480px",
              lineHeight: 1.65,
              marginBottom: "2.5rem",
            }}
          >
            Stel je dream team van leveranciers samen, regel offertes en facturen en maak je draaiboek — alles in één app.
          </p>
        </div>

        <div className="animate-fade-in delay-300 flex flex-col sm:flex-row gap-3 items-center mb-5">
          <Link href="/weddings/wizard" className="ddp-btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.875rem" }}>
            Begin gratis
          </Link>
          <Link href="/leveranciers" className="ddp-btn-secondary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.875rem" }}>
            Vind jouw Dream Partner!
          </Link>
        </div>

        <div className="animate-fade-in delay-400">
          <a
            href="#leveranciers"
            style={{ fontSize: "0.8125rem", color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "4rem" }}
          >
            Trouwleverancier? Bekijk hier <ArrowRight className="w-3 h-3" />
          </a>
        </div>

      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <ScrollReveal>
        <div
          className="flex flex-wrap justify-center gap-10 py-12 px-5"
          style={{ background: "#f5f5f7", borderTop: "1px solid rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}
        >
          {[
            { value: "500+", label: "Bruiloften gepland" },
            { value: "100%", label: "Gratis voor stellen" },
            { value: "24/7", label: "Overal beschikbaar" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* ── Herkenning ───────────────────────────────────── */}
      <section className="px-5 py-24 md:py-32" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-20">
            <ScrollReveal className="lg:w-2/5 lg:flex-shrink-0">
              <h2
                style={{
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.045em",
                  lineHeight: 1.05,
                  color: "var(--foreground)",
                }}
              >
                Een bruiloft plannen.{" "}
                <span style={{ color: "var(--muted)", fontWeight: 500 }}>
                  Voelt al snel als een tweede baan.
                </span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={120} className="lg:flex-1">
              <p style={{ fontSize: "1.0625rem", color: "var(--muted)", lineHeight: 1.75, marginBottom: "1.25rem" }}>
                Losse mailtjes, WhatsApp-groepen vol offertes en een Excel die steeds minder overzicht geeft. Je wil trouwen, geen projectmanager worden.
              </p>
              <p style={{ fontSize: "1.0625rem", color: "var(--foreground)", lineHeight: 1.75, fontWeight: 500 }}>
                DreamDay Partners brengt rust: alles op één plek, samen geregeld.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Hoe het werkt ────────────────────────────────── */}
      <section id="hoe-het-werkt" className="px-5 py-24 md:py-32" style={{ background: "#f5f5f7" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>
              Hoe het werkt
            </p>
            <h2
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "-0.045em",
                lineHeight: 1.05,
                color: "var(--foreground)",
                marginBottom: "4rem",
                maxWidth: "520px",
              }}
            >
              Drie stappen.{" "}
              <span style={{ color: "var(--muted)", fontWeight: 500 }}>Dat is alles.</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.n} delay={i * 100}>
                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "2rem",
                    border: "1px solid rgba(0,0,0,0.05)",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: 800,
                      letterSpacing: "-0.06em",
                      color: "rgba(196,154,108,0.18)",
                      lineHeight: 1,
                      marginBottom: "1.25rem",
                      fontFamily: "var(--font-geist-sans), sans-serif",
                    }}
                  >
                    {step.n}
                  </div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--foreground)", marginBottom: "0.5rem" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "0.9375rem", color: "var(--muted)", lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Functies voor bruidsparen ─────────────────────── */}
      <section id="stellen" className="px-5 py-24 md:py-32" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <ScrollReveal className="lg:max-w-lg">
              <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>
                Voor bruidsparen
              </p>
              <h2
                style={{
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.045em",
                  lineHeight: 1.05,
                  color: "var(--foreground)",
                }}
              >
                Altijd gratis.{" "}
                <span style={{ color: "var(--muted)", fontWeight: 500 }}>Voor altijd.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <p style={{ fontSize: "1rem", color: "var(--muted)", lineHeight: 1.65, maxWidth: "360px" }}>
                Maak een account en begin direct. Geen abonnement, geen proefperiode — ooit.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES_COUPLES.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} delay={i * 70} />
            ))}
          </div>

          <ScrollReveal delay={200} className="mt-12">
            <Link href="/weddings/wizard" className="ddp-btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.875rem" }}>
              Begin gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Voor leveranciers ────────────────────────────── */}
      <section id="leveranciers" className="px-5 py-24 md:py-32" style={{ background: "#f5f5f7" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <ScrollReveal className="lg:max-w-lg">
              <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>
                Voor leveranciers
              </p>
              <h2
                style={{
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.045em",
                  lineHeight: 1.05,
                  color: "var(--foreground)",
                }}
              >
                Beheer al je bruiloften{" "}
                <span style={{ color: "var(--muted)", fontWeight: 500 }}>op één plek.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <p style={{ fontSize: "1rem", color: "var(--muted)", lineHeight: 1.65, maxWidth: "360px" }}>
                Als bloemist, DJ of fotograaf heb je altijd meerdere bruiloften tegelijk. DreamDay Partners geeft je één helder overzicht.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES_VENDORS.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} delay={i * 70} />
            ))}
          </div>

          <ScrollReveal delay={200} className="mt-12">
            <Link href="/login" className="ddp-btn-secondary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.875rem" }}>
              Word leverancier
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────── */}
      <section className="px-5 py-24 md:py-32" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>
              Ervaringen
            </p>
            <h2
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "-0.045em",
                lineHeight: 1.05,
                color: "var(--foreground)",
                marginBottom: "3.5rem",
              }}
            >
              Bruidsparen gingen{" "}
              <span style={{ color: "var(--muted)", fontWeight: 500 }}>je voor.</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { quote: "Eindelijk één plek voor alles. We hadden nooit gedacht dat plannen zo overzichtelijk kon zijn.", name: "Naam bruidspaar" },
              { quote: "De combinatie van leveranciers, chat en draaiboek op één plek is echt een game changer.", name: "Naam bruidspaar" },
              { quote: "Op onze trouwdag hoefden we nergens aan te denken. Alles was geregeld.", name: "Naam bruidspaar" },
            ].map((r, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div style={{ background: "#f5f5f7", borderRadius: "20px", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.04)", height: "100%" }}>
                  <p style={{ fontSize: "0.9375rem", color: "var(--foreground)", lineHeight: 1.7, marginBottom: "1.25rem", fontStyle: "italic" }}>
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)" }}>{r.name}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>
            * Reviews worden aangevuld zodra we echte ervaringen hebben ontvangen.
          </p>
        </div>
      </section>

      {/* ── Prijzen ──────────────────────────────────────── */}
      <section id="prijzen" className="px-5 py-24 md:py-32" style={{ background: "#f5f5f7" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>
              Transparante prijzen
            </p>
            <h2
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "-0.045em",
                lineHeight: 1.05,
                color: "var(--foreground)",
                marginBottom: "0.75rem",
              }}
            >
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
                <Link href="/weddings/wizard" className="ddp-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
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
              <div style={{ background: "var(--foreground)", borderRadius: "20px", padding: "2rem", position: "relative", overflow: "hidden" }}>
                <div
                  style={{
                    position: "absolute", top: "1.25rem", right: "1.25rem",
                    background: "var(--gradient-primary)", borderRadius: "999px",
                    color: "white", fontSize: "0.625rem", fontWeight: 700,
                    padding: "3px 10px", letterSpacing: "0.05em",
                  }}
                >
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
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>
              Vragen
            </p>
            <h2
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "-0.045em",
                lineHeight: 1.05,
                color: "var(--foreground)",
                marginBottom: "3rem",
              }}
            >
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

      {/* ── Afsluitende CTA ──────────────────────────────── */}
      <section className="px-5 py-32 text-center" style={{ background: "var(--foreground)" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <ScrollReveal>
            <h2
              style={{
                fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
                fontWeight: 700,
                letterSpacing: "-0.055em",
                lineHeight: 1.04,
                color: "white",
                marginBottom: "1.25rem",
              }}
            >
              Klaar om met plezier te plannen?
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.50)", marginBottom: "2.5rem", lineHeight: 1.6 }}>
              Sluit je aan bij honderden koppels die hun dream day plannen zonder de stress.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/weddings/wizard"
                className="inline-flex items-center gap-2 font-semibold"
                style={{
                  background: "white", color: "var(--foreground)",
                  borderRadius: "999px", padding: "0.875rem 2.125rem",
                  fontSize: "0.9375rem", textDecoration: "none",
                }}
              >
                Begin gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center font-medium"
                style={{
                  background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)",
                  borderRadius: "999px", padding: "0.875rem 2.125rem",
                  fontSize: "0.9375rem", textDecoration: "none",
                }}
              >
                Demo bekijken
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="px-5 py-10" style={{ background: "var(--foreground)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-5" style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="DreamDay Partners" width={26} height={26} className="brightness-0 invert" />
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "rgba(255,255,255,0.80)", letterSpacing: "-0.02em" }}>
              DreamDay Partners
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-5">
            {[
              { href: "#hoe-het-werkt", label: "Hoe het werkt" },
              { href: "/leveranciers",  label: "Leveranciers" },
              { href: "#prijzen",       label: "Prijzen" },
              { href: "#faq",           label: "FAQ" },
              { href: "/login",         label: "Inloggen" },
            ].map((l) => (
              <a key={l.href} href={l.href} style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.40)", textDecoration: "none" }}>
                {l.label}
              </a>
            ))}
          </div>

          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>
            © 2026 DreamDay Partners
          </p>
        </div>
      </footer>
    </div>
  );
}
