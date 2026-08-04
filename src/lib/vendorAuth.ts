import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { FREE_WEDDING_LIMIT } from "@/lib/stripe";

export type SessionUser = { id: string; role: string };

/**
 * Resolves the Vendor.id linked to a user account.
 * Returns null if the user has no linked vendor record.
 */
export async function getOwnVendorId(userId: string): Promise<string | null> {
  const vendor = await prisma.vendor.findFirst({
    where: { userId },
    select: { id: true },
  });
  return vendor?.id ?? null;
}

/**
 * Telt het aantal unieke bruiloften waar deze leverancier actieve
 * dashboardtoegang toe heeft (portalAccess: true).
 */
export async function countActiveVendorWeddings(vendorId: string): Promise<number> {
  const rows = await prisma.weddingVendor.findMany({
    where: { vendorId, portalAccess: true },
    distinct: ["weddingId"],
    select: { weddingId: true },
  });
  return rows.length;
}

/**
 * Bepaalt of deze leverancier (op basis van userId) nog een extra bruiloft
 * mag koppelen: gratis accounts op basis van FREE_WEDDING_LIMIT, premium op
 * basis van het gekozen tier (null = onbeperkt, het 100+ tier).
 */
export async function canGrantVendorPortalAccess(vendorId: string): Promise<boolean> {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { userId: true } });
  if (!vendor?.userId) return true;

  const owner = await prisma.user.findUnique({
    where: { id: vendor.userId },
    select: { isPremium: true, premiumWeddingLimit: true },
  });
  if (!owner) return true;

  const limit = owner.isPremium ? owner.premiumWeddingLimit : FREE_WEDDING_LIMIT;
  if (limit === null || limit === undefined) return true; // onbeperkt

  const count = await countActiveVendorWeddings(vendorId);
  return count < limit;
}

/**
 * Checks whether a user may access a WeddingVendor record.
 *
 * - Planners / admins / team members / bruidspaar (couple): always allowed
 * - Guest roles: denied
 * - Vendor role: only allowed when their Vendor.id matches wv.vendorId
 *
 * Returns the WeddingVendor record on success, or a NextResponse 403/404 on failure.
 */
export async function authorizeWeddingVendor(
  user: SessionUser,
  wvId: string,
  weddingId: string
): Promise<
  | { ok: true; wv: { id: string; vendorId: string; status: string } }
  | { ok: false; response: NextResponse }
> {
  const wv = await prisma.weddingVendor.findFirst({
    where: { id: wvId, weddingId },
    select: { id: true, vendorId: true, status: true },
  });

  if (!wv) {
    return { ok: false, response: NextResponse.json({ error: "Niet gevonden" }, { status: 404 }) };
  }

  if (["admin", "planner", "team_member", "couple"].includes(user.role)) {
    return { ok: true, wv };
  }

  if (user.role === "vendor") {
    const ownVendorId = await getOwnVendorId(user.id);
    if (ownVendorId && ownVendorId === wv.vendorId) {
      return { ok: true, wv };
    }
    return { ok: false, response: NextResponse.json({ error: "Geen toegang" }, { status: 403 }) };
  }

  return { ok: false, response: NextResponse.json({ error: "Geen toegang" }, { status: 403 }) };
}
