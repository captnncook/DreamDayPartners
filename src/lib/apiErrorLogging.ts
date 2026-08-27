import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/errorLog";

type RouteHandler<Ctx> = (req: Request, ctx: Ctx) => Promise<Response> | Response;

// Wrapt een API-routehandler zodat ELKE onverwachte fout (niet alleen de
// fouten die de route zelf al met try/catch afvangt) automatisch met volle
// context in error_logs terechtkomt: route, method, wie was ingelogd, en de
// stacktrace. De aanroeper krijgt een nette generieke 500 i.p.v. dat Next.js
// zijn eigen kale foutpagina toont.
export function withErrorLogging<Ctx = unknown>(handler: RouteHandler<Ctx>): RouteHandler<Ctx> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
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
        // sessie ophalen mag de errorlogging zelf nooit laten crashen
      }

      let route = req.url;
      try {
        route = new URL(req.url).pathname;
      } catch {
        // ongeldige URL: val terug op de ruwe waarde
      }

      await logError(err, {
        route,
        method: req.method,
        statusCode: 500,
        userId,
        userEmail,
        userRole,
        requestId: req.headers.get("x-request-id") ?? undefined,
        source: "api",
      });

      return NextResponse.json({ error: "Er ging iets mis. Probeer het opnieuw." }, { status: 500 });
    }
  };
}
