import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/60 font-medium animate-pulse">
          Authenticating with Google...
        </p>
      </div>
      {/* Clerk handles the callback and then redirects to /auth/callback */}
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
