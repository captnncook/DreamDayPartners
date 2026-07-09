"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Layout } from "lucide-react";
import { MODULE_LABELS, TOGGLEABLE_MODULE_KEYS, type ModuleKey } from "@/lib/vendorTypeConfigs";

type ModulesData = {
  vendorId: string;
  isPremium: boolean;
  available: string[];
  disabledModules: string[];
  extraModules: string[];
};

type FeatureRequest = {
  id: string;
  moduleKey: string;
  message: string | null;
  status: string;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "In behandeling",
  approved: "Goedgekeurd",
  rejected: "Afgewezen",
};

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: "36px", height: "20px", borderRadius: "10px", flexShrink: 0,
        background: checked ? "var(--primary)" : "var(--border)", border: "none", cursor: "pointer",
        position: "relative", transition: "background 160ms var(--ease-out)",
      }}
    >
      <div style={{
        position: "absolute", top: "2px", left: "2px", width: "16px", height: "16px", borderRadius: "50%",
        background: "white", transform: checked ? "translateX(16px)" : "translateX(0)",
        transition: "transform 160ms var(--ease-out)", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

export default function VendorDashboardModulesSection() {
  const [data, setData] = useState<ModulesData | null>(null);
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [requestModule, setRequestModule] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requesting, setRequesting] = useState(false);

  const load = useCallback(async () => {
    const [modulesRes, requestsRes] = await Promise.all([
      fetch("/api/vendor/dashboard-modules"),
      fetch("/api/vendor/feature-requests"),
    ]);
    if (modulesRes.ok) setData(await modulesRes.json());
    if (requestsRes.ok) setRequests((await requestsRes.json()).requests ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !data) return null;

  const isDisabled = (key: string) => data.disabledModules.includes(key);

  async function toggleModule(key: string) {
    if (!data || !data.isPremium) return;
    const next = isDisabled(key) ? data.disabledModules.filter((m) => m !== key) : [...data.disabledModules, key];
    setData({ ...data, disabledModules: next });
    setSaving(true);
    const res = await fetch("/api/vendor/dashboard-modules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabledModules: next }),
    });
    if (res.ok) setToast("Dashboard-instellingen opgeslagen");
    setSaving(false);
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!requestModule) return;
    setRequesting(true);
    const res = await fetch("/api/vendor/feature-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleKey: requestModule, message: requestMessage }),
    });
    const json = await res.json();
    if (res.ok) {
      setRequests((prev) => [json.request, ...prev]);
      setRequestModule("");
      setRequestMessage("");
      setToast("Verzoek verstuurd naar de admin");
    } else {
      setToast(json.error ?? "Versturen mislukt");
    }
    setRequesting(false);
  }

  const requestableModules = TOGGLEABLE_MODULE_KEYS.filter((key) => !data.available.includes(key));

  return (
    <div className="ddp-card mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--primary)" }}>
          <Layout className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-semibold">Dashboard-functies</h2>
      </div>

      {toast && <p className="text-xs mb-3" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>{toast}</p>}

      {data.available.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>Jouw leverancierscategorie heeft geen optionele dashboard-functies.</p>
      ) : (
        <div className="space-y-3">
          {data.available.map((key) => (
            <div key={key} className="flex items-start gap-3">
              <Switch checked={!isDisabled(key)} onChange={() => toggleModule(key)} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{MODULE_LABELS[key as ModuleKey] ?? key}</div>
                {data.extraModules.includes(key) && (
                  <div className="text-xs mt-0.5" style={{ color: "var(--gold-deep)" }}>Toegekend door DreamDay</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!data.isPremium && (
        <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>
          Je ziet hierboven de standaard functies voor jouw categorie. Wil je zelf functies aan- of uitzetten en extra
          functies aanvragen?{" "}
          <Link href={`/leveranciers/${data.vendorId}/bewerken`} style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Upgrade naar Premium
          </Link>.
        </p>
      )}

      {data.isPremium && (
        <div style={{ borderTop: "1px solid var(--border)", marginTop: "1.25rem", paddingTop: "1.25rem" }}>
          <h3 className="text-sm font-semibold mb-1">Extra functie aanvragen</h3>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
            Niet elke functie zit standaard in jouw dashboard. Vraag een functie aan en de admin beoordeelt je verzoek.
          </p>
          {requestableModules.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--muted)" }}>Je hebt al alle beschikbare functies.</p>
          ) : (
            <form onSubmit={submitRequest} className="space-y-2">
              <select
                value={requestModule}
                onChange={(e) => setRequestModule(e.target.value)}
                className="ddp-input"
                required
              >
                <option value="">Kies een functie…</option>
                {requestableModules.map((key) => (
                  <option key={key} value={key}>{MODULE_LABELS[key]}</option>
                ))}
              </select>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Waarom heb je deze functie nodig? (optioneel)"
                className="ddp-input"
                rows={2}
              />
              <button type="submit" disabled={requesting || !requestModule} className="ddp-btn-secondary">
                {requesting ? "Versturen…" : "Verzoek versturen"}
              </button>
            </form>
          )}

          {requests.length > 0 && (
            <div className="mt-4 space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 text-xs" style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{MODULE_LABELS[r.moduleKey as ModuleKey] ?? r.moduleKey}</span>
                  <span style={{ fontWeight: 700, color: r.status === "rejected" ? "var(--muted)" : "var(--gold-deep)" }}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {saving && <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>Opslaan…</p>}
    </div>
  );
}
