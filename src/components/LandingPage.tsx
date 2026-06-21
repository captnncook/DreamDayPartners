"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Heart, CheckSquare, Users, Euro, ClipboardList, Briefcase,
  MessageCircle, FolderOpen, Check, ArrowRight, Calendar,
  Shield, Star, Handshake,
} from "lucide-react";

const FEATURES_COUPLES = [
  { icon: CheckSquare,   title: "Taken & checklist",   desc: "Alles georganiseerd — van verloving tot de grote dag. Nooit meer iets vergeten." },
  { icon: Users,         title: "Gastenlijst & RSVP",  desc: "Bijhouden wie er komt, dieetwensen, tafelindeling en +1 bevestigingen." },
  { icon: Euro,          title: "Budgetbeheer",         desc: "Realtime inzicht in wat je uitgeeft en wat er nog over is. Geen verrassingen." },
  { icon: ClipboardList, title: "Draaiboek",            desc: "Een minuut-voor-minuut tijdlijn van jullie dag, gedeeld met heel het team." },
  { icon: Briefcase,     title: "Leveranciers",         desc: "Bloemist, DJ, catering — alles op één plek, altijd direct bereikbaar." },
  { icon: MessageCircle, title: "Communicatie",         desc: "Chat met jullie planner en leveranciers. Geen lange e-mailketens meer." },
];

