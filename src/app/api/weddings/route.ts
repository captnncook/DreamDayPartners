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
  const { title, date, endDate, venue, coupleEmail1, coupleEmail2, notes } = body;

  if (!title || !date || !coupleEmail1 || !coupleEmail2) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  const e1 = coupleEmail1.toLowerCase();
  const e2 = coupleEmail2.toLowerCase();
  const weddingCode = generateWeddingCode(e1, e2, date);

  // Check if a vendor already created a placeholder wedding for this couple
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const vendorPlaceholder = await prisma.wedding.findFirst({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      OR: [
        { coupleEmail1: e1 }, { coupleEmail2: e1 },
        { coupleEmail1: e2 }, { coupleEmail2: e2 },
      ],
      // Only match vendor-created placeholders (owner is a vendor user)
      owner: { role: "vendor" },
    },
  });

  let wedding;

  if (vendorPlaceholder) {
    // Claim the existing placeholder: update title, venue, emails, owner, weddingCode
    let ownerId = user.id;
    const coupleUser = await prisma.user.findUnique({ where: { email: e1 } });
    if (coupleUser?.role === "couple") ownerId = coupleUser.id;

    wedding = await prisma.wedding.update({
      where: { id: vendorPlaceholder.id },
      data: { title, venue, coupleEmail1: e1, coupleEmail2: e2, ownerId, weddingCode, notes: notes ?? vendorPlaceholder.notes },
    });

    // Add current user as team member
    await prisma.weddingTeamMember.upsert({
      where: { weddingId_userId: { weddingId: wedding.id, userId: user.id } },
      update: {},
      create: { weddingId: wedding.id, userId: user.id, role: user.role === "couple" ? "couple" : "planner" },
    });
    if (coupleUser && coupleUser.id !== user.id) {
      await prisma.weddingTeamMember.upsert({
        where: { weddingId_userId: { weddingId: wedding.id, userId: coupleUser.id } },
        update: {},
        create: { weddingId: wedding.id, userId: coupleUser.id, role: "couple" },
      }).catch(() => {});
    }
  } else {
    // No vendor placeholder — check for exact duplicate
    const existing = await prisma.wedding.findUnique({ where: { weddingCode } });
    if (existing) {
      return NextResponse.json({ error: "Er bestaat al een bruiloft voor dit koppel op deze datum", weddingCode }, { status: 409 });
    }

    let ownerId = user.id;
    const coupleUser = await prisma.user.findUnique({ where: { email: e1 } });
    if (coupleUser?.role === "couple") ownerId = coupleUser.id;

    wedding = await prisma.wedding.create({
      data: { weddingCode, title, date: new Date(date),
      endDate: endDate ? new Date(endDate) : null, venue, coupleEmail1: e1, coupleEmail2: e2, ownerId, notes },
    });

    await prisma.weddingTeamMember.create({
      data: { weddingId: wedding.id, userId: user.id, role: user.role === "couple" ? "couple" : "planner" },
    });
    if (coupleUser && coupleUser.id !== user.id) {
      await prisma.weddingTeamMember.create({
        data: { weddingId: wedding.id, userId: coupleUser.id, role: "couple" },
      }).catch(() => {});
    }

    await prisma.budget.upsert({
      where: { weddingId: wedding.id },
      update: {},
      create: { weddingId: wedding.id, totalAmount: 0 },
    });
  }

  // Update any unlinked vendor invites that match this couple + date
  const unlinkedInvites = await prisma.vendorWeddingInvite.findMany({
    where: {
      weddingDate: { gte: dayStart, lte: dayEnd },
      OR: [
        { email1: e1 }, { email2: e1 },
        { email1: e2 }, { email2: e2 },
      ],
      NOT: { weddingId: wedding.id },
    },
  });

  for (const invite of unlinkedInvites) {
    await prisma.weddingVendor.upsert({
      where: { weddingId_vendorId: { weddingId: wedding.id, vendorId: invite.vendorId } },
      update: { portalAccess: true },
      create: { weddingId: wedding.id, vendorId: invite.vendorId, status: "lead", portalAccess: true },
    });
    await prisma.vendorWeddingInvite.update({ where: { id: invite.id }, data: { weddingId: wedding.id } });
  }

  return NextResponse.json({ wedding }, { status: 201 });
}
