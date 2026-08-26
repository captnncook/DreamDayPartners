"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, Check, AlertCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { useLang } from "@/components/LangProvider";

// Toegestane categorieën (zelfde set als het bewerk-formulier)
const CATEGORIES = [
  "weddingplanner", "fotograaf", "videograaf", "bloemist", "catering", "bakker",
  "dj", "liveband", "ceremoniespreker", "trouwlocatie", "haarstylist", "vervoer",
  "decoratie", "fotocabine", "overig",
];

type ParsedVendor = {
  name: string; category: string; contactPerson: string; email: string;
  phone: string; website: string; city: string; description: string; isPremium: string;
  imageUrl: string;
};

// Header-aliassen → veldnaam
const HEADER_MAP: Record<string, keyof ParsedVendor> = {
  name: "name", naam: "name", bedrijf: "name", bedrijfsnaam: "name",
  category: "category", categorie: "category", type: "category",
  contactperson: "contactPerson", contactpersoon: "contactPerson", contact: "contactPerson",
  email: "email", "e-mail": "email", mail: "email",
  phone: "phone", telefoon: "phone", tel: "phone", telefoonnummer: "phone",
  website: "website", site: "website", url: "website",
  city: "city", stad: "city", plaats: "city", regio: "city",
  description: "description", beschrijving: "description", omschrijving: "description",
  ispremium: "isPremium", premium: "isPremium",
  foto: "imageUrl", afbeelding: "imageUrl", image: "imageUrl", photo: "imageUrl", imageurl: "imageUrl",
};

const TEMPLATE_HEADERS = ["naam", "categorie", "contactpersoon", "email", "telefoon", "website", "stad", "beschrijving", "premium", "foto"];
const TEMPLATE_EXAMPLE = [
  "Bloemenwinkel Roos", "bloemist", "Roos Janssen", "info@bloemenwinkelroos.nl",
  "06-12345678", "https://bloemenwinkelroos.nl", "Utrecht",
  "Boeketten en bruidsbloemen met een romantische, natuurlijke stijl.", "nee", "",
];

function downloadTemplate() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_EXAMPLE]);
  ws["!cols"] = TEMPLATE_HEADERS.map((h) => ({ wch: Math.max(14, h.length + 4) }));
  XLSX.utils.book_append_sheet(wb, ws, "Leveranciers");
  XLSX.writeFile(wb, "dreamday-leveranciers-import.xlsx");
}

function rowsToVendors(rows: string[][]): { vendors: ParsedVendor[]; unmapped: string[] } {
  if (rows.length === 0) return { vendors: [], unmapped: [] };
  const header = rows[0].map((h) => String(h ?? "").trim().toLowerCase());
  const fields = header.map((h) => HEADER_MAP[h]);
  const unmapped = header.filter((h, i) => h && !fields[i]);
  const empty: ParsedVendor = { name: "", category: "", contactPerson: "", email: "", phone: "", website: "", city: "", description: "", isPremium: "", imageUrl: "" };
  const vendors = rows.slice(1).map((cells) => {
    const v: ParsedVendor = { ...empty };
    fields.forEach((f, i) => { if (f) v[f] = String(cells[i] ?? "").trim(); });
    return v;
  });
  return { vendors, unmapped };
}

type Result = {
  created: number; skipped: number; total: number;
  errors: { row: number; reason: string }[];
  skippedRows: { row: number; name: string }[];
};

