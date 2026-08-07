import { createHash, randomBytes } from "crypto";

export function generateWeddingCode(email1: string, email2: string, weddingDate: string): string {
  const sorted = [email1.toLowerCase(), email2.toLowerCase()].sort();
  const input = `${sorted[0]}|${sorted[1]}|${weddingDate}`;
  const hash = createHash("sha256").update(input).digest("hex");
  return `WED-${hash.slice(0, 6).toUpperCase()}`;
}

function slugify(text: string): string {
  return text
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // accenten weg
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Leesbare RSVP-link (bijv. /rsvp/emma-en-thomas-a8f3c2): het voornaam-deel
// is puur voor herkenbaarheid, de willekeurige suffix zorgt dat de link
// niet te raden is — alleen namen + datum kennen is niet genoeg.
export function generateRsvpSlug(partner1: string, partner2?: string | null): string {
  const names = partner2 ? `${partner1}-en-${partner2}` : partner1;
  const base = slugify(names) || "bruiloft";
  const suffix = randomBytes(4).toString("hex");
  return `${base}-${suffix}`;
}
