import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

function periodEndOf(sub: Stripe.Subscription): Date | null {
  const ts = sub.items.data[0]?.current_period_end;
  return ts ? new Date(ts * 1000) : null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;
      const userId = session.metadata?.userId;
      if (!userId) break;
      const sub = await getStripe().subscriptions.retrieve(session.subscription as string);
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          stripeSubscriptionId: sub.id,
          stripeCancelAtPeriodEnd: sub.cancel_at_period_end,
          stripeCurrentPeriodEnd: periodEndOf(sub),
        },
      });
      // Also mark the vendor profile as premium
      await prisma.vendor.updateMany({ where: { userId }, data: { isPremium: true } });
      break;
    }

    case "customer.subscription.updated": {
      // Dekt o.a. opzeggen (cancel_at_period_end) en heractiveren vóór het einde van de periode.
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      const where = userId ? { id: userId } : { stripeSubscriptionId: sub.id };
      await prisma.user.updateMany({
        where,
        data: {
          stripeCancelAtPeriodEnd: sub.cancel_at_period_end,
          stripeCurrentPeriodEnd: periodEndOf(sub),
        },
      });
      break;
    }

    case "customer.subscription.deleted":
    case "customer.subscription.paused": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      const affectedIds = userId
        ? [userId]
        : (await prisma.user.findMany({ where: { stripeSubscriptionId: sub.id }, select: { id: true } })).map((u) => u.id);
      if (affectedIds.length === 0) break;
      await prisma.user.updateMany({
        where: { id: { in: affectedIds } },
        data: { isPremium: false, stripeSubscriptionId: null, stripeCancelAtPeriodEnd: false, stripeCurrentPeriodEnd: null },
      });
      await prisma.vendor.updateMany({ where: { userId: { in: affectedIds } }, data: { isPremium: false } });
      break;
    }

    case "customer.subscription.resumed":
    case "invoice.payment_succeeded": {
      const obj = event.data.object as Stripe.Invoice | Stripe.Subscription;
      const subId = "subscription" in obj ? obj.subscription as string : obj.id;
      const existing = await prisma.user.findFirst({ where: { stripeSubscriptionId: subId } });
      if (existing && !existing.isPremium) {
        await prisma.user.update({ where: { id: existing.id }, data: { isPremium: true } });
        await prisma.vendor.updateMany({ where: { userId: existing.id }, data: { isPremium: true } });
      }
      break;
    }

    case "invoice.payment_failed": {
      // Optional: notify user but don't immediately revoke — Stripe retries first
      break;
    }
  }

  return NextResponse.json({ received: true });
}
