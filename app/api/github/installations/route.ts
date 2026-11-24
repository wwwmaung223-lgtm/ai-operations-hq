import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("github_app_user_token")?.value;
  if (!token) return NextResponse.json({ error: "GitHub is not connected." }, { status: 401 });
  const response = await fetch("https://api.github.com/user/installations", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store"
  });
  const payload = await response.json();
  if (!response.ok) return NextResponse.json({ error: "Could not load GitHub App installations." }, { status: response.status });
  return NextResponse.json({ installations: (payload.installations || []).map((item: { id: number; account?: { login?: string }; app_slug?: string }) => ({ id: item.id, account: item.account?.login || "GitHub account", app: item.app_slug || "GitHub App" })) });
}
