import { NextRequest, NextResponse } from "next/server";
import { getGitHubOwnerContext } from "@/lib/github-owner";

export async function GET(request: NextRequest) {
  const context = await getGitHubOwnerContext(request);
  if (!context) return NextResponse.json({ error: "Connect GitHub to your signed-in owner account first." }, { status: 401 });

  const installationId = new URL(request.url).searchParams.get("installation_id");
  if (!installationId || !/^\d+$/.test(installationId)) return NextResponse.json({ error: "A valid installation_id is required." }, { status: 400 });

  const headers = { Authorization: "Bearer " + context.token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  const installationsResponse = await fetch("https://api.github.com/user/installations?per_page=100", { headers, cache: "no-store" });
  if (!installationsResponse.ok) return NextResponse.json({ error: "Could not verify this GitHub installation." }, { status: installationsResponse.status });
  const installationPayload: unknown = await installationsResponse.json();
  const installations = typeof installationPayload === "object" && installationPayload !== null && "installations" in installationPayload && Array.isArray(installationPayload.installations) ? installationPayload.installations : [];
  const ownsInstallation = installations.some((item: unknown) => typeof item === "object" && item !== null && "id" in item && String((item as { id?: unknown }).id) === installationId);
  if (!ownsInstallation) return NextResponse.json({ error: "This installation is not available to the connected GitHub account." }, { status: 403 });

  const response = await fetch("https://api.github.com/user/installations/" + installationId + "/repositories?per_page=100", { headers, cache: "no-store" });
  const payload: unknown = await response.json();
  if (!response.ok) return NextResponse.json({ error: "Could not load repositories for this installation." }, { status: response.status });
  const rows = typeof payload === "object" && payload !== null && "repositories" in payload && Array.isArray(payload.repositories) ? payload.repositories : [];
  const repositories = rows.flatMap((item: unknown) => {
    if (typeof item !== "object" || item === null || !("id" in item) || !("full_name" in item)) return [];
    const row = item as { id?: unknown; full_name?: unknown; private?: unknown; default_branch?: unknown; html_url?: unknown };
    if (typeof row.id !== "number" || typeof row.full_name !== "string") return [];
    return [{ id: row.id, full_name: row.full_name, private: Boolean(row.private), default_branch: typeof row.default_branch === "string" ? row.default_branch : "main", url: typeof row.html_url === "string" ? row.html_url : "" }];
  });
  return NextResponse.json({ repositories });
}
