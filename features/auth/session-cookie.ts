import "server-only";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

// The session token is a 256-bit secret. It only ever lives in this httpOnly cookie
// and in the Convex sessions table, never in anything the browser's scripts can read.

const COOKIE_NAME = "tackbox_session";

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function setSessionCookie(token: string, expiresAt: number) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(expiresAt),
    path: "/",
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
