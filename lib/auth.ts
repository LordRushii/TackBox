import "server-only";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convex, serverSecret } from "./convex";
import { getSessionCookie, removeSessionCookie, setSessionCookie } from "./cookies";
import { generateSessionToken } from "./session";
import { hashPassword, verifyPassword } from "./password";
import { clientEmailKey, clientKey } from "./rate-keys";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name must be at most 80 characters"),
  email: z.string().trim().max(254).email("Invalid email address"),
  // bcrypt only reads the first 72 bytes, so longer passwords would be silently truncated
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .refine((p) => Buffer.byteLength(p, "utf8") <= 72, "Password must be at most 72 bytes"),
});

export const loginSchema = z.object({
  email: z.string().trim().max(254).email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(1024),
});

export interface AuthenticatedUser {
  id: Id<"users">;
  name: string;
  email: string;
  image?: string;
  role: string;
}

const SESSION_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Compared against when the email doesn't exist, so response time doesn't reveal which emails have accounts
const DUMMY_HASH = "$2b$10$IeQVCcz28THQb2ZQZP9qCe39xQLBSPF8qC4SHPiO4nd5bsXgO1gCq";

/** Creates a session for a user the server has already authenticated. */
export async function startSession(userId: Id<"users">) {
  const sessionToken = generateSessionToken();
  const expiresAt = Date.now() + SESSION_EXPIRATION_MS;
  await convex.mutation(api.sessions.createSession, {
    secret: serverSecret(),
    userId,
    sessionToken,
    expiresAt,
  });
  await setSessionCookie(sessionToken, expiresAt);
  return sessionToken;
}

export async function registerUser(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const { name, email, password } = parsed.data;

  const passwordHash = await hashPassword(password);
  const result = await convex.mutation(api.users.createUser, {
    secret: serverSecret(),
    clientKey: await clientKey(),
    name,
    email,
    passwordHash,
  });
  if (!result.ok) {
    return {
      success: false,
      error: result.reason === "limited"
        ? "Too many sign-up attempts. Try again in an hour"
        // Without email verification a taken address can't be hidden, since a free one signs
        // you straight in. The signup limit above caps how fast this can be probed
        : "Couldn't create an account with this email. If it's yours, sign in instead",
    };
  }
  const userId = result.userId;

  await startSession(userId);

  return {
    success: true,
    user: { id: userId, name, email, role: "Member" },
  };
}

export async function loginUser(input: unknown) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;
  const keys = {
    secret: serverSecret(),
    clientKey: await clientKey(),
    pairKey: await clientEmailKey(email),
  };

  const result = await convex.mutation(api.users.beginLogin, { ...keys, email });
  if (result.limited) {
    return { success: false, error: "Too many attempts. Try again in 15 minutes" };
  }

  const user = result.user;
  const passwordMatches = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !user.passwordHash || !passwordMatches) {
    await convex.mutation(api.users.recordLoginFailure, keys);
    // One message for every failure, so it doesn't reveal which emails exist or use Google
    return {
      success: false,
      error: "Invalid email or password. If you signed up with Google, use the Google button",
    };
  }

  await convex.mutation(api.users.clearLoginFailures, keys);
  await startSession(user.id);

  const { passwordHash: _, ...safeUser } = user;
  return { success: true, user: safeUser };
}

export async function logout() {
  const token = await getSessionCookie();
  if (token) {
    await convex.mutation(api.sessions.deleteSession, { sessionToken: token });
  }
  await removeSessionCookie();
  return { success: true };
}

export async function getSessionUser(): Promise<AuthenticatedUser | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  return await convex.query(api.sessions.getSessionUser, { sessionToken: token });
}

/** The current session token, for Convex functions that resolve the caller themselves. */
export async function requireSessionToken(): Promise<string> {
  const token = await getSessionCookie();
  if (!token) throw new Error("You must be logged in");
  return token;
}
