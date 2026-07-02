import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/r2";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id }, select: { photos: true, coverPhoto: true, emblemPhoto: true } });
  if (!vendor) return NextResponse.json({ urls: [], coverUrl: null, emblemUrl: null });

  // Oudere bulk-imports zetten dezelfde link soms in zowel coverPhoto als
  // photos[0] — die duplicaat niet nogmaals in de galerij tonen.
  const galleryKeys = vendor.photos.filter((k) => k !== vendor.coverPhoto);

  const [urls, coverUrl, emblemUrl] = await Promise.all([
    galleryKeys.length
      ? Promise.all(galleryKeys.map((k) => getDownloadUrl(k, 3600)))
      : Promise.resolve([]),
    vendor.coverPhoto ? getDownloadUrl(vendor.coverPhoto, 3600) : Promise.resolve(null),
    vendor.emblemPhoto ? getDownloadUrl(vendor.emblemPhoto, 3600) : Promise.resolve(null),
  ]);

  return NextResponse.json({ urls, coverUrl, emblemUrl });
}
