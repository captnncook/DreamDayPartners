import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStripe, tierPriceData, isWeddingTier, tierToWeddingLimit, type BillingInterval, type WeddingTier } from "@/lib/stripe";
import { withErrorLogging } from "@/lib/apiErrorLogging";

// Wijzigt het gekozen aantal bruiloften (tier) voor een al actief Premium-abonnement,
// zonder een nieuwe checkout-sessie — past de bestaande Stripe-subscription aan.
async function POSTImpl(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "vendor") return NextResponse.json({ error: "Alleen voor leveranciers" }, { status: 403 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.isPremium || !dbUser.stripeSubscriptionId) {
    return NextResponse.json({ error: "Geen actief abonnement" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const tierRaw = Number(body.tier);
  if (!isWeddingTier(tierRaw)) {
    return NextResponse.json({ error: "Ongeldig aantal bruiloften" }, { status: 400 });
  }
  const tier: WeddingTier = tierRaw;
  const interval: BillingInterval = body.interval === "year" ? "year" : "month";
  const weddingLimit = tierToWeddingLimit(tier);

  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(dbUser.stripeSubscriptionId);
  const itemId = sub.items.data[0]?.id;
  if (!itemId) return NextResponse.json({ error: "Abonnement niet gevonden" }, { status: 404 });

  // Wijzigen van rente/interval halverwege een lopend abonnement kan niet zomaar
  // via price_data; we maken daarom altijd een verse Price aan voor deze tier.
  const { product_data, ...priceRest } = tierPriceData(tier, interval);
  const product = await stripe.products.create({ name: product_data.name });
  const price = await stripe.prices.create({ ...priceRest, product: product.id });

  await stripe.subscriptions.update(dbUser.stripeSubscriptionId, {
    items: [{ id: itemId, price: price.id }],
    proration_behavior: "create_prorations",
    metadata: { userId: dbUser.id, weddingLimit: weddingLimit === null ? "unlimited" : String(weddingLimit) },
  });

  await prisma.user.update({ where: { id: dbUser.id }, data: { premiumWeddingLimit: weddingLimit } });

  return NextResponse.json({ ok: true, weddingLimit });
}

export const POST = withErrorLogging(POSTImpl);
