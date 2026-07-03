"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DEMO_USERS, type DemoRole } from "@/lib/demo-users";
import { Heart, Settings, Users, Leaf, Music, Utensils, Camera, Video, Scissors, Mic2, Cake, MapPin, Car, CalendarCheck, Eye, EyeOff } from "lucide-react";

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
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [realLoading, setRealLoading] = useState(false);
  const [realError, setRealError] = useState("");
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

  async function handleRealLogin(e: React.FormEvent) {
    e.preventDefault();
    setRealLoading(true);
    setRealError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailLogin, password: passwordLogin }),
      });
      const data = await res.json();
      if (!res.ok) { setRealError(data.error ?? "Inloggen mislukt"); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setRealError("Verbindingsfout, probeer opnieuw");
    } finally {
      setRealLoading(false);
    }
  }

  const selected = ROLE_OPTIONS.find((r) => r.value === selectedRole)!;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, var(--ink) 0%, var(--ink-mid) 100%)" }}
    >
      {/* Logo linksboven — terug naar home */}
      <Link href="/" className="fixed top-4 left-5 md:left-10 inline-flex items-center gap-2 z-20" style={{ textDecoration: "none" }}>
        <Image src="/images/logo-wit.svg" alt="DreamDay Platform" width={26} height={26} />
        <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.02em", color: "var(--ink-text)" }}>
          DreamDay<span className="font-serif" style={{ color: "var(--gold)" }}> Platform</span>
        </span>
      </Link>

      {/* Zachte gouden gloed — geen decoratieve roze blob meer */}
      <div
        className="fixed top-0 right-0 w-[460px] h-[460px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(201,167,93,0.16) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-3">
            <Image src="/images/logo-wit.svg" alt="DreamDay Platform" width={44} height={44} />
            <div className="text-left">
              <div className="font-serif text-xl font-bold" style={{ color: "var(--ink-text)" }}>DreamDay</div>
              <div className="text-sm font-medium" style={{ color: "var(--gold)" }}>Platform</div>
            </div>
          </Link>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
            Jouw dream day, zonder de stress. Demo
          </p>
        </div>

        {/* Login card */}
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", padding: "1.75rem" }}>
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

            {/* Role preview — geen kaart-in-kaart, dunne scheidingslijn */}
            <div className="flex items-center gap-3 py-3" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--gold)" }}
              >
                <selected.Icon className="w-5 h-5" style={{ color: "var(--ink)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{selected.label}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{selected.description}</div>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: "var(--muted-light)" }}>
                {DEMO_USERS[selectedRole].email}
              </span>
            </div>

            {/* Role description */}
            <div className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              {selectedRole === "admin"   && <p>Overzicht alle bruiloften, gebruikers en platformbeheer</p>}
              {selectedRole === "planner" && <p>Volledig bruiloftsbeheer: taken, gasten, budget, draaiboek, communicatie</p>}
              {selectedRole === "couple"  && <p>Overzicht van de eigen bruiloft, taken en communicatie met het team</p>}
              {!["admin","planner","couple"].includes(selectedRole) && (
                <p>Leveranciersportaal: intake, betalingen, deliverables en draaiboek. <span style={{ color: "var(--gold-deep)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.6875rem", letterSpacing: "0.05em" }}>Premium</span></p>
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

        {/* Email + wachtwoord inloggen */}
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", padding: "1.75rem" }} className="mt-4">
          <h2 className="font-semibold text-sm mb-3">Inloggen met e-mail &amp; wachtwoord</h2>
          <form onSubmit={handleRealLogin} className="space-y-3">
            <input
              type="email"
              required
              value={emailLogin}
              onChange={e => setEmailLogin(e.target.value)}
              placeholder="jouw@emailadres.nl"
              className="ddp-input w-full"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={passwordLogin}
                onChange={e => setPasswordLogin(e.target.value)}
                placeholder="Wachtwoord"
                className="ddp-input w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {realError && (
              <div className="text-sm p-2.5 rounded-lg" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                {realError}
              </div>
            )}
            <button type="submit" disabled={realLoading} className="ddp-btn-primary w-full py-2.5 text-sm">
              {realLoading ? "Bezig…" : "Inloggen"}
            </button>
            <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
              <Link href="/wachtwoord-vergeten" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>Wachtwoord vergeten?</Link>
            </p>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1" style={{ height: "1px", background: "var(--ink-line)" }} />
          <span className="text-xs" style={{ color: "var(--ink-muted)" }}>of inloggen met</span>
          <div className="flex-1" style={{ height: "1px", background: "var(--ink-line)" }} />
        </div>

        {/* OAuth buttons */}
        <div className="flex flex-col gap-2 mb-4">
          <a
            href="/api/auth/google"
            className="w-full py-2.5 text-sm flex items-center justify-center gap-2.5 no-underline"
            style={{ textDecoration: "none", background: "var(--surface)", borderRadius: "var(--radius-full)", fontWeight: 600, color: "var(--foreground)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Inloggen met Google
          </a>
          <a
            href="/api/auth/apple"
            className="w-full py-2.5 text-sm flex items-center justify-center gap-2.5 no-underline"
            style={{ textDecoration: "none", background: "var(--surface)", borderRadius: "var(--radius-full)", fontWeight: 600, color: "var(--foreground)" }}
          >
            <svg width="16" height="18" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.7C199.4 718 128 583 128 462.9c0-0-96.5-197.9 0-288.2C174.5 128.4 221.2 128 224 128c6.8 0 25.5 2.5 31 4.1 25.3 7.3 51.9 27.7 72.9 44.6 24.9 20.1 49.2 54.3 57.7 87.5 7.7 30.9 9.6 62.9 5.8 95.5 48.8 9.4 115.7 7.5 162.1-45.5 19.3-22.1 35.6-55.1 41.5-86.2z"/>
            </svg>
            Inloggen met Apple
          </a>
        </div>

        {/* Register CTA — donker paneel met gouden knop, consistent met dash-hero */}
        <div className="dash-hero text-center" style={{ padding: "1.5rem" }}>
          <Image src="/images/logo-wit.svg" alt="DreamDay" width={36} height={36} className="mx-auto mb-3" />
          <h2 className="font-serif font-bold mb-1" style={{ fontSize: "1.0625rem", color: "var(--ink-text)" }}>Jullie dream day plannen?</h2>
          <p className="text-xs mb-4" style={{ color: "var(--ink-muted)" }}>
            Stel jullie dream team samen en regel alles op één plek, gratis voor bruidsparen.
          </p>
          <Link
            href="/aanmelden"
            className="ddp-btn-gold w-full inline-flex items-center justify-center py-2.5 text-sm font-bold"
            style={{ background: "var(--gold)", color: "var(--ink)", borderRadius: "var(--radius-full)" }}
          >
            Begin gratis
          </Link>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "var(--ink-muted)" }}>
          Dit is een demo-omgeving. Geen echte inloggegevens nodig.
        </p>
      </div>
    </div>
  );
}
