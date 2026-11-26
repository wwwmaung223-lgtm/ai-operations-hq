import { NextRequest, NextResponse } from "next/server";
import { getGitHubOwnerContext } from "@/lib/github-owner";

export async function GET(request: NextRequest) {
  const context = await getGitHubOwnerContext(request);
  if (!context) return NextResponse.json({ error: "Connect GitHub to your signed-in owner account first." }, { status: 401 });

  const response = await fetch("https://api.github.com/user/installations?per_page=100", {
    headers: { Authorization: "Bearer " + context.token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store"
  });
  const payload: unknown = await response.json();
  if (!response.ok) return NextResponse.json({ error: "Could not load GitHub App installations." }, { status: response.status });
  const rows = typeof payload === "object" && payload !== null && "installations" in payload && Array.isArray(payload.installations) ? payload.installations : [];
  const installations = rows.flatMap((item: unknown) => {
    if (typeof item !== "object" || item === null || !("id" in item)) return [];
    const row = item as { id?: unknown; account?: { login?: unknown }; app_slug?: unknown };
    if (typeof row.id !== "number") return [];
    return [{ id: row.id, account: typeof row.account?.login === "string" ? row.account.login : "GitHub account", app: typeof row.app_slug === "string" ? row.app_slug : "GitHub App" }];
  });
  return NextResponse.json({ installations });
}
