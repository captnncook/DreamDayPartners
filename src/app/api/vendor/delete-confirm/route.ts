import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSession } from "@/lib/session";
import { sendMail, deleteAdminNotificationEmail, vendorLeftWeddingEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token ontbreekt" }, { status: 400 });

  const rows = await prisma.$queryRawUnsafe<Array<{
    id: string; userId: string; token: string; expiresAt: Date;
  }>>(
    `SELECT * FROM "vendor_delete_tokens" WHERE token = $1`,
    token
  );

  const row = rows[0];
  if (!row) return NextResponse.json({ error: "Ongeldige of verlopen link" }, { status: 404 });
  if (new Date() > new Date(row.expiresAt)) {
    return NextResponse.json({ error: "De link is verlopen. Vraag opnieuw een verwijderlink aan." }, { status: 410 });
  }

  const user = await prisma.user.findUnique({ where: { id: row.userId } });
  if (!user) return NextResponse.json({ error: "Account niet gevonden" }, { status: 404 });

  const vendorProfile = await prisma.vendor.findFirst({ where: { userId: row.userId } });
  const vendorName = vendorProfile?.name ?? user.name;
  const userEmail = user.email;

  // Clean up token
  await prisma.$executeRawUnsafe(`DELETE FROM "vendor_delete_tokens" WHERE "userId" = $1`, row.userId);

  // Werkt deze leverancier nog mee aan geplande bruiloften? Dan archiveren we
  // het profiel in plaats van het te verwijderen: het verdwijnt uit de
  // catalogus en het account gaat weg, maar draaiboek-items, betaalafspraken
  // en documenten van die bruiloften blijven intact voor het bruidspaar.
  const upcomingBookings = vendorProfile
    ? await prisma.weddingVendor.findMany({
        where: { vendorId: vendorProfile.id, wedding: { date: { gte: new Date() } } },
        include: { wedding: { select: { title: true, coupleEmail1: true } } },
      })
    : [];

  if (vendorProfile && upcomingBookings.length > 0) {
    await prisma.vendor.update({
      where: { id: vendorProfile.id },
      data: { userId: null, archivedAt: new Date(), isPremium: false },
    });
    // Informeer elk betrokken bruidspaar dat de planning intact blijft.
    for (const booking of upcomingBookings) {
      if (!booking.wedding.coupleEmail1) continue;
      const tpl = vendorLeftWeddingEmail(vendorName, booking.wedding.title);
      await sendMail({ to: booking.wedding.coupleEmail1, subject: tpl.subject, html: tpl.html }).catch(() => {});
    }
  } else {
    // Geen geplande bruiloften: volledig verwijderen mag veilig.
    await prisma.vendor.deleteMany({ where: { userId: row.userId } });
  }

  await prisma.user.delete({ where: { id: row.userId } });

  // Clear session
  await clearSession();

  // Notify admin
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL ?? "info@dreamdayplatform.com";
  const tpl = deleteAdminNotificationEmail(vendorName, userEmail);
  await sendMail({ to: adminEmail, subject: tpl.subject, html: tpl.html });

  return NextResponse.json({ ok: true, archived: upcomingBookings.length > 0 });
}
