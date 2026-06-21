"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  CheckSquare, Users, Euro, ClipboardList, Briefcase,
  MessageCircle, FolderOpen, Check, ArrowRight,
  Shield, Star, Calendar,
} from "lucide-react";

/* ─── Feature data ─────────────────────────────────────── */

const FEATURES_COUPLES = [
  { icon: CheckSquare,   title: "Taken & checklist",   desc: "Van verloving tot de grote dag — alles bijgehouden op één plek." },
  { icon: Users,         title: "Gastenlijst & RSVP",  desc: "Wie er komt, dieetwensen, tafelindeling en +1 bevestigingen." },
  { icon: Euro,          title: "Budgetbeheer",         desc: "Realtime inzicht in wat je uitgeeft. Geen verrassingen achteraf." },
  { icon: ClipboardList, title: "Draaiboek",            desc: "Een minuut-voor-minuut tijdlijn, gedeeld met heel het team." },
  { icon: Briefcase,     title: "Leveranciers",         desc: "Bloemist, DJ, catering — altijd direct bereikbaar." },
  { icon: MessageCircle, title: "Communicatie",         desc: "Chat met je planner en team. Geen lange e-mailketens meer." },
];

const FEATURES_VENDORS = [
  { icon: Calendar,      title: "Draaiboek toegang",    desc: "Ontvang je items direct in het portaal. Altijd up-to-date." },
  { icon: MessageCircle, title: "Direct communiceren",  desc: "Chat met de planner en het bruidspaar vanuit één plek." },
  { icon: FolderOpen,    title: "Documenten delen",     desc: "Upload offertes en contracten — veilig in de cloud." },
  { icon: Briefcase,     title: "Meerdere bruiloften",  desc: "Beheer al je klantbruiloften vanuit één dashboard." },
  { icon: Shield,        title: "Professioneel profiel", desc: "Presenteer jezelf als betrouwbare leverancier." },
  { icon: Star,          title: "Premium analytics",    desc: "Inzicht in je prestaties. Groei je bedrijf slimmer." },
];

const HOW_IT_WORKS = [
  { n: "1", title: "Maak een account",     desc: "In twee minuten geregistreerd. Kies of je een bruidspaar of leverancier bent." },
  { n: "2", title: "Stel je bruiloft in",  desc: "Vul je datum en locatie in. Nodig je planner en leveranciers uit." },
  { n: "3", title: "Jullie perfecte dag",  desc: "Volg de voortgang realtime. Op de dag zelf is alles geregeld." },
];

/* ─── Sub-components ────────────────────────────────────── */

function FeatureItem({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-start">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(196,154,108,0.10)" }}
      >
        <Icon className="w-6 h-6" style={{ color: "var(--primary)" }} />
      </div>
      <h3
        className="font-semibold mb-1.5"
        style={{ fontSize: "1.0625rem", color: "var(--foreground)", letterSpacing: "-0.02em" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-semibold mb-3"
      style={{ fontSize: "0.8125rem", color: "var(--primary)", letterSpacing: "0.06em", textTransform: "uppercase" }}
    >
      {children}
    </p>
  );
}

/* ─── Page ──────────────────────────────────────────────── */

