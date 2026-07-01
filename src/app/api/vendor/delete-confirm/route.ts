import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSession } from "@/lib/session";
import { sendMail } from "@/lib/mail";

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

  // Delete vendor profile(s) and user account
  await prisma.vendor.deleteMany({ where: { userId: row.userId } });
  await prisma.user.delete({ where: { id: row.userId } });

  // Clear session
  await clearSession();

  // Notify admin
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL ?? "info@dreamdayplatform.com";
  await sendMail({
    to: adminEmail,
    subject: `Leveranciersprofiel verwijderd: ${vendorName}`,
    html: `
      <p>Het leveranciersprofiel van <strong>${vendorName}</strong> is definitief verwijderd.</p>
      <ul>
        <li>E-mailadres: ${userEmail}</li>
        <li>Tijdstip: ${new Date().toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" })}</li>
      </ul>
    `,
  });

  return NextResponse.json({ ok: true });
}
