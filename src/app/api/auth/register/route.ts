import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { generateWeddingCode } from "@/lib/wedding-id";

/**
 * Publieke registratie via de "Begin gratis" wizard.
 * type: "couple" -> maakt bruidspaar-account + bruiloft
 * type: "vendor" -> maakt leverancier-account + catalogusprofiel
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, email } = body;

  if (!type || !email) {
    return NextResponse.json({ error: "Type en e-mailadres zijn verplicht" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Er bestaat al een account met dit e-mailadres. Log in om verder te gaan." },
      { status: 409 }
    );
  }

  if (type === "couple") {
    const { partner1, partner2, date, venue, budget, notes, guestCount } = body;

    const coupleName = partner1 && partner2 ? `${partner1} & ${partner2}` : partner1 || "Bruidspaar";

    const user = await prisma.user.create({
      data: { email, name: coupleName, role: "couple", isPremium: false },
    });
    await setSession(user.id);

    const weddingDate = date
      ? new Date(date)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const title = partner1 && partner2 ? `Bruiloft ${partner1} & ${partner2}` : "Mijn Bruiloft";
    const email2 = body.partnerEmail || `partner-${user.id.slice(0, 8)}@dreamday.local`;
    const weddingCode = generateWeddingCode(email, email2, weddingDate.toISOString().split("T")[0]);

    const wedding = await prisma.wedding.create({
      data: {
        weddingCode,
        title,
        date: weddingDate,
        venue: venue || null,
        coupleEmail1: email,
        coupleEmail2: email2,
        ownerId: user.id,
        notes: notes || null,
      },
    });

    await prisma.weddingTeamMember.create({
      data: { weddingId: wedding.id, userId: user.id, role: "couple" },
    });

    await prisma.budget.create({
      data: { weddingId: wedding.id, totalAmount: budget ? parseFloat(String(budget)) : 0 },
    });

    if (guestCount) {
      // bewaar verwacht aantal gasten als notitie indien geen apart veld
    }

    return NextResponse.json({ user, redirect: `/weddings/${wedding.id}` }, { status: 201 });
  }

  if (type === "vendor") {
    const { businessName, category, contactPerson, phone, website, city, description } = body;

    if (!businessName || !category) {
      return NextResponse.json({ error: "Bedrijfsnaam en categorie zijn verplicht" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: contactPerson || businessName,
        role: "vendor",
        vendorType: category,
        isPremium: false,
      },
    });
    await setSession(user.id);

    await prisma.vendor.create({
      data: {
        name: businessName,
        category,
        contactPerson: contactPerson || null,
        email,
        phone: phone || null,
        website: website || null,
        city: city || null,
        description: description || null,
        userId: user.id,
      },
    });

    return NextResponse.json({ user, redirect: "/leveranciers/mijn-profiel" }, { status: 201 });
  }

  return NextResponse.json({ error: "Ongeldig type" }, { status: 400 });
}
