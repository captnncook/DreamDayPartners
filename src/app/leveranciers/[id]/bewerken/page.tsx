"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload, Trash2, Save, Check } from "lucide-react";

const CATEGORIES = [
  { value: "weddingplanner", label: "Weddingplanner" },
  { value: "fotograaf", label: "Fotograaf" },
  { value: "videograaf", label: "Videograaf" },
  { value: "bloemist", label: "Bloemist" },
  { value: "catering", label: "Catering" },
  { value: "bakker", label: "Bruidstaart & Bakker" },
  { value: "dj", label: "DJ" },
  { value: "liveband", label: "Liveband & Muziek" },
  { value: "ceremoniespreker", label: "Ceremoniespreker" },
  { value: "trouwlocatie", label: "Trouwlocatie" },
  { value: "haarstylist", label: "Haar & Make-up" },
  { value: "vervoer", label: "Vervoer" },
  { value: "decoratie", label: "Decoratie & Styling" },
  { value: "fotocabine", label: "Fotocabine" },
  { value: "overig", label: "Overig" },
];

type Vendor = {
  id: string; name: string; category: string; contactPerson?: string;
  email?: string; phone?: string; website?: string; description?: string;
  isPremium: boolean; photos: string[]; city?: string; userId?: string;
};

export default function VendorEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoKeys, setPhotoKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    description: "", city: "", contactPerson: "", phone: "", website: "",
  });

  const load = useCallback(async () => {
    const [vRes, meRes] = await Promise.all([
      fetch(`/api/catalogus/${id}`),
      fetch("/api/auth/me"),
    ]);
    const vData = await vRes.json();
    const meData = await meRes.json();

    if (!vData.vendor) { router.push("/leveranciers"); return; }
    if (!meData.user || meData.user.id !== vData.vendor.userId) {
      router.push(`/leveranciers/${id}`);
      return;
    }

    const v = vData.vendor;
    setVendor(v);
    setForm({
      description: v.description ?? "",
      city: v.city ?? "",
      contactPerson: v.contactPerson ?? "",
      phone: v.phone ?? "",
      website: v.website ?? "",
    });

    const photosRes = await fetch(`/api/catalogus/${id}/signed-photos`);
    const pData = await photosRes.json();
    setPhotoUrls(pData.urls ?? []);
    setPhotoKeys(v.photos ?? []);

    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/catalogus/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Opslaan mislukt");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/catalogus/${id}/photos`, { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Upload mislukt");
    } else {
      setPhotoUrls(data.photos ?? []);
      setPhotoKeys(data.keys ?? []);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDeletePhoto(key: string, idx: number) {
    const res = await fetch(`/api/catalogus/${id}/photos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (res.ok) {
      const newUrls = photoUrls.filter((_, i) => i !== idx);
      const newKeys = photoKeys.filter((k) => k !== key);
      setPhotoUrls(newUrls);
      setPhotoKeys(newKeys);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <p style={{ color: "var(--muted)" }}>Laden…</p>
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7", color: "var(--foreground)" }}>
      <div style={{ background: "var(--foreground)", padding: "1.25rem 1.25rem 2rem" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <Link
            href={`/leveranciers/${id}`}
            className="inline-flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "1.5rem", display: "inline-flex" }}
          >
            <ArrowLeft className="w-4 h-4" /> Terug naar profiel
          </Link>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.04em", color: "white" }}>
            Profiel bewerken
          </h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>{vendor.name}</p>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "1.5rem auto", padding: "0 1.25rem 3rem" }}>
        {error && (
          <div style={{ background: "#fee", border: "1px solid #fcc", borderRadius: "12px", padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#c00", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* Foto's */}
        <section style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>Foto&apos;s</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {photoUrls.map((url, i) => (
              <div key={i} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "4/3" }}>
                <Image src={url} alt={`Foto ${i + 1}`} fill style={{ objectFit: "cover" }} />
                <button
                  onClick={() => handleDeletePhoto(photoKeys[i], i)}
                  style={{
                    position: "absolute", top: "6px", right: "6px",
                    background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "6px",
                    padding: "4px", cursor: "pointer", display: "flex",
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" style={{ color: "white" }} />
                </button>
              </div>
            ))}

            {photoUrls.length < 6 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  aspectRatio: "4/3",
                  border: "2px dashed rgba(0,0,0,0.15)",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  background: "none",
                  color: "var(--muted)",
                  fontSize: "0.8125rem",
                }}
              >
                <Upload className="w-5 h-5" />
                {uploading ? "Uploaden…" : "Foto toevoegen"}
              </button>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
          <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Max 6 foto&apos;s · Max 10 MB per foto</p>
        </section>

        {/* Tekst & info */}
        <section style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>Informatie</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: "0.375rem" }}>
                Over ons / beschrijving
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
                placeholder="Schrijf een beschrijving over jullie diensten, aanpak en wat jullie uniek maakt…"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  resize: "vertical",
                  outline: "none",
                  lineHeight: 1.6,
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "city", label: "Stad / regio", placeholder: "bijv. Amsterdam" },
                { key: "contactPerson", label: "Contactpersoon", placeholder: "Voornaam achternaam" },
                { key: "phone", label: "Telefoonnummer", placeholder: "+31 6 12345678" },
                { key: "website", label: "Website", placeholder: "https://www.example.nl" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: "0.375rem" }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: "10px",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex gap-3 justify-end">
          <Link href={`/leveranciers/${id}`} className="ddp-btn-secondary">
            Annuleren
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="ddp-btn-primary inline-flex items-center gap-2"
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saved ? <><Check className="w-4 h-4" /> Opgeslagen!</> : <><Save className="w-4 h-4" /> {saving ? "Opslaan…" : "Opslaan"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
