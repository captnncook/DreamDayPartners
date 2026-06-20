import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateWeddingCode } from "@/lib/wedding-id";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  let weddings;

  if (user.role === "admin") {
    weddings = await prisma.wedding.findMany({
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
    });
  } else if (user.role === "vendor") {
    weddings = await prisma.wedding.findMany({
      where: {
        vendors: { some: { vendor: { userId: user.id }, portalAccess: true } },
      },
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
    });
  } else {
    weddings = await prisma.wedding.findMany({
      where: {
        teamMembers: { some: { userId: user.id } },
      },
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
    });
  }

  return NextResponse.json({ weddings });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await req.json();
  const { title, date, venue, coupleEmail1, coupleEmail2, notes } = body;

  if (!title || !date || !coupleEmail1 || !coupleEmail2) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  const weddingCode = generateWeddingCode(coupleEmail1, coupleEmail2, date);

  const existing = await prisma.wedding.findUnique({ where: { weddingCode } });
  if (existing) {
    return NextResponse.json({ error: "Er bestaat al een bruiloft voor dit koppel op deze datum", weddingCode }, { status: 409 });
  }

  let ownerId = user.id;
  const coupleUser = await prisma.user.findUnique({ where: { email: coupleEmail1 } });
  if (coupleUser && coupleUser.role === "couple") {
    ownerId = coupleUser.id;
  }

  const wedding = await prisma.wedding.create({
    data: {
      weddingCode,
      title,
      date: new Date(date),
      venue,
      coupleEmail1,
      coupleEmail2,
      ownerId,
      notes,
    },
  });

  await prisma.weddingTeamMember.create({
    data: {
      weddingId: wedding.id,
      userId: user.id,
      role: user.role === "couple" ? "couple" : "planner",
    },
  });

  if (coupleUser && coupleUser.id !== user.id) {
    await prisma.weddingTeamMember.create({
      data: { weddingId: wedding.id, userId: coupleUser.id, role: "couple" },
    }).catch(() => {});
  }

  await prisma.budget.create({
    data: { weddingId: wedding.id, totalAmount: 0 },
  });

  return NextResponse.json({ wedding }, { status: 201 });
}
