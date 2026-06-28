"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@prisma/client";
import { useLang } from "@/components/LangProvider";
import { Globe, LogOut, Plus } from "lucide-react";

const DREAM_TEAM_SLOTS = [
  { category: "weddingplanner", label: "Planner",    emoji: "📋" },
  { category: "fotograaf",      label: "Foto",        emoji: "📷" },
  { category: "videograaf",     label: "Video",       emoji: "🎬" },
  { category: "catering",       label: "Catering",    emoji: "🍽️" },
  { category: "bloemist",       label: "Bloemen",     emoji: "💐" },
  { category: "dj",             label: "DJ",          emoji: "🎵" },
  { category: "liveband",       label: "Band",        emoji: "🎸" },
  { category: "trouwlocatie",   label: "Locatie",     emoji: "🏛️" },
  { category: "vervoer",        label: "Vervoer",     emoji: "🚗" },
  { category: "haarstylist",    label: "Haar",        emoji: "💇" },
  { category: "visagist",       label: "Make-up",     emoji: "💄" },
  { category: "bakker",         label: "Taart",       emoji: "🎂" },
];

type DreamTeamMember = { vendorId: string; name: string; category: string; photo: string | null };

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
  const [dreamTeam, setDreamTeam] = useState<DreamTeamMember[]>([]);
  const [dreamTeamWeddingId, setDreamTeamWeddingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnread = () =>
      fetch("/api/dm/unread").then(r => r.json()).then(d => setUnreadDm(d.count ?? 0)).catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user.role !== "couple") return;
    fetch("/api/weddings/dream-team")
      .then(r => r.json())
      .then(d => {
        setDreamTeam(d.team ?? []);
        setDreamTeamWeddingId(d.weddingId ?? null);
      })
      .catch(() => {});
  }, [user.role]);

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
            <div className="font-serif text-xs leading-none mt-0.5" style={{ color: "var(--primary)", fontSize: "0.7rem" }}>Platform</div>
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

      {/* Dream Team — couples only */}
      {user.role === "couple" && (
        <div className="px-3 pb-3" style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
          <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.625rem", paddingLeft: "0.25rem" }}>
            Dream Team
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingLeft: "0.125rem" }}>
            {DREAM_TEAM_SLOTS.map(({ category, label, emoji }) => {
              const member = dreamTeam.find(m => m.category === category);
              const initials = member
                ? member.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
                : null;
              return (
                <Link
                  key={category}
                  href={member ? `/leveranciers/${member.vendorId}` : `/leveranciers?category=${category}`}
                  title={member ? member.name : `${label} toevoegen`}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                    textDecoration: "none", width: "44px",
                  }}
                >
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: member ? "var(--primary)" : "var(--accent)",
                    border: member ? "2px solid var(--primary)" : "1.5px dashed var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", position: "relative", flexShrink: 0,
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "scale(1.1)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                  >
                    {member ? (
                      member.photo ? (
                        <Image src={member.photo} alt={member.name} fill style={{ objectFit: "cover" }} sizes="36px" />
                      ) : (
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "white" }}>{initials}</span>
                      )
                    ) : (
                      <span style={{ fontSize: "0.7rem" }}>{emoji}</span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.5rem", color: "var(--muted)", fontWeight: 500, textAlign: "center", lineHeight: 1.2, maxWidth: "44px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {member ? member.name.split(" ")[0] : label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

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
