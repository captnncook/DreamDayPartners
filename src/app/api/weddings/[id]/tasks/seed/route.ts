import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const TEMPLATE_TASKS = [
  { title: "Datum en locatie bepalen", category: "venue", priority: "high" },
  { title: "Budget vaststellen", category: "general", priority: "high" },
  { title: "Gastenlijst opstellen", category: "general", priority: "high" },
  { title: "Trouwlocatie boeken", category: "venue", priority: "high" },
  { title: "Catering regelen", category: "catering", priority: "high" },
  { title: "Fotograaf boeken", category: "photo", priority: "high" },
  { title: "Trouwkleding uitzoeken", category: "clothing", priority: "medium" },
  { title: "Bloemen en decoratie regelen", category: "decoration", priority: "medium" },
  { title: "DJ of band boeken", category: "music", priority: "medium" },
  { title: "Uitnodigingen versturen", category: "general", priority: "medium" },
  { title: "Huwelijkse voorwaarden bespreken", category: "legal", priority: "medium" },
  { title: "Trouwambtenaar regelen", category: "legal", priority: "high" },
  { title: "Huwelijksreis plannen", category: "general", priority: "low" },
  { title: "Taart bestellen", category: "catering", priority: "medium" },
  { title: "Make-up en haar afspraken maken", category: "clothing", priority: "medium" },
  { title: "Vervoer regelen", category: "general", priority: "low" },
  { title: "Dag-draaiboek opstellen", category: "general", priority: "medium" },
  { title: "Zitplaatsindeling gasten maken", category: "general", priority: "low" },
  { title: "Ringen uitzoeken en bestellen", category: "general", priority: "high" },
  { title: "Huwelijksgeloften schrijven", category: "general", priority: "medium" },
];

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  await prisma.task.createMany({
    data: TEMPLATE_TASKS.map(t => ({
      weddingId: id,
      title: t.title,
      category: t.category,
      priority: t.priority,
      status: "open",
    })),
    skipDuplicates: false,
  });

  return NextResponse.json({ ok: true });
}
