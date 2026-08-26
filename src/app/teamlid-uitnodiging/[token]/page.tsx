"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

type Step = "loading" | "invalid" | "name" | "verify-code" | "password";

export default function TeamInviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState("");
  const [invitedByName, setInvitedByName] = useState("");
  const [weddingTitle, setWeddingTitle] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/team-invites/${token}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Ongeldige uitnodiging");
      setStep("invalid");
      return;
    }
    setInvitedByName(data.invitedByName);
    setWeddingTitle(data.weddingTitle);
    setEmail(data.email);
    setStep("name");
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function handleSendCode() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          type: "team_member",
          data: { weddingId: null, inviteToken: token, name: name.trim() || "Teamlid" },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Fout bij versturen"); return; }
      setPendingId(data.pendingId);
      setStep("verify-code");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyCode() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Onjuiste code"); return; }
      setVerifiedToken(data.verifiedToken);
      setStep("password");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister() {
    if (password.length < 8) { setError("Wachtwoord moet minimaal 8 tekens zijn"); return; }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiedToken, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Fout bij aanmaken"); return; }
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: "420px", margin: "0 auto", padding: "3rem 1.25rem" }}>
      <h1 className="font-serif" style={{ fontSize: "var(--text-5xl)", fontWeight: 700, marginBottom: "var(--space-3)" }}>
        Uitnodiging voor DreamDay
      </h1>

      {step === "loading" && <p style={{ color: "var(--muted)" }}>Laden…</p>}

      {step === "invalid" && (
        <p style={{ color: "var(--danger, #b3261e)" }}>{error}</p>
      )}

      {step === "name" && (
        <div className="space-y-4">
          <p style={{ color: "var(--muted)", fontSize: "var(--text-lg)" }}>
            <strong>{invitedByName}</strong> nodigt je uit om mee te helpen bij <strong>{weddingTitle}</strong> — met je eigen account, los van hun inloggegevens.
          </p>
          <p style={{ color: "var(--muted)", fontSize: "var(--text-base)" }}>
            Je krijgt dezelfde toegang als {invitedByName}: het draaiboek, de gastenlijst, het budget en de berichten
            met leveranciers kun je niet alleen bekijken, maar ook net zo goed bewerken.
          </p>
          <div>
            <label style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Je naam</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="bijv. Corrie" className="ddp-input" style={{ marginTop: "0.3rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>E-mailadres</label>
            <input value={email} disabled className="ddp-input" style={{ marginTop: "0.3rem", opacity: 0.7 }} />
          </div>
          {error && <p style={{ color: "var(--danger, #b3261e)", fontSize: "var(--text-md)" }}>{error}</p>}
          <button onClick={handleSendCode} disabled={busy} className="ddp-btn-primary" style={{ width: "100%" }}>
            {busy ? "Code versturen…" : "Code versturen"}
          </button>
        </div>
      )}

      {step === "verify-code" && (
        <div className="space-y-4">
          <p style={{ color: "var(--muted)", fontSize: "var(--text-lg)" }}>
            We hebben een 6-cijferige code gestuurd naar <strong>{email}</strong>.
          </p>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="123456" className="ddp-input" />
          {error && <p style={{ color: "var(--danger, #b3261e)", fontSize: "var(--text-md)" }}>{error}</p>}
          <button onClick={handleVerifyCode} disabled={busy} className="ddp-btn-primary" style={{ width: "100%" }}>
            {busy ? "Bevestigen…" : "Code bevestigen"}
          </button>
        </div>
      )}

      {step === "password" && (
        <div className="space-y-4">
          <p style={{ color: "var(--muted)", fontSize: "var(--text-lg)" }}>E-mail bevestigd. Kies een wachtwoord voor je eigen account.</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimaal 8 tekens" className="ddp-input" />
          {error && <p style={{ color: "var(--danger, #b3261e)", fontSize: "var(--text-md)" }}>{error}</p>}
          <button onClick={handleRegister} disabled={busy} className="ddp-btn-primary" style={{ width: "100%" }}>
            {busy ? "Account aanmaken…" : "Account aanmaken"}
          </button>
        </div>
      )}
    </div>
  );
}
