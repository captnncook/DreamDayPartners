import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { TOGGLEABLE_MODULE_KEYS } from "@/lib/vendorTypeConfigs";

// Admin-only: isPremium direct op de Vendor zetten. Los van User.isPremium
// (Stripe-abonnement) — nodig voor leveranciers zonder gekoppeld account.
// Ook: extraModules — functies die de admin los van het functieverzoek-
// systeem rechtstreeks aan een leverancier kan toekennen of intrekken.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Niet toegestaan" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const data: { isPremium?: boolean; extraModules?: string[] } = {};

  if (body?.isPremium !== undefined) {
    if (typeof body.isPremium !== "boolean") {
      return NextResponse.json({ error: "isPremium moet een boolean zijn" }, { status: 400 });
    }
    data.isPremium = body.isPremium;
  }

  if (body?.extraModules !== undefined) {
    if (!Array.isArray(body.extraModules) || !body.extraModules.every((m: unknown) => typeof m === "string")) {
      return NextResponse.json({ error: "extraModules moet een lijst van strings zijn" }, { status: 400 });
    }
    const valid = new Set(TOGGLEABLE_MODULE_KEYS as readonly string[]);
    data.extraModules = body.extraModules.filter((m: string) => valid.has(m));
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Niets om op te slaan" }, { status: 400 });
  }

  const vendor = await prisma.vendor.update({
    where: { id },
    data,
    select: { id: true, isPremium: true, extraModules: true },
  });

  return NextResponse.json(vendor);
}
