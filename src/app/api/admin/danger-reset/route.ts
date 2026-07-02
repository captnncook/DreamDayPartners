import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const ADMIN_EMAIL = "info@dreamdayplatform.com";
const CONFIRM_PHRASE = "VERWIJDER ALLES";

// Tijdelijke, admin-only endpoint om alle vendors, weddings en niet-admin
// accounts te wissen. Verwijderen na gebruik.
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Niet toegestaan" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  if (body?.confirm !== CONFIRM_PHRASE) {
    return NextResponse.json({ error: "Bevestigingszin onjuist" }, { status: 400 });
  }

  const [vendorCount, weddingCount] = await prisma.$transaction([
    prisma.vendor.deleteMany({}),
    prisma.wedding.deleteMany({}),
  ]);

  const userResult = await prisma.user.deleteMany({
    where: { email: { not: ADMIN_EMAIL } },
  });

  return NextResponse.json({
    vendorsDeleted: vendorCount.count,
    weddingsDeleted: weddingCount.count,
    usersDeleted: userResult.count,
  });
}
