import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { withErrorLogging } from "@/lib/apiErrorLogging";

// Maakt een geplande opzegging ongedaan zolang de huidige betaalperiode nog loopt.
async function POSTImpl() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.stripeSubscriptionId) {
    return NextResponse.json({ error: "Geen actief abonnement" }, { status: 400 });
  }

  await getStripe().subscriptions.update(dbUser.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCancelAtPeriodEnd: false },
  });

  return NextResponse.json({ ok: true });
}

export const POST = withErrorLogging(POSTImpl);
