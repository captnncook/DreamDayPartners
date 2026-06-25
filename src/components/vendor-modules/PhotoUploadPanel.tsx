"use client";
import { useState, useRef } from "react";
import { Upload, X, Camera } from "lucide-react";

const CATEGORIES = [
  { key: "bruidsboeket", label: "Bruidsboeket" },
  { key: "corsages", label: "Corsages" },
  { key: "ceremonie", label: "Ceremonie" },
  { key: "diner", label: "Diner" },
  { key: "overig", label: "Overig" },
];

interface Photo {
  id: string;
  url: string;
  category: string;
  caption: string;
}

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
  weddingId: string;
  wvId: string;
}

export default function PhotoUploadPanel({ intakeData, onUpdate, isVendor, isPlanner, weddingId, wvId }: Props) {
  const photos: Photo[] = Array.isArray(intakeData["photos"]) ? (intakeData["photos"] as Photo[]) : [];
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("bruidsboeket");
  const fileRef = useRef<HTMLInputElement>(null);

  const canEdit = isVendor || isPlanner;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("weddingId", weddingId);
    formData.append("category", "vendor-photo");

    try {
      const res = await fetch(`/api/weddings/${weddingId}/files`, { method: "POST", body: formData });
      if (res.ok) {
        const { file: uploaded } = await res.json();
        const newPhoto: Photo = {
          id: uploaded.id,
          url: uploaded.fileKey,
          category: selectedCategory,
          caption: "",
        };
        onUpdate({ photos: [...photos, newPhoto] });
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function updateCaption(id: string, caption: string) {
    onUpdate({ photos: photos.map(p => p.id === id ? { ...p, caption } : p) });
  }

  function updateCategory(id: string, category: string) {
    onUpdate({ photos: photos.map(p => p.id === id ? { ...p, category } : p) });
  }

  function removePhoto(id: string) {
    if (!confirm("Foto verwijderen?")) return;
    onUpdate({ photos: photos.filter(p => p.id !== id) });
  }

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    photos: photos.filter(p => p.category === cat.key),
  })).filter(g => g.photos.length > 0 || canEdit);

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <Camera className="inline w-4 h-4 mr-1" style={{ verticalAlign: "middle" }} />
          Foto&apos;s
        </h3>
      </div>

      {canEdit && (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: "0.375rem 0.625rem", borderRadius: "0.375rem", border: "1px solid var(--border)", fontSize: "0.875rem", background: "white" }}
          >
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.875rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}
          >
            <Upload size={14} />
            {uploading ? "Uploaden..." : "Foto uploaden"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
        </div>
      )}

      {photos.length === 0 && (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>Nog geen foto&apos;s geüpload.</p>
      )}

      {CATEGORIES.filter(c => photos.some(p => p.category === c.key)).map(cat => (
        <div key={cat.key} style={{ marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            {cat.label}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.625rem" }}>
            {photos.filter(p => p.category === cat.key).map(photo => (
              <div key={photo.id} style={{ borderRadius: "0.625rem", overflow: "hidden", border: "1px solid var(--border)", background: "var(--blush-soft)" }}>
                <div style={{ position: "relative", aspectRatio: "1", background: "#f0ebe8" }}>
                  {/* Toon filename als placeholder — echte signed URL vereist aparte fetch */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", padding: "0.5rem" }}>
                    📷 {photo.url.split("/").pop()}
                  </div>
                  {canEdit && (
                    <button onClick={() => removePhoto(photo.id)}
                      style={{ position: "absolute", top: "0.25rem", right: "0.25rem", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "9999px", color: "white", cursor: "pointer", padding: "0.125rem", display: "flex" }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div style={{ padding: "0.375rem" }}>
                  {canEdit ? (
                    <>
                      <select
                        value={photo.category}
                        onChange={e => updateCategory(photo.id, e.target.value)}
                        style={{ width: "100%", fontSize: "0.6875rem", padding: "0.2rem", borderRadius: "0.25rem", border: "1px solid var(--border)", background: "white", marginBottom: "0.25rem" }}
                      >
                        {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                      <input
                        placeholder="Opmerking..."
                        value={photo.caption}
                        onChange={e => updateCaption(photo.id, e.target.value)}
                        onBlur={() => onUpdate({ photos })}
                        style={{ width: "100%", fontSize: "0.6875rem", padding: "0.2rem 0.375rem", borderRadius: "0.25rem", border: "1px solid var(--border)", background: "white", boxSizing: "border-box" }}
                      />
                    </>
                  ) : photo.caption ? (
                    <p style={{ fontSize: "0.6875rem", color: "var(--muted)" }}>{photo.caption}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
