"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function WachtwoordResetPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) { setError("Wachtwoorden komen niet overeen"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Er ging iets mis"); return; }
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-hero)" }}>
      <Link href="/" className="fixed top-4 left-5 md:left-10 inline-flex items-center gap-2 z-20">
        <Image src="/images/logo.svg" alt="DreamDay Platform" width={28} height={28} />
        <span style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>
          DreamDay<span style={{ color: "var(--primary)" }}> Partners</span>
        </span>
      </Link>

      <div className="w-full max-w-md">
        <div className="ddp-card shadow-lg">
          {done ? (
            <div className="text-center space-y-3 py-2">
              <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: "var(--success)" }} />
              <h1 className="text-xl font-bold">Wachtwoord opgeslagen!</h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>Je wordt doorgestuurd naar je dashboard.</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-1">Nieuw wachtwoord instellen</h1>
              <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Kies een nieuw wachtwoord van minimaal 8 tekens.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nieuw wachtwoord"
                    className="ddp-input w-full pr-10"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="Herhaal wachtwoord"
                  className="ddp-input w-full"
                />
                {error && (
                  <div className="text-sm p-2.5 rounded-lg" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading} className="ddp-btn-primary w-full py-2.5">
                  {loading ? "Opslaan…" : "Wachtwoord opslaan"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
