import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Vendors die via bulk-import zijn toegevoegd kregen vaak een generieke
// stockfoto-URL per leverancierssoort mee, waardoor meerdere leveranciers
// exact dezelfde profielfoto delen. Een écht geüploade foto staat altijd
// als uniek R2-object-key (nooit als volledige URL, en nooit gedeeld tussen
// leveranciers), dus elke coverPhoto-waarde die bij 2+ leveranciers
// voorkomt is per definitie zo'n generieke stockfoto. Die wordt hier
// gewist zodat de UI in plaats daarvan het DreamDay-logo toont.
export async function POST() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const vendors = await prisma.vendor.findMany({
    where: { coverPhoto: { not: null } },
    select: { id: true, name: true, coverPhoto: true },
  });

  const counts = new Map<string, number>();
  for (const v of vendors) {
    const key = v.coverPhoto!;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const affected = vendors.filter((v) => (counts.get(v.coverPhoto!) ?? 0) > 1);

  if (affected.length > 0) {
    await prisma.vendor.updateMany({
      where: { id: { in: affected.map((v) => v.id) } },
      data: { coverPhoto: null },
    });
  }

  return NextResponse.json({
    cleared: affected.length,
    vendors: affected.map((v) => ({ id: v.id, name: v.name })),
  });
}
