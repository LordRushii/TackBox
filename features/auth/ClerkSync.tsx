"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { loginWithClerkAction } from "./actions";
import { useSetViewer, useViewer } from "./viewer";

/**
 * Bridges Clerk (Google sign-in) to Tackbox sessions. When Clerk is signed in but there is
 * no Tackbox viewer, it opens a session for the same verified email and sets the viewer.
 */
export default function ClerkSync() {
  const { isSignedIn, isLoaded } = useUser();
  // The Google buttons pass through these two pages, and /auth/callback opens the session itself
  const pathname = usePathname();
  const onCallbackPage = pathname === "/sso-callback" || pathname === "/auth/callback";
  const viewer = useViewer();
  const setViewer = useSetViewer();
  // One attempt per Clerk sign-in. A viewer counts as done, so signing out of Tackbox
  // while Clerk is still finishing its own sign-out doesn't open a new session
  const settled = useRef(false);

  useEffect(() => {
    if (!isLoaded || onCallbackPage) return;
    if (!isSignedIn) {
      settled.current = false;
      return;
    }
    if (viewer) {
      settled.current = true;
      return;
    }
    if (settled.current) return;
    settled.current = true;

    loginWithClerkAction()
      .then((result) => {
        if (result.ok) setViewer(result.viewer);
      })
      .catch((err) => console.error("Failed to sync Clerk user to Convex:", err));
  }, [isLoaded, isSignedIn, onCallbackPage, viewer, setViewer]);

  return null;
}
