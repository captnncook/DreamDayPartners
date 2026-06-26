"use client";
import { useState } from "react";
import { X, MessageCircle, Globe, Mail, Phone, User } from "lucide-react";

interface VendorContact {
  id: string;
  name: string;
  category: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
}

interface Props {
  vendor: VendorContact;
  weddingId: string;
  wvId: string;
  status: string;
  statusLabel: string;
  statusColor: string;
}

export default function VendorContactSheet({ vendor, weddingId, statusLabel, statusColor }: Props) {
  const [open, setOpen] = useState(false);

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
          <div className="text-sm font-medium truncate">{vendor.name}</div>
          <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{vendor.category}</div>
        </div>
        <span className={`ddp-badge ${statusColor}`} style={{ fontSize: "0.6rem" }}>
          {statusLabel}
        </span>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.0625rem", letterSpacing: "-0.02em" }}>{vendor.name}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--muted)", textTransform: "capitalize" }}>{vendor.category}</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "0.25rem" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              <a
                href={`/weddings/${weddingId}/messages`}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.875rem 1rem", borderRadius: "0.875rem",
                  background: "var(--primary)", color: "white",
                  textDecoration: "none", fontWeight: 600, fontSize: "0.9375rem",
                }}
              >
                <MessageCircle className="w-5 h-5" />
                Direct chatten
              </a>

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
                  <span className="truncate">{vendor.website.replace(/^https?:\/\//, "")}</span>
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
                  <span className="truncate">{vendor.email}</span>
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
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.875rem 1rem", borderRadius: "0.875rem",
                    background: "var(--accent)", fontSize: "0.9375rem", color: "var(--muted)",
                  }}
                >
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
