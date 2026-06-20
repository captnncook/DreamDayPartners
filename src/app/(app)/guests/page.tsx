import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const RSVP_COLORS: Record<string, string> = { confirmed: "badge-success", declined: "badge-danger", invited: "badge-info", no_response: "badge-neutral" };
const RSVP_LABELS: Record<string, string> = { confirmed: "Bevestigd", declined: "Afgemeld", invited: "Uitgenodigd", no_response: "Geen reactie" };

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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Gasten</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{totalGuests} gasten totaal · {totalConfirmed} bevestigd</p>
      <div className="space-y-6">
        {weddings.map((w) => (
          <div key={w.id} className="ddp-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{w.title}</h2>
              <Link href={`/weddings/${w.id}/guests`} className="text-sm" style={{ color: "var(--primary)" }}>Beheren →</Link>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["confirmed","invited","no_response","declined"].map((status) => {
                const count = w.guests.filter((g) => g.rsvpStatus === status).length;
                return (
                  <div key={status} className="text-center p-2 rounded-lg" style={{ background: "var(--background)" }}>
                    <div className="font-bold">{count}</div>
                    <span className={`ddp-badge ${RSVP_COLORS[status]}`} style={{ fontSize: "0.6rem" }}>{RSVP_LABELS[status]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
