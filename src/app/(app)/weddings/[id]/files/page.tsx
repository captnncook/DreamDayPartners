"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Document = {
  id: string;
  name: string;
  fileKey: string;
  mimeType: string;
  fileSize: number;
  category: string;
  visibility: string;
  createdAt: string;
  uploader: { id: string; name: string; role: string };
};

const CATEGORIES = [
  { value: "all", label: "Alles" },
  { value: "inspiratie", label: "Inspiratie", icon: "🎨" },
  { value: "offerte", label: "Offertes", icon: "📋" },
  { value: "factuur", label: "Facturen", icon: "🧾" },
  { value: "contract", label: "Contracten", icon: "✍️" },
  { value: "overig", label: "Overig", icon: "📁" },
];

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
  return "📁";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export default function FilesPage() {
  const { id } = useParams<{ id: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({ name: "", category: "inspiratie" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/weddings/${id}/files`);
    const data = await res.json();
    setDocuments(data.documents ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!form.name) setForm((p) => ({ ...p, name: file.name.replace(/\.[^.]+$/, "") }));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", form.name || selectedFile.name);
    formData.append("category", form.category);

    setUploadProgress(40);

    try {
      const res = await fetch(`/api/weddings/${id}/files`, {
        method: "POST",
        body: formData,
      });
      setUploadProgress(90);
      const data = await res.json();
      if (data.document) {
        setDocuments((prev) => [data.document, ...prev]);
        setForm({ name: "", category: "inspiratie" });
        setSelectedFile(null);
        setShowUpload(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } finally {
      setUploadProgress(100);
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
    }
  }

  async function handleDownload(doc: Document) {
    const res = await fetch(`/api/weddings/${id}/files/${doc.id}`);
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`"${doc.name}" verwijderen?`)) return;
    await fetch(`/api/weddings/${id}/files/${doc.id}`, { method: "DELETE" });
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  }

  const filtered = documents.filter((d) => activeCategory === "all" || d.category === activeCategory);

  if (loading) return <div className="p-8" style={{ color: "var(--muted)" }}>Laden...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${id}`} className="text-sm hover:underline" style={{ color: "var(--muted)" }}>← Terug</Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-2xl font-bold">Bestanden</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Inspiratie, offertes, facturen en contracten</p>
          </div>
          <button onClick={() => setShowUpload(!showUpload)} className="ddp-btn-primary">
            {showUpload ? "Annuleren" : "+ Uploaden"}
          </button>
        </div>
      </div>

      {showUpload && (
        <form onSubmit={handleUpload} className="ddp-card mb-6">
          <h3 className="font-semibold mb-4">Bestand uploaden</h3>
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center mb-4 cursor-pointer transition-colors"
            style={{ borderColor: selectedFile ? "var(--primary)" : "var(--border)", background: selectedFile ? "var(--accent)" : undefined }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileSelect} />
            {selectedFile ? (
              <div>
                <div className="text-3xl mb-2">{fileIcon(selectedFile.type)}</div>
                <div className="font-medium text-sm">{selectedFile.name}</div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{formatSize(selectedFile.size)}</div>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-2">📂</div>
                <div className="text-sm font-medium">Klik om bestand te kiezen</div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>Afbeeldingen, PDF, Word, Excel — max 50 MB</div>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1">Naam</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Naam van het bestand"
                  className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Categorie</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
                  {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {uploading && (
            <div className="mb-4">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%`, background: "var(--primary)" }} />
              </div>
              <div className="text-xs mt-1 text-center" style={{ color: "var(--muted)" }}>Uploaden naar Cloudflare R2...</div>
            </div>
          )}

          <button type="submit" disabled={!selectedFile || uploading} className="ddp-btn-primary w-full">
            {uploading ? "Bezig met uploaden..." : "Bestand uploaden"}
          </button>
        </form>
      )}

      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: activeCategory === cat.value ? "var(--primary)" : "var(--accent)",
              color: activeCategory === cat.value ? "white" : "var(--foreground)",
            }}>
            {cat.icon && `${cat.icon} `}{cat.label}
            {cat.value === "all" ? ` (${documents.length})` : ` (${documents.filter((d) => d.category === cat.value).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="ddp-card text-center py-16" style={{ color: "var(--muted)" }}>
          <div className="text-4xl mb-3">📂</div>
          <h2 className="font-semibold text-lg mb-2">Nog geen bestanden</h2>
          <p className="text-sm mb-4">
            {activeCategory === "all"
              ? "Upload inspiratie, offertes, facturen of contracten"
              : `Geen ${CATEGORIES.find((c) => c.value === activeCategory)?.label.toLowerCase()} gevonden`}
          </p>
          <button onClick={() => setShowUpload(true)} className="ddp-btn-primary">Eerste bestand uploaden</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const catInfo = CATEGORIES.find((c) => c.value === doc.category);
            return (
              <div key={doc.id} className="ddp-card p-0 overflow-hidden">
                <div className="h-32 flex items-center justify-center text-5xl cursor-pointer"
                  style={{ background: "var(--accent)" }}
                  onClick={() => handleDownload(doc)}>
                  {fileIcon(doc.mimeType)}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium truncate mb-1" title={doc.name}>{doc.name}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="ddp-badge badge-neutral" style={{ fontSize: "0.65rem" }}>
                      {catInfo?.icon} {catInfo?.label ?? doc.category}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{formatSize(doc.fileSize)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      <div>{doc.uploader.name}</div>
                      <div>{formatDate(doc.createdAt)}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDownload(doc)}
                        className="text-xs px-2 py-1 rounded-md hover:opacity-80"
                        style={{ background: "var(--accent)", color: "var(--primary)" }}>↓</button>
                      <button onClick={() => handleDelete(doc)}
                        className="text-xs px-2 py-1 rounded-md hover:opacity-80"
                        style={{ background: "#fde8e8", color: "var(--danger)" }}>✕</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
