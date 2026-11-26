import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseOwnerId, signedCookieValue } from "@/lib/github-owner";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  const callbackUrl = process.env.GITHUB_APP_CALLBACK_URL;
  if (!clientId || !callbackUrl || !process.env.GITHUB_APP_STATE_SECRET || !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "GitHub App connection is not configured yet." }, { status: 503 });
  }

  const ownerId = await getSupabaseOwnerId(request);
  if (!ownerId) return NextResponse.json({ error: "Sign in to your Operations HQ account first." }, { status: 401 });

  const state = randomBytes(32).toString("hex");
  const stateCookie = signedCookieValue(state + "." + ownerId);
  if (!stateCookie) return NextResponse.json({ error: "GitHub App state signing is not configured." }, { status: 503 });

  const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("allow_signup", "false");

  const response = NextResponse.json({ authorizationUrl: authorizationUrl.toString() });
  response.cookies.set("github_oauth_state", stateCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600
  });
  return response;
}
