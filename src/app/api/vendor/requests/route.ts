import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { withErrorLogging } from "@/lib/apiErrorLogging";

// GET /api/vendor/requests -> openstaande Dream Team-uitnodigingen voor de ingelogde leverancier
async function GETImpl() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "vendor") return NextResponse.json({ requests: [] });

  const requests = await prisma.weddingVendor.findMany({
    where: {
      status: "invited",
      vendor: { userId: user.id },
    },
    include: { wedding: true, vendor: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export const GET = withErrorLogging(GETImpl);