export default function BulkVendorImport() {
  const { t } = useLang();
  const tb = t.adminTools.bulkImport;
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [vendors, setVendors] = useState<ParsedVendor[]>([]);
  const [unmapped, setUnmapped] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const invalid = vendors.filter((v) => !v.name || !v.category || !CATEGORIES.includes(v.category));

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const wb = XLSX.read(reader.result, { type: "binary" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "", raw: false });
        const { vendors, unmapped } = rowsToVendors(rows.map((r) => r.map((c) => String(c ?? ""))));
        setVendors(vendors);
        setUnmapped(unmapped);
      } catch {
        setError(tb.fileReadError);
      }
    };
    reader.readAsBinaryString(file);
  }

  async function handleImport() {
    setImporting(true);
    setError("");
    const valid = vendors.filter((v) => v.name && v.category && CATEGORIES.includes(v.category));
    const res = await fetch("/api/catalogus/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendors: valid }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? tb.importFailed);
    } else {
      setResult(data);
      router.refresh();
    }
    setImporting(false);
  }

  function reset() {
    setVendors([]); setUnmapped([]); setFileName(""); setResult(null); setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" style={{ color: "var(--primary)" }} /> {tb.importTitle}
        </h2>
        {vendors.length > 0 && (
          <button onClick={reset} className="text-xs" style={{ color: "var(--muted)" }}>{tb.clearBtn}</button>
        )}
      </div>

      <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
        {tb.uploadNotePrefix} <code>naam</code>, <code>categorie</code> {tb.uploadNoteMiddle}
        <code>contactpersoon, email, telefoon, website, stad, beschrijving, premium, foto</code> {tb.uploadNoteSuffix}
      </p>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={downloadTemplate} className="ddp-btn-secondary inline-flex items-center gap-2">
          <Download className="w-4 h-4" /> {tb.downloadTemplateBtn}
        </button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={handleFile} />
        {vendors.length === 0 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="ddp-btn-primary inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> {tb.chooseFileBtn}
          </button>
        )}
      </div>

      {vendors.length > 0 && (
        <>
          <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>
            <strong>{fileName}</strong> · {tb.rowsReadLabel.replace("{n}", String(vendors.length))}
            {invalid.length > 0 && <span style={{ color: "#c00" }}> · {tb.invalidRowsLabel.replace("{n}", String(invalid.length))}</span>}
          </div>

          {unmapped.length > 0 && (
            <div className="flex items-start gap-2 text-xs mb-3 p-2 rounded-lg" style={{ background: "#fff8e1", color: "#8a6d00" }}>
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{tb.unmappedColumnsLabel.replace("{cols}", unmapped.join(", "))}</span>
            </div>
          )}

          <div className="ddp-card p-0 overflow-hidden mb-3" style={{ maxHeight: "260px", overflowY: "auto" }}>
            <table className="w-full">
              <thead><tr style={{ borderBottom: "1px solid var(--border)", background: "var(--background)", position: "sticky", top: 0 }}>
                {[tb.tableHeaders.name, tb.tableHeaders.category, tb.tableHeaders.city, tb.tableHeaders.email].map((h) => (
                  <th key={h} className="text-xs font-semibold text-left px-3 py-2" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {vendors.slice(0, 50).map((v, i) => {
                  const bad = !v.name || !v.category || !CATEGORIES.includes(v.category);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: bad ? "#fff5f5" : undefined }}>
                      <td className="px-3 py-1.5 text-sm">{v.name || <em style={{ color: "#c00" }}>{tb.emptyLabel}</em>}</td>
                      <td className="px-3 py-1.5 text-sm" style={{ color: CATEGORIES.includes(v.category) ? undefined : "#c00" }}>
                        {v.category || <em>{tb.emptyLabel}</em>}{v.category && !CATEGORIES.includes(v.category) ? ` ${tb.unknownSuffix}` : ""}
                      </td>
                      <td className="px-3 py-1.5 text-sm">{v.city}</td>
                      <td className="px-3 py-1.5 text-sm">{v.email}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {vendors.length > 50 && <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>{tb.moreRowsLabel.replace("{n}", String(vendors.length - 50))}</p>}

          <button
            onClick={handleImport}
            disabled={importing || vendors.length - invalid.length === 0}
            className="ddp-btn-primary inline-flex items-center gap-2"
            style={{ opacity: importing ? 0.7 : 1 }}
          >
            <Check className="w-4 h-4" />
            {importing ? tb.importingBtn : tb.importBtn.replace("{n}", String(vendors.length - invalid.length))}
          </button>
        </>
      )}

      {error && (
        <div className="mt-3 text-sm p-2 rounded-lg" style={{ background: "#fee", color: "#c00" }}>{error}</div>
      )}

      {result && (
        <div className="mt-3 text-sm p-3 rounded-lg" style={{ background: "#e8f5e9", color: "#1b5e20" }}>
          <strong>{result.created}</strong> {tb.createdLabel}
          {result.skipped > 0 && <> · {result.skipped} {tb.skippedLabel}</>}
          {result.errors.length > 0 && <> · {result.errors.length} {tb.errorsLabel}</>}
          {result.errors.length > 0 && (
            <ul className="mt-1 text-xs" style={{ color: "#c00" }}>
              {result.errors.slice(0, 10).map((e, i) => <li key={i}>{tb.rowErrorLabel.replace("{row}", String(e.row)).replace("{reason}", e.reason)}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
