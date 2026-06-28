"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@prisma/client";
import { useLang } from "@/components/LangProvider";
import { Globe, LogOut } from "lucide-react";

interface SidebarProps {
  user: User;
  coupleWeddingId?: string | null;
}

export default function Sidebar({ user, coupleWeddingId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, toggle } = useLang();
  const n = t.nav;

  const coupleWeddingHref = coupleWeddingId ? `/weddings/${coupleWeddingId}` : null;

  const NAV_ITEMS = [
    { href: "/dashboard",  label: n.dashboard, roles: ["admin", "planner", "team_member", "couple", "vendor"] },
    ...(coupleWeddingHref ? [{ href: coupleWeddingHref, label: "Onze bruiloft", roles: ["couple"] }] : []),
    { href: "/weddings",   label: n.weddings,  roles: ["admin", "planner", "team_member"] },
    { href: "/tasks",      label: n.myTasks,   roles: ["planner", "team_member", "couple"] },
    { href: "/guests",     label: n.guests,    roles: ["planner", "team_member", "couple"] },
    { href: "/budget",     label: n.budget,    roles: ["planner", "team_member"] },
    { href: "/dm",                        label: "Berichten",     roles: ["planner", "team_member", "couple", "vendor"] },
    { href: "/vendors",                   label: n.vendors,       roles: ["planner", "team_member"] },
    { href: "/leveranciers",              label: "Leveranciers",  roles: ["admin", "planner", "couple"] },
    { href: "/leveranciers/mijn-profiel", label: "Mijn profiel",  roles: ["vendor"] },
    { href: "/mijn-bruiloften",           label: "Mijn bruiloften", roles: ["vendor"] },
    { href: "/admin",                     label: n.admin,         roles: ["admin"] },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const [unreadDm, setUnreadDm] = useState(0);

  useEffect(() => {
    const fetchUnread = () =>
      fetch("/api/dm/unread").then(r => r.json()).then(d => setUnreadDm(d.count ?? 0)).catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

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
      className="ddp-sidebar"
      style={{ background: "#ffffff", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/images/logo.svg" alt="DreamDay Partners" width={30} height={30} className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-bold text-sm leading-none" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>DreamDay</div>
            <div className="font-serif text-xs leading-none mt-0.5" style={{ color: "var(--primary)", fontSize: "0.7rem" }}>Partners</div>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-3 mx-3 my-3 rounded-2xl" style={{ background: "var(--color-blush-soft)", border: "1px solid var(--color-blush)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--color-charcoal)", color: "var(--color-cream)" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{user.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs" style={{ color: "var(--muted)" }}>{roleLabels[user.role] ?? user.role}</span>
              {user.isPremium ? (
                <span className="ddp-badge badge-champagne" style={{ fontSize: "0.55rem", padding: "0.1rem 0.35rem" }}>Pro</span>
              ) : user.role === "vendor" && (
                <span style={{ fontSize: "0.55rem", padding: "0.1rem 0.35rem", background: "rgba(0,0,0,0.07)", color: "var(--muted)", borderRadius: "4px", fontWeight: 600, letterSpacing: "0.03em" }}>Gratis</span>
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
          return (
            <Link key={item.href} href={item.href} className={`ddp-nav-item${active ? " active" : ""}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{item.label}</span>
              {item.href === "/dm" && unreadDm > 0 && (
                <span style={{
                  background: "var(--primary)", color: "white",
                  borderRadius: "9999px", fontSize: "0.625rem", fontWeight: 700,
                  padding: "0.1rem 0.45rem", lineHeight: 1.6, minWidth: "1.25rem", textAlign: "center",
                }}>
                  {unreadDm > 99 ? "99+" : unreadDm}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Language + Logout + Website */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid var(--border)", background: "#fafaf8" }}>
        <Link href="/instellingen" className="ddp-nav-item w-full text-left">
          Instellingen
        </Link>
        <Link href="/" className="ddp-nav-item w-full text-left" target="_blank" rel="noopener noreferrer">
          Naar website
        </Link>
        <button onClick={toggle} className="ddp-nav-item w-full text-left mt-0.5">
          <Globe className="w-4 h-4 flex-shrink-0" />
          <span>{t.common.switchLang}</span>
        </button>
        <button onClick={handleLogout} className="ddp-nav-item w-full text-left mt-0.5">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {n.logout}
        </button>
      </div>
    </aside>
  );
}