export default function LandingPage() {
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
        className="sticky top-0 z-50 px-6 md:px-10 h-14 flex items-center justify-between"
        style={{
          background: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.70)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
          transition: "border-color 0.3s, background 0.3s",
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="DreamDay Partners" width={32} height={32} />
          <span style={{ fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>
            DreamDay<span style={{ color: "var(--primary)" }}> Partners</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5">
          {[
            { href: "#stellen",      label: "Voor stellen" },
            { href: "#leveranciers", label: "Voor leveranciers" },
            { href: "#prijzen",      label: "Prijzen" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="ddp-btn-ghost"
              style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--foreground)", padding: "0.4rem 0.75rem" }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="ddp-btn-ghost"
            style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--foreground)", padding: "0.4rem 0.875rem" }}
          >
            Inloggen
          </Link>
          <Link href="/weddings/wizard" className="ddp-btn-primary" style={{ fontSize: "0.875rem", padding: "0.5rem 1.25rem" }}>
            Begin gratis
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-28"
        style={{ background: "#ffffff" }}
      >
        <p
          className="font-semibold mb-5"
          style={{ fontSize: "0.8125rem", color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          Wedding management platform
        </p>

        <h1
          style={{
            fontFamily: "var(--font-geist-sans), -apple-system, 'SF Pro Display', sans-serif",
            fontSize: "clamp(3rem, 9vw, 6.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.05em",
            lineHeight: 1.02,
            color: "var(--foreground)",
            maxWidth: "900px",
            marginBottom: "1.5rem",
          }}
        >
          Plan jullie bruiloft.{" "}
          <span
            style={{
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Samen.
          </span>
        </h1>

        <p
          style={{
            fontSize: "clamp(1.0625rem, 2.5vw, 1.25rem)",
            color: "var(--muted)",
            maxWidth: "520px",
            lineHeight: 1.55,
            marginBottom: "2.5rem",
          }}
        >
          Het platform voor bruidsparen, planners en leveranciers. Overzichtelijk, eenvoudig en gratis voor stellen.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-20">
          <Link href="/weddings/wizard" className="ddp-btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            Gratis starten
          </Link>
          <Link href="/login" className="ddp-btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            Demo bekijken
          </Link>
        </div>

        {/* Clean product mockup */}
        <div
          style={{
            width: "100%",
            maxWidth: "700px",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 0 rgba(0,0,0,0.06), 0 20px 60px rgba(0,0,0,0.12)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="flex items-center gap-2 px-4"
            style={{ height: "40px", background: "#f5f5f7", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
            </div>
            <div
              className="flex-1 mx-3 flex items-center px-3 text-xs rounded-md"
              style={{ height: "24px", background: "white", color: "var(--muted)", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              dreamdaypartners.nl/dashboard
            </div>
          </div>
          <div className="grid grid-cols-3" style={{ background: "white" }}>
            {[
              { label: "Draaiboek items", value: "14", color: "var(--primary)" },
              { label: "Budget verbruikt", value: "68%", color: "var(--warning)" },
              { label: "Gasten bevestigd", value: "84", color: "var(--success)" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="py-7 text-center"
                style={{ borderRight: i < 2 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                    fontSize: "2rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    color: s.color,
                    lineHeight: 1,
                    marginBottom: "6px",
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof bar ─────────────────────────────── */}
      <div
        className="flex justify-center gap-12 py-10 px-6"
        style={{ background: "#f5f5f7", borderTop: "1px solid rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}
      >
        {[
          { value: "500+", label: "Bruiloften gepland" },
          { value: "100%", label: "Gratis voor stellen" },
          { value: "24/7", label: "Overal beschikbaar" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div
              style={{
                fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                fontSize: "1.625rem",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "var(--foreground)",
                lineHeight: 1.1,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Voor stellen ─────────────────────────────────── */}
      <section id="stellen" className="py-28 px-6" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div className="mb-16">
            <SectionLabel>Voor bruidsparen</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.06,
                color: "var(--foreground)",
                maxWidth: "540px",
                marginBottom: "1rem",
              }}
            >
              Altijd gratis. Voor altijd.
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--muted)", maxWidth: "440px", lineHeight: 1.55 }}>
              Maak een account en begin direct. Geen abonnement, geen verborgen kosten — ooit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {FEATURES_COUPLES.map((f) => (
              <FeatureItem key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>

          <div className="mt-14">
            <Link href="/weddings/wizard" className="ddp-btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
              Gratis beginnen <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Voor leveranciers ────────────────────────────── */}
      <section id="leveranciers" className="py-28 px-6" style={{ background: "#f5f5f7" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div className="mb-16">
            <SectionLabel>Voor leveranciers</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.06,
                color: "var(--foreground)",
                maxWidth: "540px",
                marginBottom: "1rem",
              }}
            >
              Jouw professionele portaal.
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--muted)", maxWidth: "440px", lineHeight: 1.55 }}>
              Als bloemist, DJ of caterer beheer je alle bruiloften vanuit één slim platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {FEATURES_VENDORS.map((f) => (
              <FeatureItem key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>

          <div className="mt-14">
            <a href="#prijzen" className="ddp-btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
              Bekijk plannen
            </a>
          </div>
        </div>
      </section>

      {/* ── Prijzen ──────────────────────────────────────── */}
      <section id="prijzen" className="py-28 px-6" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div className="text-center mb-16">
            <SectionLabel>Transparante prijzen</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.06,
                color: "var(--foreground)",
                marginBottom: "0.75rem",
              }}
            >
              Eerlijk geprijsd.
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--muted)" }}>
              Stellen betalen nooit iets. Leveranciers kiezen wat past.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Free couple */}
            <div style={{ background: "#f5f5f7", borderRadius: "20px", padding: "2rem" }}>
              <div className="ddp-badge badge-rose mb-5">Bruidspaar</div>
              <div
                style={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontSize: "3rem",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "var(--foreground)",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                Gratis
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1.5rem" }}>Voor altijd</div>
              <ul className="space-y-3 mb-7">
                {["Taken & checklist", "Gastenlijst & RSVP", "Budgetbeheer", "Draaiboek", "Leveranciers", "Communicatie"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5" style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/weddings/wizard" className="ddp-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                Gratis starten
              </Link>
            </div>

            {/* Vendor free */}
            <div style={{ background: "#f5f5f7", borderRadius: "20px", padding: "2rem" }}>
              <div className="ddp-badge badge-neutral mb-5">Leverancier · Free</div>
              <div
                style={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontSize: "3rem",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "var(--foreground)",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                €0
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1.5rem" }}>Per maand</div>
              <ul className="space-y-3 mb-7">
                {["Portaaltoegang (1 bruiloft)", "Draaiboek inzien", "Bestanden ontvangen", "Chatten met planner", "Basisprofiel"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5" style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="ddp-btn-secondary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                Gratis registreren
              </Link>
            </div>

            {/* Dream Day Pro */}
            <div
              style={{
                background: "var(--foreground)",
                borderRadius: "20px",
                padding: "2rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  background: "var(--gradient-primary)",
                  borderRadius: "var(--radius-full)",
                  color: "white",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  padding: "3px 10px",
                  letterSpacing: "0.04em",
                }}
              >
                POPULAIRST
              </div>
              <div className="ddp-badge badge-premium mb-5">Dream Day Pro</div>
              <div
                style={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontSize: "3rem",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "white",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                €29
              </div>
              <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.50)", marginBottom: "1.5rem" }}>
                Per maand · Maandelijks opzegbaar
              </div>
              <ul className="space-y-3 mb-7">
                {[
                  "Onbeperkt bruiloften",
                  "Volledig bestandsbeheer",
                  "Geavanceerde chat",
                  "Draaiboek bewerken",
                  "Premium profiel",
                  "Analytisch dashboard",
                  "Prioriteit support",
                ].map((item) => (
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
          </div>
        </div>
      </section>

      {/* ── Hoe het werkt ────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: "#f5f5f7" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div className="text-center mb-16">
            <SectionLabel>Hoe het werkt</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.06,
                color: "var(--foreground)",
              }}
            >
              Drie stappen. Dat is alles.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.n}>
                <div
                  style={{
                    fontFamily: "var(--font-geist-sans), sans-serif",
                    fontSize: "3.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.05em",
                    color: "rgba(196,154,108,0.20)",
                    lineHeight: 1,
                    marginBottom: "0.75rem",
                  }}
                >
                  {step.n}
                </div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: "var(--foreground)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--muted)", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-32 px-6 text-center" style={{ background: "var(--foreground)" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              fontSize: "clamp(2.25rem, 6vw, 4rem)",
              fontWeight: 700,
              letterSpacing: "-0.05em",
              lineHeight: 1.04,
              color: "white",
              marginBottom: "1.25rem",
            }}
          >
            Jullie dag. Jullie manier.
          </h2>
          <p style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.55)", marginBottom: "2.5rem", lineHeight: 1.5 }}>
            Sluit je aan bij honderden koppels die hun droomdag plannen met DreamDay Partners.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/weddings/wizard"
              className="inline-flex items-center gap-2 font-semibold"
              style={{
                background: "white",
                color: "var(--foreground)",
                borderRadius: "var(--radius-full)",
                padding: "0.875rem 2.25rem",
                fontSize: "1rem",
                textDecoration: "none",
                letterSpacing: "-0.01em",
              }}
            >
              Gratis starten <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center font-medium"
              style={{
                background: "rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.75)",
                borderRadius: "var(--radius-full)",
                padding: "0.875rem 2.25rem",
                fontSize: "1rem",
                textDecoration: "none",
              }}
            >
              Demo bekijken
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer
        className="px-6 py-10"
        style={{ background: "var(--foreground)", borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-5"
          style={{ maxWidth: "1000px", margin: "0 auto" }}
        >
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="DreamDay Partners" width={28} height={28} className="brightness-0 invert" />
            <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)", letterSpacing: "-0.02em" }}>
              DreamDay Partners
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {[
              { href: "#stellen",      label: "Voor stellen" },
              { href: "#leveranciers", label: "Voor leveranciers" },
              { href: "#prijzen",      label: "Prijzen" },
              { href: "/login",        label: "Inloggen" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
              >
                {l.label}
              </a>
            ))}
          </div>

          <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.30)" }}>
            © 2025 DreamDay Partners
          </p>
        </div>
      </footer>
    </div>
  );
}
