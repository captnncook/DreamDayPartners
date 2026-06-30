import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { sendMail, claimWelcomeEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 10;

async function loadValidRequest(token: string) {
  const request = await prisma.vendorClaimRequest.findUnique({ where: { token }, include: { vendor: true } });
  if (!request || request.status !== "approved") return { error: "Ongeldige of verlopen link" as const };
  if (request.attempts >= MAX_ATTEMPTS) return { error: "Te veel pogingen, neem contact op" as const };
  if (!request.tokenExpiresAt || request.tokenExpiresAt < new Date()) return { error: "Deze link is verlopen" as const };
  return { request };
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const result = await loadValidRequest(token);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({
    vendorName: result.request.vendor.name,
    vendorCategory: result.request.vendor.category,
    email: result.request.email,
  });
}

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token) return NextResponse.json({ error: "Token verplicht" }, { status: 400 });

  const result = await loadValidRequest(token);
  if ("error" in result) {
    if (token) {
      await prisma.vendorClaimRequest.updateMany({
        where: { token, status: "approved" },
        data: { attempts: { increment: 1 } },
      });
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const { request } = result;

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Wachtwoord moet minimaal 8 tekens zijn" }, { status: 400 });
  }

  let user = await prisma.user.findUnique({ where: { email: request.email } });
  const passwordHash = await bcrypt.hash(password, 12);

  if (user) {
    user = await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  } else {
    user = await prisma.user.create({
      data: {
        email: request.email,
        name: request.vendor.contactPerson || request.vendor.name,
        role: "vendor",
        vendorType: request.vendor.category,
        passwordHash,
      },
    });
  }

  await prisma.$transaction([
    prisma.vendor.update({ where: { id: request.vendorId }, data: { userId: user.id, email: request.email } }),
    prisma.vendorClaimRequest.update({ where: { id: request.id }, data: { status: "completed", token: null } }),
  ]);

  await setSession(user.id);

  const welcome = claimWelcomeEmail(request.vendor.name);
  await sendMail({ to: request.email, subject: welcome.subject, html: welcome.html });

  return NextResponse.json({ ok: true, redirect: "/leveranciers/mijn-profiel" });
}
