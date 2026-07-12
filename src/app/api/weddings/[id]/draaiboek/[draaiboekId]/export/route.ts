import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { DraaiboekPdf, getLogoDataUri } from "./DraaiboekPdf";
import React, { type ReactElement } from "react";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; draaiboekId: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id, draaiboekId } = await params;

  const accessWhere =
    user.role === "admin"
      ? { id }
      : user.role === "vendor"
      ? { id, vendors: { some: { vendor: { userId: user.id }, portalAccess: true } } }
      : { id, teamMembers: { some: { userId: user.id } } };

  const wedding = await prisma.wedding.findFirst({ where: accessWhere, select: { id: true, title: true, date: true, endDate: true, venue: true } });
  if (!wedding) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const draaiboek = await prisma.draaiboek.findFirst({
    where: { id: draaiboekId, weddingId: id },
    include: { items: { include: { vendor: true }, orderBy: { sortOrder: "asc" } } },
  });
  if (!draaiboek) return NextResponse.json({ error: "Draaiboek niet gevonden" }, { status: 404 });

  let items = draaiboek.items;
  if (user.role === "vendor") {
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    items = items.filter((item) => !vendor || item.isPublic || item.vendorId === vendor.id || item.visibleVendorIds.includes(vendor.id));
  }
  items = [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const logoDataUri = await getLogoDataUri();

  const pdfBuffer = await renderToBuffer(
    React.createElement(DraaiboekPdf, {
      weddingTitle: wedding.title,
      weddingDate: wedding.date.toISOString(),
      weddingEndDate: wedding.endDate ? wedding.endDate.toISOString() : null,
      venue: wedding.venue ?? null,
      draaiboekTitle: draaiboek.title,
      draaiboekDate: draaiboek.date ? draaiboek.date.toISOString() : null,
      version: draaiboek.version,
      logoDataUri,
      items: items.map((item) => ({
        startTime: item.startTime,
        duration: item.duration,
        title: item.title,
        location: item.location,
        notes: item.notes,
        vendorName: item.vendor?.name ?? null,
        vendorCategory: item.vendor?.category ?? null,
      })),
    }) as unknown as ReactElement<DocumentProps>
  );

  const fileName = `draaiboek-${wedding.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
