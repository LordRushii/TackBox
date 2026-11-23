"use server";

import { api } from "@/convex/_generated/api";
import { convex, serverSecret } from "@/lib/convex";
import { startSession } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";

export async function loginWithClerkAction() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { success: false, error: "Not authenticated with Clerk" };
  }

  // Only a verified primary email may be linked to a Tackbox account; otherwise anyone
  // could add someone else's address in Clerk and be signed in as them
  const primary = clerkUser.primaryEmailAddress;
  if (!primary || primary.verification?.status !== "verified") {
    return { success: false, error: "Your email address isn't verified" };
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

    return { success: true, user };
  } catch (error) {
    console.error("Clerk sync error:", error);
    return { success: false, error: "Failed to sync user session" };
  }
}
