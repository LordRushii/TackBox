"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { loginWithClerkAction } from "@/features/auth/actions";
import { safeRedirect } from "@/features/auth/safe-redirect";
import { useSetViewer } from "@/features/auth/viewer";
import PixelLoader from "@/components/pixel/PixelLoader";

export default function AuthCallback() {
  const router = useRouter();
  const setViewer = useSetViewer();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function syncClerkUser() {
      try {
        const result = await loginWithClerkAction();

        if (result.ok) {
          setViewer(result.viewer);
          const searchParams = new URLSearchParams(window.location.search);
          router.push(safeRedirect(searchParams.get("redirect")));
        } else {
          setError(result.error || "Your session couldn't be synced. Try signing in again.");
        }
      } catch (err) {
        console.error("Auth sync error:", err);
        setError("Something went wrong while signing in. Try again.");
      }
    }

    syncClerkUser();
  }, [router, setViewer]);

  if (error) {
    return (
      <main className="flex min-h-[60vh] flex-1 items-center justify-center px-6">
        <div role="alert" className="w-full max-w-sm rounded-2xl border border-line bg-card p-6">
          <h1 className="flex items-center gap-2 font-heading text-lg font-medium text-foreground">
            <AlertTriangle className="size-4 text-negative" strokeWidth={1.5} />
            Couldn&apos;t sign you in
          </h1>
          <p className="mt-2 text-sm leading-[22px] text-subtle">{error}</p>
          <button type="button" className="btn btn-secondary mt-6 h-9 px-3 text-sm" onClick={() => router.push("/login")}>
            Back to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <PixelLoader label="Completing sign in" />
    </div>
  );
}
