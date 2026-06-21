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
    { href: "/dashboard", label: n.dashboard, icon: "🏠", roles: ["admin", "planner", "team_member", "couple", "vendor"] },
    { href: "/weddings", label: n.weddings, icon: "💍", roles: ["admin", "planner", "team_member"] },
    { href: "/tasks", label: n.myTasks, icon: "✅", roles: ["planner", "team_member", "couple"] },
    { href: "/guests", label: n.guests, icon: "👥", roles: ["planner", "team_member", "couple"] },
    { href: "/budget", label: n.budget, icon: "💶", roles: ["planner", "team_member"] },
    { href: "/draaiboek", label: n.draaiboek, icon: "📋", roles: ["planner", "team_member", "couple", "vendor"] },
    { href: "/messages", label: n.messages, icon: "💬", roles: ["planner", "team_member", "couple", "vendor"] },
    { href: "/vendors", label: n.vendors, icon: "🤝", roles: ["planner", "team_member"] },
    { href: "/admin", label: n.admin, icon: "⚙️", roles: ["admin"] },
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

  return (
    <aside
      className="flex flex-col w-64 min-h-screen border-r"
      style={{ background: "white", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">💍</span>
          <span className="font-bold text-base" style={{ color: "var(--primary)" }}>DreamDay Partners</span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: "var(--primary)" }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs truncate" style={{ color: "var(--muted)" }}>
              {roleLabels[user.role] ?? user.role}
              {user.isPremium && (
                <span className="ml-1 ddp-badge badge-premium" style={{ fontSize: "0.55rem", padding: "0.1rem 0.4rem" }}>
                  Premium
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "var(--primary-dark)" : "var(--foreground)",
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Language + Logout */}
      <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors hover:bg-gray-50"
          style={{ color: "var(--muted)" }}
        >
          <span>🌐</span>
          <span>{t.common.switchLang}</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors hover:bg-gray-50"
          style={{ color: "var(--muted)" }}
        >
          <span>🚪</span>
          {n.logout}
        </button>
      </div>
    </aside>
  );
}
