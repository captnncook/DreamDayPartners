import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { createPrivateKey, createSign } from "crypto";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "";

function makeAppleClientSecret(): string {
  const teamId = process.env.APPLE_TEAM_ID!;
  const keyId = process.env.APPLE_KEY_ID!;
  const clientId = process.env.APPLE_CLIENT_ID!;
  const privateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: teamId,
    iat: now,
    exp: now + 3600,
    aud: "https://appleid.apple.com",
    sub: clientId,
  })).toString("base64url");

  const data = `${header}.${payload}`;
  const key = createPrivateKey({ key: privateKey, format: "pem" });
  const sign = createSign("SHA256");
  sign.update(data);
  const sig = sign.sign(key).toString("base64url");
  return `${data}.${sig}`;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length < 2) return {};
  return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
}

// Apple sends a form POST
export async function POST(req: NextRequest) {
  const base = appUrl();
  try {
    const form = await req.formData();
    const code = form.get("code") as string | null;
    const idToken = form.get("id_token") as string | null;
    // Apple sends name only on the very first login, encoded as JSON in `user`
    const userField = form.get("user") as string | null;

    if (!code && !idToken) {
      return NextResponse.redirect(`${base}/login?error=apple_no_code`);
    }

    // Get email from id_token (no server round-trip needed for email)
    let email: string | undefined;
    let name: string | undefined;

    if (idToken) {
      const payload = decodeJwtPayload(idToken);
      email = payload.email as string | undefined;
    }

    // Apple may also provide name in the `user` field on first auth
    if (userField) {
      try {
        const parsed = JSON.parse(userField);
        const n = parsed.name;
        if (n) name = [n.firstName, n.lastName].filter(Boolean).join(" ");
        if (!email && parsed.email) email = parsed.email;
      } catch { /* ignore */ }
    }

    // If we still don't have email, exchange code for tokens
    if (!email && code) {
      const clientSecret = makeAppleClientSecret();
      const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.APPLE_CLIENT_ID!,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${base}/api/auth/apple/callback`,
        }),
      });
      if (tokenRes.ok) {
        const tokens = await tokenRes.json();
        if (tokens.id_token) {
          const payload = decodeJwtPayload(tokens.id_token);
          email = payload.email as string | undefined;
        }
      }
    }

    if (!email) {
      return NextResponse.redirect(`${base}/login?error=apple_no_email`);
    }

    email = email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const params = new URLSearchParams({ email, name: name ?? "", provider: "apple" });
      return NextResponse.redirect(`${base}/aanmelden?${params}`);
    }

    await setSession(user.id);
    return NextResponse.redirect(`${base}/dashboard`);
  } catch (err) {
    console.error("Apple callback error:", err);
    return NextResponse.redirect(`${base}/login?error=apple_failed`);
  }
}
