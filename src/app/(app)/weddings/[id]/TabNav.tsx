"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/LangProvider";

export default function TabNav({ id }: { id: string }) {
  const pathname = usePathname();
  const { t } = useLang();
  const tb = t.tabs;

  const tabs = [
    { href: `/weddings/${id}`, label: tb.overview },
    { href: `/weddings/${id}/tasks`, label: tb.tasks },
    { href: `/weddings/${id}/guests`, label: tb.guests },
    { href: `/weddings/${id}/budget`, label: tb.budget },
    { href: `/weddings/${id}/files`, label: tb.files },
    { href: `/weddings/${id}/draaiboek`, label: tb.draaiboek },
    { href: `/weddings/${id}/messages`, label: tb.messages },
    { href: `/weddings/${id}/vendors`, label: tb.vendors },
    { href: `/weddings/${id}/team`, label: tb.team },
  ];

  return (
    <div
      className="flex gap-0.5 border-b mb-5 overflow-x-auto ddp-tabs-scroll"
      style={{ borderColor: "var(--border)" }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-3.5 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0"
            style={{
              borderColor: isActive ? "var(--primary)" : "transparent",
              color: isActive ? "var(--primary)" : "var(--muted)",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
