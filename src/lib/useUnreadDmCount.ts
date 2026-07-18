"use client";

import { useEffect, useState } from "react";

// Peilt periodiek het aantal ongelezen DM's. Wordt gebruikt voor het
// berichten-icoon rechtsboven (mobiel) en in de sidebar (desktop).
export function useUnreadDmCount(intervalMs = 20000): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/dm/unread");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data.count === "number") setCount(data.count);
      } catch {
        // stil falen — badge blijft gewoon op de laatst bekende waarde
      }
    }

    poll();
    const interval = setInterval(poll, intervalMs);
    return () => { cancelled = true; clearInterval(interval); };
  }, [intervalMs]);

  return count;
}

export function formatUnreadBadge(count: number): string {
  return count >= 3 ? "3+" : String(count);
}
