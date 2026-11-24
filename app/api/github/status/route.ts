import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("github_app_user_token")?.value;
  const account = request.cookies.get("github_account")?.value || null;
  if (!token) return NextResponse.json({ connected: false });
  const check = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store"
  });
  if (!check.ok) return NextResponse.json({ connected: false, expired: true });
  const user = await check.json() as { login?: string };
  return NextResponse.json({ connected: true, account: user.login || account });
}
