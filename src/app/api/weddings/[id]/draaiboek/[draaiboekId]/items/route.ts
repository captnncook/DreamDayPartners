import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; draaiboekId: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { draaiboekId } = await params;
  const body = await req.json();

  const item = await prisma.draaiboekItem.create({
    data: {
      draaiboekId,
      startTime: body.startTime,
      duration: body.duration ?? 30,
      title: body.title,
      description: body.description ?? null,
      location: body.location ?? null,
      sortOrder: body.sortOrder ?? 0,
      assignedUserId: body.assignedUserId ?? null,
      vendorId: body.vendorId ?? null,
      notes: body.notes ?? null,
      isPublic: body.isPublic ?? true,
    },
    include: { vendor: true },
  });

  return NextResponse.json({ item }, { status: 201 });
}
