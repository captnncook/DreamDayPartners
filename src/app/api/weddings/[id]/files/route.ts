import { NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const documents = await prisma.document.findMany({
    where: { weddingId: id },
    include: { uploader: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ documents });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const wedding = await prisma.wedding.findUnique({ where: { id }, select: { id: true } });
  if (!wedding) return Response.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string) || "overig";
  const name = (formData.get("name") as string) || file?.name || "bestand";

  if (!file) return Response.json({ error: "Geen bestand" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "";
  const fileKey = `weddings/${id}/${uuidv4()}${ext ? `.${ext}` : ""}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
      ContentLength: buffer.length,
    })
  );

  const document = await prisma.document.create({
    data: {
      weddingId: id,
      name,
      fileKey,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      category,
      uploadedBy: session.id,
    },
    include: { uploader: { select: { id: true, name: true, role: true } } },
  });

  return Response.json({ document }, { status: 201 });
}
