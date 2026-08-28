"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useLang } from "@/components/LangProvider";

type StorageRow = {
  weddingId: string;
  title: string;
  weddingCode: string;
  fileCount: number;
  bytes: number;
  sizeLabel: string;
  share: number;
};

type DocRow = {
  id: string;
  name: string;
  category: string;
  visibility: string;
  mimeType: string;
  fileSizeLabel: string;
  createdAt: string;
  wedding: { id: string; title: string; weddingCode: string };
  uploaderName: string;
  url: string | null;
};

export default function DocumentsClient() {
  const { t } = useLang();
  const ad = t.adminDocuments;
  const categories = t.files.categories;
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [showStorage, setShowStorage] = useState(false);
  const [storage, setStorage] = useState<{ totalLabel: string; totalFiles: number; perWedding: StorageRow[] } | null>(null);
  const [storageLoading, setStorageLoading] = useState(false);

  useEffect(() => {
    if (!showStorage || storage) return;
    setStorageLoading(true);
    fetch("/api/admin/storage")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStorage(d))
      .finally(() => setStorageLoading(false));
  }, [showStorage, storage]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const res = await fetch(`/api/admin/documents?${params}`);
    const data = await res.json();
    setDocs(data.documents ?? []);
    setLoading(false);
  }, [q, category]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const visibilityLabel: Record<string, string> = {
    team: ad.visibilityTeam, couple: ad.visibilityCouple, vendor: ad.visibilityVendor, private: ad.visibilityPrivate,
  };
  const categoryLabel: Record<string, string> = {
    inspiratie: categories.inspiratie, offerte: categories.offerte, factuur: categories.factuur,
    contract: categories.contract, overig: categories.overig,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{ad.pageTitle}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{ad.subtitle}</p>
        </div>
        <button onClick={() => setShowStorage((s) => !s)} className="ddp-btn-secondary text-sm" style={{ padding: "0.5rem 1rem" }}>
          {showStorage ? ad.storageToggleHide : ad.storageToggleShow}
        </button>
      </div>

      {showStorage && (
        <div className="mb-8">
          <h2 className="dash-section-title mb-1">{ad.storageTitle}</h2>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>{ad.storageSubtitle}</p>
          {storageLoading || !storage ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>{ad.loading}</p>
          ) : storage.perWedding.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>{ad.storageEmpty}</p>
          ) : (
            <>
              <p className="text-sm mb-3" style={{ color: "var(--foreground)", fontWeight: 600 }}>
                {ad.storageTotal.replace("{size}", storage.totalLabel).replace("{count}", String(storage.totalFiles))}
              </p>
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {storage.perWedding.map((w) => (
                  <div key={w.weddingId} className="dash-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.375rem" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-serif text-sm truncate" style={{ fontWeight: 700 }}>{w.title}</span>
                        <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>{w.weddingCode}</span>
                      </div>
                      <div className="text-xs flex-shrink-0 text-right" style={{ color: "var(--foreground)", fontWeight: 600 }}>
                        {w.sizeLabel}
                        <span className="block" style={{ color: "var(--muted)", fontWeight: 400 }}>
                          {ad.storageFileCount.replace("{n}", String(w.fileCount))}
                        </span>
                      </div>
                    </div>
                    <div style={{ height: "3px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.max(2, w.share * 100)}%`, background: "var(--gold)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="ddp-search flex-1" style={{ minWidth: "220px" }}>
          <Search />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={ad.searchPlaceholder} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="ddp-input" style={{ width: "200px" }}>
          <option value="">{ad.allCategories}</option>
          {Object.entries(categoryLabel).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>{ad.loading}</p>
      ) : docs.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>{ad.empty}</p>
      ) : (
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
          <table className="w-full text-sm" style={{ minWidth: "780px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
                {[ad.tableHeaders.name, ad.tableHeaders.wedding, ad.tableHeaders.category, ad.tableHeaders.uploader, ad.tableHeaders.size, ad.tableHeaders.date].map((h) => (
                  <th key={h} className="text-xs font-semibold text-left px-4 py-3" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-4 py-3 font-medium">
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" title={ad.downloadTooltip} style={{ color: "var(--primary)" }}>
                        {d.name}
                      </a>
                    ) : d.name}
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted-light)" }}>{visibilityLabel[d.visibility] ?? d.visibility}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/weddings/${d.wedding.id}/files`} style={{ color: "var(--foreground)", textDecoration: "none" }}>
                      {d.wedding.title}
                    </Link>
                    <div className="text-xs" style={{ color: "var(--muted-light)" }}>{d.wedding.weddingCode}</div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{categoryLabel[d.category] ?? d.category}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{d.uploaderName}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{d.fileSizeLabel}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{new Date(d.createdAt).toLocaleDateString("nl-NL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
