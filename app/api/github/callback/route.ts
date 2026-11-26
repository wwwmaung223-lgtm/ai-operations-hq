import { NextRequest, NextResponse } from "next/server";
import { parseOAuthStateCookie, signedCookieValue } from "@/lib/github-owner";

export const runtime = "nodejs";

function failure(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/?github=connect_error", request.url));
  response.cookies.delete("github_oauth_state");
  return response;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
  const callbackUrl = process.env.GITHUB_APP_CALLBACK_URL;
  const stateCookie = parseOAuthStateCookie(request.cookies.get("github_oauth_state")?.value);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (searchParams.has("error") || !code || !state || !stateCookie || state !== stateCookie.state || !clientId || !clientSecret || !callbackUrl) {
    return failure(request);
  }

  try {
    const exchange = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: callbackUrl }),
      cache: "no-store"
    });
    const payload: unknown = await exchange.json();
    if (!exchange.ok || typeof payload !== "object" || payload === null || !("access_token" in payload)) return failure(request);
    const accessToken = (payload as { access_token?: unknown }).access_token;
    if (typeof accessToken !== "string" || !accessToken) return failure(request);

    const verify = await fetch("https://api.github.com/user", {
      headers: { Authorization: "Bearer " + accessToken, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      cache: "no-store"
    });
    if (!verify.ok) return failure(request);
    const githubUser: unknown = await verify.json();
    if (typeof githubUser !== "object" || githubUser === null || !("login" in githubUser)) return failure(request);
    const login = (githubUser as { login?: unknown }).login;
    if (typeof login !== "string" || !login) return failure(request);

    const ownerCookie = signedCookieValue(stateCookie.ownerId);
    if (!ownerCookie) return failure(request);
    const response = NextResponse.redirect(new URL("/?github=connected", request.url));
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 8
    };
    response.cookies.set("github_app_user_token", accessToken, cookieOptions);
    response.cookies.set("github_owner", ownerCookie, cookieOptions);
    response.cookies.delete("github_oauth_state");
    return response;
  } catch {
    return failure(request);
  }
}
