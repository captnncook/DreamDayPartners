import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getDownloadUrl } from "@/lib/r2";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "couple") return NextResponse.json({ team: [] });

  const wedding = await prisma.wedding.findFirst({
    where: { teamMembers: { some: { userId: user.id } } },
    include: {
      vendors: {
        include: {
          vendor: { select: { id: true, name: true, category: true, emblemPhoto: true, coverPhoto: true } },
        },
      },
    },
  });

  if (!wedding) return NextResponse.json({ weddingId: null, team: [] });

  // Group by category: keep only the first (primary) vendor per category
  const byCategory: Record<string, { vendorId: string; name: string; category: string; photoKey: string | null }> = {};
  for (const wv of wedding.vendors) {
    const cat = wv.vendor.category;
    if (!byCategory[cat]) {
      byCategory[cat] = {
        vendorId: wv.vendor.id,
        name: wv.vendor.name,
        category: cat,
        photoKey: wv.vendor.emblemPhoto ?? wv.vendor.coverPhoto ?? null,
      };
    }
  }

  const entries = Object.values(byCategory);
  const team = await Promise.all(entries.map(async (e) => ({
    vendorId: e.vendorId,
    name: e.name,
    category: e.category,
    photo: e.photoKey ? await getDownloadUrl(e.photoKey, 3600).catch(() => null) : null,
  })));

  return NextResponse.json({ weddingId: wedding.id, team });
}
