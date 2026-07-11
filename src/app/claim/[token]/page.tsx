"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { APPLE_LOGIN_ENABLED } from "@/lib/featureFlags";

export default function ClaimVerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<{ vendorName: string; email: string } | null>(null);
  const [error, setError] = useState(searchParams.get("error") ?? "");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/auth/claim-verify?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setInfo(data);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function submitPassword() {
    setError("");
    if (password.length < 8) { setError("Wachtwoord moet minimaal 8 tekens zijn"); return; }
    if (password !== password2) { setError("Wachtwoorden komen niet overeen"); return; }
    setSaving(true);
    const res = await fetch("/api/auth/claim-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Er ging iets mis"); setSaving(false); return; }
    router.push(data.redirect ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/images/logo.svg" alt="DreamDay Platform" width={32} height={32} />
          </Link>
        </div>

        <div className="ddp-card">
          {loading && <p className="text-sm" style={{ color: "var(--muted)" }}>Bezig met laden...</p>}

          {!loading && error && !info && (
            <div>
              <h1 className="text-lg font-bold mb-2">Link ongeldig</h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{error}</p>
              <Link href="/login" className="ddp-btn-secondary mt-4 inline-block">Naar inloggen</Link>
            </div>
          )}

          {!loading && info && (
            <div>
              <h1 className="text-xl font-bold mb-1">Stel je account in</h1>
              <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
                Profiel: <strong>{info.vendorName}</strong> · {info.email}
              </p>

              <div className="space-y-2 mb-4">
                <a href={`/api/auth/google?claim=${token}`} className="ddp-btn-secondary w-full text-center block">
                  Doorgaan met Google
                </a>
                {APPLE_LOGIN_ENABLED && (
                  <a href={`/api/auth/apple?claim=${token}`} className="ddp-btn-secondary w-full text-center block">
                    Doorgaan met Apple
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>of kies een wachtwoord</span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>

              {error && <p className="text-sm mb-3" style={{ color: "var(--danger)" }}>{error}</p>}

              <input
                type="password"
                placeholder="Wachtwoord (min. 8 tekens)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ddp-input w-full mb-2"
              />
              <input
                type="password"
                placeholder="Herhaal wachtwoord"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="ddp-input w-full mb-4"
              />
              <button onClick={submitPassword} disabled={saving} className="ddp-btn-primary w-full">
                {saving ? "Bezig..." : "Account activeren"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
