import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Afscheidscijfer voor het platform (1 t/m 10), bijv. bij accountverwijdering.
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    return NextResponse.json({ error: "Cijfer moet tussen 1 en 10 liggen" }, { status: 400 });
  }

  const feedback = await prisma.platformFeedback.create({
    data: {
      rating,
      text: typeof body?.text === "string" && body.text.trim() ? body.text.trim() : null,
      role: user.role,
    },
  });

  return NextResponse.json({ feedback }, { status: 201 });
}
