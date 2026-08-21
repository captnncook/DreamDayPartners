"use client";
import { useState } from "react";
import { Flag } from "lucide-react";
import type { Field } from "@/lib/vendorTypeConfigs";
import AddToCalendarButton from "@/components/AddToCalendarButton";

interface Props {
  weddingId: string;
  wvId: string;
  fields: Field[];
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isPlanner: boolean;
  isVendor: boolean;
  requiredKeys?: string[];
  onToggleRequired?: (key: string, next: boolean) => void;
}

export default function IntakeForm({ fields, intakeData, onUpdate, isPlanner, isVendor, requiredKeys = [], onToggleRequired }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>(intakeData ?? {});

  if (!fields || fields.length === 0) return null;

  const canEdit = isPlanner || isVendor;

  function save() {
    onUpdate(form);
    setEditing(false);
  }

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
    fontSize: "0.875rem",
    background: "white",
    color: "var(--charcoal)",
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Intake gegevens</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
            {isVendor
              ? "Zet een vlag bij een veld om er een taak van te maken bij het bruidspaar/de planner."
              : "Deze gegevens worden ingevuld door het bruidspaar of de planner."}
          </p>
        </div>
        {canEdit && (
          <button onClick={() => setEditing(!editing)} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
            {editing ? "Annuleren" : "Bewerken"}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {fields.map(field => {
          const value = form[field.key];
          if (editing) {
            return (
              <div key={field.key}>
                <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", display: "block" }}>
                  {field.label}{field.required && <span style={{ color: "var(--primary)" }}> *</span>}
                </label>
                {field.type === "longtext" ? (
                  <textarea
                    value={(value as string) ?? ""}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                    placeholder={field.placeholder}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={(value as string) ?? ""}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">Kies...</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : field.type === "boolean" ? (
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.checked }))}
                    />
                    <span style={{ fontSize: "0.875rem" }}>{field.label}</span>
                  </label>
                ) : field.type === "color-multi" ? (
                  <input
                    type="text"
                    value={(value as string) ?? ""}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    style={inputStyle}
                    placeholder={field.placeholder ?? "Bijv. blush, champagne, wit, groen"}
                  />
                ) : (
                  <input
                    type={field.type === "number" ? "number" : field.type === "time" ? "time" : field.type === "date" ? "date" : "text"}
                    value={(value as string) ?? ""}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    style={inputStyle}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            );
          }

          const display = value == null || value === "" ? <span style={{ color: "var(--muted)", fontStyle: "italic" }}>Niet ingevuld</span> :
            typeof value === "boolean" ? (value ? "Ja" : "Nee") :
            field.type === "date" ? new Date(String(value)).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) :
            String(value);
          const isRequired = requiredKeys.includes(field.key);

          return (
            <div key={field.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
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
                <span style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{field.label}</span>
              </span>
              <span style={{ fontSize: "0.875rem", color: "var(--charcoal)", textAlign: "right", display: "flex", alignItems: "center", gap: "0.625rem", justifyContent: "flex-end" }}>
                {display}
                {field.type === "date" && typeof value === "string" && value && (
                  <AddToCalendarButton title={field.label} date={value} />
                )}
              </span>
            </div>
          );
        })}
      </div>

      {editing && (
        <button onClick={save} style={{ marginTop: "1rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
          Opslaan
        </button>
      )}
    </div>
  );
}
