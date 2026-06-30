import { randomBytes } from "crypto";

export function generateClaimToken(): string {
  return randomBytes(32).toString("base64url");
}

export const CLAIM_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
