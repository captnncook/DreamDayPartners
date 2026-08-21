"use client";
import { useState } from "react";
import { Flag } from "lucide-react";
import type { Field } from "@/lib/vendorTypeConfigs";

interface Props {
  fields: Field[];
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isPlanner: boolean;
  isVendor?: boolean;
  requiredKeys?: string[];
  onToggleRequired?: (key: string, next: boolean) => void;
  // Toon een onderliggende standaardwaarde (bijv. uit het eigen profiel)
  // i.p.v. kaal "Niet ingevuld" als een per-bruiloft veld leeg is.
  defaults?: Record<string, string | undefined>;
}

export default function LogisticsPanel({ fields, intakeData, onUpdate, isPlanner, isVendor, requiredKeys = [], onToggleRequired, defaults }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>(intakeData ?? {});

  if (!fields || fields.length === 0) return null;

  const canEdit = isPlanner || isVendor;

  const inputStyle = {
    width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem",
    border: "1px solid var(--border)", fontSize: "var(--text-md)", background: "white", color: "var(--foreground)",
  };

  function save() {
    onUpdate(form);
    setEditing(false);
  }

  return (
    <div className="ddp-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Logistiek</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--muted)", marginTop: "2px" }}>
            {isVendor
              ? "Zet een vlag bij een veld om er een taak van te maken bij het bruidspaar/de planner."
              : "Wordt ingevuld door het bruidspaar of de planner."}
          </p>
        </div>
        {canEdit && (
          <button onClick={() => setEditing(!editing)} style={{ fontSize: "var(--text-base)", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
            {editing ? "Annuleren" : "Bewerken"}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gap: "var(--space-5)" }}>
        {fields.map(field => {
          const value = form[field.key];
          if (editing) {
            return (
              <div key={field.key}>
                <label style={{ fontSize: "var(--text-sm)", color: "var(--muted)", marginBottom: "var(--space-1)", display: "block" }}>{field.label}</label>
                {field.type === "boolean" ? (
                  <select
                    value={value === true ? "ja" : value === false ? "nee" : ""}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value === "ja" ? true : e.target.value === "nee" ? false : null }))}
                    style={inputStyle}
                  >
                    <option value="">Kies...</option>
                    <option value="ja">Ja</option>
                    <option value="nee">Nee</option>
                  </select>
                ) : field.type === "select" ? (
                  <select value={(value as string) ?? ""} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} style={inputStyle}>
                    <option value="">Kies...</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : field.type === "time" ? "time" : "text"}
                    value={(value as string) ?? ""}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    style={inputStyle}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            );
          }

          const fallback = defaults?.[field.key];
          const display = value == null || value === ""
            ? fallback
              ? <span style={{ color: "var(--muted)", fontStyle: "italic" }}>{fallback}</span>
              : <span style={{ color: "var(--muted)", fontStyle: "italic" }}>Niet ingevuld</span>
            : typeof value === "boolean"
            ? (value ? "Ja" : "Nee")
            : String(value);

          const isRequired = requiredKeys.includes(field.key);

          return (
            <div key={field.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-6)", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0 }}>
                {isVendor && onToggleRequired && (
                  <button
                    type="button"
                    onClick={() => onToggleRequired(field.key, !isRequired)}
                    title={isRequired ? "Zet niet meer als taak bij bruidspaar/planner" : "Zet als taak bij bruidspaar/planner"}
                    aria-label={isRequired ? `${field.label}: niet meer als taak zetten` : `${field.label}: als taak zetten bij bruidspaar/planner`}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                  >
                    <Flag className="w-3.5 h-3.5" style={{ color: isRequired ? "var(--gold-deep)" : "var(--muted-light)", fill: isRequired ? "var(--gold-deep)" : "none" }} />
                  </button>
                )}
                <span style={{ fontSize: "var(--text-md)", color: "var(--muted)" }}>{field.label}</span>
              </span>
              <span style={{ fontSize: "var(--text-md)", color: "var(--foreground)", textAlign: "right" }}>{display}</span>
            </div>
          );
        })}
      </div>

      {editing && (
        <button onClick={save} style={{ marginTop: "var(--space-6)", padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "var(--text-md)", fontWeight: 600 }}>
          Opslaan
        </button>
      )}
    </div>
  );
}
