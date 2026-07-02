"use client";

import { useState, useEffect } from "react";
import { User, Bell, LogOut, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { SkeletonBlock } from "@/components/Skeleton";

type UserInfo = { id: string; name: string; email: string; role: string; vendorType?: string | null };

const ROLE_LABELS: Record<string, string> = {
  admin: "Beheerder", planner: "Trouwplanner", team_member: "Teamlid", couple: "Bruidspaar", vendor: "Leverancier",
};

const VENDOR_TYPE_LABELS: Record<string, string> = {
  weddingplanner: "Weddingplanner", fotograaf: "Fotograaf", videograaf: "Videograaf",
  bloemist: "Bloemist", dj: "DJ / Muziek", catering: "Catering", bakker: "Bruidstaart & Bakker",
  haarstylist: "Haarstylist", visagist: "Visagist", trouwlocatie: "Trouwlocatie",
  vervoer: "Vervoer", verhuur: "Verhuur", tentverhuur: "Tentverhuur", trouwauto: "Trouwauto",
  bar: "Bar / Cocktails", koffiebar: "Koffiebar / Foodtruck",
  liveband: "Liveband & Muziek", entertainment: "Entertainment / Acts",
  fotocabine: "Fotocabine", dj_live: "DJ Live", band: "Band",
};

const NOTIF_DEFAULTS = {
  emailNewMessage: true,
  emailNewTask: true,
  emailWeddingUpdate: false,
  emailWeeklyDigest: true,
};

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#1a1a1a", color: "white", padding: "0.75rem 1.25rem", borderRadius: "12px", fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", whiteSpace: "nowrap" }}>
      <Check className="w-4 h-4 text-green-400" /> {msg}
    </div>
  );
}

export default function InstellingenPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [notifs, setNotifs] = useState(NOTIF_DEFAULTS);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      setUser(d.user);
      setNameDraft(d.user?.name ?? "");
      setEmailDraft(d.user?.email ?? "");
      if (d.user) {
        setNotifs({
          emailNewMessage: d.user.emailNewMessage ?? true,
          emailNewTask: d.user.emailNewTask ?? true,
          emailWeddingUpdate: d.user.emailWeddingUpdate ?? false,
          emailWeeklyDigest: d.user.emailWeeklyDigest ?? true,
        });
      }
      setLoading(false);
    });
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body: Record<string, string> = { name: nameDraft };
    if (user?.role === "admin" && emailDraft && emailDraft !== user.email) {
      body.email = emailDraft;
    }
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      const d = await res.json();
      setUser(d.user);
      setEmailDraft(d.user?.email ?? "");
      setToast("Profielinstellingen opgeslagen");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) return (
    <div className="p-8 max-w-xl mx-auto space-y-4">
      <SkeletonBlock style={{ height: "1.75rem", width: "60%", marginBottom: "1rem" }} />
      <SkeletonBlock style={{ height: "220px", borderRadius: "16px" }} />
      <SkeletonBlock style={{ height: "180px", borderRadius: "16px" }} />
      <SkeletonBlock style={{ height: "80px", borderRadius: "16px" }} />
    </div>
  );

  return (
    <div className="p-8 max-w-xl mx-auto">
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      <h1 className="text-2xl font-bold mb-6">Profielinstellingen</h1>

      {/* Account */}
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
            {user?.role === "admin" ? (
              <input
                type="email"
                value={emailDraft}
                onChange={e => setEmailDraft(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)" }}
              />
            ) : (
              <div className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "var(--accent)", color: "var(--muted)" }}>
                {user?.email}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Rol</label>
            <div className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "var(--accent)", color: "var(--muted)" }}>
              {user?.role === "vendor" && user.vendorType
                ? (VENDOR_TYPE_LABELS[user.vendorType] ?? user.vendorType)
                : (ROLE_LABELS[user?.role ?? ""] ?? user?.role)}
            </div>
          </div>
          <button type="submit" disabled={saving} className="ddp-btn-primary">
            {saving ? "Opslaan…" : "Naam opslaan"}
          </button>
        </form>
      </div>

      {/* Notifications — hidden for admins */}
      {user?.role !== "admin" && <div className="ddp-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--primary)" }}>
            <Bell className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-semibold">Meldingen</h2>
        </div>
        <div className="space-y-3">
          {([
            { key: "emailNewMessage", label: "Nieuw bericht ontvangen", sub: "E-mail bij elk nieuw direct bericht" },
            { key: "emailNewTask", label: "Nieuwe taak aangemaakt", sub: "E-mail als er een taak aan jou wordt toegewezen" },
            { key: "emailWeddingUpdate", label: "Bruiloft-updates", sub: "E-mail bij wijzigingen in de planning" },
            { key: "emailWeeklyDigest", label: "Wekelijks overzicht", sub: "Elke maandag een samenvatting van openstaande punten" },
          ] as { key: keyof typeof NOTIF_DEFAULTS; label: string; sub: string }[]).map(({ key, label, sub }) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 flex-shrink-0">
                <input type="checkbox" checked={notifs[key]} onChange={e => setNotifs(p => ({ ...p, [key]: e.target.checked }))}
                  className="sr-only" />
                <div style={{ width: "36px", height: "20px", borderRadius: "10px", background: notifs[key] ? "var(--primary)" : "var(--border)", cursor: "pointer", transition: "background 0.2s", position: "relative" }}>
                  <div style={{ position: "absolute", top: "2px", left: notifs[key] ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{sub}</div>
              </div>
            </label>
          ))}
        </div>
        <button
          onClick={async () => {
            await fetch("/api/me", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(notifs),
            });
            setToast("Meldingsinstellingen opgeslagen");
          }}
          className="ddp-btn-primary mt-4">
          Voorkeuren opslaan
        </button>
      </div>}

      {/* Logout */}
      <div className="ddp-card">
        <h2 className="font-semibold mb-3">Account</h2>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm" style={{ color: "var(--danger)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <LogOut className="w-4 h-4" /> Uitloggen
        </button>
      </div>
    </div>
  );
}
