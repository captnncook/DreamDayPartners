import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { randomBytes } from "crypto";

export async function POST() {
  const user = await getSession();
  if (!user || user.role !== "vendor") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
  if (!vendor) return NextResponse.json({ error: "Profiel niet gevonden" }, { status: 404 });

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 uur

  await prisma.$executeRawUnsafe(
    `INSERT INTO "vendor_delete_tokens" (id, "userId", token, "expiresAt") VALUES ($1, $2, $3, $4)
     ON CONFLICT ("userId") DO UPDATE SET token = $3, "expiresAt" = $4, "createdAt" = NOW()`,
    randomBytes(8).toString("hex"),
    user.id,
    token,
    expiresAt
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const confirmUrl = `${appUrl}/leveranciers/verwijder-bevestigen/${token}`;

  await sendMail({
    to: user.email,
    subject: "Bevestig verwijdering van je profiel",
    html: `
      <p>Je hebt gevraagd om je profiel op DreamDay Partners te verwijderen.</p>
      <p>Klik op onderstaande knop om de verwijdering te bevestigen. Deze link is <strong>24 uur</strong> geldig.</p>
      <p>
        <a href="${confirmUrl}" style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          Profiel definitief verwijderen
        </a>
      </p>
      <p style="color:#888;font-size:0.9em;">Werkt de knop niet? Kopieer deze link: ${confirmUrl}</p>
      <p style="color:#888;font-size:0.9em;">Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
