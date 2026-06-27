"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, MessageCircle, Globe, Mail, Phone, User } from "lucide-react";

interface VendorContact {
  id: string;
  name: string;
  category: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  userId?: string | null;
}

interface Props {
  vendor: VendorContact;
  weddingId: string;
  wvId: string;
  status: string;
  statusLabel: string;
  statusColor: string;
}

export default function VendorContactSheet({ vendor, weddingId: _weddingId, wvId: _wvId }: Props) {
  const [open, setOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const router = useRouter();

  async function openChat() {
    if (!vendor.userId) return;
    setStarting(true);
    try {
      const res = await fetch("/api/dm/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: vendor.userId }),
      });
      if (res.ok) {
        const { conversation } = await res.json();
        router.push(`/dm/${conversation.id}`);
      }
    } finally {
      setStarting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 py-2 px-2 rounded-xl -mx-2 hover:bg-accent w-full text-left"
        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: "var(--accent)", color: "var(--primary)" }}>
          {vendor.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate" title={vendor.name}>{vendor.name}</div>
          <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{vendor.category}</div>
        </div>
      </button>

      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--card)", borderRadius: "1.25rem 1.25rem 0 0",
              padding: "1.5rem", width: "100%", maxWidth: "480px",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
            }}
          >
            {/* Drag handle */}
            <div style={{ width: "2.5rem", height: "4px", background: "var(--border)", borderRadius: "2px", margin: "0 auto 1.25rem" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.0625rem", letterSpacing: "-0.02em" }}>{vendor.name}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--muted)", textTransform: "capitalize" }}>{vendor.category}</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "0.25rem" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ display: "grid", gap: "0.625rem" }}>
              {vendor.userId ? (
                <button
                  onClick={openChat}
                  disabled={starting}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.875rem 1rem", borderRadius: "0.875rem",
                    background: "var(--primary)", color: "white",
                    border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9375rem",
                    opacity: starting ? 0.7 : 1,
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  {starting ? "Openen..." : "Stuur een bericht"}
                </button>
              ) : (
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.875rem 1rem", borderRadius: "0.875rem",
                  background: "var(--accent)", color: "var(--muted)",
                  fontSize: "0.875rem",
                }}>
                  <MessageCircle className="w-5 h-5" />
                  Leverancier heeft nog geen account
                </div>
              )}

              {vendor.website && (
                <a
                  href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.875rem 1rem", borderRadius: "0.875rem",
                    background: "var(--accent)", color: "var(--foreground)",
                    textDecoration: "none", fontSize: "0.9375rem",
                  }}
                >
                  <Globe className="w-5 h-5" style={{ color: "var(--primary)" }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {vendor.website.replace(/^https?:\/\//, "")}
                  </span>
                </a>
              )}

              {vendor.email && (
                <a
                  href={`mailto:${vendor.email}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.875rem 1rem", borderRadius: "0.875rem",
                    background: "var(--accent)", color: "var(--foreground)",
                    textDecoration: "none", fontSize: "0.9375rem",
                  }}
                >
                  <Mail className="w-5 h-5" style={{ color: "var(--primary)" }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor.email}</span>
                </a>
              )}

              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.875rem 1rem", borderRadius: "0.875rem",
                    background: "var(--accent)", color: "var(--foreground)",
                    textDecoration: "none", fontSize: "0.9375rem",
                  }}
                >
                  <Phone className="w-5 h-5" style={{ color: "var(--primary)" }} />
                  {vendor.phone}
                </a>
              )}

              {vendor.contactPerson && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.875rem 1rem", borderRadius: "0.875rem",
                  background: "var(--accent)", fontSize: "0.875rem", color: "var(--muted)",
                }}>
                  <User className="w-5 h-5" style={{ color: "var(--primary)" }} />
                  {vendor.contactPerson}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
