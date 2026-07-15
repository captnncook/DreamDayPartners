import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

// Zegt het abonnement op tegen het einde van de lopende (betaalde) periode —
// niet meteen. De leverancier blijft dus Premium tot de datum waarop
// anders opnieuw was afgeschreven.
export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.stripeSubscriptionId) {
    return NextResponse.json({ error: "Geen actief abonnement" }, { status: 400 });
  }

  const sub = await getStripe().subscriptions.update(dbUser.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const periodEnd = sub.items.data[0]?.current_period_end;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCancelAtPeriodEnd: true,
      stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });

  return NextResponse.json({ ok: true, currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null });
}
