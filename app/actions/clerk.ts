"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { generateSessionToken } from "@/lib/session";
import { setSessionCookie } from "@/lib/cookies";
import { currentUser } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const SESSION_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function loginWithClerkAction() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { success: false, error: "Not authenticated with Clerk" };
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    return { success: false, error: "No email address found" };
  }

  const name =
    `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
    email.split("@")[0];
  const image = clerkUser.imageUrl;

  try {
    // Find or create user in Convex
    let user = await convex.query(api.users.getUserByEmail, { email });
    let userId;

    if (!user) {
      userId = await convex.mutation(api.users.createUser, {
        name,
        email,
        image,
        createdAt: Date.now(),
      });
      // Get the newly created user for returning in the response
      user = await convex.query(api.users.getUserById, { id: userId });
    } else {
      userId = user._id;
      // Update image if needed
      if (image && user.image !== image) {
        await convex.mutation(api.users.updateUser, { id: userId, image });
      }
    }

    // Create a Convex session
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + SESSION_EXPIRATION_MS;

    await convex.mutation(api.sessions.createSession, {
      userId,
      sessionToken,
      expiresAt,
      createdAt: Date.now(),
    });

    // Set standard tackbox_session cookie
    await setSessionCookie(sessionToken, expiresAt);

    return {
      success: true,
      user: {
        id: userId,
        name: user!.name,
        email: user!.email,
        image: user!.image || image,
        role: "Member",
      },
    };
  } catch (error) {
    console.error("Clerk sync error:", error);
    return { success: false, error: "Failed to sync user session" };
  }
}
