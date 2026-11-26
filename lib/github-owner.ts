import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

export type GitHubOwnerContext = {
  ownerId: string;
  token: string;
};

function stateSecret(): string | null {
  return process.env.GITHUB_APP_STATE_SECRET || null;
}

function sign(value: string): string | null {
  const secret = stateSecret();
  if (!secret || secret.length < 32) return null;
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function signedCookieValue(value: string): string | null {
  const signature = sign(value);
  return signature ? value + "." + signature : null;
}

export function verifySignedCookieValue(value: string | undefined): string | null {
  if (!value) return null;
  const splitAt = value.lastIndexOf(".");
  if (splitAt <= 0) return null;
  const payload = value.slice(0, splitAt);
  const supplied = value.slice(splitAt + 1);
  const expected = sign(payload);
  if (!expected) return null;
  const suppliedBytes = Buffer.from(supplied, "hex");
  const expectedBytes = Buffer.from(expected, "hex");
  if (suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes, expectedBytes)) return null;
  return payload;
}

export async function getSupabaseOwnerId(request: Request): Promise<string | null> {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  try {
    const response = await fetch(supabaseUrl.replace(/\/$/, "") + "/auth/v1/user", {
      headers: { apikey: anonKey, Authorization: authorization },
      cache: "no-store"
    });
    if (!response.ok) return null;
    const user: unknown = await response.json();
    if (typeof user !== "object" || user === null || !("id" in user)) return null;
    const id = (user as { id?: unknown }).id;
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

export async function getGitHubOwnerContext(request: NextRequest): Promise<GitHubOwnerContext | null> {
  const ownerId = await getSupabaseOwnerId(request);
  if (!ownerId) return null;
  const cookieOwner = verifySignedCookieValue(request.cookies.get("github_owner")?.value);
  const token = request.cookies.get("github_app_user_token")?.value;
  if (!token || cookieOwner !== ownerId) return null;
  return { ownerId, token };
}

export function parseOAuthStateCookie(value: string | undefined): { state: string; ownerId: string } | null {
  const payload = verifySignedCookieValue(value);
  if (!payload) return null;
  const splitAt = payload.indexOf(".");
  if (splitAt <= 0) return null;
  const state = payload.slice(0, splitAt);
  const ownerId = payload.slice(splitAt + 1);
  if (!/^[a-f0-9]{64}$/.test(state) || !ownerId) return null;
  return { state, ownerId };
}
