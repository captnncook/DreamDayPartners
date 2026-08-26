"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ScrollReveal from "@/components/ScrollReveal";
import { Check, ArrowRight, ChevronDown, LogOut } from "lucide-react";
import { useLang } from "@/components/LangProvider";
import type { T } from "@/lib/i18n";

type VendorStory = { value: string; label: string; pain: string; solution: string };

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
        <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "var(--space-3)" }}>
          {title}
        </h3>
        <p style={{ fontSize: "var(--text-md)", color: "var(--muted)", lineHeight: 1.7 }}>{desc}</p>
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
        <span style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{q}</span>
        <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }} />
      </button>
      {open && (
        <p style={{ fontSize: "var(--text-lg)", color: "var(--muted)", lineHeight: 1.7, paddingBottom: "1.375rem" }}>{a}</p>
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
        fontSize: "var(--text-lg)", fontWeight: isActive ? 700 : 500, padding: "0.625rem 1rem",
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

function VendorStoryPicker({ stories, painHeading, solutionHeading }: { stories: VendorStory[]; painHeading: string; solutionHeading: string }) {
  const [active, setActive] = useState<string>(stories[0].value);
  const story = stories.find((s) => s.value === active);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex flex-col gap-1 lg:w-64 flex-shrink-0">
        {stories.map((s) => (
          <SidebarItem key={s.value} label={s.label} isActive={active === s.value} onClick={() => setActive(s.value)} />
        ))}
      </div>

      {/* Dropdown — mobile/tablet only */}
      <div className="lg:hidden">
        <select
          value={active}
          onChange={(e) => setActive(e.target.value)}
          className="ddp-select"
          style={{ fontWeight: 700, fontSize: "var(--text-xl)" }}
        >
          {stories.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {story && (
          <div key={story.value} className="animate-fade-in" style={{ background: "white", borderRadius: "20px", padding: "2rem", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p className="ddp-section-label mb-3" style={{ color: "var(--primary)" }}>{story.label}: {painHeading}</p>
            <p style={{ fontSize: "var(--text-2xl)", color: "var(--foreground)", lineHeight: 1.7, marginBottom: "var(--space-7)" }}>
              {story.pain}
            </p>
            <p className="ddp-section-label mb-3" style={{ color: "var(--primary)" }}>{solutionHeading}</p>
            <p style={{ fontSize: "var(--text-2xl)", color: "var(--muted)", lineHeight: 1.7 }}>
              {story.solution}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */

export default function LandingPage() {
  const router = useRouter();
  const { t, toggle } = useLang();
  const l: T["landing"] = t.landing;
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
          height: "68px",
          gap: "var(--space-6)",
          background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.80)",
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
          transition: "background 200ms var(--ease-out), border-color 200ms var(--ease-out)",
        }}
      >
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/images/logo.svg" alt="DreamDay Platform" width={28} height={28} />
          <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>
            DreamDay<span className="hidden sm:inline" style={{ color: "var(--primary)" }}> Platform</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-0 flex-1 justify-center">
          {[
            { href: "#hoe-het-werkt", label: l.nav.howItWorks },
            { href: "#prijzen",       label: l.nav.pricing },
            { href: "#faq",           label: l.nav.faq },
            { href: "/leveranciers",  label: l.nav.findVendors },
          ].map((n) => (
            <a key={n.href} href={n.href} className="ddp-btn-ghost" style={{ fontSize: "var(--text-base)", fontWeight: 500, color: "var(--foreground)", padding: "0.35rem 0.7rem" }}>
              {n.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <button
            onClick={toggle}
            className="ddp-btn-ghost"
            style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--muted)", padding: "0.35rem 0.6rem" }}
            aria-label="Switch language"
          >
            {t.common.switchLang}
          </button>
          {loggedIn ? (
            <>
              <Link href="/dashboard" className="ddp-btn-primary" style={{ fontSize: "var(--text-base)", padding: "0.45rem 1.125rem" }}>
                {l.nav.profile}
              </Link>
              <button
                onClick={handleLogout}
                className="ddp-btn-ghost"
                style={{ fontSize: "var(--text-base)", color: "var(--muted)", padding: "0.45rem 0.625rem" }}
                title={l.nav.logoutTitle}
                aria-label={l.nav.logoutTitle}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="hidden sm:block">
                <Link href="/login" className="ddp-btn-ghost" style={{ fontSize: "var(--text-base)", color: "var(--foreground)", padding: "0.35rem 0.75rem" }}>
                  {l.nav.login}
                </Link>
              </div>
              <div className="hidden sm:block">
                <a href="#bruidsparen" className="ddp-btn-ghost" style={{ fontSize: "var(--text-base)", fontWeight: 500, color: "var(--foreground)", padding: "0.35rem 0.75rem" }}>
                  {l.nav.forCouples}
                </a>
              </div>
              <a href="#leveranciers" className="ddp-btn-primary" style={{ fontSize: "var(--text-base)", padding: "0.45rem 0.875rem", whiteSpace: "nowrap" }}>
                {l.nav.forVendors}
              </a>
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
                  marginBottom: "var(--space-8)",
                }}
              >
                {l.hero.title1}{" "}
                <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {l.hero.titleHighlight}
                </span>
              </h1>
              <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.125rem)", color: "var(--muted)", maxWidth: "440px", lineHeight: 1.7, marginBottom: "2.5rem" }}>
                {l.hero.sub}
              </p>
              <div className="flex flex-wrap gap-3 mb-6" style={{ position: "relative", zIndex: 1 }}>
                <Link href="/aanmelden" className="ddp-btn-primary" style={{ fontSize: "var(--text-lg)", padding: "0.75rem 1.875rem" }}>
                  {l.hero.ctaPrimary}
                </Link>
                <Link href="/leveranciers" className="ddp-btn-secondary" style={{ fontSize: "var(--text-lg)", padding: "0.75rem 1.875rem", borderColor: "var(--color-charcoal)", color: "var(--color-charcoal)" }}>
                  {l.hero.ctaSecondary}
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
                  alt={l.hero.imageAlt}
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

      {/* ── Audience-splitser ─────────────────────────────── */}
      <section className="px-5" style={{ background: "var(--background)" }}>
        <div style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto", paddingBottom: "clamp(3rem, 6vw, 5rem)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ScrollReveal>
              <div style={{ background: "white", borderRadius: "20px", padding: "2rem", border: "1px solid rgba(0,0,0,0.05)", height: "100%" }}>
                <h3 className="font-serif" style={{ fontSize: "var(--text-4xl)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", marginBottom: "var(--space-4)" }}>
                  {l.audience.coupleTitle}
                </h3>
                <p style={{ fontSize: "var(--text-lg)", color: "var(--muted)", lineHeight: 1.65, marginBottom: "var(--space-8)" }}>
                  {l.audience.coupleDesc}
                </p>
                <Link href="/aanmelden" className="ddp-btn-primary" style={{ fontSize: "var(--text-lg)", padding: "0.75rem 1.875rem" }}>
                  {l.audience.coupleCta}
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <div style={{ background: "white", borderRadius: "20px", padding: "2rem", border: "1px solid rgba(0,0,0,0.05)", height: "100%" }}>
                <h3 className="font-serif" style={{ fontSize: "var(--text-4xl)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", marginBottom: "var(--space-4)" }}>
                  {l.audience.vendorTitle}
                </h3>
                <p style={{ fontSize: "var(--text-lg)", color: "var(--muted)", lineHeight: 1.65, marginBottom: "var(--space-8)" }}>
                  {l.audience.vendorDesc}
                </p>
                <a href="#leveranciers" className="ddp-btn-primary" style={{ fontSize: "var(--text-lg)", padding: "0.75rem 1.875rem" }}>
                  {l.audience.vendorCta}
                </a>
              </div>
            </ScrollReveal>
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
                {l.brandStrip.title}
              </p>
              <p style={{ fontSize: "var(--text-xl)", color: "rgba(255,255,255,0.7)", marginTop: "var(--space-5)" }}>
                {l.brandStrip.sub}
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
                  alt={l.recognition.imageAlt}
                  width={600}
                  height={400}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            </ScrollReveal>
            <div className="lg:flex-1">
              <ScrollReveal>
                <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "var(--space-7)" }}>
                  {l.recognition.titleNormal}{" "}
                  <span style={{ color: "var(--muted)", fontWeight: 500 }}>{l.recognition.titleMuted}</span>
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <p style={{ fontSize: "var(--text-2xl)", color: "var(--muted)", lineHeight: 1.75, marginBottom: "var(--space-7)" }}>
                  {l.recognition.p1}
                </p>
                <p style={{ fontSize: "var(--text-2xl)", color: "var(--foreground)", lineHeight: 1.75, fontWeight: 500 }}>
                  {l.recognition.p2}
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
            <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "var(--space-5)" }}>{l.howItWorksSection.label}</p>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "var(--space-11)", maxWidth: "520px" }}>
              {l.howItWorksSection.title1}{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>{l.howItWorksSection.title2}</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {l.howItWorksSection.steps.map((step, i) => {
              const img = ["/images/dreamday-button.png", "/images/dashboard-laptop.png", "/images/app-ipad.png"][i];
              return (
                <ScrollReveal key={step.n} delay={i * 100}>
                  <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", height: "100%" }}>
                    <div style={{ position: "relative", height: "200px" }}>
                      <Image src={img} alt={step.title} fill style={{ objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", borderRadius: "10px", padding: "4px 10px" }}>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "white", letterSpacing: "0.05em" }}>{step.n}</span>
                      </div>
                    </div>
                    <div style={{ padding: "1.375rem 1.5rem 1.5rem" }}>
                      <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", marginBottom: "var(--space-3)" }}>{step.title}</h3>
                      <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.65 }}>{step.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Functies voor bruidsparen ─────────────────────── */}
      <section id="bruidsparen" className="px-5 py-24 md:py-32" style={{ background: "var(--background)" }}>
        <div style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto" }}>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* Left: text + features grid */}
            <div className="flex-1">
              <ScrollReveal>
                <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "var(--space-5)" }}>{l.couples.label}</p>
                <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "var(--space-5)" }}>
                  {l.couples.title1}{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>{l.couples.title2}</span>
                </h2>
                <p style={{ fontSize: "var(--text-xl)", color: "var(--muted)", lineHeight: 1.65, marginBottom: "2.5rem", maxWidth: "400px" }}>
                  {l.couples.sub}
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {l.couples.features.map((f, i) => (
                  <FeatureCard key={f.title} title={f.title} desc={f.desc} delay={i * 60} />
                ))}
              </div>

              <ScrollReveal>
                <Link href="/aanmelden" className="ddp-btn-primary" style={{ fontSize: "var(--text-lg)", padding: "0.75rem 1.875rem" }}>
                  {l.couples.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </ScrollReveal>
            </div>

            {/* Right: image */}
            <ScrollReveal className="lg:w-80 lg:flex-shrink-0" delay={150}>
              <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", position: "sticky", top: "80px" }}>
                <Image
                  src="/images/app-ipad.png"
                  alt={l.couples.imageAlt}
                  width={480}
                  height={360}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <div style={{ padding: "1.25rem", background: "white" }}>
                  <p style={{ fontSize: "var(--text-md)", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                    {l.couples.imageCaption}
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
                <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "var(--space-5)" }}>{l.vendorsSection.label}</p>
                <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "var(--space-5)" }}>
                  {l.vendorsSection.title1}{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>{l.vendorsSection.title2}</span>
                </h2>
                <p style={{ fontSize: "var(--text-xl)", color: "var(--muted)", lineHeight: 1.65, marginBottom: "2.5rem", maxWidth: "400px" }}>
                  {l.vendorsSection.sub}
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {l.vendorsSection.features.map((f, i) => (
                  <FeatureCard key={f.title} title={f.title} desc={f.desc} delay={i * 60} />
                ))}
              </div>

              <ScrollReveal>
                <Link href="/aanmelden?type=vendor" className="ddp-btn-primary" style={{ fontSize: "var(--text-lg)", padding: "0.75rem 1.875rem" }}>
                  {l.vendorsSection.cta}
                </Link>
              </ScrollReveal>
            </div>

            {/* Left: image */}
            <ScrollReveal className="lg:w-80 lg:flex-shrink-0" delay={150}>
              <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", position: "sticky", top: "80px" }}>
                <Image
                  src="/images/planner-outdoor.png"
                  alt={l.vendorsSection.imageAlt}
                  width={480}
                  height={360}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <div style={{ padding: "1.25rem", background: "white" }}>
                  <p style={{ fontSize: "var(--text-md)", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                    {l.vendorsSection.imageCaption}
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
            <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "var(--space-5)" }}>{l.perVendor.label}</p>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "var(--space-5)", maxWidth: "640px" }}>
              {l.perVendor.title1}{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>{l.perVendor.title2}</span>
            </h2>
            <p style={{ fontSize: "var(--text-xl)", color: "var(--muted)", marginBottom: "var(--space-7)", maxWidth: "520px" }}>
              {l.perVendor.sub1}
            </p>
            <p style={{ fontSize: "var(--text-md)", color: "var(--muted)", marginBottom: "2.5rem", maxWidth: "520px" }}>
              {l.perVendor.sub2Pre}{" "}
              <a href="#bruidsparen" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "underline" }}>{l.perVendor.sub2Link}</a>.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <VendorStoryPicker stories={l.perVendor.stories} painHeading={l.perVendor.painHeading} solutionHeading={l.perVendor.solutionHeading} />
          </ScrollReveal>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────── */}
      <section className="px-5 py-24 md:py-32" style={{ background: "var(--background)" }}>
        <div style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "var(--space-5)" }}>{l.socialProof.label}</p>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "3.5rem" }}>
              {l.socialProof.title1}{" "}<span style={{ color: "var(--muted)", fontWeight: 500 }}>{l.socialProof.title2}</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Featured photo quote */}
            <ScrollReveal delay={0} className="md:col-span-1">
              <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", height: "220px" }}>
                  <Image src="/images/bride-sofa.png" alt={l.socialProof.featuredImageAlt} fill style={{ objectFit: "cover", objectPosition: "center top" }} />
                </div>
                <div style={{ padding: "1.5rem", background: "white", flex: 1 }}>
                  <p style={{ fontSize: "var(--text-lg)", color: "var(--foreground)", lineHeight: 1.7, marginBottom: "var(--space-6)", fontStyle: "italic" }}>
                    &ldquo;{l.socialProof.featuredQuote}&rdquo;
                  </p>
                  <p style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--primary)" }}>{l.socialProof.featuredName}</p>
                </div>
              </div>
            </ScrollReveal>

            <div className="md:col-span-2 grid grid-cols-1 gap-4">
              {l.socialProof.others.map((r, i) => (
                <ScrollReveal key={i} delay={(i + 1) * 100}>
                  <div style={{ background: "var(--sand)", borderRadius: "20px", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.04)", height: "100%" }}>
                    <p style={{ fontSize: "var(--text-lg)", color: "var(--foreground)", lineHeight: 1.7, marginBottom: "var(--space-7)", fontStyle: "italic" }}>
                      &ldquo;{r.quote}&rdquo;
                    </p>
                    <p style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--primary)" }}>{r.name}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <p style={{ marginTop: "var(--space-8)", fontSize: "var(--text-sm)", color: "var(--muted)", fontStyle: "italic" }}>
            {l.socialProof.disclaimer}
          </p>
        </div>
      </section>

      {/* ── Prijzen ──────────────────────────────────────── */}
      <section id="prijzen" className="px-5 py-24 md:py-32" style={{ background: "var(--sand)" }}>
        <div style={{ maxWidth: "clamp(1040px, 74vw, 1440px)", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "var(--space-5)" }}>{l.pricing.label}</p>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "var(--space-5)" }}>
              {l.pricing.title}
            </h2>
            <p style={{ fontSize: "var(--text-xl)", color: "var(--muted)", marginBottom: "3.5rem" }}>
              {l.pricing.sub}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <ScrollReveal delay={0}>
              <div style={{ background: "white", borderRadius: "20px", padding: "2rem", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="ddp-badge badge-rose mb-5">{l.pricing.couple.badge}</div>
                <div style={{ fontSize: "2.75rem", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1, marginBottom: "4px" }}>{l.pricing.couple.price}</div>
                <div style={{ fontSize: "var(--text-base)", color: "var(--muted)", marginBottom: "var(--space-8)" }}>{l.pricing.couple.subtext}</div>
                <ul className="space-y-3 mb-7">
                  {l.pricing.couple.features.map((item) => (
                    <li key={item} className="flex items-center gap-2.5" style={{ fontSize: "var(--text-md)" }}>
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/aanmelden" className="ddp-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                  {l.pricing.couple.cta}
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <div style={{ background: "white", borderRadius: "20px", padding: "2rem", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="ddp-badge badge-neutral mb-5">{l.pricing.vendorFree.badge}</div>
                <div style={{ fontSize: "2.75rem", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1, marginBottom: "4px" }}>{l.pricing.vendorFree.price}</div>
                <div style={{ fontSize: "var(--text-base)", color: "var(--muted)", marginBottom: "var(--space-8)" }}>{l.pricing.vendorFree.subtext}</div>
                <ul className="space-y-3 mb-7">
                  {l.pricing.vendorFree.features.map((item) => (
                    <li key={item} className="flex items-center gap-2.5" style={{ fontSize: "var(--text-md)" }}>
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/aanmelden?type=vendor" className="ddp-btn-secondary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                  {l.pricing.vendorFree.cta}
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={160}>
              <div style={{ background: "var(--ink)", borderRadius: "20px", padding: "2rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "var(--gradient-primary)", borderRadius: "999px", color: "white", fontSize: "var(--text-2xs)", fontWeight: 700, padding: "3px 10px", letterSpacing: "0.05em" }}>
                  {l.pricing.popularBadge}
                </div>
                <div className="ddp-badge badge-premium mb-5">{l.pricing.premium.badge}</div>
                <div style={{ fontSize: "2.75rem", fontWeight: 700, letterSpacing: "-0.04em", color: "white", lineHeight: 1, marginBottom: "4px" }}>{l.pricing.premium.price}</div>
                <div style={{ fontSize: "var(--text-base)", color: "rgba(255,255,255,0.45)", marginBottom: "var(--space-8)" }}>{l.pricing.premium.subtext}</div>
                <ul className="space-y-3 mb-7">
                  {l.pricing.premium.features.map((item) => (
                    <li key={item} className="flex items-center gap-2.5" style={{ fontSize: "var(--text-md)", color: "rgba(255,255,255,0.85)" }}>
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary-light)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/aanmelden?type=vendor" className="ddp-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                  {l.pricing.premium.cta}
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
            <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "var(--space-5)" }}>{l.faqSection.label}</p>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--foreground)", marginBottom: "var(--space-10)" }}>
              {l.faqSection.title}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <div style={{ background: "var(--sand)", borderRadius: "20px", padding: "0 1.75rem", border: "1px solid rgba(0,0,0,0.04)" }}>
              {l.faqSection.items.map((faq) => (
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
            <h2 className="font-serif" style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)", fontWeight: 700, letterSpacing: "-0.055em", lineHeight: 1.04, color: "white", marginBottom: "var(--space-7)" }}>
              {l.finalCta.title}
            </h2>
            <p style={{ fontSize: "var(--text-2xl)", color: "rgba(255,255,255,0.50)", marginBottom: "2.5rem", lineHeight: 1.6 }}>
              {l.finalCta.sub}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/aanmelden" className="inline-flex items-center gap-2 font-semibold" style={{ background: "white", color: "var(--foreground)", borderRadius: "999px", padding: "0.875rem 2.125rem", fontSize: "var(--text-lg)", textDecoration: "none" }}>
                {l.finalCta.ctaPrimary} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/leveranciers" className="inline-flex items-center font-medium" style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)", borderRadius: "999px", padding: "0.875rem 2.125rem", fontSize: "var(--text-lg)", textDecoration: "none" }}>
                {l.finalCta.ctaSecondary}
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
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "rgba(255,255,255,0.80)", letterSpacing: "-0.02em" }}>{l.footer.tagline}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {l.footer.links.map((n) => (
              <a key={n.href} href={n.href} style={{ fontSize: "var(--text-base)", color: "rgba(255,255,255,0.40)", textDecoration: "none" }}>{n.label}</a>
            ))}
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.25)" }}>© 2026 DreamDay Platform</p>
        </div>
      </footer>
    </div>
  );
}
