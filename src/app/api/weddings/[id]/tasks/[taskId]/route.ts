import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { taskId } = await params;
  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}
