import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const RSVP_META: Record<string, { label: string; color: string }> = {
  confirmed:   { label: "Bevestigd",    color: "var(--foreground)" },
  invited:     { label: "Uitgenodigd",  color: "var(--muted)" },
  no_response: { label: "Geen reactie", color: "var(--muted-light)" },
  declined:    { label: "Afgemeld",     color: "var(--muted-light)" },
};

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
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Gasten</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{totalGuests} gasten totaal · {totalConfirmed} bevestigd</p>
      </div>

      {weddings.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          Nog geen bruiloften met gastenlijsten.
        </p>
      ) : (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {weddings.map((w) => (
            <Link key={w.id} href={`/weddings/${w.id}/guests`} className="dash-row" style={{ padding: "1.125rem 0.25rem" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-serif" style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--foreground)" }}>{w.title}</div>
                <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                  {(["confirmed", "invited", "no_response", "declined"] as const).map((status) => {
                    const count = w.guests.filter((g) => g.rsvpStatus === status).length;
                    const meta = RSVP_META[status];
                    return (
                      <span key={status} className="text-xs" style={{ color: meta.color }}>
                        <span style={{ fontWeight: 700 }}>{count}</span>{" "}
                        <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{meta.label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
              <span className="text-sm flex-shrink-0" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>Beheren</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
