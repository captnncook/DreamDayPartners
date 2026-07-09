import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getVendorTypeConfig, TOGGLEABLE_MODULE_KEYS } from "@/lib/vendorTypeConfigs";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "vendor") return NextResponse.json({ error: "Alleen voor leveranciers" }, { status: 403 });

  const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
  if (!vendor) return NextResponse.json({ error: "Geen leveranciersprofiel gevonden" }, { status: 404 });

  const requests = await prisma.vendorFeatureRequest.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "vendor") return NextResponse.json({ error: "Alleen voor leveranciers" }, { status: 403 });

  const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
  if (!vendor) return NextResponse.json({ error: "Geen leveranciersprofiel gevonden" }, { status: 404 });
  if (!vendor.isPremium) {
    return NextResponse.json({ error: "Alleen premium-leveranciers kunnen extra functies aanvragen" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const moduleKey: unknown = body?.moduleKey;
  const message: unknown = body?.message;

  if (typeof moduleKey !== "string" || !TOGGLEABLE_MODULE_KEYS.includes(moduleKey as (typeof TOGGLEABLE_MODULE_KEYS)[number])) {
    return NextResponse.json({ error: "Onbekende functie" }, { status: 400 });
  }

  const config = getVendorTypeConfig(vendor.category);
  const alreadyAvailable = new Set([...(config.modules ?? []), ...vendor.extraModules]);
  if (alreadyAvailable.has(moduleKey)) {
    return NextResponse.json({ error: "Deze functie staat al in jouw dashboard" }, { status: 400 });
  }

  const existingPending = await prisma.vendorFeatureRequest.findFirst({
    where: { vendorId: vendor.id, moduleKey, status: "pending" },
  });
  if (existingPending) {
    return NextResponse.json({ error: "Je hebt hier al een openstaand verzoek voor lopen" }, { status: 400 });
  }

  const request = await prisma.vendorFeatureRequest.create({
    data: {
      vendorId: vendor.id,
      moduleKey,
      message: typeof message === "string" && message.trim() ? message.trim() : null,
    },
  });

  return NextResponse.json({ request }, { status: 201 });
}
