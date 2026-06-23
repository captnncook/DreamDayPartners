import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      category: true,
      contactPerson: true,
      email: true,
      phone: true,
      website: true,
      description: true,
      isPremium: true,
      photos: true,
      city: true,
      latitude: true,
      longitude: true,
      userId: true,
    },
  });

  if (!vendor) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json({ vendor });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  // Only the vendor's linked user or admin can edit
  if (vendor.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const body = await req.json();
  const { description, city, contactPerson, phone, website } = body;

  let geoData: { latitude?: number; longitude?: number } = {};
  if (city !== undefined && city !== vendor.city && city.trim()) {
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", Nederland")}&format=json&limit=1`,
        { headers: { "User-Agent": "DreamDayPartners/1.0 (info@dreamdaypartners.nl)" } }
      );
      const geoJson = await geoRes.json();
      if (geoJson[0]) {
        geoData = { latitude: parseFloat(geoJson[0].lat), longitude: parseFloat(geoJson[0].lon) };
      }
    } catch {
      // geocoding is best-effort
    }
  }

  const updated = await prisma.vendor.update({
    where: { id },
    data: {
      ...(description !== undefined ? { description } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(contactPerson !== undefined ? { contactPerson } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(website !== undefined ? { website } : {}),
      ...geoData,
    },
  });

  return NextResponse.json({ vendor: updated });
}
