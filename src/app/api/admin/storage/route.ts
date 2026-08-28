import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatFileSize } from "@/lib/r2";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function GETImpl() {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const grouped = await prisma.document.groupBy({
    by: ["weddingId"],
    _sum: { fileSize: true },
    _count: { _all: true },
    orderBy: { _sum: { fileSize: "desc" } },
  });

  const weddingIds = grouped.map((g) => g.weddingId);
  const weddings = await prisma.wedding.findMany({
    where: { id: { in: weddingIds } },
    select: { id: true, title: true, weddingCode: true },
  });
  const weddingById = new Map(weddings.map((w) => [w.id, w]));

  const totalBytes = grouped.reduce((sum, g) => sum + (g._sum.fileSize ?? 0), 0);
  const totalFiles = grouped.reduce((sum, g) => sum + g._count._all, 0);

  return NextResponse.json({
    totalBytes,
    totalLabel: formatFileSize(totalBytes),
    totalFiles,
    perWedding: grouped.map((g) => {
      const w = weddingById.get(g.weddingId);
      const bytes = g._sum.fileSize ?? 0;
      return {
        weddingId: g.weddingId,
        title: w?.title ?? "?",
        weddingCode: w?.weddingCode ?? "",
        fileCount: g._count._all,
        bytes,
        sizeLabel: formatFileSize(bytes),
        share: totalBytes > 0 ? bytes / totalBytes : 0,
      };
    }),
  });
}

export const GET = withErrorLogging(GETImpl);
