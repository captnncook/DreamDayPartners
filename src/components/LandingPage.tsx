"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
        style={{ background: "var(--accent)" }}
      >
        {icon}
      </div>
      <div>
        <div className="font-semibold text-sm mb-1">{title}</div>
        <div className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{body}</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { t, toggle } = useLang();
  const l = t.landing;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 border-b px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", borderColor: "var(--border)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">💍</span>
          <span className="font-bold" style={{ color: "var(--primary)" }}>DreamDay Partners</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            {t.common.switchLang}
          </button>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--primary)" }}
          >
            {l.navLogin}
          </Link>
          <Link href="/weddings/wizard" className="ddp-btn-primary text-sm">
            {l.navStart}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "var(--accent)", color: "var(--primary)" }}
        >
          <span>✨</span>
          {l.heroBadge}
        </div>

        <h1
          className="text-5xl font-extrabold mb-6 max-w-3xl leading-tight"
          style={{ color: "var(--foreground)" }}
        >
          {l.heroTitle}
        </h1>

        <p className="text-lg max-w-2xl mb-10 leading-relaxed" style={{ color: "var(--muted)" }}>
          {l.heroSub}
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/weddings/wizard" className="ddp-btn-primary px-8 py-3 text-base">
            💍 {l.heroCtaCouple}
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl text-base font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            {l.heroCtaLogin}
          </Link>
        </div>

        {/* Mock dashboard preview strip */}
        <div
          className="mt-16 w-full max-w-4xl rounded-2xl border overflow-hidden shadow-xl"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="h-10 flex items-center gap-2 px-4 border-b"
            style={{ background: "white", borderColor: "var(--border)" }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: "#e05252" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--warning)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--success)" }} />
            <div
              className="flex-1 mx-4 h-5 rounded-md text-xs flex items-center px-3"
              style={{ background: "var(--accent)", color: "var(--muted)" }}
            >
              dreamdaypartners.nl/weddings
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
            {[
              { icon: "📋", label: "Draaiboek", value: "14 items" },
              { icon: "💶", label: "Budget", value: "68% gebruikt" },
              { icon: "👥", label: "Gasten", value: "84 bevestigd" },
            ].map((stat) => (
              <div key={stat.label} className="p-6 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>{stat.label}</div>
                <div className="font-bold" style={{ color: "var(--primary)" }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features: two columns */}
      <section className="py-24 px-6 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Couples */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: "var(--accent)", color: "var(--primary)" }}
            >
              👰 {l.coupleTitle}
            </div>
            <h2 className="text-2xl font-bold mb-2">{l.coupleTitle}</h2>
            <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{l.coupleSub}</p>
            <div className="space-y-6">
              <Feature icon="📋" title={l.coupleF1T} body={l.coupleF1B} />
              <Feature icon="💶" title={l.coupleF2T} body={l.coupleF2B} />
              <Feature icon="🤝" title={l.coupleF3T} body={l.coupleF3B} />
              <Feature icon="👥" title={l.coupleF4T} body={l.coupleF4B} />
            </div>
          </div>

          {/* Vendors */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: "#f0f9f4", color: "var(--success)" }}
            >
              🤝 {l.vendorTitle}
            </div>
            <h2 className="text-2xl font-bold mb-2">{l.vendorTitle}</h2>
            <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{l.vendorSub}</p>
            <div className="space-y-6">
              <Feature icon="⏱️" title={l.vendorF1T} body={l.vendorF1B} />
              <Feature icon="💬" title={l.vendorF2T} body={l.vendorF2B} />
              <Feature icon="🚚" title={l.vendorF3T} body={l.vendorF3B} />
              <Feature icon="🎨" title={l.vendorF4T} body={l.vendorF4B} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: "var(--primary)" }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">{l.ctaTitle}</h2>
        <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
          {l.ctaSub}
        </p>
        <Link
          href="/weddings/wizard"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-base font-semibold bg-white transition-colors hover:opacity-90"
          style={{ color: "var(--primary)" }}
        >
          💍 {l.ctaBtn}
        </Link>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-6 border-t text-center text-xs"
        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>💍</span>
          <span className="font-semibold" style={{ color: "var(--primary)" }}>DreamDay Partners</span>
        </div>
        <p>{l.footerTagline}</p>
      </footer>
    </div>
  );
}
