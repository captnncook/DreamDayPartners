import { prisma } from "@/lib/prisma";

export type AdminEventType =
  | "password_reset"
  | "email_change"
  | "vendor_type_change"
  | "claim_approved"
  | "claim_rejected"
  | "claim_reminder"
  | "account_created"
  | "error";

export async function logAdminEvent(type: AdminEventType, message: string, targetEmail?: string) {
  try {
    await prisma.adminEvent.create({ data: { type, message, targetEmail } });
  } catch (err) {
    console.error("[adminEvent] failed to log:", err);
  }
}
