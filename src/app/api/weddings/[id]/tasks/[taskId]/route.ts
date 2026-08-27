import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function PUTHandler(req: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { taskId } = await params;
  const body = await req.json();

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: body.title,
      description: body.description,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      category: body.category,
      assignedTo: body.assignedTo,
      status: body.status,
      priority: body.priority,
    },
    include: { assignedUser: true },
  });

  return NextResponse.json({ task });
}

async function DELETEHandler(_req: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { taskId } = await params;
  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}

export const PUT = withErrorLogging(PUTHandler);
export const DELETE = withErrorLogging(DELETEHandler);
