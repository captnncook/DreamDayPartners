import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

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
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          stripeSubscriptionId: session.subscription as string,
        },
      });
      // Also mark the vendor profile as premium
      await prisma.vendor.updateMany({ where: { userId }, data: { isPremium: true } });
      break;
    }

    case "customer.subscription.deleted":
    case "customer.subscription.paused": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) {
        // Fallback: find by stripeSubscriptionId
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { isPremium: false, stripeSubscriptionId: null },
        });
        await prisma.vendor.updateMany({
          where: { userId: { in: (await prisma.user.findMany({ where: { stripeSubscriptionId: sub.id }, select: { id: true } })).map(u => u.id) } },
          data: { isPremium: false },
        });
        break;
      }
      await prisma.user.update({ where: { id: userId }, data: { isPremium: false, stripeSubscriptionId: null } });
      await prisma.vendor.updateMany({ where: { userId }, data: { isPremium: false } });
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
