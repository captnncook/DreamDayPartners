"use client";

import { useState } from "react";
import { Phone, Edit2, Check, X } from "lucide-react";

type Contact = {
  name: string;
  role: string;
  phone: string;
  notes: string;
};

const EMPTY: Contact = { name: "", role: "", phone: "", notes: "" };

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

export default function DayOfContact({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const raw = intakeData.dayOfContact as Contact | undefined;
  const [contact, setContact] = useState<Contact>(raw ?? EMPTY);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Contact>(raw ?? EMPTY);

  const hasData = contact.name || contact.phone;

  function saveContact() {
    setContact(form);
    onUpdate({ dayOfContact: form });
    setEditing(false);
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", fontSize: "0.875rem", background: "white", color: "var(--foreground)" };

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <div>
            <h3 className="font-semibold text-sm">Noodcontact dag-van</h3>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "1px" }}>Aanspreekpunt op de trouwdag vanuit de locatie</p>
          </div>
        </div>
        {canEdit && !editing && (
          <button onClick={() => { setForm(contact); setEditing(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Naam contactpersoon *" style={inputStyle} />
            <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Functie (bv. locatiemanager)" style={inputStyle} />
          </div>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Telefoonnummer *" type="tel" style={inputStyle} />
          <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Extra info (optioneel)" style={inputStyle} />
          <div className="flex gap-2">
            <button onClick={saveContact} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", padding: "0.3rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem" }}>
              <Check className="w-3.5 h-3.5" /> Opslaan
            </button>
            <button onClick={() => setEditing(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : hasData ? (
        <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.875rem 1rem" }}>
          <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{contact.name}</div>
          {contact.role && <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "1px" }}>{contact.role}</div>}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.5rem", color: "var(--primary)", fontSize: "0.9375rem", fontWeight: 600, textDecoration: "none" }}>
              <Phone className="w-3.5 h-3.5" /> {contact.phone}
            </a>
          )}
          {contact.notes && <div style={{ fontSize: "0.8125rem", color: "var(--foreground)", marginTop: "0.375rem" }}>{contact.notes}</div>}
        </div>
      ) : (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>
          {canEdit ? "Voeg het noodcontact toe voor de trouwdag." : "Nog geen contactpersoon ingesteld."}
        </p>
      )}
    </div>
  );
}
