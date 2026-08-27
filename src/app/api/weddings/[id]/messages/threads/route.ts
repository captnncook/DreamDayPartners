import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function POSTHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const { type = "internal", subject, vendorId } = await req.json();

  const thread = await prisma.messageThread.create({
    // vendorId ontbrak hier voorheen volledig: een thread van het type
    // "vendor" kreeg nooit een vendorId, waardoor die leverancier het
    // gesprek nooit te zien kreeg (de GET-filter voor leveranciers matcht
    // expliciet op vendorId) en het gesprek voor het bruidspaar zelf na een
    // herlaad ook verdween (zie de gecorrigeerde filter in page.tsx).
    data: { weddingId: id, type, subject: subject || null, vendorId: type === "vendor" ? (vendorId ?? null) : null },
    include: { messages: { include: { sender: true } } },
  });

  return NextResponse.json({ thread }, { status: 201 });
}

export const POST = withErrorLogging(POSTHandler);
