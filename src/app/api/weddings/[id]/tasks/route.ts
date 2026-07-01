import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendMail, newTaskEmail } from "@/lib/mail";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const tasks = await prisma.task.findMany({
    where: { weddingId: id },
    include: { assignedUser: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const task = await prisma.task.create({
    data: {
      weddingId: id,
      title: body.title,
      description: body.description,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      category: body.category ?? "general",
      assignedTo: body.assignedTo ?? null,
      status: body.status ?? "open",
      priority: body.priority ?? "medium",
    },
    include: { assignedUser: true },
  });

  // Email the assigned user if they have emailNewTask enabled
  if (task.assignedUser?.emailNewTask && task.assignedUser.email && task.assignedUser.id !== user.id) {
    const wedding = await prisma.wedding.findUnique({ where: { id }, select: { title: true } });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const tpl = newTaskEmail(task.title, wedding?.title ?? "je bruiloft", appUrl);
    await sendMail({ to: task.assignedUser.email, subject: tpl.subject, html: tpl.html });
  }

  return NextResponse.json({ task }, { status: 201 });
}
