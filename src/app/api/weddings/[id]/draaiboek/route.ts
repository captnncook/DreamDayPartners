import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const { title, version } = await req.json();

  const draaiboek = await prisma.draaiboek.create({
    data: { weddingId: id, title, version: version ?? "1.0", status: "draft" },
  });

  return NextResponse.json({ draaiboek }, { status: 201 });
}
