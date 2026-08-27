import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function GETImpl() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ ok: true, userCount, dbUrl: process.env.DATABASE_URL ? "set" : "missing" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), dbUrl: process.env.DATABASE_URL ? "set" : "missing" }, { status: 500 });
  }
}

export const GET = withErrorLogging(GETImpl);
