import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const EVENT_LABELS: Record<string, string> = {
  password_reset: "Wachtwoordreset",
  email_change: "E-mailwijziging",
  vendor_type_change: "Leverancierstype gewijzigd",
  claim_approved: "Claim goedgekeurd",
  claim_rejected: "Claim afgewezen",
  claim_reminder: "Herinnering verstuurd",
  account_created: "Account geactiveerd",
  error: "Foutmelding",
};

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [recentEvents, topVendors, loginsToday, loginsWeek, errorCount] = await Promise.all([
    prisma.adminEvent.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.vendor.findMany({
      where: { viewCount: { gt: 0 } },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { id: true, name: true, category: true, viewCount: true },
    }),
    prisma.user.count({ where: { lastLoginAt: { gte: since24h } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: since7d } } }),
    prisma.adminEvent.count({ where: { type: "error", createdAt: { gte: since7d } } }),
  ]);

  return NextResponse.json({
    recentEvents: recentEvents.map((e) => ({
      id: e.id,
      type: e.type,
      label: EVENT_LABELS[e.type] ?? e.type,
      message: e.message,
      targetEmail: e.targetEmail,
      createdAt: e.createdAt.toISOString(),
    })),
    topVendors,
    loginsToday,
    loginsWeek,
    errorCount7d: errorCount,
  });
}
