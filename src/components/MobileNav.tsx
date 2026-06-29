"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import {
  LogOut, Menu, X, Globe, ChevronRight,
} from "lucide-react";
import { useLang } from "./LangProvider";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  planner: "Weddingplanner",
  team_member: "Teamlid",
  couple: "Bruidspaar",
};

export default function MobileNav({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { lang, t, toggle } = useLang();
  const n = t.nav;

  const NAV_ITEMS = [
    { href: "/dashboard",                  label: n.dashboard,         roles: ["admin", "planner", "team_member", "couple", "vendor"] },
    { href: "/weddings",                   label: n.weddings,          roles: ["admin", "planner", "team_member"] },
    { href: "/tasks",                      label: n.myTasks,           roles: ["planner", "team_member", "couple"] },
    { href: "/guests",                     label: n.guests,            roles: ["planner", "team_member", "couple"] },
    { href: "/budget",                     label: n.budget,            roles: ["planner", "team_member"] },
    { href: "/messages",                   label: n.messages,          roles: ["planner", "team_member", "couple", "vendor"] },
    { href: "/vendors",                    label: n.vendors,           roles: ["planner", "team_member"] },
    { href: "/leveranciers",               label: n.vendors,           roles: ["admin", "planner", "couple"] },
    { href: "/leveranciers/mijn-profiel",  label: lang === "en" ? "My profile" : "Mijn profiel", roles: ["vendor"] },
    { href: "/admin",                      label: n.admin,             roles: ["admin"] },
  ];

  const visibleItems = NAV_ITEMS.filter((i) => i.roles.includes(user.role));
  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const roleLabel = ROLE_LABELS[user.role] ?? user.vendorType ?? "Leverancier";

  async function handleLogout() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    /* Only visible on mobile — hidden on md+ via CSS in globals.css */
    <div className="ddp-mobile-header">

      {/* ── Top bar ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem",
          height: "56px",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <Link
          href="/dashboard"
          style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
        >
          <Image src="/logo.png" alt="DreamDay Partners" width={30} height={30} style={{ flexShrink: 0 }} />
          <span
            style={{
              fontWeight: 700,
              fontSize: "15px",
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
            }}
          >
            DreamDay
          </span>
        </Link>

        <button
          onClick={() => setOpen(true)}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(0,0,0,0.06)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Open menu"
        >
          <Menu style={{ width: "20px", height: "20px", color: "var(--foreground)" }} />
        </button>
      </header>

      {/* ── Full-screen overlay ── */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "white",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Overlay header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 1rem",
              height: "56px",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: "17px",
                letterSpacing: "-0.03em",
                color: "var(--foreground)",
              }}
            >
              Menu
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.06)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X style={{ width: "16px", height: "16px", color: "var(--foreground)" }} />
            </button>
          </div>

          {/* User card */}
          <div style={{ padding: "16px 16px 8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                background: "#f5f5f7",
                borderRadius: "14px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "var(--foreground)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "1px" }}>
                  {roleLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: "8px 16px", overflowY: "auto" }}>
            <div
              style={{
                background: "#f5f5f7",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              {visibleItems.map((item, idx) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const isLast = idx === visibleItems.length - 1;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "14px 16px",
                      textDecoration: "none",
                      background: active ? "rgba(196,154,108,0.08)" : "transparent",
                      borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: "15px",
                        fontWeight: active ? 600 : 400,
                        color: active ? "var(--primary-dark)" : "var(--foreground)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {item.label}
                    </span>
                    <ChevronRight
                      style={{ width: "16px", height: "16px", color: "rgba(0,0,0,0.2)", flexShrink: 0 }}
                    />
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom actions */}
          <div style={{ padding: "8px 16px 32px", flexShrink: 0, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 16px",
                marginBottom: "8px",
                borderRadius: "14px",
                background: "#f5f5f7",
                textDecoration: "none",
                fontSize: "14px",
                color: "var(--muted)",
                letterSpacing: "-0.01em",
              }}
            >
              {t.nav.toWebsite}
            </Link>
            <div
              style={{
                background: "#f5f5f7",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => { toggle(); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Globe style={{ width: "16px", height: "16px", color: "var(--muted)" }} />
                </div>
                <span style={{ fontSize: "15px", color: "var(--foreground)", letterSpacing: "-0.01em" }}>
                  {t.common.switchLang}
                </span>
              </button>

              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(255,59,48,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LogOut style={{ width: "16px", height: "16px", color: "var(--danger)" }} />
                </div>
                <span style={{ fontSize: "15px", color: "var(--danger)", letterSpacing: "-0.01em" }}>
                  {n.logout}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
