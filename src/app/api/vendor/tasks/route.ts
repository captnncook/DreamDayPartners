import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const tasks = await prisma.task.findMany({
    where: { assignedTo: user.id, status: { not: "done" } },
    include: { wedding: { select: { title: true } } },
    orderBy: { dueDate: "asc" },
    take: 10,
  });

  return NextResponse.json({ tasks: tasks.map(t => ({ ...t, weddingTitle: t.wedding.title })) });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { weddingId, title, dueDate } = await req.json();
  if (!weddingId || !title) return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });

  // verify vendor has access to this wedding
  const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
  if (!vendor) return NextResponse.json({ error: "Geen profiel" }, { status: 400 });

  const wv = await prisma.weddingVendor.findFirst({ where: { weddingId, vendorId: vendor.id, portalAccess: true } });
  if (!wv) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const task = await prisma.task.create({
    data: { weddingId, title, assignedTo: user.id, priority: "medium", category: "vendor", dueDate: dueDate ? new Date(dueDate) : null },
    include: { wedding: { select: { title: true } } },
  });
  return NextResponse.json({ task: { ...task, weddingTitle: task.wedding.title } });
}
