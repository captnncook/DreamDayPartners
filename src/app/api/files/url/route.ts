import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDownloadUrl } from "@/lib/r2";

// GET /api/files/url?key=weddings/xxx/yyy.jpg
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key vereist" }, { status: 400 });

  try {
    const url = await getDownloadUrl(key, 3600);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Kan URL niet genereren" }, { status: 502 });
  }
}
