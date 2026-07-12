import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSession } from "@/lib/session";
import { sendMail, deleteAdminNotificationEmail, weddingCancelledEmail } from "@/lib/mail";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

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
  if (!user || user.role !== "couple") return NextResponse.json({ error: "Account niet gevonden" }, { status: 404 });

  await prisma.$executeRawUnsafe(`DELETE FROM "vendor_delete_tokens" WHERE "userId" = $1`, row.userId);

  // Bruiloften waarvan dit account het laatste bruidspaar-lid is, worden
  // geannuleerd (inclusief e-mail naar het dream team). Heeft de partner een
  // eigen account, dan blijft de bruiloft voor die partner gewoon bestaan.
  const memberships = await prisma.weddingTeamMember.findMany({
    where: { userId: user.id, role: "couple" },
    select: { weddingId: true },
  });

  for (const m of memberships) {
    const otherCoupleMembers = await prisma.weddingTeamMember.count({
      where: { weddingId: m.weddingId, role: "couple", userId: { not: user.id } },
    });
    if (otherCoupleMembers > 0) continue;

    const wedding = await prisma.wedding.findUnique({
      where: { id: m.weddingId },
      include: { vendors: { include: { vendor: { select: { name: true, email: true } } } } },
    });
    if (!wedding) continue;

    // Alleen bij een toekomstige bruiloft is annulering relevant voor het
    // dream team; een voorbije bruiloft verwijderen we stil.
    if (wedding.date >= new Date()) {
      for (const wv of wedding.vendors) {
        if (!wv.vendor.email) continue;
        const tpl = weddingCancelledEmail(wv.vendor.name, wedding.title, formatDate(wedding.date));
        await sendMail({ to: wv.vendor.email, subject: tpl.subject, html: tpl.html }).catch(() => {});
      }
    }

    await prisma.wedding.delete({ where: { id: wedding.id } });
  }

  const userName = user.name;
  const userEmail = user.email;
  await prisma.user.delete({ where: { id: user.id } });

  await clearSession();

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL ?? "info@dreamdayplatform.com";
  const tpl = deleteAdminNotificationEmail(userName, userEmail);
  await sendMail({ to: adminEmail, subject: tpl.subject, html: tpl.html }).catch(() => {});

  return NextResponse.json({ ok: true });
}
