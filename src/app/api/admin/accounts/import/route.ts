import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { geocodeCity } from "@/lib/geocode";
import { randomBytes } from "crypto";
import { sendMail } from "@/lib/mail";

// Expected CSV columns (case-insensitive): name, email, role, vendorType, city, phone, website
// role defaults to "vendor", vendorType defaults to "overig"
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const vals = line.match(/("([^"]*)")|([^,]+)|(?<=,)(?=,)|(?<=,)$/g) ?? line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (vals[i] ?? "").toString().trim().replace(/^"|"$/g, "");
    });
    return row;
  });
}

export async function POST(req: NextRequest) {
  const admin = await getSession();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const sendInvite = formData.get("sendInvite") === "true";

  if (!file) return NextResponse.json({ error: "Geen bestand" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (!rows.length) return NextResponse.json({ error: "Leeg of ongeldig CSV-bestand" }, { status: 400 });

  let created = 0, skipped = 0, errors: string[] = [];

  for (const row of rows) {
    const email = row.email?.toLowerCase();
    const name = row.name || row.bedrijfsnaam || row.businessname || "";
    const role = (row.role || row.rol || "vendor") as string;
    const vendorType = row.vendortype || row.categorie || row.category || "overig";
    const city = row.city || row.stad || row.plaats || "";
    const phone = row.phone || row.telefoon || "";
    const website = row.website || "";

    if (!email || !name) { skipped++; continue; }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { skipped++; continue; }

    try {
      const user = await prisma.user.create({
        data: { email, name, role, vendorType: role === "vendor" ? vendorType : null, isPremium: false },
      });

      if (role === "vendor") {
        const geo = city ? await geocodeCity(city) : {};
        await prisma.vendor.create({
          data: {
            name,
            category: vendorType,
            email,
            phone: phone || null,
            website: website || null,
            city: city || null,
            latitude: geo.latitude ?? null,
            longitude: geo.longitude ?? null,
            userId: user.id,
          },
        });
        // Rate-limit geocoding
        if (city) await new Promise(r => setTimeout(r, 1100));
      }

      if (sendInvite) {
        const token = randomBytes(32).toString("base64url");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await prisma.$executeRawUnsafe(
          `INSERT INTO "password_reset_tokens" (id, "userId", token, "expiresAt") VALUES ($1, $2, $3, $4)`,
          randomBytes(8).toString("hex"), user.id, token, expiresAt
        );
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
        await sendMail({
          to: email,
          subject: "Je account op DreamDay Partners is aangemaakt",
          html: `
            <p>Welkom op DreamDay Partners!</p>
            <p>Er is een account voor je aangemaakt. Klik op de knop om je wachtwoord in te stellen en in te loggen.</p>
            <p><a href="${appUrl}/wachtwoord-reset/${token}" style="display:inline-block;padding:12px 24px;background:#c49a6c;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Account activeren</a></p>
            <p style="color:#888;font-size:0.9em;">De link is 7 dagen geldig.</p>
          `,
          role: role === "vendor" ? "vendor" : "couple",
          name,
        });
      }

      created++;
    } catch (err) {
      errors.push(`${email}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ total: rows.length, created, skipped, errors });
}
