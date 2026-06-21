import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ itemId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { itemId } = await params;
  await prisma.draaiboekItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { itemId } = await params;
  const body = await req.json();

  const item = await prisma.draaiboekItem.update({
    where: { id: itemId },
    data: {
      ...(body.startTime !== undefined && { startTime: body.startTime }),
      ...(body.duration !== undefined && { duration: body.duration }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
    include: { vendor: true },
  });

  return NextResponse.json({ item });
}
