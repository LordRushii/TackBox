import { z } from "zod";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getSessionCookie, removeSessionCookie, setSessionCookie } from "./cookies";
import { generateSessionToken } from "./session";
import { hashPassword, verifyPassword } from "./password";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export interface AuthenticatedUser {
  id: Id<"users">;
  name: string;
  email: string;
  image?: string;
  role: string;
}

const SESSION_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function registerUser(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const { name, email, password } = parsed.data;

  // Check if email already exists
  const existingUser = await convex.query(api.users.getUserByEmail, { email });
  if (existingUser) {
    return { success: false, error: "Email already registered" };
  }

  // Hash password
  const passwordHash = await hashPassword(password);
  const createdAt = Date.now();

  // Create user
  const userId = await convex.mutation(api.users.createUser, {
    name,
    email,
    passwordHash,
    createdAt,
  });

  // Create session
  const sessionToken = generateSessionToken();
  const expiresAt = Date.now() + SESSION_EXPIRATION_MS;

  await convex.mutation(api.sessions.createSession, {
    userId,
    sessionToken,
    expiresAt,
    createdAt,
  });

  // Set cookie
  await setSessionCookie(sessionToken, expiresAt);

  return {
    success: true,
    user: {
      id: userId,
      name,
      email,
      role: "Member",
    },
  };
}

export async function loginUser(input: unknown) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;

  // Find user
  const user = await convex.query(api.users.getUserByEmail, { email });
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  // Compare passwords
  if (!user.passwordHash) {
    return { success: false, error: "Please sign in with your provider" };
  }
  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    return { success: false, error: "Invalid email or password" };
  }

  // Create session
  const sessionToken = generateSessionToken();
  const expiresAt = Date.now() + SESSION_EXPIRATION_MS;

  await convex.mutation(api.sessions.createSession, {
    userId: user._id,
    sessionToken,
    expiresAt,
    createdAt: Date.now(),
  });

  // Set cookie
  await setSessionCookie(sessionToken, expiresAt);

  return {
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: "Member",
    },
  };
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

  const session = await convex.query(api.sessions.getSession, { sessionToken: token });
  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      await convex.mutation(api.sessions.deleteSession, { sessionToken: token });
    }
    return null;
  }

  const user = await convex.query(api.users.getUserById, { id: session.userId });
  if (!user) return null;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: "Member",
  };
}
