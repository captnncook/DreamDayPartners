"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/LangProvider";

export default function TabNav({ id, isVendor }: { id: string; isVendor?: boolean }) {
  const pathname = usePathname();
  const { t } = useLang();
  const tb = t.tabs;

  const tabs = [
    { href: `/weddings/${id}`,           label: tb.overview },
    !isVendor && { href: `/weddings/${id}/tasks`,     label: tb.tasks },
    !isVendor && { href: `/weddings/${id}/guests`,    label: tb.guests },
    !isVendor && { href: `/weddings/${id}/budget`,    label: tb.budget },
    !isVendor && { href: `/weddings/${id}/files`,     label: tb.files },
    { href: `/weddings/${id}/draaiboek`, label: tb.draaiboek },
    { href: `/weddings/${id}/messages`,  label: tb.messages },
    !isVendor && { href: `/weddings/${id}/vendors`,   label: tb.vendors },
    { href: `/weddings/${id}/team`,      label: tb.team },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div
      className="flex gap-1.5 mb-8 overflow-x-auto pb-0.5"
      style={{ scrollbarWidth: "none" }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-shrink-0 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all"
            style={{
              fontSize: "0.8125rem",
              background: isActive ? "var(--foreground)" : "rgba(0,0,0,0.05)",
              color: isActive ? "white" : "var(--muted)",
              letterSpacing: "-0.01em",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
