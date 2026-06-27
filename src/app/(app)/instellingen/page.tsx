"use client";

import { useState, useEffect } from "react";
import { User, Check, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type UserInfo = { id: string; name: string; email: string; role: string };

const ROLE_LABELS: Record<string, string> = {
  admin: "Beheerder", planner: "Trouwplanner", team_member: "Teamlid", couple: "Bruidspaar", vendor: "Leverancier",
};

export default function InstellingenPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [nameDraft, setNameDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      setUser(d.user);
      setNameDraft(d.user?.name ?? "");
      setLoading(false);
    });
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameDraft }),
    });
    setSaving(false);
    if (res.ok) {
      const d = await res.json();
      setUser(d.user);
      setMsg("Naam opgeslagen!");
    } else {
      setMsg("Opslaan mislukt.");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) return <div className="p-8" style={{ color: "var(--muted)" }}>Laden…</div>;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profielinstellingen</h1>

      <div className="ddp-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--primary)" }}>
            <User className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-semibold">Mijn account</h2>
        </div>
        <form onSubmit={saveName} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Naam</label>
            <input value={nameDraft} onChange={e => setNameDraft(e.target.value)} required
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">E-mailadres</label>
            <div className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "var(--accent)", color: "var(--muted)" }}>
              {user?.email}
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Aanmelden gaat via magic link — geen wachtwoord nodig.</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Rol</label>
            <div className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "var(--accent)", color: "var(--muted)" }}>
              {ROLE_LABELS[user?.role ?? ""] ?? user?.role}
            </div>
          </div>
          {msg && (
            <div className="text-sm flex items-center gap-1" style={{ color: msg.includes("!") ? "var(--success)" : "var(--danger)" }}>
              {msg.includes("!") && <Check className="w-3.5 h-3.5" />}{msg}
            </div>
          )}
          <button type="submit" disabled={saving} className="ddp-btn-primary">
            {saving ? "Opslaan…" : "Naam opslaan"}
          </button>
        </form>
      </div>

      <div className="ddp-card">
        <h2 className="font-semibold mb-3">Account</h2>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm" style={{ color: "var(--danger)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <LogOut className="w-4 h-4" /> Uitloggen
        </button>
      </div>
    </div>
  );
}
