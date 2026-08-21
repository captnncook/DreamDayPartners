import { prisma } from "@/lib/prisma";

// Standaard checklist voor een net aangemaakte bruiloft. Bestond al als
// los, hand-matig te activeren knopje ("20 standaardtaken toevoegen?") op
// de takenpagina, maar een net aangemeld bruidspaar landt daarvoor eerst op
// een volledig leeg takenoverzicht ("Geen taken. Geniet ervan!") zonder
// enige aanwijzing dat deze checklist bestaat — vooral vervelend voor een
// bruiloft met een korte planningstermijn die juist houvast nodig heeft.
export const STARTER_TASKS = [
  { title: "Datum en locatie bepalen", category: "venue", priority: "high" },
  { title: "Budget vaststellen", category: "general", priority: "high" },
  { title: "Gastenlijst opstellen", category: "general", priority: "high" },
  { title: "Trouwlocatie boeken", category: "venue", priority: "high" },
  { title: "Catering regelen", category: "catering", priority: "high" },
  { title: "Fotograaf boeken", category: "photo", priority: "high" },
  { title: "Trouwkleding uitzoeken", category: "clothing", priority: "medium" },
  { title: "Bloemen en decoratie regelen", category: "decoration", priority: "medium" },
  { title: "DJ of band boeken", category: "music", priority: "medium" },
  { title: "Uitnodigingen versturen", category: "general", priority: "medium" },
  { title: "Huwelijkse voorwaarden bespreken", category: "legal", priority: "medium" },
  { title: "Trouwambtenaar regelen", category: "legal", priority: "high" },
  { title: "Huwelijksreis plannen", category: "general", priority: "low" },
  { title: "Taart bestellen", category: "catering", priority: "medium" },
  { title: "Make-up en haar afspraken maken", category: "clothing", priority: "medium" },
  { title: "Vervoer regelen", category: "general", priority: "low" },
  { title: "Dag-draaiboek opstellen", category: "general", priority: "medium" },
  { title: "Zitplaatsindeling gasten maken", category: "general", priority: "low" },
  { title: "Ringen uitzoeken en bestellen", category: "general", priority: "high" },
  { title: "Huwelijksgeloften schrijven", category: "general", priority: "medium" },
];

export async function seedStarterTasks(weddingId: string) {
  await prisma.task.createMany({
    data: STARTER_TASKS.map(t => ({
      weddingId,
      title: t.title,
      category: t.category,
      priority: t.priority,
      status: "open",
    })),
    skipDuplicates: false,
  });
}
