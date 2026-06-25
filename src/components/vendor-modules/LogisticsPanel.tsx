"use client";
import { useState } from "react";
import type { Field } from "@/lib/vendorTypeConfigs";

interface Props {
  fields: Field[];
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isPlanner: boolean;
}

export default function LogisticsPanel({ fields, intakeData, onUpdate, isPlanner }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>(intakeData ?? {});

  if (!fields || fields.length === 0) return null;

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
    fontSize: "0.875rem",
    background: "white",
    color: "var(--charcoal)",
  };

  function save() {
    onUpdate(form);
    setEditing(false);
  }

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Logistiek</h3>
        {isPlanner && (
          <button onClick={() => setEditing(!editing)} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
            {editing ? "Annuleren" : "Bewerken"}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {fields.map(field => {
          const value = form[field.key];
          if (editing) {
            return (
              <div key={field.key}>
                <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", display: "block" }}>{field.label}</label>
                {field.type === "boolean" ? (
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.checked }))}
                    />
                    <span style={{ fontSize: "0.875rem" }}>Ja</span>
                  </label>
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
          const display = value == null || value === "" ? <span style={{ color: "var(--muted)", fontStyle: "italic" }}>—</span>
            : typeof value === "boolean" ? (value ? "✓ Ja" : "✗ Nee")
            : String(value);
          return (
            <div key={field.key} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{field.label}</span>
              <span style={{ fontSize: "0.875rem", color: "var(--charcoal)" }}>{display}</span>
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
