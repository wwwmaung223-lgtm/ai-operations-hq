import { NextRequest, NextResponse } from "next/server";
import { getSupabaseOwnerId } from "@/lib/github-owner";

export async function POST(request: NextRequest) {
  const ownerId = await getSupabaseOwnerId(request);
  if (!ownerId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const response = NextResponse.json({ connected: false });
  response.cookies.delete("github_app_user_token");
  response.cookies.delete("github_owner");
  response.cookies.delete("github_oauth_state");
  return response;
}
