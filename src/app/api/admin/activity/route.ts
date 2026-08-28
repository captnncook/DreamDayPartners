import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { withErrorLogging } from "@/lib/apiErrorLogging";

// Puur signalerend: telt hoe vaak elk IP de afgelopen 24 uur voorkwam,
// zonder ooit iemand te blokkeren. Een enkele of dubbele hit is normaal
// gedrag (nieuwsgierigheid) en wordt niet als opvallend gemarkeerd — pas
// bij echt hoog volume krijgt een IP een visuele nadruk in de UI.
const NOTABLE_THRESHOLD = 8;

async function GETImpl() {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [recent, grouped] = await Promise.all([
    prisma.activitySignal.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.activitySignal.groupBy({
      by: ["ip"],
      where: { createdAt: { gte: since24h }, ip: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { ip: "desc" } },
    }),
  ]);

  return NextResponse.json({
    recent: recent.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })),
    perIp: grouped.map((g) => ({ ip: g.ip, count: g._count._all, notable: g._count._all >= NOTABLE_THRESHOLD })),
    notableThreshold: NOTABLE_THRESHOLD,
  });
}

export const GET = withErrorLogging(GETImpl);
