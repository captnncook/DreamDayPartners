import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { completeClaimViaOAuth } from "@/lib/complete-claim";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const claimToken = state?.startsWith("claim:") ? state.slice(6) : null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_cancelled`);
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${appUrl}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/login?error=google_token`);
  }

  const tokens = await tokenRes.json();

  // Get user info from Google
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(`${appUrl}/login?error=google_userinfo`);
  }

  const googleUser = await userRes.json() as { email: string; name: string; given_name?: string };
  const email = googleUser.email?.toLowerCase();
  if (!email) return NextResponse.redirect(`${appUrl}/login?error=google_no_email`);

  if (claimToken) {
    const result = await completeClaimViaOAuth(claimToken, email);
    if (!result.ok) return NextResponse.redirect(`${appUrl}/claim/${claimToken}?error=${encodeURIComponent(result.error)}`);
    return NextResponse.redirect(`${appUrl}/leveranciers/mijn-profiel`);
  }

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // New user — redirect to registration with pre-filled email & name
    const params = new URLSearchParams({
      email,
      name: googleUser.name ?? googleUser.given_name ?? "",
      provider: "google",
    });
    return NextResponse.redirect(`${appUrl}/aanmelden?${params}`);
  }

  await setSession(user.id);
  return NextResponse.redirect(`${appUrl}/dashboard`);
}
