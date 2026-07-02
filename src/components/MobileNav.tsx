"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import {
  LogOut, Menu, X, Globe,
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
    { href: "/dm",                         label: "Berichten",         roles: ["planner", "team_member", "couple", "vendor"] },
    { href: "/dream-team",                 label: "Dream Team",        roles: ["couple"] },
    { href: "/vendors",                    label: "Onze leveranciers", roles: ["planner", "team_member"] },
    { href: "/leveranciers",               label: "Catalogus",         roles: ["admin", "planner", "couple"] },
    { href: "/leveranciers/mijn-profiel",  label: "Mijn profiel",      roles: ["vendor"] },
    { href: "/mijn-bruiloften",            label: "Mijn bruiloften",   roles: ["vendor"] },
    { href: "/instellingen",               label: "Instellingen",      roles: ["admin", "planner", "team_member", "couple", "vendor"] },
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
          <Image src="/images/logo.svg" alt="DreamDay Partners" width={30} height={30} style={{ flexShrink: 0 }} />
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
            background: "var(--ink)",
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
              borderBottom: "1px solid var(--ink-line)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: "17px",
                letterSpacing: "-0.03em",
                color: "var(--ink-text)",
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
                background: "rgba(255,255,255,0.08)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X style={{ width: "16px", height: "16px", color: "var(--ink-text)" }} />
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
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--ink)",
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
                    color: "var(--ink-text)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: "13px", color: "var(--ink-muted)", marginTop: "1px" }}>
                  {roleLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: "8px 16px", overflowY: "auto" }}>
            <div style={{ overflow: "hidden" }}>
              {visibleItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`ddp-nav-item-dark${active ? " active" : ""}`}
                    style={{ padding: "12px 14px", marginBottom: "2px" }}
                  >
                    <span style={{ flex: 1, fontSize: "15px" }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom actions */}
          <div style={{ padding: "8px 16px 32px", flexShrink: 0, borderTop: "1px solid var(--ink-line)" }}>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="ddp-nav-item-dark"
              style={{ justifyContent: "center", padding: "12px 16px", marginTop: "10px" }}
            >
              {t.nav.toWebsite}
            </Link>
            <button
              onClick={() => { toggle(); }}
              className="ddp-nav-item-dark w-full text-left mt-0.5"
              style={{ padding: "12px 14px" }}
            >
              <Globe style={{ width: "16px", height: "16px" }} />
              <span style={{ fontSize: "15px" }}>{t.common.switchLang}</span>
            </button>

            <button
              onClick={handleLogout}
              className="ddp-nav-item-dark w-full text-left mt-0.5"
              style={{ padding: "12px 14px" }}
            >
              <LogOut style={{ width: "16px", height: "16px" }} />
              <span style={{ fontSize: "15px" }}>{n.logout}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
