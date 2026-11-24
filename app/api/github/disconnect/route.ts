import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ connected: false });
  response.cookies.delete("github_app_user_token");
  response.cookies.delete("github_account");
  response.cookies.delete("github_oauth_state");
  return response;
}
