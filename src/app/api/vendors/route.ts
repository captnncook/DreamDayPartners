import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { withErrorLogging } from "@/lib/apiErrorLogging";

// Rangschikt kandidaten op relevantie t.o.v. de zoekterm: een woordgrens-match
// ("Tom" in "Tom Beeldregie") moet altijd boven een toevallige substring-match
// midden in een ander woord staan ("Au-tom-obielbedrijf") — anders verdwijnt
// de bedoelde leverancier onder alfabetisch eerdere ruis zodra er meer dan
// 20 willekeurige substring-treffers zijn.
function rankScore(name: string, q: string): number {
  const n = name.toLowerCase();
  const query = q.toLowerCase();
  if (n === query) return 0;
  if (n.startsWith(query)) return 1;
  if (new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(n)) return 2;
  return 3;
}

async function GETImpl(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ vendors: [] });

  const candidates = await prisma.vendor.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    select: { id: true, name: true, category: true, email: true, phone: true, contactPerson: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  const vendors = candidates
    .map((v) => ({ v, score: rankScore(v.name, q) }))
    .sort((a, b) => a.score - b.score || a.v.name.localeCompare(b.v.name))
    .slice(0, 20)
    .map((r) => r.v);

  return NextResponse.json({ vendors });
}

export const GET = withErrorLogging(GETImpl);
