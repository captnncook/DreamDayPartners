import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorLogging } from "@/lib/apiErrorLogging";

// Controleert bij leveranciers-registratie of de bedrijfsnaam (bijna) al in de
// catalogus staat, zodat we een duplicaat of een claimbaar profiel kunnen
// voorstellen. Fuzzy: hoofdletters, diakrieten, leestekens en kleine
// spelfouten (Levenshtein) tellen niet als verschil.

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diakrieten weg (café → cafe)
    .replace(/[^a-z0-9]/g, ""); // spaties/leestekens weg
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

function isSimilar(input: string, candidate: string): boolean {
  if (!input || !candidate) return false;
  if (input === candidate) return true;
  const shorter = Math.min(input.length, candidate.length);
  const longer = Math.max(input.length, candidate.length);
  // "bloemenwinkelroosutrecht" bevat "bloemenwinkelroos" (en andersom) —
  // maar alleen als het kortste woord een substantieel deel van het
  // langste is. Zonder deze verhouding matchte bijv. een bestaand bedrijf
  // "FotoG" toevallig als losse lettergreep ergens midden in een veel
  // langere, verder onverwante naam, wat betekenisloze suggesties gaf.
  if (shorter >= 6 && shorter / longer >= 0.6 && (candidate.includes(input) || input.includes(candidate))) return true;
  // kleine spelfouten: 1 fout bij korte namen, 2 bij langere
  const maxDistance = shorter > 8 ? 2 : 1;
  return levenshtein(input, candidate) <= maxDistance;
}

async function GETImpl(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim() ?? "";
  if (name.length < 3) return NextResponse.json({ matches: [] });

  const input = normalize(name);
  if (input.length < 3) return NextResponse.json({ matches: [] });

  const vendors = await prisma.vendor.findMany({
    where: { archivedAt: null },
    select: { id: true, name: true, city: true, category: true, userId: true },
  });

  const matches = vendors
    .filter((v) => isSimilar(input, normalize(v.name)))
    .slice(0, 5)
    .map((v) => ({
      id: v.id,
      name: v.name,
      city: v.city,
      category: v.category,
      hasAccount: !!v.userId,
    }));

  return NextResponse.json({ matches });
}

export const GET = withErrorLogging(GETImpl);
