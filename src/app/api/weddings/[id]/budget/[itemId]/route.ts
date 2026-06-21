import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { itemId } = await params;
  const body = await req.json();

  const item = await prisma.budgetItem.update({
    where: { id: itemId },
    data: {
      ...(body.payStatus !== undefined && { payStatus: body.payStatus }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.estimated !== undefined && { estimated: body.estimated }),
      ...(body.actual !== undefined && { actual: body.actual }),
    },
    include: { vendor: true },
  });

  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { itemId } = await params;
  await prisma.budgetItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
