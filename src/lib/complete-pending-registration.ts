import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { generateWeddingCode } from "@/lib/wedding-id";
import { sendMail, claimWelcomeEmail } from "@/lib/mail";

export async function completePendingRegistrationViaOAuth(
  verifiedToken: string,
  oauthEmail: string,
  appUrl: string
): Promise<{ ok: true; redirect: string } | { ok: false; error: string }> {
  const rows = await prisma.$queryRawUnsafe<Array<{
    id: string; email: string; type: string; data: string; verified: boolean;
  }>>(
    `SELECT * FROM "pending_registrations" WHERE "verifiedToken" = $1`,
    verifiedToken
  );

  const pending = rows[0];
  if (!pending || !pending.verified) return { ok: false, error: "Verificatietoken verlopen. Start opnieuw." };
  if (pending.email !== oauthEmail.toLowerCase()) {
    return { ok: false, error: "Het e-mailadres van je Google/Apple account komt niet overeen met het verificatie-emailadres." };
  }

  const existing = await prisma.user.findUnique({ where: { email: pending.email } });
  if (existing) {
    await setSession(existing.id);
    await prisma.$executeRawUnsafe(`DELETE FROM "pending_registrations" WHERE "verifiedToken" = $1`, verifiedToken);
    return { ok: true, redirect: `${appUrl}/dashboard` };
  }

  const data = JSON.parse(pending.data);

  await prisma.$executeRawUnsafe(`DELETE FROM "pending_registrations" WHERE "verifiedToken" = $1`, verifiedToken);

  if (pending.type === "couple") {
    const { partner1, partner2, date, venue, budget } = data;
    const coupleName = partner1 && partner2 ? `${partner1} & ${partner2}` : partner1 || "Bruidspaar";

    const user = await prisma.user.create({
      data: { email: pending.email, name: coupleName, role: "couple", isPremium: false },
    });
    await setSession(user.id);

    const weddingDate = date ? new Date(date) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const title = partner1 && partner2 ? `Bruiloft ${partner1} & ${partner2}` : "Mijn Bruiloft";
    const email2 = `partner-${user.id.slice(0, 8)}@dreamday.local`;
    const weddingCode = generateWeddingCode(pending.email, email2, weddingDate.toISOString().split("T")[0]);

    const wedding = await prisma.wedding.create({
      data: {
        weddingCode,
        title,
        date: weddingDate,
        venue: venue || null,
        coupleEmail1: pending.email,
        coupleEmail2: email2,
        ownerId: user.id,
      },
    });
    await prisma.weddingTeamMember.create({ data: { weddingId: wedding.id, userId: user.id, role: "couple" } });
    await prisma.budget.create({ data: { weddingId: wedding.id, totalAmount: budget ? parseFloat(String(budget)) : 0 } });

    return { ok: true, redirect: `${appUrl}/weddings/${wedding.id}` };
  }

  if (pending.type === "vendor") {
    const { businessName, category, contactPerson, phone, website, city } = data;

    const user = await prisma.user.create({
      data: { email: pending.email, name: contactPerson || businessName, role: "vendor", vendorType: category, isPremium: false },
    });
    await setSession(user.id);

    await prisma.vendor.create({
      data: {
        name: businessName,
        category,
        contactPerson: contactPerson || null,
        email: pending.email,
        phone: phone || null,
        website: website || null,
        city: city || null,
        userId: user.id,
      },
    });

    const tpl = claimWelcomeEmail(businessName);
    await sendMail({ to: pending.email, subject: tpl.subject, html: tpl.html, role: "vendor", name: businessName });

    return { ok: true, redirect: `${appUrl}/leveranciers/mijn-profiel` };
  }

  return { ok: false, error: "Ongeldig registratietype" };
}
