import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET, getDownloadUrl, deleteFile } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  if (vendor.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return NextResponse.json({ error: "Opslag niet geconfigureerd" }, { status: 503 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Geen bestand meegegeven" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Afbeelding mag max 10 MB zijn" }, { status: 400 });

  if (vendor.emblemPhoto) {
    try { await deleteFile(vendor.emblemPhoto); } catch { /* ignore */ }
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileKey = `vendors/${id}/emblem-${uuidv4()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
      ContentLength: buffer.length,
    }));
  } catch (err) {
    console.error("R2 emblem upload error:", err);
    return NextResponse.json({ error: "Upload naar opslag mislukt." }, { status: 502 });
  }

  await prisma.vendor.update({ where: { id }, data: { emblemPhoto: fileKey } });

  const url = await getDownloadUrl(fileKey, 3600);
  return NextResponse.json({ url, key: fileKey });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  if (vendor.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  if (vendor.emblemPhoto) {
    try { await deleteFile(vendor.emblemPhoto); } catch { /* ignore */ }
    await prisma.vendor.update({ where: { id }, data: { emblemPhoto: null } });
  }

  return NextResponse.json({ ok: true });
}
