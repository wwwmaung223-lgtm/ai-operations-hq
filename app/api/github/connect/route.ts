import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "GitHub App is not configured yet." }, { status: 503 });
  const state = randomBytes(32).toString("hex");
  const redirectUri = new URL("/api/github/callback", request.url).toString();
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "false");
  const response = NextResponse.redirect(url);
  response.cookies.set("github_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
