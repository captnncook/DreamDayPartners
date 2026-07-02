import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendMail, adminPasswordResetEmail } from "@/lib/mail";
import { randomBytes } from "crypto";
import { logAdminEvent } from "@/lib/adminEvent";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSession();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.$executeRawUnsafe(
    `INSERT INTO "password_reset_tokens" (id, "userId", token, "expiresAt")
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ("userId") DO UPDATE SET token = $3, "expiresAt" = $4, "createdAt" = NOW()`,
    randomBytes(8).toString("hex"),
    target.id,
    token,
    expiresAt
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const resetUrl = `${appUrl}/wachtwoord-reset/${token}`;

  const tpl = adminPasswordResetEmail(resetUrl);
  await sendMail({ to: target.email, subject: tpl.subject, html: tpl.html });
  await logAdminEvent("password_reset", `Beheerder stuurde wachtwoordreset naar ${target.name}`, target.email);

  return NextResponse.json({ ok: true });
}
