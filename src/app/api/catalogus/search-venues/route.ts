import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Live-zoeken naar trouwlocaties tijdens het typen (aanmeldflow). Fuzzy per
// woord, zodat kleine typfouten of een andere schrijfwijze ("4 reasons" i.p.v.
// "4Reasons", "kasteel de har" i.p.v. "Kasteel de Haar") toch de juiste
// locatie vinden.

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
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

function wordMatches(queryWord: string, candidateWord: string): boolean {
  if (!queryWord || !candidateWord) return false;
  if (candidateWord.startsWith(queryWord) || queryWord.startsWith(candidateWord)) return true;
  const maxDistance = queryWord.length > 5 ? 2 : 1;
  return levenshtein(queryWord, candidateWord) <= maxDistance;
}

// Elk woord uit de zoekopdracht moet ergens in de naam of stad een fuzzy-match
// vinden, in willekeurige volgorde (zo matcht "haar kasteel" ook op "Kasteel de Haar").
function isMatch(query: string, name: string, city: string | null): boolean {
  const queryWords = normalize(query).split(/\s+/).filter(Boolean);
  const candidateWords = [...normalize(name).split(/\s+/), ...normalize(city ?? "").split(/\s+/)].filter(Boolean);
  if (queryWords.length === 0) return false;
  return queryWords.every((qw) => candidateWords.some((cw) => wordMatches(qw, cw)));
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  if (search.length < 2) return NextResponse.json({ vendors: [] });

  const venues = await prisma.vendor.findMany({
    where: { archivedAt: null, category: "trouwlocatie" },
    select: { id: true, name: true, city: true },
  });

  const matches = venues.filter((v) => isMatch(search, v.name, v.city)).slice(0, 5);

  return NextResponse.json({ vendors: matches });
}
