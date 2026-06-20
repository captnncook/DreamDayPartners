import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteFile, getDownloadUrl } from "@/lib/r2";

type Params = { params: Promise<{ id: string; fileId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId } = await params;

  const document = await prisma.document.findUnique({ where: { id: fileId } });
  if (!document) return Response.json({ error: "Not found" }, { status: 404 });

  const url = await getDownloadUrl(document.fileKey);
  return Response.json({ url });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId } = await params;

  const document = await prisma.document.findUnique({ where: { id: fileId } });
  if (!document) return Response.json({ error: "Not found" }, { status: 404 });

  if (document.uploadedBy !== session.id && session.role !== "admin" && session.role !== "planner") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteFile(document.fileKey);
  await prisma.document.delete({ where: { id: fileId } });

  return Response.json({ ok: true });
}
