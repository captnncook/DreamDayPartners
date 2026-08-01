import { prisma } from "@/lib/prisma";
import { getVendorTypeConfig, type Field } from "@/lib/vendorTypeConfigs";

function isFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Houdt de taken in sync met de intake/logistics-velden die een leverancier
 * heeft gemarkeerd als "graag ingevuld" (WeddingVendor.requiredIntakeKeys).
 * Wordt aangeroepen (a) zodra de leverancier die markering wijzigt, en
 * (b) zodra het bruidspaar/de planner intakeData opslaat — zodat een taak
 * vanzelf verschijnt zodra iets ontbreekt, en vanzelf wordt afgevinkt zodra
 * het is ingevuld.
 */
export async function syncIntakeTasks(wvId: string): Promise<void> {
  const wv = await prisma.weddingVendor.findUnique({
    where: { id: wvId },
    include: { vendor: { select: { name: true, category: true } } },
  });
  if (!wv) return;

  const config = getVendorTypeConfig(wv.vendor.category);
  const allFields: Field[] = [...(config.intakeFields ?? []), ...(config.logisticsFields ?? [])];
  const fieldsByKey = new Map(allFields.map((f) => [f.key, f]));
  const intakeData = (wv.intakeData ?? {}) as Record<string, unknown>;
  const requiredKeys = wv.requiredIntakeKeys ?? [];

  const existingTasks = await prisma.task.findMany({
    where: { vendorBookingId: wvId, sourceFieldKey: { not: null } },
  });
  const existingByKey = new Map(existingTasks.map((t) => [t.sourceFieldKey as string, t]));

  for (const key of requiredKeys) {
    const field = fieldsByKey.get(key);
    if (!field) continue;
    const filled = isFilled(intakeData[key]);
    const existing = existingByKey.get(key);

    if (filled) {
      if (existing && existing.status !== "done") {
        await prisma.task.update({ where: { id: existing.id }, data: { status: "done" } });
      }
      continue;
    }

    if (!existing) {
      await prisma.task.create({
        data: {
          weddingId: wv.weddingId,
          title: `Vul '${field.label}' in voor ${wv.vendor.name}`,
          description: `${wv.vendor.name} heeft dit nodig om jullie goed te kunnen helpen. Klik op deze taak om het direct in te vullen.`,
          category: "vendor_intake",
          status: "open",
          priority: "medium",
          vendorBookingId: wvId,
          sourceFieldKey: key,
        },
      });
    } else if (existing.status === "done") {
      // Was ingevuld maar het veld is weer leeggemaakt — taak heropenen.
      await prisma.task.update({ where: { id: existing.id }, data: { status: "open" } });
    }
  }

  // Velden die niet meer als "graag ingevuld" gemarkeerd staan: bijbehorende taak opruimen.
  for (const [key, task] of existingByKey) {
    if (!requiredKeys.includes(key)) {
      await prisma.task.delete({ where: { id: task.id } }).catch(() => {});
    }
  }
}
