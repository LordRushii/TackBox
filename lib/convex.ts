import "server-only";
import { ConvexHttpClient } from "convex/browser";

export const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Shared secret proving a Convex call comes from this server, not from a browser.
 * Must match CONVEX_SERVER_SECRET set on the Convex deployment (npx convex env set).
 */
export function serverSecret(): string {
  const secret = process.env.CONVEX_SERVER_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("CONVEX_SERVER_SECRET is missing or too short in the Next.js environment");
  }
  return secret;
}
