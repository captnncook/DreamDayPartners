import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/r2";

// Extern gehoste foto's (bijv. bij bulk-import) staan al als volledige URL
// opgeslagen en hoeven niet gesigned te worden — alleen R2-object-keys wel.
function resolvePhoto(key: string, expiresInSeconds: number): Promise<string> {
  if (/^https?:\/\//i.test(key)) return Promise.resolve(key);
  return getDownloadUrl(key, expiresInSeconds);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id }, select: { photos: true, coverPhoto: true, emblemPhoto: true } });
  if (!vendor) return NextResponse.json({ urls: [], coverUrl: null, emblemUrl: null });

  // Oudere bulk-imports zetten dezelfde link soms in zowel coverPhoto als
  // photos[0] — die duplicaat niet nogmaals in de galerij tonen.
  const galleryKeys = vendor.photos.filter((k) => k !== vendor.coverPhoto);

  const [urls, coverUrl, emblemUrl] = await Promise.all([
    galleryKeys.length
      ? Promise.all(galleryKeys.map((k) => resolvePhoto(k, 3600)))
      : Promise.resolve([]),
    vendor.coverPhoto ? resolvePhoto(vendor.coverPhoto, 3600) : Promise.resolve(null),
    vendor.emblemPhoto ? resolvePhoto(vendor.emblemPhoto, 3600) : Promise.resolve(null),
  ]);

  return NextResponse.json({ urls, coverUrl, emblemUrl });
}
