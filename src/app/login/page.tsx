"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_USERS, type DemoRole } from "@/lib/demo-users";

const ROLE_OPTIONS: { value: DemoRole; label: string; icon: string; description: string }[] = [
  { value: "admin", label: "Admin", icon: "⚙️", description: "Platform beheerder" },
  { value: "planner", label: "Weddingplanner", icon: "💍", description: "Sophie van der Berg" },
  { value: "couple", label: "Bruidspaar", icon: "👰", description: "Emma de Vries" },
  { value: "bloemist", label: "Bloemist", icon: "🌸", description: "Roos Janssen" },
  { value: "dj", label: "DJ", icon: "🎵", description: "DJ Marco" },
  { value: "catering", label: "Catering", icon: "🍽️", description: "Tasty Events" },
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl">💍</span>
            <span className="text-2xl font-bold" style={{ color: "var(--primary)" }}>DreamDay Partners</span>
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Wedding management platform — Demo
          </p>
        </div>

        {/* Login card */}
        <div className="ddp-card shadow-lg">
          <h1 className="text-lg font-semibold mb-1">Inloggen</h1>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            Kies een rol om de demo te verkennen
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role dropdown */}
            <div>
              <label className="block text-sm font-medium mb-2">Inloggen als</label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as DemoRole)}
                  className="w-full appearance-none border rounded-lg px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 cursor-pointer"
                  style={{
                    borderColor: "var(--border)",
                    background: "white",
                  }}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  ▾
                </div>
              </div>
            </div>

            {/* Role preview */}
            <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
              <span className="text-2xl">{selected.icon}</span>
              <div>
                <div className="font-medium text-sm">{selected.label}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{selected.description}</div>
              </div>
              <div className="ml-auto">
                <span className="ddp-badge badge-neutral text-xs">{DEMO_USERS[selectedRole].email}</span>
              </div>
            </div>

            {/* Wat zie je per rol */}
            <div className="text-xs space-y-1" style={{ color: "var(--muted)" }}>
              {selectedRole === "admin" && <p>Overzicht alle bruiloften, gebruikers en platformbeheer</p>}
              {selectedRole === "planner" && <p>Volledig bruiloftsbeheer: taken, gasten, budget, draaiboek, communicatie</p>}
              {selectedRole === "couple" && <p>Overzicht van de eigen bruiloft, taken en communicatie met het team</p>}
              {(selectedRole === "bloemist" || selectedRole === "dj" || selectedRole === "catering") && (
                <p>Leveranciersportaal: eigen draaiboek-items en communicatie met het team (Premium)</p>
              )}
            </div>

            {error && (
              <div className="text-sm p-3 rounded-lg" style={{ background: "#fde8e8", color: "var(--danger)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ddp-btn-primary w-full py-3 text-base"
            >
              {loading ? "Bezig met inloggen..." : `Inloggen als ${selected.label}`}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "var(--muted)" }}>
          Dit is een demo-omgeving. Geen echte inloggegevens nodig.
        </p>
      </div>
    </div>
  );
}
