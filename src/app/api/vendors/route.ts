import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ vendors });
}
