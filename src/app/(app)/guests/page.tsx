import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GuestsOverviewClient from "./GuestsOverviewClient";

export default async function AllGuestsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const myWeddings = await prisma.weddingTeamMember.findMany({ where: { userId: user.id } });
  const weddingIds = myWeddings.map((m) => m.weddingId);

  const weddings = await prisma.wedding.findMany({
    where: { id: { in: weddingIds } },
    include: { guests: { orderBy: { name: "asc" } } },
    orderBy: { date: "asc" },
  });

  const totalGuests = weddings.reduce((s, w) => s + w.guests.length, 0);
  const totalConfirmed = weddings.reduce((s, w) => s + w.guests.filter((g) => g.rsvpStatus === "confirmed").length, 0);

  const weddingsForClient = weddings.map((w) => ({
    id: w.id,
    title: w.title,
    counts: {
      confirmed: w.guests.filter((g) => g.rsvpStatus === "confirmed").length,
      invited: w.guests.filter((g) => g.rsvpStatus === "invited").length,
      no_response: w.guests.filter((g) => g.rsvpStatus === "no_response").length,
      declined: w.guests.filter((g) => g.rsvpStatus === "declined").length,
    },
  }));

  return (
    <GuestsOverviewClient
      weddings={weddingsForClient}
      totalGuests={totalGuests}
      totalConfirmed={totalConfirmed}
    />
  );
}
