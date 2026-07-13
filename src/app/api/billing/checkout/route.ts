import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStripe, proPriceData, type BillingInterval } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "vendor") return NextResponse.json({ error: "Alleen voor leveranciers" }, { status: 403 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  if (dbUser.isPremium) {
    return NextResponse.json({ error: "Al premium" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const interval: BillingInterval = body.interval === "year" ? "year" : "month";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamdaypartners-production.up.railway.app";

  // Get or create Stripe customer
  let customerId = dbUser.stripeCustomerId;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: dbUser.email,
      name: dbUser.name,
      metadata: { userId: dbUser.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: dbUser.id }, data: { stripeCustomerId: customerId } });
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price_data: proPriceData(interval), quantity: 1 }],
    success_url: `${appUrl}/leveranciers/mijn-profiel?upgrade=success`,
    cancel_url: `${appUrl}/leveranciers/mijn-profiel?upgrade=cancelled`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userId: dbUser.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
