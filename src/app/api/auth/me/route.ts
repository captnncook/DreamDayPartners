import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

import { withErrorLogging } from "@/lib/apiErrorLogging";
async function GETImpl() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export const GET = withErrorLogging(GETImpl);
