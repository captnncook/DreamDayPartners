// Stuurt een client-side fout naar /api/log-client-error, zodat die net als
// server/API-fouten met volledige stacktrace terechtkomt in het admin-
// foutenlog. Best-effort: als dit zelf faalt (bv. offline), niet opnieuw
// gooien — een kapotte errorrapportage mag de gebruiker niet extra hinderen.
export function reportClientError(error: unknown, route?: string, extra?: Record<string, unknown>) {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const body = JSON.stringify({
      message,
      stack,
      route: route ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
      extra,
    });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/log-client-error", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/log-client-error", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    // nooit laten crashen op de errorrapportage zelf
  }
}
