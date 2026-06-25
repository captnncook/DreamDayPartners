import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
 * Checks whether a user may access a WeddingVendor record.
 *
 * - Planners / admins / team members: always allowed
 * - Couple / guest roles: denied
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

  if (["admin", "planner", "team_member"].includes(user.role)) {
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
