import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const budget = await prisma.budget.findUnique({
    where: { weddingId: id },
    include: { items: { include: { vendor: true }, orderBy: { category: "asc" } } },
  });

  return NextResponse.json({ budget });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const { totalAmount } = await req.json();

  const budget = await prisma.budget.update({
    where: { weddingId: id },
    data: { totalAmount },
    include: { items: { include: { vendor: true } } },
  });

  return NextResponse.json({ budget });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const budget = await prisma.budget.findUnique({ where: { weddingId: id } });
  if (!budget) return NextResponse.json({ error: "Geen budget gevonden" }, { status: 404 });

  const item = await prisma.budgetItem.create({
    data: {
      budgetId: budget.id,
      category: body.category,
      description: body.description,
      estimated: body.estimated ?? 0,
      actual: body.actual ?? 0,
      vendorId: body.vendorId ?? null,
      payStatus: body.payStatus ?? "pending",
      invoiceUrl: body.invoiceUrl ?? null,
    },
    include: { vendor: true },
  });

  return NextResponse.json({ item }, { status: 201 });
}
