import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type IncomingVendor = {
  name?: string;
  category?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  description?: string;
  isPremium?: boolean | string;
  imageUrl?: string;
};

const geoCache = new Map<string, { latitude?: number; longitude?: number }>();

async function geocodeCity(city?: string | null): Promise<{ latitude?: number; longitude?: number }> {
  if (!city) return {};
  const key = city.trim().toLowerCase();
  if (geoCache.has(key)) return geoCache.get(key)!;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", Nederland")}&format=json&limit=1`,
      { headers: { "User-Agent": "DreamDayPartners/1.0" } }
    );
    const json = await res.json();
    if (Array.isArray(json) && json[0]) {
      const geo = { latitude: parseFloat(json[0].lat), longitude: parseFloat(json[0].lon) };
      geoCache.set(key, geo);
      return geo;
    }
  } catch {
    // geocoding is best-effort
  }
  geoCache.set(key, {});
  return {};
}

function toBool(v: boolean | string | undefined): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return ["true", "1", "ja", "yes", "premium"].includes(v.trim().toLowerCase());
  return false;
}

// Admin-only: leveranciers in bulk toevoegen aan de catalogus
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Alleen admins kunnen leveranciers toevoegen" }, { status: 403 });
  }

  const body = await req.json();
  const rows: IncomingVendor[] = Array.isArray(body?.vendors) ? body.vendors : [];
  if (rows.length === 0) {
    return NextResponse.json({ error: "Geen leveranciers ontvangen" }, { status: 400 });
  }
  if (rows.length > 2000) {
    return NextResponse.json({ error: "Maximaal 2000 leveranciers per import" }, { status: 400 });
  }

  // Bestaande namen ophalen om dubbele te kunnen overslaan (case-insensitief)
  const existing = await prisma.vendor.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map((v) => v.name.trim().toLowerCase()));

  const errors: { row: number; reason: string }[] = [];
  const skipped: { row: number; name: string }[] = [];
  const seenInBatch = new Set<string>();
  const toCreate: { row: number; data: IncomingVendor & { name: string; category: string } }[] = [];

  rows.forEach((raw, i) => {
    const rowNum = i + 1;
    const name = (raw.name ?? "").trim();
    const category = (raw.category ?? "").trim();
    if (!name || !category) {
      errors.push({ row: rowNum, reason: "Naam en categorie zijn verplicht" });
      return;
    }
    const key = name.toLowerCase();
    if (existingNames.has(key) || seenInBatch.has(key)) {
      skipped.push({ row: rowNum, name });
      return;
    }
    seenInBatch.add(key);
    toCreate.push({ row: rowNum, data: { ...raw, name, category } });
  });

  // Sequentieel geocoderen (cache voorkomt dubbele calls per stad) en aanmaken
  let created = 0;
  for (const { row, data } of toCreate) {
    const geo = await geocodeCity(data.city);
    const imageUrl = data.imageUrl?.trim();
    const isValidImage = imageUrl && /^https?:\/\//i.test(imageUrl);
    try {
      await prisma.vendor.create({
        data: {
          name: data.name,
          category: data.category,
          contactPerson: data.contactPerson?.trim() || null,
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          website: data.website?.trim() || null,
          city: data.city?.trim() || null,
          description: data.description?.trim() || null,
          isPremium: toBool(data.isPremium),
          ...(geo.latitude != null ? { latitude: geo.latitude, longitude: geo.longitude } : {}),
          ...(isValidImage ? { coverPhoto: imageUrl } : {}),
        },
      });
      created++;
    } catch {
      errors.push({ row, reason: "Aanmaken mislukt" });
    }
  }

  return NextResponse.json({
    created,
    skipped: skipped.length,
    skippedRows: skipped,
    errors,
    total: rows.length,
  }, { status: 201 });
}
