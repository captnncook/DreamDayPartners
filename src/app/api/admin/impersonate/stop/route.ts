import { NextResponse } from "next/server";
import { getRealSession, getImpersonationStatus, stopImpersonation } from "@/lib/session";
import { logAdminEvent } from "@/lib/adminEvent";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function POSTImpl() {
  const admin = await getRealSession();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const status = await getImpersonationStatus();
  await stopImpersonation();

  if (status.active && status.target) {
    await logAdminEvent("impersonate_stop", `${admin.name} (admin) stopte met meekijken als ${status.target.name}`, status.target.email);
  }

  return NextResponse.json({ ok: true });
}

export const POST = withErrorLogging(POSTImpl);
