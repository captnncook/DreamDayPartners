import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendMail, deleteRequestEmail } from "@/lib/mail";
import { randomBytes } from "crypto";

// Bruidspaar vraagt accountverwijdering aan: bevestiging via e-maillink,
// zelfde token-mechanisme als bij leveranciers.
export async function POST() {
  const user = await getSession();
  if (!user || user.role !== "couple") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

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
  const confirmUrl = `${appUrl}/account-verwijderen/${token}`;

  const tpl = deleteRequestEmail(user.name, confirmUrl);
  await sendMail({ to: user.email, subject: tpl.subject, html: tpl.html });

  return NextResponse.json({ ok: true });
}