const FEATURES_VENDORS = [
  { icon: Calendar,      title: "Draaiboek toegang",   desc: "Ontvang je draaiboek-items direct in het portaal. Altijd up-to-date." },
  { icon: MessageCircle, title: "Direct communiceren", desc: "Chat met de planner en het bruidspaar vanuit één centrale plek." },
  { icon: FolderOpen,    title: "Documenten delen",    desc: "Upload offertes, contracten en inspiratie — veilig opgeslagen in de cloud." },
  { icon: Briefcase,     title: "Meerdere bruiloften", desc: "Beheer al je klantbruiloften vanuit één overzichtelijk dashboard." },
  { icon: Shield,        title: "Professioneel profiel", desc: "Presenteer jezelf als betrouwbare leverancier met een volledig profiel." },
  { icon: Star,          title: "Premium analytics",   desc: "Inzicht in je prestaties en klantrelaties. Groei je bedrijf slimmer." },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Maak een account aan",
    desc: "In twee minuten geregistreerd. Kies of je een bruidspaar of leverancier bent.",
  },
  {
    step: "02",
    title: "Stel je bruiloft in",
    desc: "Vul je datum, locatie en gastenlijst in. Nodig je planner en leveranciers uit.",
  },
  {
    step: "03",
    title: "Jullie perfecte dag",
    desc: "Volg de voortgang realtime. Op de dag zelf is alles geregeld en iedereen geïnformeerd.",
  },
];

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div
      className="ddp-card ddp-card-hover flex gap-4 p-5"
      style={{ border: "1px solid rgba(0,0,0,0.04)" }}
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--accent)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "var(--primary)" }} />
      </div>
      <div>
        <div className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}>{title}</div>
        <div className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between transition-all"
        style={{
          background: scrolled ? "rgba(245,245,247,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
          transitionDuration: "0.3s",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }}
          >
            <Heart className="w-4.5 h-4.5 text-white fill-white" />
          </div>
          <span className="font-bold text-base" style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}>
            DreamDay <span style={{ color: "var(--primary)" }}>Partners</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <a href="#stellen" className="ddp-btn-ghost text-sm">Voor stellen</a>
          <a href="#leveranciers" className="ddp-btn-ghost text-sm">Voor leveranciers</a>
          <a href="#prijzen" className="ddp-btn-ghost text-sm">Prijzen</a>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login" className="ddp-btn-ghost text-sm">Inloggen</Link>
          <Link href="/weddings/wizard" className="ddp-btn-primary text-sm px-5 py-2.5">
            Gratis starten
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 overflow-hidden"
        style={{ background: "linear-gradient(170deg, #ffffff 0%, #faf8f5 45%, #f5ede3 100%)" }}
      >
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-60"
          style={{ background: "radial-gradient(circle, rgba(232,180,188,0.22) 0%, transparent 65%)", transform: "translate(25%, -25%)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-50"
          style={{ background: "radial-gradient(circle, rgba(196,154,108,0.18) 0%, transparent 65%)", transform: "translate(-25%, 25%)" }} />
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[400px] rounded-full pointer-events-none opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(212,168,71,0.12) 0%, transparent 70%)", transform: "translate(-50%, -50%)" }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
            style={{ background: "white", color: "var(--primary)", boxShadow: "var(--shadow-md)", border: "1px solid rgba(196,154,108,0.15)" }}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            Alles voor jullie perfecte dag
          </div>

          {/* Headline */}
          <h1
            className="font-serif font-bold mb-6"
            style={{
              fontSize: "clamp(2.8rem, 8vw, 6rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
            }}
          >
            Plan jullie bruiloft{" "}
            <span
              style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              samen
            </span>
            .
          </h1>

          {/* Subline */}
          <p
            className="mx-auto mb-10 leading-relaxed"
            style={{
              fontSize: "clamp(1.05rem, 2.5vw, 1.3rem)",
              color: "var(--muted)",
              maxWidth: "560px",
            }}
          >
            Het alles-in-één platform voor bruidsparen, wedding planners en leveranciers. Gratis voor stellen.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 justify-center mb-16">
            <Link
              href="/weddings/wizard"
              className="ddp-btn-primary px-8 py-3.5"
              style={{ fontSize: "1rem" }}
            >
              Start gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="ddp-btn-secondary px-8 py-3.5"
              style={{ fontSize: "1rem" }}
            >
              Demo bekijken
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { value: "500+", label: "Bruiloften gepland" },
              { value: "Gratis", label: "Voor bruidsparen" },
              { value: "24/7", label: "Overal beschikbaar" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-bold text-xl" style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}>{s.value}</div>
                <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock UI preview */}
        <div
          className="relative z-10 mt-16 w-full max-w-2xl rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.14)", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="h-10 flex items-center gap-2 px-4" style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
            </div>
            <div className="flex-1 mx-4 h-6 rounded-lg text-xs flex items-center px-3" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
              dreamdaypartners.nl/dashboard
            </div>
          </div>
          <div className="grid grid-cols-3" style={{ background: "white" }}>
            {[
              { label: "Draaiboek", value: "14 items", color: "var(--primary)" },
              { label: "Budget", value: "68% gebruikt", color: "var(--warning)" },
              { label: "Gasten", value: "84 bevestigd", color: "var(--success)" },
            ].map((item) => (
              <div key={item.label} className="p-6 text-center" style={{ borderRight: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="font-bold text-lg mb-0.5" style={{ color: item.color, letterSpacing: "-0.02em" }}>{item.value}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Voor stellen ── */}
      <section id="stellen" className="py-28 px-6" style={{ background: "white" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{ background: "var(--rose-bg)", color: "#8f3659", border: "1px solid var(--rose)" }}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              Voor bruidsparen
            </div>
            <h2
              className="font-serif font-bold mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.03em", color: "var(--foreground)" }}
            >
              Altijd gratis voor stellen.
            </h2>
            <p className="mx-auto text-lg" style={{ color: "var(--muted)", maxWidth: "520px", lineHeight: 1.6 }}>
              Maak jullie DreamDay-account aan en begin direct met plannen. Geen abonnement, geen verborgen kosten.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES_COUPLES.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/weddings/wizard" className="ddp-btn-primary px-8 py-3.5" style={{ fontSize: "1rem" }}>
              Gratis beginnen <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>Geen creditcard vereist</p>
          </div>
        </div>
      </section>

      {/* ── Voor leveranciers ── */}
      <section
        id="leveranciers"
        className="py-28 px-6"
        style={{ background: "var(--gradient-section-alt)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{ background: "var(--sage-bg)", color: "#2e7a5a", border: "1px solid var(--sage)" }}
            >
              <Handshake className="w-3.5 h-3.5" />
              Voor leveranciers
            </div>
            <h2
              className="font-serif font-bold mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.03em", color: "var(--foreground)" }}
            >
              Jouw professionele portaal.
            </h2>
            <p className="mx-auto text-lg" style={{ color: "var(--muted)", maxWidth: "520px", lineHeight: 1.6 }}>
              Als bloemist, DJ, caterer of fotograaf beheer je alle bruiloften vanuit één slim platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES_VENDORS.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href="#prijzen" className="ddp-btn-secondary px-8 py-3.5" style={{ fontSize: "1rem" }}>
              Bekijk plannen
            </a>
          </div>
        </div>
      </section>

      {/* ── Prijzen ── */}
      <section id="prijzen" className="py-28 px-6" style={{ background: "white" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-serif font-bold mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.03em", color: "var(--foreground)" }}
            >
              Eerlijk en transparant.
            </h2>
            <p className="text-lg" style={{ color: "var(--muted)" }}>
              Stellen betalen altijd niks. Leveranciers kiezen wat bij ze past.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Couple — free forever */}
            <div className="ddp-card" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="ddp-badge badge-rose mb-4">Bruidspaar</div>
              <div className="font-serif font-bold mb-1" style={{ fontSize: "2.5rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>Gratis</div>
              <div className="text-sm mb-6" style={{ color: "var(--muted)" }}>Voor altijd, beloofd.</div>
              <ul className="space-y-3 mb-8">
                {["Taken & checklist", "Gastenlijst & RSVP", "Budgetbeheer", "Draaiboek", "Leveranciers overzicht", "Communicatie met team"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--foreground)" }}>
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/weddings/wizard" className="ddp-btn-primary w-full py-3 text-sm">
                Gratis starten
              </Link>
            </div>

            {/* Vendor free */}
            <div className="ddp-card" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="ddp-badge badge-neutral mb-4">Leverancier Free</div>
              <div className="font-serif font-bold mb-1" style={{ fontSize: "2.5rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>€0</div>
              <div className="text-sm mb-6" style={{ color: "var(--muted)" }}>Per maand · Altijd gratis</div>
              <ul className="space-y-3 mb-8">
                {["Portaaltoegang (1 bruiloft)", "Draaiboek inzien", "Bestanden ontvangen", "Chatten met planner", "Basisprofiel"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--foreground)" }}>
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="ddp-btn-secondary w-full py-3 text-sm">
                Gratis registreren
              </Link>
            </div>

            {/* Dream Day Pro */}
            <div
              className="ddp-card relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #1d1d1f 0%, #2d2d2f 100%)",
                border: "none",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}
            >
              {/* Recommended badge */}
              <div
                className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "var(--gradient-primary)", color: "white" }}
              >
                Populairst
              </div>

              <div className="ddp-badge badge-premium mb-4">Dream Day Pro</div>
              <div className="font-serif font-bold mb-0.5" style={{ fontSize: "2.5rem", letterSpacing: "-0.03em", color: "white" }}>€29</div>
              <div className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>Per maand · Opzegbaar per maand</div>
              <ul className="space-y-3 mb-8">
                {[
                  "Onbeperkt bruiloften beheren",
                  "Volledig bestandsbeheer",
                  "Geavanceerde chat & berichten",
                  "Draaiboek bewerken",
                  "Premium leveranciersprofiel",
                  "Analytisch dashboard",
                  "Prioriteit support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.88)" }}>
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary-light)" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="ddp-btn-primary w-full py-3 text-sm"
                style={{ background: "var(--gradient-primary)" }}
              >
                Dream Day Pro starten
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hoe het werkt ── */}
      <section className="py-28 px-6" style={{ background: "var(--gradient-section-alt)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-serif font-bold mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.03em", color: "var(--foreground)" }}
            >
              In drie stappen klaar.
            </h2>
            <p className="text-lg" style={{ color: "var(--muted)" }}>
              Zo simpel is het.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 font-bold text-lg"
                  style={{ background: "var(--gradient-primary)", color: "white", boxShadow: "var(--shadow-primary)", letterSpacing: "-0.02em" }}
                >
                  {step.step}
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="py-28 px-6 text-center"
        style={{ background: "var(--foreground)" }}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-7"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }}
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h2
            className="font-serif font-bold mb-5 text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.03em" }}
          >
            Jullie dag. Jullie manier.
          </h2>
          <p
            className="mb-10 leading-relaxed"
            style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.65)", maxWidth: "440px", margin: "0 auto 2.5rem" }}
          >
            Sluit je aan bij honderden koppels die hun droombruiloft plannen met DreamDay Partners.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/weddings/wizard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base bg-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ color: "var(--foreground)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
            >
              Gratis starten <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.08)" }}
            >
              Demo bekijken
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-10 px-6"
        style={{ background: "var(--foreground)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-sm text-white" style={{ letterSpacing: "-0.02em" }}>DreamDay Partners</span>
            </div>

            <div className="flex items-center gap-6">
              {[
                { href: "#stellen", label: "Voor stellen" },
                { href: "#leveranciers", label: "Voor leveranciers" },
                { href: "#prijzen", label: "Prijzen" },
                { href: "/login", label: "Inloggen" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              © 2025 DreamDay Partners
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
