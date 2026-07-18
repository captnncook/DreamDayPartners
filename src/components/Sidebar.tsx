"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import { useLang } from "@/components/LangProvider";
import { Globe, LogOut } from "lucide-react";
import { useUnreadDmCount, formatUnreadBadge } from "@/lib/useUnreadDmCount";

interface SidebarProps {
  user: User;
  coupleWeddingId?: string | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, toggle } = useLang();
  const n = t.nav;
  const unreadCount = useUnreadDmCount();

  const NAV_ITEMS = [
    { href: "/dashboard",  label: n.dashboard, roles: ["admin", "planner", "team_member", "couple", "vendor"] },
    { href: "/weddings",   label: n.weddings,  roles: ["admin", "planner", "team_member"] },
    { href: "/tasks",      label: n.myTasks,   roles: ["planner", "team_member", "couple"] },
    { href: "/guests",     label: n.guests,    roles: ["planner", "team_member", "couple"] },
    { href: "/budget",     label: n.budget,    roles: ["planner", "team_member"] },
    { href: "/dm",                        label: "Berichten",        roles: ["planner", "team_member", "couple", "vendor"] },
    { href: "/draaiboek",                 label: "Draaiboek",        roles: ["planner", "team_member", "couple", "vendor"] },
    { href: "/dream-team",                label: "Dream Team",       roles: ["couple"] },
    { href: "/vendors",                   label: "Onze leveranciers", roles: ["planner", "team_member"] },
    { href: "/leveranciers",              label: "Catalogus",         roles: ["admin", "planner", "couple"] },
    { href: "/leveranciers/mijn-profiel", label: "Mijn profiel",      roles: ["vendor"] },
    { href: "/mijn-bruiloften",           label: "Mijn bruiloften",   roles: ["vendor"] },
    { href: "/leveranciers/analytics",    label: "Analytisch overzicht", roles: ["vendor"] },
    { href: "/instellingen",              label: "Instellingen",      roles: ["admin", "planner", "team_member", "couple", "vendor"] },
    { href: "/admin",                     label: n.admin,             roles: ["admin"] },
    { href: "/admin/accounts",            label: "Accounts",          roles: ["admin"] },
    { href: "/admin/vendors",             label: "Leveranciers",      roles: ["admin"] },
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
    <aside className="ddp-sidebar" style={{ background: "var(--ink)" }}>
      {/* Logo */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--ink-line)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/images/logo-wit.svg" alt="DreamDay Platform" width={30} height={30} className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-bold text-sm leading-none" style={{ color: "var(--ink-text)", letterSpacing: "-0.02em" }}>DreamDay</div>
            <div className="font-serif text-xs leading-none mt-0.5" style={{ color: "var(--gold)", fontSize: "0.7rem" }}>Platform</div>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-3 mx-3 my-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--gold)", color: "var(--ink)" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: "var(--ink-text)" }}>{user.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs" style={{ color: "var(--ink-muted)" }}>{roleLabels[user.role] ?? user.role}</span>
              {user.isPremium && (
                <span
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    border: "1px solid var(--gold)",
                    borderRadius: "999px",
                    padding: "0.05rem 0.4rem",
                  }}
                >
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
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/") ||
            (item.href === "/leveranciers/mijn-profiel" && pathname.startsWith("/leveranciers/"));
          const showBadge = item.href === "/dm" && unreadCount > 0;
          return (
            <Link key={item.href} href={item.href} className={`ddp-nav-item-dark${active ? " active" : ""}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{item.label}</span>
              {showBadge && (
                <span
                  style={{
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 5px",
                    borderRadius: "999px",
                    background: "var(--gold)",
                    color: "var(--ink)",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  {formatUnreadBadge(unreadCount)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Language + Logout + Website */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid var(--ink-line)" }}>
        <Link href="/" className="ddp-nav-item-dark w-full text-left">
          {t.nav.toWebsite}
        </Link>
        <button onClick={toggle} className="ddp-nav-item-dark w-full text-left mt-0.5">
          <Globe className="w-4 h-4 flex-shrink-0" />
          <span>{t.common.switchLang}</span>
        </button>
        <button onClick={handleLogout} className="ddp-nav-item-dark w-full text-left mt-0.5">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {n.logout}
        </button>
      </div>
    </aside>
  );
}
