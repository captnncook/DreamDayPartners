import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

import { withErrorLogging } from "@/lib/apiErrorLogging";
async function POSTImpl() {
  await clearSession();
  return NextResponse.json({ ok: true });
}

export const POST = withErrorLogging(POSTImpl);
