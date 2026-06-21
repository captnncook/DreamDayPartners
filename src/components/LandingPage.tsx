"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import {
  Heart, ClipboardList, Euro, Handshake, Users,
  Clock, MessageCircle, Truck, Palette, Globe,
} from "lucide-react";

function FeatureCard({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="flex gap-4 group">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110"
        style={{ background: "rgba(255,255,255,0.7)", boxShadow: "0 2px 8px rgba(196,154,108,0.12)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "var(--primary)" }} />
      </div>
      <div>
        <div className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>{title}</div>
        <div className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{body}</div>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center p-6 transition-all duration-200 hover:bg-white/60">
      <div className="font-bold text-base mb-1" style={{ color: "var(--primary)" }}>{value}</div>
      <div className="text-xs font-medium" style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const { t, toggle } = useLang();
  const l = t.landing;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between"
        style={{
          background: "rgba(250, 247, 244, 0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }}
          >
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: "var(--foreground)" }}>
            DreamDay <span style={{ color: "var(--primary)" }}>Partners</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="ddp-btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            {t.common.switchLang}
          </button>
          <Link href="/login" className="ddp-btn-ghost text-sm">{l.navLogin}</Link>
          <Link href="/weddings/wizard" className="ddp-btn-primary text-sm px-4 py-2">{l.navStart}</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,180,188,0.18) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,154,108,0.14) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in-up">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-7"
            style={{ background: "white", color: "var(--primary)", border: "1px solid var(--accent)", boxShadow: "var(--shadow-sm)" }}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            {l.heroBadge}
          </div>

          {/* Heading */}
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: "var(--foreground)" }}>
            {l.heroTitle}
          </h1>

          {/* Sub */}
          <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--muted)" }}>
            {l.heroSub}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/weddings/wizard" className="ddp-btn-primary px-8 py-3 text-base">
              {l.heroCtaCouple}
            </Link>
            <Link href="/login" className="ddp-btn-secondary px-8 py-3 text-base">
              {l.heroCtaLogin}
            </Link>
          </div>
        </div>

        {/* Mock dashboard */}
        <div
          className="relative z-10 mt-16 w-full max-w-3xl rounded-2xl overflow-hidden animate-fade-in-up"
          style={{ boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)", animationDelay: "0.15s", animationFillMode: "both" }}
        >
          {/* Browser bar */}
          <div className="h-9 flex items-center gap-2 px-4" style={{ background: "white", borderBottom: "1px solid var(--border)" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--danger)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--warning)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--success)" }} />
            <div className="flex-1 mx-4 h-5 rounded-md text-xs flex items-center px-3" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
              dreamdaypartners.nl/dashboard
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x" style={{ background: "white", borderColor: "var(--border)" }}>
            <StatPill label="Draaiboek" value="14 items" />
            <StatPill label="Budget" value="68% gebruikt" />
            <StatPill label="Gasten" value="84 bevestigd" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="ddp-section-label mb-3">Alles wat je nodig hebt</p>
            <h2 className="font-serif text-3xl font-bold" style={{ color: "var(--foreground)" }}>
              Voor iedereen in het bruiloftsproces
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Couples */}
            <div className="ddp-card" style={{ background: "var(--rose-bg)", border: "1px solid var(--rose)" }}>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                style={{ background: "white", color: "#9B3C5E", border: "1px solid var(--rose)" }}
              >
                <Heart className="w-3.5 h-3.5 fill-current" /> {l.coupleTitle}
              </div>
              <h2 className="font-serif text-xl font-bold mb-2">{l.coupleTitle}</h2>
              <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>{l.coupleSub}</p>
              <div className="space-y-5">
                <FeatureCard icon={ClipboardList} title={l.coupleF1T} body={l.coupleF1B} />
                <FeatureCard icon={Euro}          title={l.coupleF2T} body={l.coupleF2B} />
                <FeatureCard icon={Handshake}     title={l.coupleF3T} body={l.coupleF3B} />
                <FeatureCard icon={Users}         title={l.coupleF4T} body={l.coupleF4B} />
              </div>
            </div>

            {/* Vendors */}
            <div className="ddp-card" style={{ background: "var(--sage-bg)", border: "1px solid var(--sage)" }}>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                style={{ background: "white", color: "#2E7A5A", border: "1px solid var(--sage)" }}
              >
                <Handshake className="w-3.5 h-3.5" /> {l.vendorTitle}
              </div>
              <h2 className="font-serif text-xl font-bold mb-2">{l.vendorTitle}</h2>
              <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>{l.vendorSub}</p>
              <div className="space-y-5">
                <FeatureCard icon={Clock}          title={l.vendorF1T} body={l.vendorF1B} />
                <FeatureCard icon={MessageCircle}  title={l.vendorF2T} body={l.vendorF2B} />
                <FeatureCard icon={Truck}          title={l.vendorF3T} body={l.vendorF3B} />
                <FeatureCard icon={Palette}        title={l.vendorF4T} body={l.vendorF4B} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section
        className="py-10 px-6"
        style={{ background: "var(--surface-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: "500+", label: "Bruiloften gepland" },
            { value: "98%",  label: "Tevreden planners" },
            { value: "24/7", label: "Beschikbaar" },
          ].map((item) => (
            <div key={item.label}>
              <div className="font-serif text-3xl font-bold mb-1" style={{ color: "var(--primary)" }}>{item.value}</div>
              <div className="text-sm" style={{ color: "var(--muted)" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA section ── */}
      <section className="py-24 px-6 text-center" style={{ background: "var(--gradient-primary)" }}>
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6" style={{ background: "rgba(255,255,255,0.2)" }}>
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white mb-4">{l.ctaTitle}</h2>
          <p className="text-base mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>{l.ctaSub}</p>
          <Link
            href="/weddings/wizard"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-white transition-all duration-200 hover:opacity-95 hover:shadow-xl"
            style={{ color: "var(--primary-dark)" }}
          >
            {l.ctaBtn} →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 text-center text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <Heart className="w-3 h-3 text-white fill-white" />
          </div>
          <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>DreamDay Partners</span>
        </div>
        <p style={{ color: "var(--muted)" }}>{l.footerTagline}</p>
      </footer>
    </div>
  );
}
