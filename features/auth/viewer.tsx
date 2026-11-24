"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { logoutAction } from "./actions";

/** The signed-in user, as the browser sees them. */
export type Viewer = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

type ViewerState = {
  viewer: Viewer | null;
  setViewer: (viewer: Viewer | null) => void;
};

const ViewerContext = createContext<ViewerState | null>(null);

const sameViewer = (a: Viewer | null, b: Viewer | null) =>
  a === b ||
  (a !== null && b !== null && a.id === b.id && a.name === b.name && a.email === b.email && a.image === b.image);

/**
 * The one place the app keeps who is signed in. The root layout reads the session cookie on
 * the server and passes the result in, so the first paint is already right. Sign-in, sign-out
 * and profile edits set it directly; whenever the layout renders again with a different
 * viewer, the server's answer wins.
 */
export function ViewerProvider({
  initialViewer,
  children,
}: {
  initialViewer: Viewer | null;
  children: React.ReactNode;
}) {
  const [viewer, setViewer] = useState(initialViewer);
  const [fromServer, setFromServer] = useState(initialViewer);
  if (!sameViewer(fromServer, initialViewer)) {
    setFromServer(initialViewer);
    setViewer(initialViewer);
  }

  return <ViewerContext.Provider value={{ viewer, setViewer }}>{children}</ViewerContext.Provider>;
}

function useViewerState(): ViewerState {
  const state = useContext(ViewerContext);
  if (!state) throw new Error("useViewer must be used inside ViewerProvider");
  return state;
}

/** The signed-in user, or null. */
export function useViewer(): Viewer | null {
  return useViewerState().viewer;
}

/** For flows that change who is signed in: sign-in, sign-up and profile edits. */
export function useSetViewer(): (viewer: Viewer | null) => void {
  return useViewerState().setViewer;
}

/** Ends both the Tackbox session and any Google session behind it, then goes home. */
export function useSignOut(): () => Promise<void> {
  const { setViewer } = useViewerState();
  const { signOut: clerkSignOut, isSignedIn: isClerkSignedIn } = useAuth();
  const router = useRouter();

  return useCallback(async () => {
    // Clerk first: while it is still signed in, ClerkSync would open a new Tackbox session
    if (isClerkSignedIn) {
      try {
        await clerkSignOut();
      } catch (e) {
        console.error("Failed to sign out of Google:", e);
      }
    }
    try {
      await logoutAction();
    } catch (e) {
      console.error("Failed to logout on server:", e);
    }
    setViewer(null);
    router.push("/");
  }, [isClerkSignedIn, clerkSignOut, setViewer, router]);
}
