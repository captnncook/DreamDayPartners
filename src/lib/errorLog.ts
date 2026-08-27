import { prisma } from "@/lib/prisma";

export type ErrorLogSource = "api" | "server" | "client";

export type ErrorLogContext = {
  route?: string;
  method?: string;
  statusCode?: number;
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  requestId?: string | null;
  digest?: string | null;
  source?: ErrorLogSource;
  extra?: Record<string, unknown>;
};

// Best-effort redaction: nooit wachtwoorden/tokens meesturen in de opgeslagen
// context, ook al zaten die in de oorspronkelijke request body.
const SENSITIVE_KEYS = /password|wachtwoord|token|secret|passwordhash|authorization|cookie/i;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.test(k) ? "[redacted]" : redact(v);
    }
    return out;
  }
  return value;
}

// Logt élke onverwachte fout naar de error_logs-tabel, zodat een programmeur
// achteraf exact kan zien wat er gebeurde: bericht, stacktrace, route/method,
// wie was ingelogd en welke request-data erbij hoorde. Faalt de DB-write zelf
// (bv. database onbereikbaar), dan valt dit terug op console.error zodat de
// fout in elk geval in de serverlogs blijft staan.
export async function logError(error: unknown, context: ErrorLogContext = {}): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? (error.stack ?? null) : null;

  console.error(
    `[error]${context.route ? ` ${context.method ?? ""} ${context.route}` : ""}${context.statusCode ? ` (${context.statusCode})` : ""}:`,
    error
  );

  try {
    let contextJson: string | null = null;
    if (context.extra) {
      try {
        contextJson = JSON.stringify(redact(context.extra)).slice(0, 8000);
      } catch {
        contextJson = null;
      }
    }

    await prisma.errorLog.create({
      data: {
        message: message.slice(0, 4000),
        stack: stack?.slice(0, 8000) ?? null,
        digest: context.digest ?? null,
        source: context.source ?? "api",
        route: context.route ?? null,
        method: context.method ?? null,
        statusCode: context.statusCode ?? null,
        userId: context.userId ?? null,
        userEmail: context.userEmail ?? null,
        userRole: context.userRole ?? null,
        requestId: context.requestId ?? null,
        context: contextJson,
      },
    });
  } catch (dbErr) {
    console.error("[errorLog] kon fout niet opslaan in error_logs:", dbErr);
  }
}
