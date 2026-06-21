"use client";

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
    <aside
      className="flex flex-col w-64 min-h-screen"
      style={{
        background: "white",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }}
          >
            💍
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm leading-none" style={{ color: "var(--foreground)" }}>
              DreamDay
            </div>
            <div className="text-xs leading-none mt-0.5" style={{ color: "var(--primary)" }}>
              Partners
            </div>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-3.5 mx-3 my-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
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
                <span className="ddp-badge badge-premium" style={{ fontSize: "0.55rem", padding: "0.1rem 0.35rem" }}>
                  Pro
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-3 space-y-0.5">
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
      <div className="px-3 py-3" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={toggle}
          className="ddp-nav-item w-full text-left"
        >
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
  );
}
