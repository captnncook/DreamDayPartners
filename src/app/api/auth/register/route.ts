import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { generateWeddingCode, generateRsvpSlug } from "@/lib/wedding-id";
import { hash } from "bcryptjs";
import { sendMail, claimWelcomeEmail } from "@/lib/mail";
import { geocodeCity } from "@/lib/geocode";
import { seedStarterTasks } from "@/lib/starterTasks";

import { withErrorLogging } from "@/lib/apiErrorLogging";
async function POSTImpl(req: NextRequest) {
  const body = await req.json();
  const { verifiedToken, password } = body as { verifiedToken: string; password?: string };

  if (!verifiedToken) {
    return NextResponse.json({ error: "Verificatietoken ontbreekt" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Wachtwoord moet minimaal 8 tekens zijn" }, { status: 400 });
  }

  const rows = await prisma.$queryRawUnsafe<Array<{
    id: string; email: string; type: string; data: string; verified: boolean;
  }>>(
    `SELECT * FROM "pending_registrations" WHERE "verifiedToken" = $1`,
    verifiedToken
  );

  const pending = rows[0];
  if (!pending || !pending.verified) {
    return NextResponse.json({ error: "Ongeldig of verlopen token. Start opnieuw." }, { status: 401 });
  }

  const existing = await prisma.user.findUnique({ where: { email: pending.email } });
  if (existing) {
    return NextResponse.json({ error: "Er bestaat al een account met dit e-mailadres." }, { status: 409 });
  }

  const data = JSON.parse(pending.data);
  const passwordHash = await hash(password, 12);

  // Clean up used token
  await prisma.$executeRawUnsafe(
    `DELETE FROM "pending_registrations" WHERE "verifiedToken" = $1`,
    verifiedToken
  );

  if (pending.type === "couple") {
    const { partner1, partner2, date, endDate, venue, budget, guestCount } = data;
    if (!date) {
      return NextResponse.json({ error: "Trouwdatum ontbreekt. Ga terug en vul jullie trouwdatum in." }, { status: 400 });
    }
    const coupleName = partner1 && partner2 ? `${partner1} & ${partner2}` : partner1 || "Bruidspaar";

    const user = await prisma.user.create({
      data: { email: pending.email, name: coupleName, role: "couple", isPremium: false, passwordHash },
    });
    await setSession(user.id);

    // Als een leverancier deze bruiloft al zelf had geregistreerd (via "Mijn
    // bruiloften") bestaat er al een Wedding op dit e-mailadres — dan koppelen
    // we het nieuwe account daaraan i.p.v. een dubbele bruiloft aan te maken.
    const existingWedding = await prisma.wedding.findFirst({
      where: { OR: [{ coupleEmail1: pending.email }, { coupleEmail2: pending.email }] },
    });
    if (existingWedding) {
      await prisma.wedding.update({ where: { id: existingWedding.id }, data: { ownerId: user.id } });
      await prisma.weddingTeamMember.upsert({
        where: { weddingId_userId: { weddingId: existingWedding.id, userId: user.id } },
        update: {},
        create: { weddingId: existingWedding.id, userId: user.id, role: "couple" },
      });
      return NextResponse.json({ redirect: `/weddings/${existingWedding.id}` }, { status: 201 });
    }

    const weddingDate = new Date(date);
    const title = partner1 && partner2 ? `Bruiloft ${partner1} & ${partner2}` : "Mijn Bruiloft";
    const email2 = `partner-${user.id.slice(0, 8)}@dreamday.local`;
    const weddingCode = generateWeddingCode(pending.email, email2, weddingDate.toISOString().split("T")[0]);
    const rsvpToken = generateRsvpSlug(partner1 || coupleName, partner2);

    const wedding = await prisma.wedding.create({
      data: {
        weddingCode,
        rsvpToken,
        title,
        date: weddingDate,
        endDate: endDate ? new Date(endDate) : null,
        venue: venue || null,
        coupleEmail1: pending.email,
        coupleEmail2: email2,
        ownerId: user.id,
      },
    });

    await prisma.weddingTeamMember.create({
      data: { weddingId: wedding.id, userId: user.id, role: "couple" },
    });

    await prisma.budget.create({
      data: { weddingId: wedding.id, totalAmount: budget ? parseFloat(String(budget)) : 0 },
    });

    await seedStarterTasks(wedding.id);

    if (guestCount) { /* stored in wedding notes if needed */ }

    return NextResponse.json({ redirect: `/weddings/${wedding.id}` }, { status: 201 });
  }

  if (pending.type === "vendor") {
    const { businessName, category, contactPerson, phone, website, city } = data;

    if (!businessName || !category) {
      return NextResponse.json({ error: "Bedrijfsnaam en categorie zijn verplicht" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email: pending.email,
        name: contactPerson || businessName,
        role: "vendor",
        vendorType: category,
        isPremium: false,
        passwordHash,
      },
    });
    await setSession(user.id);

    const geo = await geocodeCity(city);

    await prisma.vendor.create({
      data: {
        name: businessName,
        category,
        contactPerson: contactPerson || null,
        email: pending.email,
        phone: phone || null,
        website: website || null,
        city: city || null,
        latitude: geo.latitude ?? null,
        longitude: geo.longitude ?? null,
        userId: user.id,
      },
    });

    const tpl = claimWelcomeEmail(businessName);
    await sendMail({ to: pending.email, subject: tpl.subject, html: tpl.html, role: "vendor", name: businessName });

    return NextResponse.json({ redirect: "/leveranciers/mijn-profiel" }, { status: 201 });
  }

  if (pending.type === "team_member") {
    const { inviteToken, name } = data as { inviteToken: string; name: string };

    const invite = await prisma.weddingTeamInvite.findUnique({ where: { token: inviteToken } });
    if (!invite || invite.acceptedAt || invite.email !== pending.email) {
      return NextResponse.json({ error: "Deze uitnodiging is niet meer geldig. Vraag een nieuwe uitnodiging aan." }, { status: 410 });
    }

    const user = await prisma.user.create({
      data: { email: pending.email, name: name || "Teamlid", role: "team_member", isPremium: false, passwordHash },
    });
    await setSession(user.id);

    await prisma.weddingTeamMember.upsert({
      where: { weddingId_userId: { weddingId: invite.weddingId, userId: user.id } },
      update: {},
      create: { weddingId: invite.weddingId, userId: user.id, role: "team_member" },
    });
    await prisma.weddingTeamInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });

    return NextResponse.json({ redirect: `/weddings/${invite.weddingId}` }, { status: 201 });
  }

  return NextResponse.json({ error: "Ongeldig type" }, { status: 400 });
}

export const POST = withErrorLogging(POSTImpl);
