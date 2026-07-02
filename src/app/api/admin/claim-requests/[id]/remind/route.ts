import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendMail, claimApprovedEmail } from "@/lib/mail";
import { generateClaimToken, CLAIM_TOKEN_TTL_MS } from "@/lib/claim-token";
import { logAdminEvent } from "@/lib/adminEvent";

// Stuur een herinneringsmail voor een goedgekeurde, nog niet geactiveerde claim.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const request = await prisma.vendorClaimRequest.findUnique({ where: { id }, include: { vendor: true } });
  if (!request) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });
  if (request.status !== "approved") return NextResponse.json({ error: "Deze aanvraag wacht niet op activatie" }, { status: 409 });

  // Verleng/regenereer het token als het verlopen is
  let token = request.token;
  let tokenExpiresAt = request.tokenExpiresAt;
  if (!token || !tokenExpiresAt || tokenExpiresAt < new Date()) {
    token = generateClaimToken();
    tokenExpiresAt = new Date(Date.now() + CLAIM_TOKEN_TTL_MS);
    await prisma.vendorClaimRequest.update({ where: { id }, data: { token, tokenExpiresAt } });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const verifyUrl = `${appUrl}/claim/${token}`;
  const tpl = claimApprovedEmail(request.vendor.name, verifyUrl);
  await sendMail({ to: request.email, subject: tpl.subject, html: tpl.html, role: "vendor", name: request.vendor.name });
  await logAdminEvent("claim_reminder", `Herinnering verstuurd voor ${request.vendor.name}`, request.email);

  return NextResponse.json({ ok: true });
}
