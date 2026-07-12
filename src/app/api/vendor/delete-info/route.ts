import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Feitelijke cijfers voor de "weet je het zeker?"-stap bij het verwijderen
// van een leveranciersaccount.
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const vendor = await prisma.vendor.findFirst({ where: { userId: user.id }, select: { id: true, viewCount: true } });
  if (!vendor) return NextResponse.json({ error: "Profiel niet gevonden" }, { status: 404 });

  const [upcomingWeddings, totalWeddings, documents] = await Promise.all([
    prisma.weddingVendor.count({ where: { vendorId: vendor.id, wedding: { date: { gte: new Date() } } } }),
    prisma.weddingVendor.count({ where: { vendorId: vendor.id } }),
    prisma.document.count({ where: { vendorBooking: { vendorId: vendor.id } } }),
  ]);

  return NextResponse.json({
    upcomingWeddings,
    totalWeddings,
    profileViews: vendor.viewCount,
    documents,
  });
}
