import { NextResponse } from "next/server";
import { getImpersonationStatus } from "@/lib/session";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function GETImpl() {
  const status = await getImpersonationStatus();
  if (!status.active || !status.target || !status.admin) {
    return NextResponse.json({ active: false });
  }
  return NextResponse.json({
    active: true,
    targetName: status.target.name,
    targetRole: status.target.role,
    adminName: status.admin.name,
  });
}

export const GET = withErrorLogging(GETImpl);
