"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function WachtwoordVergetenPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Er ging iets mis"); return; }
      setSent(true);
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
          {sent ? (
            <div className="text-center space-y-3 py-2">
              <div className="text-4xl">📬</div>
              <h1 className="text-xl font-bold">Check je inbox</h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Als er een account bestaat voor <strong>{email}</strong>, ontvang je een e-mail met een link om je wachtwoord opnieuw in te stellen. De link is 1 uur geldig.
              </p>
              <Link href="/login" className="ddp-btn-primary w-full py-2.5 text-sm mt-2 inline-block text-center">
                Terug naar inloggen
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-1">Wachtwoord vergeten?</h1>
              <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
                Vul je e-mailadres in en we sturen je een link om je wachtwoord opnieuw in te stellen.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jouw@emailadres.nl"
                  className="ddp-input w-full"
                  autoFocus
                />
                {error && (
                  <div className="text-sm p-2.5 rounded-lg" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading} className="ddp-btn-primary w-full py-2.5">
                  {loading ? "Versturen…" : "Link versturen"}
                </button>
              </form>
              <p className="text-center text-xs mt-4" style={{ color: "var(--muted)" }}>
                <Link href="/login" style={{ color: "var(--primary)" }}>← Terug naar inloggen</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
