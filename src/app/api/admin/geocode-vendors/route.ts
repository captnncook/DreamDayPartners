import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { geocodeCity } from "@/lib/geocode";

// Geocode all vendors that have a city but no coordinates
export async function POST() {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const vendors = await prisma.vendor.findMany({
    where: { city: { not: null }, latitude: null },
    select: { id: true, city: true },
  });

  let updated = 0;
  for (const v of vendors) {
    const geo = await geocodeCity(v.city);
    if (geo.latitude) {
      await prisma.vendor.update({
        where: { id: v.id },
        data: { latitude: geo.latitude, longitude: geo.longitude },
      });
      updated++;
      // Respect Nominatim rate limit (1 req/sec)
      await new Promise(r => setTimeout(r, 1100));
    }
  }

  return NextResponse.json({ total: vendors.length, updated });
}
