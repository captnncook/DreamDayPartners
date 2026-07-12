import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    include: {
      owner: true,
      teamMembers: { include: { user: true } },
      vendors: { include: { vendor: true } },
      budget: { include: { items: { include: { vendor: true } } } },
      tasks: { include: { assignedUser: true } },
      guests: true,
      draaiboeken: { include: { items: { include: { vendor: true }, orderBy: { sortOrder: "asc" } } } },
      threads: { include: { messages: { include: { sender: true }, orderBy: { createdAt: "asc" }, take: 5 } } },
      seatTables: { include: { guests: true } },
    },
  });

  if (!wedding) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  return NextResponse.json({ wedding });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const wedding = await prisma.wedding.update({
    where: { id },
    data: {
      title: body.title,
      date: body.date ? new Date(body.date) : undefined,
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      venue: body.venue,
      status: body.status,
      notes: body.notes,
    },
  });

  return NextResponse.json({ wedding });
}
