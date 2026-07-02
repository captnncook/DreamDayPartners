import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getDownloadUrl } from "@/lib/r2";

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

const PAGE_SIZE = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const where = {
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { city: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
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
        coverPhoto: true,
        city: true,
        latitude: true,
        longitude: true,
        priceFrom: true,
        specializations: true,
      },
      orderBy: [{ isPremium: "desc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.vendor.count({ where }),
  ]);

  // Generate signed URLs for cover photos
  const vendorsWithCover = await Promise.all(
    vendors.map(async (v) => ({
      ...v,
      coverPhotoUrl: v.coverPhoto ? await getDownloadUrl(v.coverPhoto, 86400) : null,
    }))
  );

  return NextResponse.json({ vendors: vendorsWithCover, total, page, pageSize: PAGE_SIZE });
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
