"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, ExternalLink, Upload, X, Image as ImageIcon } from "lucide-react";

interface MoodboardPhoto {
  id: string;
  fileKey: string;
}

function MoodboardPhotoCard({ photo, onRemove, canEdit }: { photo: MoodboardPhoto; onRemove: () => void; canEdit: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/files/url?key=${encodeURIComponent(photo.fileKey)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.url && setSrc(d.url))
      .catch(() => {});
  }, [photo.fileKey]);

  return (
    <div style={{ position: "relative", aspectRatio: "1", borderRadius: "0.5rem", overflow: "hidden", background: "var(--color-blush-soft, #f0ebe8)" }}>
      {src
        ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><ImageIcon size={18} style={{ color: "var(--muted)" }} /></div>
      }
      {canEdit && (
        <button onClick={onRemove} type="button"
          style={{ position: "absolute", top: "0.25rem", right: "0.25rem", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "9999px", color: "white", cursor: "pointer", padding: "0.125rem", display: "flex" }}>
          <X size={12} />
        </button>
      )}
    </div>
  );
}

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner?: boolean;
  weddingId: string;
  editorName?: string;
  editorIsVendor?: boolean;
}

export default function MoodboardUploader({ intakeData, onUpdate, isVendor, isPlanner, weddingId, editorName, editorIsVendor }: Props) {
  const canEdit = isVendor || isPlanner;
  const moodboardUrl = intakeData?.moodboardUrl as string | undefined;
  const moodboardNotes = intakeData?.moodboardNotes as string | undefined;
  const moodboardEditedBy = intakeData?.moodboardEditedBy as string | undefined;
  const photos: MoodboardPhoto[] = Array.isArray(intakeData?.moodboardPhotos) ? (intakeData.moodboardPhotos as MoodboardPhoto[]) : [];
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(moodboardUrl ?? "");
  const [notes, setNotes] = useState(moodboardNotes ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Zonder attributie kon niet gezien worden of het bruidspaar of de
  // leverancier het moodboard had gevuld — nu vastgelegd bij elke wijziging.
  const editorLabel = editorName?.trim() || (editorIsVendor ? "de leverancier" : "het bruidspaar");

  function save() {
    onUpdate({ moodboardUrl: url.trim(), moodboardNotes: notes.trim(), moodboardEditedBy: editorLabel });
    setEditing(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("weddingId", weddingId);
    formData.append("category", "moodboard-photo");
    try {
      const res = await fetch(`/api/weddings/${weddingId}/files`, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Upload mislukt");
        return;
      }
      const { document: uploaded } = await res.json();
      onUpdate({ moodboardPhotos: [...photos, { id: uploaded.id, fileKey: uploaded.fileKey }], moodboardEditedBy: editorLabel });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removePhoto(id: string) {
    if (!confirm("Foto verwijderen?")) return;
    onUpdate({ moodboardPhotos: photos.filter(p => p.id !== id) });
  }

  const hasContent = moodboardUrl || moodboardNotes || photos.length > 0;

  return (
    <div className="ddp-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Palette className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Moodboard & Stijl</h3>
        </div>
        {canEdit && (
          <button onClick={() => setEditing(!editing)} style={{ fontSize: "var(--text-base)", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
            {editing ? "Annuleren" : hasContent ? "Bewerken" : "Toevoegen"}
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <div>
            <label style={{ fontSize: "var(--text-sm)", color: "var(--muted)", display: "block", marginBottom: "var(--space-1)" }}>
              Link naar moodboard (Pinterest, Canva, Google Foto&apos;s…)
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.pinterest.com/…"
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", fontSize: "var(--text-md)", background: "white", color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "var(--text-sm)", color: "var(--muted)", display: "block", marginBottom: "var(--space-1)" }}>
              Notities / stijlomschrijving
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Bijv. romantisch, luchtig, veel bloemen, blush tinten…"
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", fontSize: "var(--text-md)", background: "white", color: "var(--foreground)", resize: "vertical" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "var(--text-sm)", color: "var(--muted)", display: "block", marginBottom: "var(--space-2)" }}>
              Losse foto&apos;s
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
              {photos.map(p => (
                <MoodboardPhotoCard key={p.id} photo={p} canEdit onRemove={() => removePhoto(p.id)} />
              ))}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", padding: "0.375rem 0.875rem", borderRadius: "0.5rem", background: "var(--surface-2, #f5f3ee)", color: "var(--primary)", border: "1px solid var(--border)", cursor: "pointer", fontSize: "var(--text-base)", fontWeight: 600 }}>
              <Upload size={14} /> {uploading ? "Uploaden…" : "Foto uploaden"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
          </div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>
            Wordt ingevuld door het bruidspaar of de planner, ter voorbereiding voor deze leverancier.
          </p>
          <button
            onClick={save}
            style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "var(--text-md)", fontWeight: 600, width: "fit-content" }}
          >
            Opslaan
          </button>
        </div>
      ) : hasContent ? (
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          {photos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "var(--space-3)" }}>
              {photos.map(p => (
                <MoodboardPhotoCard key={p.id} photo={p} canEdit={false} onRemove={() => {}} />
              ))}
            </div>
          )}
          {moodboardUrl && (
            <a href={moodboardUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-md)", color: "var(--primary)", fontWeight: 600 }}>
              <ExternalLink className="w-4 h-4" /> Moodboard bekijken
            </a>
          )}
          {moodboardNotes && (
            <p style={{ fontSize: "var(--text-md)", color: "var(--foreground)", lineHeight: 1.6, background: "var(--color-blush-soft)", padding: "0.75rem", borderRadius: "0.5rem", margin: 0 }}>
              {moodboardNotes}
            </p>
          )}
          {moodboardEditedBy && (
            <p style={{ fontSize: "var(--text-xs)", color: "var(--muted)", margin: 0 }}>Ingevuld door {moodboardEditedBy}</p>
          )}
        </div>
      ) : (
        <p style={{ fontSize: "var(--text-md)", color: "var(--muted)", fontStyle: "italic" }}>
          {canEdit
            ? "Voeg een moodboard-link of stijlomschrijving toe als referentie voor de sessie."
            : "Nog geen moodboard gedeeld."}
        </p>
      )}
    </div>
  );
}
