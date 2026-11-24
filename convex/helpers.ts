import { QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { toSlug } from "../features/skills/slug";

// Every Convex function is reachable by anyone who knows the public deployment URL,
// so nothing here may trust a user ID sent by the caller. Functions either:
//  - resolve the caller from their session token (a 256-bit secret held in an httpOnly cookie), or
//  - require CONVEX_SERVER_SECRET, which only the Next.js server knows (login, signup, sessions).

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function assertServerSecret(secret: string) {
  const expected = process.env.CONVEX_SERVER_SECRET;
  if (!expected || expected.length < 32) {
    throw new Error("Server misconfigured: CONVEX_SERVER_SECRET is not set on the Convex deployment");
  }
  if (!safeEqual(secret, expected)) {
    throw new Error("Unauthorized");
  }
}

type Reader = { db: QueryCtx["db"] };

export async function userFromSession(
  ctx: Reader,
  sessionToken: string | undefined,
): Promise<Doc<"users"> | null> {
  if (!sessionToken) return null;
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_sessionToken", (q) => q.eq("sessionToken", sessionToken))
    .unique();
  if (!session || session.expiresAt < Date.now()) return null;
  return await ctx.db.get(session.userId);
}

export async function requireUser(ctx: Reader, sessionToken: string): Promise<Doc<"users">> {
  const user = await userFromSession(ctx, sessionToken);
  if (!user) throw new Error("Unauthorized: please sign in again");
  return user;
}

// ---- Public profile ------------------------------------------------------

// The only user fields that may leave the backend. Never the email or password hash.
// The handle comes from the display name plus part of the ID, so it can't reveal an email.
export function publicAuthor(user: Doc<"users"> | null) {
  if (!user) return null;
  const base = toSlug(user.name).slice(0, 24) || "user";
  return {
    _id: user._id,
    name: user.name,
    image: user.image,
    username: `${base}-${user._id.slice(-4)}`,
  };
}

export function sessionUser(user: Doc<"users">) {
  return { id: user._id, name: user.name, email: user.email, image: user.image, role: "Member" };
}

export const LIMITS = {
  name: 80,
  email: 254,
  imageUrl: 2048,
  skillName: 120,
  description: 500,
  category: 50,
  tag: 50,
  tags: 10,
  content: 100_000,
  subSkills: 20,
  subSkillTitle: 120,
};

export function checkLength(value: string | undefined, max: number, field: string) {
  if (value !== undefined && value.length > max) {
    throw new Error(`${field} must be at most ${max} characters`);
  }
}

// Uploaded avatars are stored inline as base64 data URLs; Convex documents cap at 1 MB
const MAX_DATA_URL = 700_000;
const DATA_IMAGE = /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;

export function checkImageUrl(url: string | undefined) {
  if (!url) return;
  if (url.startsWith("data:")) {
    if (url.length > MAX_DATA_URL) throw new Error("Image is too large, keep it under 500 KB");
    if (!DATA_IMAGE.test(url)) throw new Error("Image must be a PNG, JPEG, GIF or WebP file");
    return;
  }
  checkLength(url, LIMITS.imageUrl, "Image URL");
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Image must be a valid URL");
  }
  if (parsed.protocol !== "https:") throw new Error("Image URL must use https");
}
