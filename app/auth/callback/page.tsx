"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { safeRedirect } from "@/lib/safe-redirect";
import { loginWithClerkAction } from "@/app/actions/clerk";
import { AlertTriangle } from "lucide-react";
import PixelLoader from "@/components/pixel/PixelLoader";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function syncClerkUser() {
      try {
        const result = await loginWithClerkAction();
        
        if (result.success && result.user) {
          // Save user session for UI
          localStorage.setItem("user", JSON.stringify(result.user));
          window.dispatchEvent(new Event("storage"));
          
          // Redirect
          const searchParams = new URLSearchParams(window.location.search);
          const redirectUrl = safeRedirect(searchParams.get("redirect"));
          router.push(redirectUrl);
        } else {
          setError(result.error || "Your session couldn't be synced. Try signing in again.");
        }
      } catch (err) {
        console.error("Auth sync error:", err);
        setError("Something went wrong while signing in. Try again.");
      }
    }

    syncClerkUser();
  }, [router]);

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
