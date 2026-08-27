import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { authorizeWeddingVendor } from "@/lib/vendorAuth";
import { syncIntakeTasks } from "@/lib/intakeTasks";
import { withErrorLogging } from "@/lib/apiErrorLogging";

type Params = { params: Promise<{ id: string; wvId: string }> };

async function PATCHHandler(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const updated = await prisma.weddingVendor.update({
    where: { id: wvId },
    data: { intakeData: body.intakeData },
  });

  await syncIntakeTasks(wvId);

  return NextResponse.json({ booking: updated });
}

export const PATCH = withErrorLogging(PATCHHandler);
