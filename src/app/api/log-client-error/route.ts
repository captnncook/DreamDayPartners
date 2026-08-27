import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/errorLog";

// Vangt onverwachte fouten aan de browserkant (onbehandelde JS-exceptions,
// promise-rejecties, React-rendering-crashes) op dezelfde manier als
// API-routes: met volledige stacktrace en wie was ingelogd, zodat een
// programmeur ook client-side incidenten kan terugvinden in het admin-log.
export async function POST(req: NextRequest) {
  let userId: string | null = null;
  let userEmail: string | null = null;
  let userRole: string | null = null;
  try {
    const user = await getSession();
    if (user) {
      userId = user.id;
      userEmail = user.email;
      userRole = user.role;
    }
  } catch {
    // sessie ophalen mag deze route zelf nooit laten falen
  }

  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message : "Onbekende clientfout";
    const stack = typeof body?.stack === "string" ? body.stack : undefined;

    await logError(new Error(message), {
      route: typeof body?.route === "string" ? body.route : undefined,
      source: "client",
      userId,
      userEmail,
      userRole,
      extra: {
        stack,
        userAgent: req.headers.get("user-agent") ?? undefined,
        ...(body?.extra && typeof body.extra === "object" ? body.extra : {}),
      },
    });
  } catch {
    // best-effort: een falende client-errorrapportage mag zelf geen fout gooien
  }

  return NextResponse.json({ ok: true });
}
