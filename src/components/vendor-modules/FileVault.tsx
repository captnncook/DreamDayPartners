"use client";
import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";

interface Doc {
  id: string;
  name: string;
  fileKey: string;
  mimeType: string;
  fileSize: number;
  category: string;
  createdAt: string;
}

interface Props {
  documents: Doc[];
  weddingId: string;
  wvId: string;
  isPlanner?: boolean;
  isVendor?: boolean;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

const CATEGORIES = [
  { key: "offerte", label: "Offerte" },
  { key: "factuur", label: "Factuur" },
  { key: "contract", label: "Contract" },
  { key: "moodboard", label: "Moodboard" },
  { key: "inspiratie", label: "Inspiratie" },
  { key: "overig", label: "Overig" },
];

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.key, c.label]));


export default function FileVault({ documents: initial, weddingId, isPlanner, isVendor }: Props) {
  const [docs, setDocs] = useState<Doc[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("offerte");
  const fileRef = useRef<HTMLInputElement>(null);

  const canUpload = isPlanner || isVendor;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("weddingId", weddingId);
    formData.append("category", selectedCategory);
    formData.append("name", file.name);

    try {
      const res = await fetch(`/api/weddings/${weddingId}/files`, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Upload mislukt");
        return;
      }
      const { document: uploaded } = await res.json();
      setDocs(prev => [uploaded, ...prev]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bestand verwijderen?")) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) setDocs(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <FileText className="inline w-4 h-4 mr-1" style={{ verticalAlign: "middle" }} />
          Bestanden
        </h3>
        <a href={`/weddings/${weddingId}/documenten`} style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none" }}>Alles →</a>
      </div>

      {canUpload && (
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
            {uploading ? "Uploaden..." : "Bestand uploaden"}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip" onChange={handleUpload} style={{ display: "none" }} />
        </div>
      )}

      {docs.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>Nog geen bestanden gedeeld.</p>
      ) : (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {docs.map(doc => (
            <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.625rem 0.75rem", background: "var(--blush-soft)", borderRadius: "0.5rem", gap: "0.75rem" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--charcoal)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {doc.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {CATEGORY_LABELS[doc.category] ?? doc.category} · {fmtSize(doc.fileSize)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                <a
                  href={`/api/documents/${doc.id}/download`}
                  style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}
                >
                  ↓
                </a>
                {canUpload && (
                  <button onClick={() => handleDelete(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", padding: "2px" }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
