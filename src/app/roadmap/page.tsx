import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import RoadmapTimeline from "./RoadmapTimeline";

export const metadata: Metadata = {
  title: "Roadmap — DreamDay Platform",
  description: "Hoever staan we met DreamDay Platform, welke mijlpalen komen er nog, en wanneer verwachten we live te gaan.",
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header className="px-5 md:px-10 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between" style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/images/logo.svg" alt="DreamDay Platform" width={28} height={28} />
            <span className="font-serif" style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.02em", color: "var(--foreground)" }}>
              DreamDay<span style={{ color: "var(--primary)" }}> Platform</span>
            </span>
          </Link>
          <Link href="/login" className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Inloggen
          </Link>
        </div>
      </header>

      <main className="px-5 py-10 md:py-14" style={{ maxWidth: "1040px", margin: "0 auto" }}>
        <h1 className="font-serif" style={{ fontSize: "clamp(1.75rem, 5vw, 2.375rem)", fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.15, color: "var(--foreground)" }}>
          Roadmap
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--muted)", lineHeight: 1.65, maxWidth: "640px" }}>
          Hoever staan we, welke stappen komen er nog en wanneer gaan we live? Beweeg over de tijdlijn
          (op mobiel staat alles direct open) voor meer uitleg per mijlpaal.
        </p>

        <div className="mt-10 md:mt-14">
          <RoadmapTimeline />
        </div>
      </main>

      <footer className="px-5 py-10 mt-10" style={{ background: "var(--ink)" }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-5" style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <div className="flex items-center gap-2">
            <Image src="/images/logo-wit.svg" alt="DreamDay Platform" width={24} height={24} />
            <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "rgba(255,255,255,0.8)" }}>DreamDay Platform</span>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {[
              { href: "/blog", label: "Blog" },
              { href: "/roadmap", label: "Roadmap" },
              { href: "/privacy", label: "Privacybeleid" },
              { href: "/voorwaarden", label: "Algemene voorwaarden" },
              { href: "/leveranciers", label: "Vind leveranciers" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>© 2026 DreamDay Platform</p>
        </div>
      </footer>
    </div>
  );
}
