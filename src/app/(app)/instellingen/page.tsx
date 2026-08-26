"use client";

import { useState, useEffect } from "react";
import { User, Bell, LogOut, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { SkeletonBlock } from "@/components/Skeleton";
import VendorDashboardModulesSection from "@/components/VendorDashboardModulesSection";
import CoupleDeleteSection from "@/components/CoupleDeleteSection";
import { useLang } from "@/components/LangProvider";

type UserInfo = { id: string; name: string; email: string; role: string; vendorType?: string | null };

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
    <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#1a1a1a", color: "white", padding: "0.75rem 1.25rem", borderRadius: "12px", fontSize: "var(--text-md)", fontWeight: 600, display: "flex", alignItems: "center", gap: "var(--space-3)", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", whiteSpace: "nowrap" }}>
      <Check className="w-4 h-4 text-green-400" /> {msg}
    </div>
  );
}

export default function InstellingenPage() {
  const { t } = useLang();
  const ts = t.settings;
  const ROLE_LABELS: Record<string, string> = ts.roleLabels;
  const VENDOR_TYPE_LABELS: Record<string, string> = ts.vendorTypeLabels;
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
      setToast(ts.profileSaved);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) return (
    <div className="p-8 max-w-xl mx-auto space-y-4">
      <SkeletonBlock style={{ height: "1.75rem", width: "60%", marginBottom: "var(--space-6)" }} />
      <SkeletonBlock style={{ height: "220px", borderRadius: "16px" }} />
      <SkeletonBlock style={{ height: "180px", borderRadius: "16px" }} />
      <SkeletonBlock style={{ height: "80px", borderRadius: "16px" }} />
    </div>
  );

  return (
    <div className="p-8 max-w-xl mx-auto">
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      <h1 className="font-serif mb-6" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{ts.title}</h1>

      {/* Account */}
      <div className="ddp-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--primary)" }}>
            <User className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-semibold">{ts.myAccount}</h2>
        </div>
        <form onSubmit={saveName} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">{ts.nameLabel}</label>
            <input value={nameDraft} onChange={e => setNameDraft(e.target.value)} required
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{ts.emailLabel}</label>
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
            <label className="block text-xs font-medium mb-1">{ts.roleLabel}</label>
            <div className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "var(--accent)", color: "var(--muted)" }}>
              {user?.role === "vendor" && user.vendorType
                ? (VENDOR_TYPE_LABELS[user.vendorType] ?? user.vendorType)
                : (ROLE_LABELS[user?.role ?? ""] ?? user?.role)}
            </div>
          </div>
          <button type="submit" disabled={saving} className="ddp-btn-primary">
            {saving ? ts.saving : ts.saveName}
          </button>
        </form>
      </div>

      {user?.role === "vendor" && <VendorDashboardModulesSection />}

      {/* Notifications — hidden for admins */}
      {user?.role !== "admin" && <div className="ddp-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--primary)" }}>
            <Bell className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-semibold">{ts.notifications}</h2>
        </div>
        <div className="space-y-3">
          {([
            { key: "emailNewMessage", label: ts.notifNewMessage, sub: ts.notifNewMessageSub },
            { key: "emailNewTask", label: ts.notifNewTask, sub: ts.notifNewTaskSub },
            { key: "emailWeddingUpdate", label: ts.notifWeddingUpdate, sub: ts.notifWeddingUpdateSub },
            { key: "emailWeeklyDigest", label: ts.notifWeeklyDigest, sub: ts.notifWeeklyDigestSub },
          ] as { key: keyof typeof NOTIF_DEFAULTS; label: string; sub: string }[]).map(({ key, label, sub }) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 flex-shrink-0">
                <input type="checkbox" checked={notifs[key]} onChange={e => setNotifs(p => ({ ...p, [key]: e.target.checked }))}
                  className="sr-only" />
                <div style={{ width: "36px", height: "20px", borderRadius: "10px", background: notifs[key] ? "var(--primary)" : "var(--border)", cursor: "pointer", transition: "background 160ms var(--ease-out)", position: "relative" }}>
                  <div style={{ position: "absolute", top: "2px", left: "2px", width: "16px", height: "16px", borderRadius: "50%", background: "white", transform: notifs[key] ? "translateX(16px)" : "translateX(0)", transition: "transform 160ms var(--ease-out)", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
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
            setToast(ts.notificationsSaved);
          }}
          className="ddp-btn-primary mt-4">
          {ts.savePreferences}
        </button>
      </div>}

      {/* Logout */}
      <div className="ddp-card">
        <h2 className="font-semibold mb-3">{ts.account}</h2>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm" style={{ color: "var(--danger)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <LogOut className="w-4 h-4" /> {ts.logout}
        </button>
        {user?.role === "couple" && <CoupleDeleteSection />}
      </div>
    </div>
  );
}
