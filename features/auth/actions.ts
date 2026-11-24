"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { convex, serverSecret } from "@/lib/convex";
import {
  type AuthResult,
  getViewer,
  loginUser,
  logout,
  registerUser,
  requireSessionToken,
  startSession,
  toViewer,
} from "./server";

// Every action here changes who is signed in, so each one revalidates the root layout:
// it reads the viewer and hands it to the ViewerProvider.

export async function registerAction(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthResult> {
  if (!input.name || !input.email || !input.password || !input.confirmPassword) {
    return { ok: false, error: "Please fill in all fields" };
  }
  if (input.password !== input.confirmPassword) {
    return { ok: false, error: "Passwords do not match" };
  }

  const result = await registerUser(input);
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

export async function loginAction(input: { email: string; password: string }): Promise<AuthResult> {
  if (!input.email || !input.password) {
    return { ok: false, error: "Please fill in all fields" };
  }

  const result = await loginUser(input);
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

/** Turns a Google sign-in through Clerk into a Tackbox session. */
export async function loginWithClerkAction(): Promise<AuthResult> {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return { ok: false, error: "Not authenticated with Clerk" };
  }

  // Only a verified primary email may be linked to a Tackbox account; otherwise anyone
  // could add someone else's address in Clerk and be signed in as them
  const primary = clerkUser.primaryEmailAddress;
  if (!primary || primary.verification?.status !== "verified") {
    return { ok: false, error: "Your email address isn't verified" };
  }
  const email = primary.emailAddress;

  const name =
    `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
    email.split("@")[0];
  const image = clerkUser.imageUrl || undefined;

  try {
    const userId = await convex.mutation(api.users.findOrCreateOAuthUser, {
      secret: serverSecret(),
      name: name.slice(0, 80),
      email,
      image,
    });

    const sessionToken = await startSession(userId);
    const user = await convex.query(api.sessions.getSessionUser, { sessionToken });
    if (!user) throw new Error("Session was not created");

    revalidatePath("/", "layout");
    return { ok: true, viewer: toViewer(user) };
  } catch (error) {
    console.error("Clerk sync error:", error);
    return { ok: false, error: "Failed to sync user session" };
  }
}

export async function logoutAction() {
  await logout();
  revalidatePath("/", "layout");
}

export async function updateProfileAction(name: string, image: string): Promise<AuthResult> {
  const sessionToken = await requireSessionToken();

  if (typeof name !== "string" || typeof image !== "string") {
    return { ok: false, error: "Invalid profile data" };
  }

  try {
    await convex.mutation(api.users.updateProfile, { sessionToken, name, image });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Couldn't save the profile" };
  }

  // Read after the update: getViewer caches per request, so the layout reuses this fresh copy
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Please log in again" };

  revalidatePath("/", "layout");
  return { ok: true, viewer };
}
