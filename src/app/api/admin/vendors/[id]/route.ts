import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Admin-only: isPremium direct op de Vendor zetten. Los van User.isPremium
// (Stripe-abonnement) — nodig voor leveranciers zonder gekoppeld account.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Niet toegestaan" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body?.isPremium !== "boolean") {
    return NextResponse.json({ error: "isPremium (boolean) verplicht" }, { status: 400 });
  }

  const vendor = await prisma.vendor.update({
    where: { id },
    data: { isPremium: body.isPremium },
    select: { id: true, isPremium: true },
  });

  return NextResponse.json(vendor);
}
