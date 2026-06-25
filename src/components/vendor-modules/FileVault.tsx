"use client";

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
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

const CATEGORY_LABELS: Record<string, string> = {
  offerte: "Offerte",
  factuur: "Factuur",
  contract: "Contract",
  inspiratie: "Inspiratie",
  overig: "Overig",
};

export default function FileVault({ documents, weddingId }: Props) {
  if (documents.length === 0) {
    return (
      <div className="card" style={{ padding: "1.5rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bestanden</h3>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>Nog geen bestanden gedeeld.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bestanden</h3>
        <a href={`/weddings/${weddingId}/documenten`} style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none" }}>Alle documenten →</a>
      </div>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {documents.map(doc => (
          <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.625rem 0.75rem", background: "var(--blush-soft)", borderRadius: "0.5rem" }}>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--charcoal)" }}>{doc.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                {CATEGORY_LABELS[doc.category] ?? doc.category} · {fmtSize(doc.fileSize)}
              </div>
            </div>
            <a
              href={`/api/documents/${doc.id}/download`}
              style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none" }}
            >
              ↓
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
