import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getDownloadUrl } from "@/lib/r2";
import { geocodeCity } from "@/lib/geocode";

const VENDOR_LIST_SELECT = {
  id: true,
  name: true,
  category: true,
  description: true,
  isPremium: true,
  coverPhoto: true,
  city: true,
  latitude: true,
  longitude: true,
  priceFrom: true,
  specializations: true,
} satisfies Prisma.VendorSelect;

type VendorListItem = Prisma.VendorGetPayload<{ select: typeof VENDOR_LIST_SELECT }>;

const PAGE_SIZE = 60;
const EARTH_KM = 6371;

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Zoekt de bruiloftslocatie van de ingelogde gebruiker (bruidspaar, planner
// of teamlid) op, zodat we leveranciers bij hen in de buurt bovenaan kunnen
// tonen. Geeft null terug als er geen (gegeocodeerde) locatie bekend is.
async function findUserLocation(userId: string): Promise<{ latitude: number; longitude: number } | null> {
  const wedding = await prisma.wedding.findFirst({
    where: {
      latitude: { not: null },
      OR: [{ ownerId: userId }, { teamMembers: { some: { userId } } }],
    },
    select: { latitude: true, longitude: true },
    orderBy: { updatedAt: "desc" },
  });
  if (!wedding?.latitude || !wedding.longitude) return null;
  return { latitude: wedding.latitude, longitude: wedding.longitude };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const all = searchParams.get("all") === "1";

  const where = {
    archivedAt: null, // gearchiveerde (vertrokken) leveranciers niet tonen
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

  // Kaartweergave: alle matches over alle pagina's heen tonen, niet slechts
  // de huidige pagina. Lichte payload (geen foto's/omschrijving) omdat dit
  // in één keer honderden/duizenden leveranciers kan zijn.
  if (all) {
    const allVendors = await prisma.vendor.findMany({
      where,
      select: { id: true, name: true, category: true, city: true, latitude: true, longitude: true, isPremium: true },
      orderBy: [{ isPremium: "desc" }, { name: "asc" }],
    });
    return NextResponse.json({ vendors: allVendors, total: allVendors.length });
  }

  // Bewust géén contactPerson/email/phone/website in de lijst-response:
  // dit endpoint is publiek en zou anders in bulk (60 per pagina) de complete
  // contactdatabase van leveranciers lekken naar scrapers. Contactgegevens
  // staan alleen in de detail-API, één leverancier per request.
  const select = VENDOR_LIST_SELECT;

  const user = await getSession();
  const location = user ? await findUserLocation(user.id) : null;

  let vendors: Array<VendorListItem & { distanceKm?: number | null }>;
  let total: number;

  if (location) {
    // Locatie bekend: alle matches ophalen, op afstand sorteren en pas dan
    // pagineren. De catalogus is nog klein genoeg om dit in het geheugen te
    // doen; bij duizenden leveranciers zou dit met PostGIS moeten.
    const all = await prisma.vendor.findMany({ where, select });
    total = all.length;
    const withDistance = all.map((v) => ({
      ...v,
      distanceKm: v.latitude != null && v.longitude != null
        ? distanceKm(location.latitude, location.longitude, v.latitude, v.longitude)
        : null,
    }));
    withDistance.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) {
        return Number(b.isPremium) - Number(a.isPremium) || a.name.localeCompare(b.name);
      }
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
    vendors = withDistance.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  } else {
    const [pageVendors, count] = await Promise.all([
      prisma.vendor.findMany({
        where,
        select,
        orderBy: [{ isPremium: "desc" }, { name: "asc" }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.vendor.count({ where }),
    ]);
    vendors = pageVendors;
    total = count;
  }

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
