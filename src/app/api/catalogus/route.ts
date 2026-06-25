import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function geocodeCity(city?: string | null): Promise<{ latitude?: number; longitude?: number }> {
  if (!city) return {};
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", Nederland")}&format=json&limit=1`,
      { headers: { "User-Agent": "DreamDayPartners/1.0" } }
    );
    const json = await res.json();
    if (Array.isArray(json) && json[0]) {
      return { latitude: parseFloat(json[0].lat), longitude: parseFloat(json[0].lon) };
    }
  } catch {
    // geocoding is best-effort
  }
  return {};
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const vendors = await prisma.vendor.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
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
    },
    orderBy: [{ isPremium: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ vendors });
}

// Admin-only: nieuwe leverancier toevoegen aan de catalogus
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Alleen admins kunnen leveranciers toevoegen" }, { status: 403 });

  const body = await req.json();
  const { name, category, contactPerson, email, phone, website, city, description, isPremium } = body;

  if (!name || !category) {
    return NextResponse.json({ error: "Naam en categorie zijn verplicht" }, { status: 400 });
  }

  const geo = await geocodeCity(city);

  const vendor = await prisma.vendor.create({
    data: {
      name,
      category,
      contactPerson: contactPerson || null,
      email: email || null,
      phone: phone || null,
      website: website || null,
      city: city || null,
      description: description || null,
      isPremium: Boolean(isPremium),
      ...(geo.latitude != null ? { latitude: geo.latitude, longitude: geo.longitude } : {}),
    },
  });

  return NextResponse.json({ vendor }, { status: 201 });
}
