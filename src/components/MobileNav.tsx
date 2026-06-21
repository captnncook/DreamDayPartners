"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import {
  Heart, Home, CheckSquare, Users, Euro, ClipboardList,
  MessageCircle, Briefcase, Settings, LogOut, Menu, X, Globe,
} from "lucide-react";
import { useLang } from "./LangProvider";

const NAV_ICONS: Record<string, React.ElementType> = {
  "/dashboard":  Home,
  "/weddings":   Heart,
  "/tasks":      CheckSquare,
  "/guests":     Users,
  "/budget":     Euro,
  "/draaiboek":  ClipboardList,
  "/messages":   MessageCircle,
  "/vendors":    Briefcase,
  "/admin":      Settings,
};

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
  const { t, toggle } = useLang();
  const n = t.nav;

  const NAV_ITEMS = [
    { href: "/dashboard",  label: n.dashboard, roles: ["admin", "planner", "team_member", "couple", "vendor"] },
    { href: "/weddings",   label: n.weddings,  roles: ["admin", "planner", "team_member"] },
    { href: "/tasks",      label: n.myTasks,   roles: ["planner", "team_member", "couple"] },
    { href: "/guests",     label: n.guests,    roles: ["planner", "team_member", "couple"] },
    { href: "/budget",     label: n.budget,    roles: ["planner", "team_member"] },
    { href: "/draaiboek",  label: n.draaiboek, roles: ["planner", "team_member", "couple", "vendor"] },
    { href: "/messages",   label: n.messages,  roles: ["planner", "team_member", "couple", "vendor"] },
    { href: "/vendors",    label: n.vendors,   roles: ["planner", "team_member"] },
    { href: "/admin",      label: n.admin,     roles: ["admin"] },
  ];

  const visibleItems = NAV_ITEMS.filter((i) => i.roles.includes(user.role));
  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Top bar — mobile only */}
      <header
        className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.9375rem",
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
            }}
          >
            DreamDay
          </span>
        </Link>

        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.06)" }}
          aria-label="Menu openen"
        >
          <Menu className="w-5 h-5" style={{ color: "var(--foreground)" }} />
        </button>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className="md:hidden fixed top-0 right-0 bottom-0 z-50 flex flex-col"
        style={{
          width: "280px",
          background: "white",
          boxShadow: "-12px 0 40px rgba(0,0,0,0.15)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 h-14 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <span style={{ fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.02em", color: "var(--foreground)" }}>
            Menu
          </span>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.06)" }}
          >
            <X className="w-4 h-4" style={{ color: "var(--foreground)" }} />
          </button>
        </div>

        {/* User card */}
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-2xl"
            style={{ background: "var(--surface-2)" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: "var(--gradient-primary)" }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div
                className="font-semibold truncate"
                style={{ fontSize: "0.9375rem", color: "var(--foreground)", letterSpacing: "-0.01em" }}
              >
                {user.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                {ROLE_LABELS[user.role] ?? user.vendorType ?? "Leverancier"}
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
          {visibleItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = NAV_ICONS[item.href] ?? Home;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`ddp-nav-item${active ? " active" : ""}`}
                style={{ fontSize: "0.9375rem", padding: "0.75rem 1rem" }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div
          className="px-3 py-3 flex-shrink-0 space-y-0.5"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          <button
            onClick={toggle}
            className="ddp-nav-item w-full text-left"
            style={{ fontSize: "0.9375rem", padding: "0.75rem 1rem" }}
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            {t.common.switchLang}
          </button>
          <button
            onClick={handleLogout}
            className="ddp-nav-item w-full text-left"
            style={{ fontSize: "0.9375rem", padding: "0.75rem 1rem", color: "var(--danger)" }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" style={{ color: "var(--danger)" }} />
            {n.logout}
          </button>
        </div>
      </div>
    </>
  );
}
