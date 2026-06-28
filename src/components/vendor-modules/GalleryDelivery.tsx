"use client";

import { useState } from "react";
import { ImageIcon, ExternalLink } from "lucide-react";

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

export default function GalleryDelivery({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const [editing, setEditing] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState((intakeData.galleryDeliveryDate as string) ?? "");
  const [galleryLink, setGalleryLink] = useState((intakeData.galleryLink as string) ?? "");
  const [galleryNote, setGalleryNote] = useState((intakeData.galleryNote as string) ?? "");

  function save() {
    onUpdate({ galleryDeliveryDate: deliveryDate, galleryLink: galleryLink.trim(), galleryNote: galleryNote.trim() });
    setEditing(false);
  }

  const hasContent = deliveryDate || galleryLink || galleryNote;

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <h3 className="font-semibold text-sm">Galerij levering</h3>
        </div>
        {canEdit && (
          <button onClick={() => setEditing(!editing)} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
            {editing ? "Annuleren" : "Bewerken"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Verwachte leverdatum foto&apos;s</label>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Galerij-link (bijv. Pixieset, Google Foto&apos;s)</label>
            <input type="url" value={galleryLink} onChange={e => setGalleryLink(e.target.value)}
              placeholder="https://…" className="w-full border rounded-lg px-3 py-2 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Toelichting / wachtwoord</label>
            <input type="text" value={galleryNote} onChange={e => setGalleryNote(e.target.value)}
              placeholder="Bijv. wachtwoord: bruidspaar2026" className="w-full border rounded-lg px-3 py-2 text-sm bg-white" style={{ borderColor: "var(--border)" }} />
          </div>
          <button onClick={save} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
            Opslaan
          </button>
        </div>
      ) : !hasContent ? (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>
          {canEdit ? "Voeg een leverdatum en galerij-link toe zodra de foto's klaar zijn." : "Nog geen galerij beschikbaar."}
        </p>
      ) : (
        <div className="space-y-2">
          {deliveryDate && (
            <div className="flex justify-between text-sm" style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>Verwachte leverdatum</span>
              <span style={{ fontWeight: 600 }}>
                {new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(deliveryDate))}
              </span>
            </div>
          )}
          {galleryLink && (
            <div className="flex justify-between items-center text-sm" style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>Galerij</span>
              <a href={galleryLink} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                Bekijk galerij <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
          {galleryNote && (
            <div className="flex justify-between text-sm" style={{ padding: "0.5rem 0" }}>
              <span style={{ color: "var(--muted)" }}>Toelichting</span>
              <span>{galleryNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
