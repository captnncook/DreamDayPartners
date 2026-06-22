import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/r2";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id }, select: { photos: true } });
  if (!vendor) return NextResponse.json({ urls: [] });

  if (!vendor.photos.length) return NextResponse.json({ urls: [] });

  const urls = await Promise.all(vendor.photos.map((k) => getDownloadUrl(k, 3600)));
  return NextResponse.json({ urls });
}
