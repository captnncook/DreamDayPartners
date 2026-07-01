import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth niet geconfigureerd" }, { status: 503 });
  }

  const claimToken = req.nextUrl.searchParams.get("claim");
  const pendingToken = req.nextUrl.searchParams.get("pending");

  const state = claimToken ? `claim:${claimToken}` : pendingToken ? `pending:${pendingToken}` : undefined;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    ...(state ? { state } : {}),
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
