"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { loginWithClerkAction } from "@/app/actions/clerk";

/**
 * This component bridges Clerk auth with the custom Convex session system.
 * When a user signs in via Clerk (Google OAuth), it automatically:
 * 1. Creates/finds the user in Convex
 * 2. Sets the tackbox_session cookie
 * 3. Stores user data in localStorage for the Header
 */
export default function ClerkSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, user, isLoaded } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user && !hasSynced.current) {
      hasSynced.current = true;

      // Check if we already have a local session — if so, skip sync
      const existingUser = localStorage.getItem("user");
      if (existingUser) return;

      // Clerk user is signed in but no local session — sync now
      loginWithClerkAction()
        .then((result) => {
          if (result.success && result.user) {
            localStorage.setItem("user", JSON.stringify(result.user));
            window.dispatchEvent(new Event("storage"));
          }
        })
        .catch((err) => {
          console.error("Failed to sync Clerk user to Convex:", err);
        });
    }

    if (!isSignedIn && isLoaded) {
      hasSynced.current = false;
    }
  }, [isSignedIn, user, isLoaded]);

  return <>{children}</>;
}
