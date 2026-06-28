import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnVendorId } from "@/lib/vendorAuth";
import { generateWeddingCode } from "@/lib/wedding-id";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const vendorId = await getOwnVendorId(user.id);
  if (!vendorId) return NextResponse.json({ invites: [] });

  const [invites, directLinks] = await Promise.all([
    prisma.vendorWeddingInvite.findMany({
      where: { vendorId },
      include: { wedding: { select: { id: true, title: true, date: true } } },
      orderBy: { weddingDate: "asc" },
    }),
    prisma.weddingVendor.findMany({
      where: { vendorId, portalAccess: true },
      include: { wedding: { select: { id: true, title: true, date: true } } },
    }),
  ]);

  // Merge: invites take precedence; add direct links that have no corresponding invite
  const inviteWeddingIds = new Set(invites.map(i => i.weddingId).filter(Boolean));
  const extra = directLinks
    .filter(wv => !inviteWeddingIds.has(wv.weddingId))
    .map(wv => ({
      id: `wv-${wv.id}`,
      email1: "",
      email2: null,
      weddingDate: wv.wedding.date.toISOString(),
      weddingTitle: wv.wedding.title,
      notes: null,
      weddingId: wv.weddingId,
      wedding: wv.wedding,
      vendorStatus: wv.status,
      createdAt: wv.wedding.date.toISOString(),
      source: "direct" as const,
    }));

  const allInvites = [
    ...invites.map(i => ({ ...i, vendorStatus: undefined, source: "invite" as const })),
    ...extra,
  ].sort((a, b) => new Date(a.weddingDate).getTime() - new Date(b.weddingDate).getTime());

  return NextResponse.json({ invites: allInvites });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const vendorId = await getOwnVendorId(user.id);
  if (!vendorId) return NextResponse.json({ error: "Geen leveranciersprofiel gevonden" }, { status: 400 });

  const { email1, email2, weddingDate, weddingTitle, notes } = await req.json();
  if (!email1 || !weddingDate) {
    return NextResponse.json({ error: "E-mailadres en trouwdatum zijn verplicht" }, { status: 400 });
  }

  const e1 = email1.toLowerCase();
  const e2 = email2 ? email2.toLowerCase() : null;

  const date = new Date(weddingDate);
  date.setUTCHours(0, 0, 0, 0);
  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  // Check if a wedding already exists for these emails + date
  let wedding = await prisma.wedding.findFirst({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      OR: [
        { coupleEmail1: e1 }, { coupleEmail2: e1 },
        ...(e2 ? [{ coupleEmail1: e2 }, { coupleEmail2: e2 }] : []),
      ],
    },
  });

  const alreadyExisted = !!wedding;

  if (!wedding) {
    // Create a placeholder wedding so the vendor has a dashboard right away
    const title = weddingTitle?.trim() || `Bruiloft ${new Date(date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}`;
    const weddingCode = generateWeddingCode(e1, e2 ?? e1, weddingDate);

    const existing = await prisma.wedding.findUnique({ where: { weddingCode } });
    if (existing) {
      wedding = existing;
    } else {
      wedding = await prisma.wedding.create({
        data: {
          weddingCode,
          title,
          date,
          coupleEmail1: e1,
          coupleEmail2: e2 ?? "",
          ownerId: user.id,
          notes,
        },
      });
      await prisma.budget.create({ data: { weddingId: wedding.id, totalAmount: 0 } });
    }
  }

  // Link vendor to the wedding
  await prisma.weddingVendor.upsert({
    where: { weddingId_vendorId: { weddingId: wedding.id, vendorId } },
    update: { portalAccess: true },
    create: { weddingId: wedding.id, vendorId, status: "lead", portalAccess: true },
  });

  // Store the invite for future matching (if couple signs up later)
  const invite = await prisma.vendorWeddingInvite.create({
    data: {
      vendorId,
      email1: e1,
      email2: e2,
      weddingDate: date,
      weddingTitle: weddingTitle || null,
      notes: notes || null,
      weddingId: wedding.id,
    },
    include: { wedding: { select: { id: true, title: true, date: true } } },
  });

  return NextResponse.json({ invite, matched: alreadyExisted }, { status: 201 });
}
