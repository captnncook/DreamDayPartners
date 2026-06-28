import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/r2";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id }, select: { photos: true, coverPhoto: true, emblemPhoto: true } });
  if (!vendor) return NextResponse.json({ urls: [], coverUrl: null, emblemUrl: null });

  const [urls, coverUrl, emblemUrl] = await Promise.all([
    vendor.photos.length
      ? Promise.all(vendor.photos.map((k) => getDownloadUrl(k, 3600)))
      : Promise.resolve([]),
    vendor.coverPhoto ? getDownloadUrl(vendor.coverPhoto, 3600) : Promise.resolve(null),
    vendor.emblemPhoto ? getDownloadUrl(vendor.emblemPhoto, 3600) : Promise.resolve(null),
  ]);

  return NextResponse.json({ urls, coverUrl, emblemUrl });
}
