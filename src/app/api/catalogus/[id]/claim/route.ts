import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail, claimRequestAdminEmail } from "@/lib/mail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? "info@dreamdaypartners.nl";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { email } = await req.json();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Geldig e-mailadres verplicht" }, { status: 400 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) return NextResponse.json({ error: "Leverancier niet gevonden" }, { status: 404 });
  if (vendor.userId) return NextResponse.json({ error: "Dit profiel is al geclaimd" }, { status: 409 });

  const existing = await prisma.vendorClaimRequest.findFirst({
    where: { vendorId: id, status: "pending" },
  });
  if (existing) {
    return NextResponse.json({ error: "Er staat al een aanvraag open voor dit profiel" }, { status: 409 });
  }

  await prisma.vendorClaimRequest.create({
    data: { vendorId: id, email: email.toLowerCase() },
  });

  const admins = await prisma.user.findMany({ where: { role: "admin" } });
  await Promise.all(
    admins.map((admin) =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          type: "vendor_claim_request",
          content: `Nieuwe profiel-claim aanvraag voor "${vendor.name}" (${email})`,
          relatedType: "vendor",
          relatedId: vendor.id,
        },
      })
    )
  );

  const tpl = claimRequestAdminEmail(vendor.name, email);
  await sendMail({ to: ADMIN_NOTIFY_EMAIL, subject: tpl.subject, html: tpl.html });

  return NextResponse.json({ ok: true });
}
