import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl, formatFileSize } from "@/lib/r2";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function GETImpl(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const documents = await prisma.document.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { wedding: { title: { contains: q, mode: "insensitive" } } }] } : {}),
    },
    include: {
      wedding: { select: { id: true, title: true, weddingCode: true } },
      uploader: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const withUrls = await Promise.all(
    documents.map(async (d) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      visibility: d.visibility,
      mimeType: d.mimeType,
      fileSizeLabel: formatFileSize(d.fileSize),
      createdAt: d.createdAt.toISOString(),
      wedding: d.wedding,
      uploaderName: d.uploader.name,
      url: await getDownloadUrl(d.fileKey).catch(() => null),
    }))
  );

  return NextResponse.json({ documents: withUrls });
}

export const GET = withErrorLogging(GETImpl);
