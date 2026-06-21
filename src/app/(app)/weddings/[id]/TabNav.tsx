"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = (id: string) => [
  { href: `/weddings/${id}`, label: "Overzicht" },
  { href: `/weddings/${id}/tasks`, label: "Taken" },
  { href: `/weddings/${id}/guests`, label: "Gasten" },
  { href: `/weddings/${id}/budget`, label: "Budget" },
  { href: `/weddings/${id}/files`, label: "Bestanden" },
  { href: `/weddings/${id}/draaiboek`, label: "Draaiboek" },
  { href: `/weddings/${id}/messages`, label: "Berichten" },
  { href: `/weddings/${id}/vendors`, label: "Leveranciers" },
];

export default function TabNav({ id }: { id: string }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b mb-6 overflow-x-auto" style={{ borderColor: "var(--border)" }}>
      {tabs(id).map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors"
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
