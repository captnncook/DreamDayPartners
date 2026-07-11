import { NextRequest, NextResponse } from "next/server";

// Rate limiting voor de publieke catalogus-API tegen scrapers.
// Sliding window per IP, in-memory (volstaat op één instance; bij horizontaal
// schalen vervangen door een gedeelde store zoals Redis).

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60; // ruim voldoende voor normaal bladeren/zoeken

const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (hits.get(ip) ?? []).filter((t) => t > windowStart);
  timestamps.push(now);
  hits.set(ip, timestamps);

  // Opruimen zodat de map niet oneindig groeit
  if (hits.size > 10_000) {
    for (const [key, value] of hits) {
      if (value.every((t) => t <= windowStart)) hits.delete(key);
    }
  }

  return timestamps.length > MAX_REQUESTS;
}

export default function proxy(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het over een minuut opnieuw." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/catalogus/:path*"],
};
