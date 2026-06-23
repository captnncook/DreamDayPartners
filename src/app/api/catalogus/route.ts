import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
