"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithClerkAction } from "@/app/actions/clerk";
import { AlertTriangle } from "lucide-react";

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
          const redirectUrl = searchParams.get("redirect") || "/my-skills";
          router.push(redirectUrl);
        } else {
          setError(result.error || "Failed to sync user session.");
        }
      } catch (err) {
        console.error("Auth sync error:", err);
        setError("An unexpected error occurred during authentication.");
      }
    }

    syncClerkUser();
  }, [router]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="alert alert-error max-w-md shadow-lg">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Authentication Error</h3>
            <div className="text-sm">{error}</div>
          </div>
          <button className="btn btn-sm" onClick={() => router.push("/login")}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/60 font-medium animate-pulse">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
