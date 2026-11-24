import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("github_app_user_token")?.value;
  const installationId = new URL(request.url).searchParams.get("installation_id");
  if (!token) return NextResponse.json({ error: "GitHub is not connected." }, { status: 401 });
  if (!installationId || !/^\d+$/.test(installationId)) return NextResponse.json({ error: "A valid installation_id is required." }, { status: 400 });
  const response = await fetch(`https://api.github.com/user/installations/${installationId}/repositories?per_page=100`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store"
  });
  const payload = await response.json();
  if (!response.ok) return NextResponse.json({ error: "Could not load repositories for this installation." }, { status: response.status });
  return NextResponse.json({ repositories: (payload.repositories || []).map((repo: { id: number; full_name: string; private: boolean; default_branch: string; html_url: string }) => ({ id: repo.id, full_name: repo.full_name, private: repo.private, default_branch: repo.default_branch, url: repo.html_url })) });
}
