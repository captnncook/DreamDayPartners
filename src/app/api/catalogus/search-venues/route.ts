import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorLogging } from "@/lib/apiErrorLogging";

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
  // Woorden van 1-2 tekens (cijfers, lidwoorden als "s") zijn te kort om
  // betrouwbaar fuzzy te matchen (elke letter ligt dan al binnen 1 fout van
  // toevallig een ander kort woord) — daar staat alleen exact of prefix toe.
  if (queryWord.length <= 2 || candidateWord.length <= 2) {
    return candidateWord.startsWith(queryWord) || queryWord.startsWith(candidateWord);
  }
  if (candidateWord.startsWith(queryWord) || queryWord.startsWith(candidateWord)) return true;
  const maxDistance = queryWord.length > 5 ? 2 : 1;
  return levenshtein(queryWord, candidateWord) <= maxDistance;
}

// Elk woord uit de zoekopdracht moet ergens in de naam of stad een fuzzy-match
// vinden, in willekeurige volgorde (zo matcht "haar kasteel" ook op "Kasteel de Haar").
// Bij meerdere zoekwoorden mag er precies één niet matchen — iemand die haast
// heeft, tikt vaak niet alleen een letter fout in de naam maar ook in de
// plaatsnaam (of noemt een nabijgelegen plaats i.p.v. de exacte vestigingsplaats)
// — dat mag niet meteen alle resultaten wegvallen als de rest wél klopt.
function matchScore(query: string, name: string, city: string | null): number | null {
  const queryWords = normalize(query).split(/\s+/).filter(Boolean);
  const candidateWords = [...normalize(name).split(/\s+/), ...normalize(city ?? "").split(/\s+/)].filter(Boolean);
  if (queryWords.length === 0) return null;
  const misses = queryWords.filter((qw) => !candidateWords.some((cw) => wordMatches(qw, cw))).length;
  const allowedMisses = queryWords.length > 1 ? 1 : 0;
  return misses <= allowedMisses ? misses : null;
}

async function GETImpl(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  if (search.length < 2) return NextResponse.json({ vendors: [] });

  const venues = await prisma.vendor.findMany({
    where: { archivedAt: null, category: "trouwlocatie" },
    select: { id: true, name: true, city: true },
  });

  const matches = venues
    .map((v) => ({ v, score: matchScore(search, v.name, v.city) }))
    .filter((m): m is { v: typeof venues[number]; score: number } => m.score !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map((m) => m.v);

  return NextResponse.json({ vendors: matches });
}

export const GET = withErrorLogging(GETImpl);
