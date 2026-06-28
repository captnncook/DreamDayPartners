import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, email, phone, message, weddingDate } = body;
  if (!name || !email || !message) return NextResponse.json({ error: "Vul alle velden in" }, { status: 400 });

  const vendor = await prisma.vendor.findUnique({ where: { id }, select: { id: true } });
  if (!vendor) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const req2 = await prisma.vendorContactRequest.create({
    data: { vendorId: id, name, email, phone: phone || null, message, weddingDate: weddingDate ? new Date(weddingDate) : null },
  });
  return NextResponse.json({ request: req2 });
}
