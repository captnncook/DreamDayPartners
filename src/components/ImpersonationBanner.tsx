"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Status = { active: false } | { active: true; targetName: string; targetRole: string; adminName: string };

export default function ImpersonationBanner() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ active: false });
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    fetch("/api/admin/impersonate/status")
      .then((r) => (r.ok ? r.json() : { active: false }))
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status.active) return null;

  async function handleStop() {
    setStopping(true);
    await fetch("/api/admin/impersonate/stop", { method: "POST" });
    router.push("/admin/accounts");
    router.refresh();
  }

  return (
    <div
      className="flex items-center justify-between flex-wrap gap-2 px-4"
      style={{ background: "var(--ink)", color: "var(--ink-text)", padding: "0.5rem 1rem", fontSize: "var(--text-sm)" }}
    >
      <span>
        Je kijkt mee als <strong>{status.targetName}</strong>
      </span>
      <button
        onClick={handleStop}
        disabled={stopping}
        style={{ background: "var(--gold)", color: "var(--ink)", border: "none", borderRadius: "var(--radius-full)", padding: "0.3rem 0.875rem", fontWeight: 700, fontSize: "var(--text-sm)", cursor: "pointer" }}
      >
        {stopping ? "Bezig…" : "Stop meekijken"}
      </button>
    </div>
  );
}
