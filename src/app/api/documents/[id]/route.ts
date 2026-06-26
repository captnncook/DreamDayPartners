import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { deleteFile } from "@/lib/r2";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  // Only uploader, planner or admin may delete
  if (doc.uploadedBy !== user.id && !["admin", "planner", "team_member"].includes(user.role)) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try { await deleteFile(doc.fileKey); } catch { /* R2 delete best-effort */ }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
