import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MyTasksClient from "./MyTasksClient";

export default async function MyTasksPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  // Bruidspaar ziet alle taken van hun bruiloft(en), niet alleen de taken die
  // letterlijk aan henzelf zijn toegewezen — zelfde aanpak als het dashboard,
  // anders lijkt deze pagina onterecht bijna leeg.
  const where = user.role === "couple"
    ? { wedding: { teamMembers: { some: { userId: user.id } } } }
    : { assignedTo: user.id };

  const tasks = await prisma.task.findMany({
    where,
    include: { wedding: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const tasksForClient = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate?.toISOString() ?? null,
    weddingId: t.weddingId,
    wedding: { title: t.wedding.title },
  }));

  return <MyTasksClient tasks={tasksForClient} />;
}
