"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import { useLang } from "@/components/LangProvider";

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, toggle } = useLang();
  const n = t.nav;
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const NAV_ITEMS = [
    { href: "/dashboard",  label: n.dashboard, icon: "🏠", roles: ["admin", "planner", "team_member", "couple", "vendor"] },
    { href: "/weddings",   label: n.weddings,  icon: "💍", roles: ["admin", "planner", "team_member"] },
    { href: "/tasks",      label: n.myTasks,   icon: "✅", roles: ["planner", "team_member", "couple"] },
    { href: "/guests",     label: n.guests,    icon: "👥", roles: ["planner", "team_member", "couple"] },
    { href: "/budget",     label: n.budget,    icon: "💶", roles: ["planner", "team_member"] },
    { href: "/draaiboek",  label: n.draaiboek, icon: "📋", roles: ["planner", "team_member", "couple", "vendor"] },
    { href: "/messages",   label: n.messages,  icon: "💬", roles: ["planner", "team_member", "couple", "vendor"] },
    { href: "/vendors",    label: n.vendors,   icon: "🤝", roles: ["planner", "team_member"] },
    { href: "/admin",      label: n.admin,     icon: "⚙️", roles: ["admin"] },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    planner: "Weddingplanner",
    team_member: "Teamlid",
    couple: "Bruidspaar",
    vendor: user.vendorType ?? "Leverancier",
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4"
        style={{
          height: "56px",
          background: "white",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }}
          >
            💍
          </div>
          <div className="leading-none">
            <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>DreamDay</span>
            <span className="text-xs ml-0.5" style={{ color: "var(--primary)" }}>Partners</span>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          aria-label="Menu openen"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="0" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="0" y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className="lg:hidden fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(28, 22, 19, 0.5)",
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col w-64 transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: "white", borderRight: "1px solid var(--border)" }}
      >
        {/* Logo row */}
        <div className="px-5 flex items-center justify-between flex-shrink-0" style={{ height: "60px", borderBottom: "1px solid var(--border)" }}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }}
            >
              💍
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm leading-none" style={{ color: "var(--foreground)" }}>DreamDay</div>
              <div className="text-xs leading-none mt-0.5" style={{ color: "var(--primary)" }}>Partners</div>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--muted)" }}
            aria-label="Menu sluiten"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3.5 mx-3 my-3 rounded-xl flex-shrink-0" style={{ background: "var(--surface-2)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: "var(--gradient-primary)", boxShadow: "0 2px 6px rgba(196,154,108,0.3)" }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{user.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {roleLabels[user.role] ?? user.role}
                </span>
                {user.isPremium && (
                  <span className="ddp-badge badge-premium" style={{ fontSize: "0.55rem", padding: "0.1rem 0.35rem" }}>Pro</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto">
          {visibleItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`ddp-nav-item${active ? " active" : ""}`}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Language + Logout */}
        <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={toggle} className="ddp-nav-item w-full text-left">
            <span className="text-base w-5 text-center flex-shrink-0">🌐</span>
            <span>{t.common.switchLang}</span>
          </button>
          <button
            onClick={handleLogout}
            className="ddp-nav-item w-full text-left mt-0.5"
            style={{ color: "var(--muted)" }}
          >
            <span className="text-base w-5 text-center flex-shrink-0">🚪</span>
            {n.logout}
          </button>
        </div>
      </aside>
    </>
  );
}
