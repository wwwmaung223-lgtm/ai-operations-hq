import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;\n  const callbackUrl = process.env.GITHUB_APP_CALLBACK_URL;
  const expectedState = request.cookies.get("github_oauth_state")?.value;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const base = new URL("/", request.url);
  if (error || !code || !state || !expectedState || state !== expectedState || !clientId || !clientSecret || !callbackUrl) {
    const response = NextResponse.redirect(new URL("/?github=connect_error", request.url));
    response.cookies.delete("github_oauth_state");
    return response;
  }
  try {
    const exchange = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: callbackUrl })
    });
    const payload = await exchange.json() as { access_token?: string; error?: string };
    if (!exchange.ok || !payload.access_token) throw new Error(payload.error || "GitHub authorization failed");
    const verify = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${payload.access_token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      cache: "no-store"
    });
    if (!verify.ok) throw new Error("Could not verify GitHub account");
    const user = await verify.json() as { login?: string };
    const response = NextResponse.redirect(new URL("/?github=connected", request.url));
    response.cookies.set("github_app_user_token", payload.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8
    });
    response.cookies.set("github_account", user.login || "", {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8
    });
    response.cookies.delete("github_oauth_state");
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/?github=connect_error", request.url));
    response.cookies.delete("github_oauth_state");
    return response;
  }
}
