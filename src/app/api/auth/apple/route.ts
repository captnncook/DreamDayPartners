import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.APPLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Apple OAuth niet geconfigureerd" }, { status: 503 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const claimToken = req.nextUrl.searchParams.get("claim");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/auth/apple/callback`,
    response_type: "code id_token",
    response_mode: "form_post",
    scope: "name email",
    ...(claimToken ? { state: `claim:${claimToken}` } : {}),
  });

  return NextResponse.redirect(`https://appleid.apple.com/auth/authorize?${params}`);
}
