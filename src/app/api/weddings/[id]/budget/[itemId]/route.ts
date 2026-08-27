import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { withErrorLogging } from "@/lib/apiErrorLogging";

type Params = { params: Promise<{ id: string; itemId: string }> };

async function PATCHImpl(req: NextRequest, { params }: Params) {
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

async function DELETEImpl(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { itemId } = await params;
  await prisma.budgetItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}

export const PATCH = withErrorLogging(PATCHImpl);
export const DELETE = withErrorLogging(DELETEImpl);
