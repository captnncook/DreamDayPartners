import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { seedStarterTasks } from "@/lib/starterTasks";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  await seedStarterTasks(id);

  return NextResponse.json({ ok: true });
}
