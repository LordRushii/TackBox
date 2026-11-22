import "server-only";
import { createHmac } from "crypto";
import { headers } from "next/headers";
import { serverSecret } from "./convex";

/**
 * The client's IP as reported by the hosting proxy. On Vercel `x-real-ip` and the first
 * `x-forwarded-for` entry are set by the platform. Locally every request shares one key.
 */
async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-real-ip")?.trim() ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

/** Keyed hash, so the rate-limit table never stores raw IPs, emails or user IDs. */
function hmac(...parts: string[]): string {
  return createHmac("sha256", serverSecret()).update(parts.join("\n")).digest("hex");
}

export async function clientKey(): Promise<string> {
  return hmac("ip", await clientIp());
}

export async function clientEmailKey(email: string): Promise<string> {
  return hmac("ip+email", await clientIp(), email.toLowerCase());
}

/** One viewer: the signed-in user if there is one, otherwise the client IP. */
export async function viewerKey(userId: string | undefined): Promise<string> {
  return userId ? hmac("user", userId) : hmac("ip", await clientIp());
}
