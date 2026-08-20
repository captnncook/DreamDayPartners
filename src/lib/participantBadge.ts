import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/r2";
import { getVendorTypeConfig } from "@/lib/vendorTypeConfigs";

const ROLE_LABELS: Record<string, string> = {
  admin: "Beheerder",
  planner: "Trouwplanner",
  team_member: "Teamlid",
  couple: "Bruidspaar",
};

export type ParticipantBadge = { label: string; photoUrl: string | null };

/**
 * Haalt in één keer op wat er onder een naam in DM's getoond moet worden:
 * leverancierssoort (bijv. "Bloemist") mét schild-foto voor leveranciers,
 * of gewoon de rol ("Bruidspaar", "Trouwplanner", ...) voor anderen.
 */
export async function resolveParticipantBadges(userIds: string[]): Promise<Map<string, ParticipantBadge>> {
  const uniqueIds = Array.from(new Set(userIds));
  const vendors = await prisma.vendor.findMany({
    where: { userId: { in: uniqueIds } },
    select: { userId: true, category: true, emblemPhoto: true, coverPhoto: true },
  });
  const vendorByUserId = new Map(vendors.filter((v) => v.userId).map((v) => [v.userId as string, v]));

  const badges = new Map<string, ParticipantBadge>();
  for (const id of uniqueIds) {
    const vendor = vendorByUserId.get(id);
    if (vendor) {
      // Eén onvolledig/onverwacht leveranciersrecord mag nooit de hele
      // DM-lijst/conversatie laten crashen — badge is puur cosmetisch.
      try {
        const photoKey = vendor.emblemPhoto ?? vendor.coverPhoto ?? null;
        badges.set(id, {
          label: getVendorTypeConfig(vendor.category).label,
          photoUrl: photoKey ? await getDownloadUrl(photoKey, 3600).catch(() => null) : null,
        });
      } catch {
        badges.set(id, { label: "Leverancier", photoUrl: null });
      }
    }
  }
  return badges;
}

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}
