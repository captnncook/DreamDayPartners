"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

type Vendor = { id: string; name: string; category: string; email?: string; phone?: string; contactPerson?: string; website?: string };
type WeddingVendor = { id: string; status: string; portalAccess: boolean; notes?: string; vendor: Vendor };
type Document = { id: string; name: string; fileKey: string; mimeType: string; fileSize: number; category: string; createdAt: string; uploader: { name: string } };
type ScheduleItem = { id: string; startTime: string; duration: number; title: string; location?: string; notes?: string; draaiboek: { id: string; title: string; version: string } };
type Draaiboek = { id: string; title: string; version: string };

const VENDOR_ICONS: Record<string, string> = {
  bloemist: "🌸", dj: "🎵", catering: "🍽️", fotograaf: "📷",
  locatie: "🏰", muziek: "🎶", video: "🎬", transport: "🚗", haar_make: "💄",
};

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function diffMinutes(from: string, to: string): number {
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  return Math.max(5, th * 60 + tm - (fh * 60 + fm));
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}u ${m}min` : `${h}u`;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return "🖼️";
  if (mime === "application/pdf") return "📄";
  return "📁";
}

export default function VendorDetailPage() {
  const { id, weddingVendorId } = useParams<{ id: string; weddingVendorId: string }>();
  const { t } = useLang();
  const vd = t.vendorDetail;

  const [wv, setWv] = useState<WeddingVendor | null>(null);
  const [files, setFiles] = useState<Document[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [draaiboeken, setDraaiboeken] = useState<Draaiboek[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inspiration" | "schedule">("inspiration");

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Schedule form state
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ draaiboekId: "", startTime: "09:00", endTime: "09:30", title: "", location: "", notes: "" });
  const [savingSchedule, setSavingSchedule] = useState(false);

  const load = useCallback(async () => {
    const [wvRes, filesRes, schedRes] = await Promise.all([
      fetch(`/api/weddings/${id}/vendors/${weddingVendorId}`),
      fetch(`/api/weddings/${id}/files`),
      fetch(`/api/weddings/${id}/vendors/${weddingVendorId}/schedule`),
    ]);
    const [wvData, filesData, schedData] = await Promise.all([wvRes.json(), filesRes.json(), schedRes.json()]);
    setWv(wvData.weddingVendor ?? null);
    setFiles((filesData.documents ?? []).filter((d: Document) => d.category === "inspiratie"));
    setSchedule(schedData.items ?? []);
    setDraaiboeken(schedData.draaiboeken ?? []);
    if (schedData.draaiboeken?.[0]) {
      setScheduleForm((p) => ({ ...p, draaiboekId: schedData.draaiboeken[0].id }));
    }
    setLoading(false);
  }, [id, weddingVendorId]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("name", uploadName || selectedFile.name);
    fd.append("category", "inspiratie");
    try {
      const res = await fetch(`/api/weddings/${id}/files`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.document) {
        setFiles((prev) => [data.document, ...prev]);
        setSelectedFile(null);
        setUploadName("");
        setShowUpload(false);
      } else {
        setUploadError(data.error ?? "Upload mislukt");
      }
    } catch {
      setUploadError("Netwerkfout — probeer opnieuw");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteFile(fileId: string) {
    if (!confirm("Bestand verwijderen?")) return;
    await fetch(`/api/weddings/${id}/files/${fileId}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }

  async function handleDownload(fileId: string) {
    const res = await fetch(`/api/weddings/${id}/files/${fileId}`);
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  }

  async function handleAddSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduleForm.draaiboekId || !scheduleForm.title) return;
    setSavingSchedule(true);
    const res = await fetch(`/api/weddings/${id}/vendors/${weddingVendorId}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...scheduleForm,
        duration: diffMinutes(scheduleForm.startTime, scheduleForm.endTime),
      }),
    });
    const data = await res.json();
    if (data.item) {
      setSchedule((prev) => [...prev, data.item].sort((a, b) => a.startTime.localeCompare(b.startTime)));
      setScheduleForm((p) => ({ ...p, startTime: "09:00", endTime: "09:30", title: "", location: "", notes: "" }));
      setShowScheduleForm(false);
    }
    setSavingSchedule(false);
  }

  async function handleDeleteSchedule(itemId: string) {
    if (!confirm("Tijdstip verwijderen?")) return;
    const item = schedule.find((s) => s.id === itemId);
    if (!item) return;
    await fetch(`/api/weddings/${id}/draaiboek/${item.draaiboek.id}/items/${itemId}`, { method: "DELETE" });
    setSchedule((prev) => prev.filter((s) => s.id !== itemId));
  }

  if (loading) return <div className="p-8" style={{ color: "var(--muted)" }}>{t.common.loading}</div>;
  if (!wv) return <div className="p-8">Leverancier niet gevonden</div>;

  const icon = VENDOR_ICONS[wv.vendor.category] ?? "🤝";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href={`/weddings/${id}/team`} className="text-sm hover:underline" style={{ color: "var(--muted)" }}>
          {vd.back}
        </Link>
      </div>

      {/* Vendor header */}
      <div className="ddp-card mb-6">
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: "var(--accent)" }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{wv.vendor.name}</h1>
            <div className="text-sm capitalize mt-0.5" style={{ color: "var(--muted)" }}>{wv.vendor.category}</div>
            <div className="flex items-center gap-2 mt-2 flex-wrap text-xs" style={{ color: "var(--muted)" }}>
              {wv.vendor.contactPerson && <span>👤 {wv.vendor.contactPerson}</span>}
              {wv.vendor.email && <a href={`mailto:${wv.vendor.email}`} className="hover:underline" style={{ color: "var(--primary)" }}>✉️ {wv.vendor.email}</a>}
              {wv.vendor.phone && <span>📞 {wv.vendor.phone}</span>}
              {wv.vendor.website && <a href={wv.vendor.website} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: "var(--primary)" }}>🌐 Website</a>}
            </div>
          </div>
        </div>
        {wv.notes && (
          <div className="mt-4 pt-4 border-t text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            {wv.notes}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6" style={{ borderColor: "var(--border)" }}>
        {(["inspiration", "schedule"] as const).map((tab) => {
          const label = tab === "inspiration" ? vd.tabInspiration : vd.tabSchedule;
          const count = tab === "inspiration" ? files.length : schedule.length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors"
              style={{
                borderColor: activeTab === tab ? "var(--primary)" : "transparent",
                color: activeTab === tab ? "var(--primary)" : "var(--muted)",
              }}
            >
              {label} {count > 0 && <span className="ml-1 text-xs opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* INSPIRATION TAB */}
      {activeTab === "inspiration" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">{vd.inspirationTitle}</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{vd.inspirationSub}</p>
            </div>
            <button onClick={() => setShowUpload(!showUpload)} className="ddp-btn-primary text-sm">
              {showUpload ? t.common.cancel : vd.uploadBtn}
            </button>
          </div>

          {showUpload && (
            <form onSubmit={handleUpload} className="ddp-card mb-6 space-y-4">
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
                style={{ borderColor: selectedFile ? "var(--primary)" : "var(--border)", background: selectedFile ? "var(--accent)" : undefined }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setSelectedFile(f);
                    if (f && !uploadName) setUploadName(f.name.replace(/\.[^.]+$/, ""));
                  }}
                />
                {selectedFile ? (
                  <div>
                    <div className="text-3xl mb-2">{fileIcon(selectedFile.type)}</div>
                    <div className="font-medium text-sm">{selectedFile.name}</div>
                    <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{formatSize(selectedFile.size)}</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl mb-2">🎨</div>
                    <div className="text-sm font-medium">Klik om bestand te kiezen</div>
                    <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>Afbeeldingen, PDF — max 50 MB</div>
                  </div>
                )}
              </div>
              {selectedFile && (
                <input
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="Naam van het bestand"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border)" }}
                />
              )}
              {uploadError && (
                <div className="p-3 rounded-lg text-sm" style={{ background: "#fde8e8", color: "var(--danger)" }}>
                  ⚠️ {uploadError}
                </div>
              )}
              <button type="submit" disabled={!selectedFile || uploading} className="ddp-btn-primary w-full">
                {uploading ? vd.uploading : "Uploaden"}
              </button>
            </form>
          )}

          {files.length === 0 ? (
            <div className="ddp-card text-center py-16" style={{ color: "var(--muted)" }}>
              <div className="text-4xl mb-3">🎨</div>
              <p className="text-sm">{vd.noFiles}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((doc) => (
                <div key={doc.id} className="ddp-card p-0 overflow-hidden">
                  <div
                    className="h-28 flex items-center justify-center text-4xl cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ background: "var(--accent)" }}
                    onClick={() => handleDownload(doc.id)}
                  >
                    {fileIcon(doc.mimeType)}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium truncate" title={doc.name}>{doc.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{formatSize(doc.fileSize)} · {doc.uploader.name}</div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleDownload(doc.id)}
                        className="text-xs px-2 py-1 rounded-md"
                        style={{ background: "var(--accent)", color: "var(--primary)" }}
                      >↓</button>
                      <button
                        onClick={() => handleDeleteFile(doc.id)}
                        className="text-xs px-2 py-1 rounded-md"
                        style={{ background: "#fde8e8", color: "var(--danger)" }}
                      >✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SCHEDULE TAB */}
      {activeTab === "schedule" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">{vd.scheduleTitle}</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{vd.scheduleSub}</p>
            </div>
            {draaiboeken.length > 0 && (
              <button onClick={() => setShowScheduleForm(!showScheduleForm)} className="ddp-btn-primary text-sm">
                {showScheduleForm ? t.common.cancel : vd.addScheduleBtn}
              </button>
            )}
          </div>

          {showScheduleForm && (
            <form onSubmit={handleAddSchedule} className="ddp-card mb-6 space-y-4">
              <h3 className="font-semibold text-sm">{vd.addScheduleBtn}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">{vd.scheduleForm.draaiboek}</label>
                  <select
                    value={scheduleForm.draaiboekId}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, draaiboekId: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {draaiboeken.map((d) => (
                      <option key={d.id} value={d.id}>{d.title} (v{d.version})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Van</label>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => {
                      const start = e.target.value;
                      setScheduleForm((p) => ({
                        ...p,
                        startTime: start,
                        endTime: addMinutes(start, diffMinutes(p.startTime, p.endTime)),
                      }));
                    }}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Tot</label>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    min={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, endTime: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Duur</label>
                  <div className="border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "var(--accent)", color: "var(--muted)" }}>
                    {formatDuration(diffMinutes(scheduleForm.startTime, scheduleForm.endTime))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{vd.scheduleForm.title} *</label>
                  <input
                    required
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="bijv. Bloemstukken plaatsen"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{vd.scheduleForm.location}</label>
                  <input
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="bijv. Feestzaal"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{vd.scheduleForm.notes}</label>
                  <input
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Extra info"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </div>
              <button type="submit" disabled={savingSchedule} className="ddp-btn-primary w-full">
                {savingSchedule ? vd.saving : vd.scheduleForm.addBtn}
              </button>
            </form>
          )}

          {draaiboeken.length === 0 && (
            <div className="ddp-card mb-4 text-sm" style={{ background: "#fef9ec", borderColor: "#f5d080", border: "1px solid" }}>
              <p style={{ color: "var(--muted)" }}>
                Er is nog geen draaiboek aangemaakt voor deze bruiloft.{" "}
                <Link href={`/weddings/${id}/draaiboek`} className="underline" style={{ color: "var(--primary)" }}>
                  Maak een draaiboek aan →
                </Link>
              </p>
            </div>
          )}

          {schedule.length === 0 ? (
            <div className="ddp-card text-center py-16" style={{ color: "var(--muted)" }}>
              <div className="text-4xl mb-3">⏱️</div>
              <p className="text-sm">{vd.noSchedule}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={item.id} className="ddp-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="text-center flex-shrink-0 pt-0.5">
                        <div className="text-base font-bold" style={{ color: "var(--primary)" }}>{item.startTime}</div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>– {addMinutes(item.startTime, item.duration)}</div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--muted)", opacity: 0.7 }}>{formatDuration(item.duration)}</div>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.title}</div>
                        {item.location && <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>📍 {item.location}</div>}
                        {item.notes && <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>💬 {item.notes}</div>}
                        <div className="text-xs mt-1" style={{ color: "var(--muted)", opacity: 0.7 }}>
                          {item.draaiboek.title} v{item.draaiboek.version}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSchedule(item.id)}
                      className="text-xs hover:opacity-70 flex-shrink-0"
                      style={{ color: "var(--muted)" }}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
