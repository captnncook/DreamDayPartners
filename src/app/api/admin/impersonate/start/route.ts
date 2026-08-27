import { NextRequest, NextResponse } from "next/server";
import { getRealSession, startImpersonation } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logAdminEvent } from "@/lib/adminEvent";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function POSTImpl(req: NextRequest) {
  const admin = await getRealSession();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const targetUserId = body?.userId;
  if (!targetUserId || typeof targetUserId !== "string") {
    return NextResponse.json({ error: "Geen gebruiker opgegeven" }, { status: 400 });
  }
  if (targetUserId === admin.id) {
    return NextResponse.json({ error: "Je kunt niet met jezelf meekijken" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) return NextResponse.json({ error: "Account niet gevonden" }, { status: 404 });

  await startImpersonation(target.id);
  await logAdminEvent("impersonate_start", `${admin.name} (admin) kijkt mee als ${target.name}`, target.email);

  return NextResponse.json({ ok: true });
}

export const POST = withErrorLogging(POSTImpl);
