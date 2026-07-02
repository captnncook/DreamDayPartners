"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";

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

// Eenvoudige CSV-parser met ondersteuning voor quotes, komma's en puntkomma's
function parseCSV(text: string): string[][] {
  text = text.replace(/^﻿/, ""); // BOM weg
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let field = "", row: string[] = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delimiter) { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); field = ""; row = []; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function rowsToVendors(rows: string[][]): { vendors: ParsedVendor[]; unmapped: string[] } {
  if (rows.length === 0) return { vendors: [], unmapped: [] };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const fields = header.map((h) => HEADER_MAP[h]);
  const unmapped = header.filter((h, i) => !fields[i]);
  const empty: ParsedVendor = { name: "", category: "", contactPerson: "", email: "", phone: "", website: "", city: "", description: "", isPremium: "", imageUrl: "" };
  const vendors = rows.slice(1).map((cells) => {
    const v: ParsedVendor = { ...empty };
    fields.forEach((f, i) => { if (f) v[f] = (cells[i] ?? "").trim(); });
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
      const { vendors, unmapped } = rowsToVendors(parseCSV(String(reader.result ?? "")));
      setVendors(vendors);
      setUnmapped(unmapped);
    };
    reader.readAsText(file);
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
      setError(data.error ?? "Import mislukt");
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
          <FileSpreadsheet className="w-4 h-4" style={{ color: "var(--primary)" }} /> Leveranciers importeren
        </h2>
        {vendors.length > 0 && (
          <button onClick={reset} className="text-xs" style={{ color: "var(--muted)" }}>Wissen</button>
        )}
      </div>

      <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
        Upload een CSV-bestand. Excel? Sla op als <strong>CSV (UTF-8)</strong>. Kolommen: <code>naam</code>, <code>categorie</code> (verplicht),
        en optioneel <code>contactpersoon, email, telefoon, website, stad, beschrijving, premium, foto</code> (link naar profielfoto). Maximaal 2000 rijen per upload.
      </p>

      <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={handleFile} />

      {vendors.length === 0 ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="ddp-btn-secondary inline-flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> CSV kiezen
        </button>
      ) : (
        <>
          <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>
            <strong>{fileName}</strong> · {vendors.length} rijen ingelezen
            {invalid.length > 0 && <span style={{ color: "#c00" }}> · {invalid.length} ongeldig (worden overgeslagen)</span>}
          </div>

          {unmapped.length > 0 && (
            <div className="flex items-start gap-2 text-xs mb-3 p-2 rounded-lg" style={{ background: "#fff8e1", color: "#8a6d00" }}>
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Niet-herkende kolommen genegeerd: {unmapped.join(", ")}</span>
            </div>
          )}

          <div className="ddp-card p-0 overflow-hidden mb-3" style={{ maxHeight: "260px", overflowY: "auto" }}>
            <table className="w-full">
              <thead><tr style={{ borderBottom: "1px solid var(--border)", background: "var(--background)", position: "sticky", top: 0 }}>
                {["Naam", "Categorie", "Stad", "Email"].map((h) => (
                  <th key={h} className="text-xs font-semibold text-left px-3 py-2" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {vendors.slice(0, 50).map((v, i) => {
                  const bad = !v.name || !v.category || !CATEGORIES.includes(v.category);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: bad ? "#fff5f5" : undefined }}>
                      <td className="px-3 py-1.5 text-sm">{v.name || <em style={{ color: "#c00" }}>leeg</em>}</td>
                      <td className="px-3 py-1.5 text-sm" style={{ color: CATEGORIES.includes(v.category) ? undefined : "#c00" }}>
                        {v.category || <em>leeg</em>}{v.category && !CATEGORIES.includes(v.category) ? " (onbekend)" : ""}
                      </td>
                      <td className="px-3 py-1.5 text-sm">{v.city}</td>
                      <td className="px-3 py-1.5 text-sm">{v.email}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {vendors.length > 50 && <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>… en {vendors.length - 50} meer</p>}

          <button
            onClick={handleImport}
            disabled={importing || vendors.length - invalid.length === 0}
            className="ddp-btn-primary inline-flex items-center gap-2"
            style={{ opacity: importing ? 0.7 : 1 }}
          >
            <Check className="w-4 h-4" />
            {importing ? "Importeren…" : `${vendors.length - invalid.length} leveranciers importeren`}
          </button>
        </>
      )}

      {error && (
        <div className="mt-3 text-sm p-2 rounded-lg" style={{ background: "#fee", color: "#c00" }}>{error}</div>
      )}

      {result && (
        <div className="mt-3 text-sm p-3 rounded-lg" style={{ background: "#e8f5e9", color: "#1b5e20" }}>
          <strong>{result.created}</strong> toegevoegd
          {result.skipped > 0 && <> · {result.skipped} overgeslagen (al aanwezig)</>}
          {result.errors.length > 0 && <> · {result.errors.length} fout</>}
          {result.errors.length > 0 && (
            <ul className="mt-1 text-xs" style={{ color: "#c00" }}>
              {result.errors.slice(0, 10).map((e, i) => <li key={i}>Rij {e.row}: {e.reason}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
