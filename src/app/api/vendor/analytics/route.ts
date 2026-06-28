import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const vendor = await prisma.vendor.findFirst({ where: { userId: user.id }, select: { id: true } });
  if (!vendor) return NextResponse.json({ error: "Geen leveranciersprofiel" }, { status: 404 });

  const weddingVendors = await prisma.weddingVendor.findMany({
    where: { vendorId: vendor.id, portalAccess: true },
    include: { wedding: { select: { date: true, title: true } } },
  });

  const now = new Date();
  const thisYear = now.getFullYear();

  const byMonth: Record<number, number> = {};
  const byMonthRevenue: Record<number, number> = {};
  const byYear: Record<number, number> = {};
  let totalRevenue = 0;

  for (const wv of weddingVendors) {
    const d = wv.wedding.date;
    const m = d.getMonth(); // 0-11
    const y = d.getFullYear();
    byMonth[m] = (byMonth[m] ?? 0) + 1;
    byYear[y] = (byYear[y] ?? 0) + 1;
    const rev = wv.finalAmount ?? wv.depositAmount ?? 0;
    totalRevenue += rev;
    byMonthRevenue[m] = (byMonthRevenue[m] ?? 0) + rev;
  }

  const monthNames = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
  const monthsData = monthNames.map((name, i) => ({ name, count: byMonth[i] ?? 0, revenue: byMonthRevenue[i] ?? 0 }));

  const upcoming = weddingVendors.filter(wv => new Date(wv.wedding.date) >= now).length;
  const past = weddingVendors.filter(wv => new Date(wv.wedding.date) < now).length;

  return NextResponse.json({
    total: weddingVendors.length,
    thisYear: byYear[thisYear] ?? 0,
    upcoming,
    past,
    totalRevenue,
    monthsData,
    byYear: Object.entries(byYear).map(([year, count]) => ({ year: Number(year), count })).sort((a, b) => a.year - b.year),
  });
}
