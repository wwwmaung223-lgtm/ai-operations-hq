import { NextRequest, NextResponse } from "next/server";
import { getGitHubOwnerContext, getSupabaseOwnerId } from "@/lib/github-owner";

export async function GET(request: NextRequest) {
  const ownerId = await getSupabaseOwnerId(request);
  if (!ownerId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const context = await getGitHubOwnerContext(request);
  if (!context) return NextResponse.json({ connected: false });

  const check = await fetch("https://api.github.com/user", {
    headers: { Authorization: "Bearer " + context.token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store"
  });
  if (!check.ok) {
    const response = NextResponse.json({ connected: false, expired: true });
    response.cookies.delete("github_app_user_token");
    response.cookies.delete("github_owner");
    return response;
  }
  const user: unknown = await check.json();
  const login = typeof user === "object" && user !== null && "login" in user ? (user as { login?: unknown }).login : null;
  return NextResponse.json({ connected: true, account: typeof login === "string" ? login : "GitHub account" });
}
