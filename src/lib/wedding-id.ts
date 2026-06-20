import { createHash } from "crypto";

export function generateWeddingCode(email1: string, email2: string, weddingDate: string): string {
  const sorted = [email1.toLowerCase(), email2.toLowerCase()].sort();
  const input = `${sorted[0]}|${sorted[1]}|${weddingDate}`;
  const hash = createHash("sha256").update(input).digest("hex");
  return `WED-${hash.slice(0, 6).toUpperCase()}`;
}
