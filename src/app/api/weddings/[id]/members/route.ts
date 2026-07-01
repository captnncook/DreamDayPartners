import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Returns all people assignable to tasks for this wedding:
// team members (planner, couple, team_member) + linked vendors who have a user account
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  const [teamMembers, weddingVendors] = await Promise.all([
    prisma.weddingTeamMember.findMany({
      where: { weddingId: id },
      include: { user: { select: { id: true, name: true, role: true, vendorType: true } } },
    }),
    prisma.weddingVendor.findMany({
      where: { weddingId: id },
      include: { vendor: { select: { id: true, name: true, category: true, userId: true, contactPerson: true } } },
    }),
  ]);

  const members: { id: string; name: string; label: string }[] = [];
  const seen = new Set<string>();

  for (const tm of teamMembers) {
    if (!seen.has(tm.user.id)) {
      seen.add(tm.user.id);
      const roleLabel =
        tm.user.role === "couple" ? "Bruidspaar" :
        tm.user.role === "planner" ? "Weddingplanner" :
        tm.user.role === "team_member" ? "Teamlid" : tm.user.role;
      members.push({ id: tm.user.id, name: tm.user.name, label: roleLabel });
    }
  }

  for (const wv of weddingVendors) {
    if (wv.vendor.userId && !seen.has(wv.vendor.userId)) {
      seen.add(wv.vendor.userId);
      members.push({
        id: wv.vendor.userId,
        name: wv.vendor.contactPerson || wv.vendor.name,
        label: wv.vendor.category,
      });
    }
  }

  return NextResponse.json({ members });
}
