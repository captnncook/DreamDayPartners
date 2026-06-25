"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DEMO_USERS, type DemoRole } from "@/lib/demo-users";
import { Heart, Settings, Users, Leaf, Music, Utensils, Camera, Video, Scissors, Mic2, Cake, MapPin, Car, CalendarCheck } from "lucide-react";

const ROLE_OPTIONS: { value: DemoRole; label: string; Icon: React.ElementType; description: string }[] = [
  { value: "admin",               label: "Admin",              Icon: Settings,      description: "Platform beheerder" },
  { value: "planner",             label: "Weddingplanner",     Icon: Heart,         description: "Sophie van der Berg" },
  { value: "couple",              label: "Bruidspaar",         Icon: Users,         description: "Emma de Vries" },
  { value: "bloemist",            label: "Bloemist",           Icon: Leaf,          description: "Roos Janssen" },
  { value: "dj",                  label: "DJ",                 Icon: Music,         description: "DJ Marco" },
  { value: "catering",            label: "Catering",           Icon: Utensils,      description: "Tasty Events" },
  { value: "fotograaf",           label: "Fotograaf",          Icon: Camera,        description: "Lara Vermeer" },
  { value: "videograaf",          label: "Videograaf",         Icon: Video,         description: "Tom de Wit" },
  { value: "haarstylist",         label: "Haarstylist",        Icon: Scissors,      description: "Noa Pieters" },
  { value: "liveband",            label: "Liveband",           Icon: Mic2,          description: "Daan Kroon" },
  { value: "bakker",              label: "Bakker",             Icon: Cake,          description: "Sanne Bakker" },
  { value: "trouwlocatie",        label: "Trouwlocatie",       Icon: MapPin,        description: "Kasteel de Haar" },
  { value: "vervoer",             label: "Vervoer",            Icon: Car,           description: "Henk Visser" },
  { value: "weddingplanner_vendor", label: "WP (leverancier)", Icon: CalendarCheck, description: "Isa Mulder" },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<DemoRole>("planner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const demoUser = DEMO_USERS[selectedRole];

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoUser.email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Inloggen mislukt");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Verbindingsfout, probeer opnieuw");
    } finally {
      setLoading(false);
    }
  }

  const selected = ROLE_OPTIONS.find((r) => r.value === selectedRole)!;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Logo linksboven — terug naar home */}
      <Link href="/" className="fixed top-4 left-5 md:left-10 inline-flex items-center gap-2 z-20" style={{ textDecoration: "none" }}>
        <Image src="/logo.png" alt="DreamDay Partners" width={28} height={28} />
        <span style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>
          DreamDay<span style={{ color: "var(--primary)" }}> Partners</span>
        </span>
      </Link>

      {/* Decorative blob */}
      <div
        className="fixed top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(232,180,188,0.15) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-3">
            <Image src="/logo.png" alt="DreamDay Partners" width={48} height={48} />
            <div className="text-left">
              <div className="font-serif text-xl font-bold" style={{ color: "var(--foreground)" }}>DreamDay</div>
              <div className="text-sm font-medium" style={{ color: "var(--primary)" }}>Partners</div>
            </div>
          </Link>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Jouw dream day, zonder de stress — Demo
          </p>
        </div>

        {/* Login card */}
        <div className="ddp-card" style={{ boxShadow: "var(--shadow-lg)", padding: "1.75rem" }}>
          <h1 className="font-serif text-xl font-bold mb-1">Inloggen</h1>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            Kies een rol om de demo te verkennen
          </p>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Role select */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Inloggen als
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as DemoRole)}
                  className="ddp-select appearance-none pr-10 cursor-pointer font-medium"
                  style={{ padding: "0.7rem 0.875rem" }}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
                  ▾
                </div>
              </div>
            </div>

            {/* Role preview */}
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--accent)" }}
              >
                <selected.Icon className="w-5 h-5" style={{ color: "var(--primary)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{selected.label}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{selected.description}</div>
              </div>
              <span className="ddp-badge badge-neutral text-xs flex-shrink-0">
                {DEMO_USERS[selectedRole].email}
              </span>
            </div>

            {/* Role description */}
            <div className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              {selectedRole === "admin"   && <p>Overzicht alle bruiloften, gebruikers en platformbeheer</p>}
              {selectedRole === "planner" && <p>Volledig bruiloftsbeheer: taken, gasten, budget, draaiboek, communicatie</p>}
              {selectedRole === "couple"  && <p>Overzicht van de eigen bruiloft, taken en communicatie met het team</p>}
              {!["admin","planner","couple"].includes(selectedRole) && (
                <p>Leveranciersportaal: intake, betalingen, deliverables en draaiboek <span className="ddp-badge badge-premium" style={{ fontSize: "0.6rem" }}>Premium</span></p>
              )}
            </div>

            {error && (
              <div className="text-sm p-3 rounded-lg" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ddp-btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? "Bezig…" : `Inloggen als ${selected.label}`}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 ddp-divider" />
          <span className="text-xs" style={{ color: "var(--muted)" }}>of</span>
          <div className="flex-1 ddp-divider" />
        </div>

        {/* Register CTA */}
        <div className="ddp-card text-center" style={{ boxShadow: "var(--shadow-md)" }}>
          <Image src="/logo.png" alt="DreamDay" width={40} height={40} className="mx-auto mb-3" />
          <h2 className="font-semibold text-sm mb-1">Jullie dream day plannen?</h2>
          <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
            Stel jullie dream team samen en regel alles op één plek — gratis voor bruidsparen.
          </p>
          <Link href="/aanmelden" className="ddp-btn-primary w-full py-2.5 text-sm">
            Begin gratis
          </Link>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "var(--muted-light)" }}>
          Dit is een demo-omgeving. Geen echte inloggegevens nodig.
        </p>
      </div>
    </div>
  );
}
