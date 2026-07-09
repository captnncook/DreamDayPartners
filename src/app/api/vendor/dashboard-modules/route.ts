import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getVendorTypeConfig, TOGGLEABLE_MODULE_KEYS } from "@/lib/vendorTypeConfigs";

// Eigen leverancier: welke dashboard-modules zijn beschikbaar/aan/uit.
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "vendor") return NextResponse.json({ error: "Alleen voor leveranciers" }, { status: 403 });

  const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
  if (!vendor) return NextResponse.json({ error: "Geen leveranciersprofiel gevonden" }, { status: 404 });

  const config = getVendorTypeConfig(vendor.category);
  const available = Array.from(new Set([...(config.modules ?? []), ...vendor.extraModules])).filter((m) =>
    TOGGLEABLE_MODULE_KEYS.includes(m as (typeof TOGGLEABLE_MODULE_KEYS)[number])
  );

  return NextResponse.json({
    vendorId: vendor.id,
    isPremium: vendor.isPremium,
    available,
    disabledModules: vendor.disabledModules,
    extraModules: vendor.extraModules,
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "vendor") return NextResponse.json({ error: "Alleen voor leveranciers" }, { status: 403 });

  const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
  if (!vendor) return NextResponse.json({ error: "Geen leveranciersprofiel gevonden" }, { status: 404 });
  if (!vendor.isPremium) {
    return NextResponse.json({ error: "Alleen premium-leveranciers kunnen het dashboard aanpassen" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const disabledModules: unknown = body?.disabledModules;
  if (!Array.isArray(disabledModules) || !disabledModules.every((m) => typeof m === "string")) {
    return NextResponse.json({ error: "disabledModules (string[]) verplicht" }, { status: 400 });
  }

  const config = getVendorTypeConfig(vendor.category);
  const available = new Set([...(config.modules ?? []), ...vendor.extraModules]);
  const filtered = disabledModules.filter((m) => available.has(m));

  const updated = await prisma.vendor.update({
    where: { id: vendor.id },
    data: { disabledModules: filtered },
    select: { disabledModules: true },
  });

  return NextResponse.json(updated);
}
