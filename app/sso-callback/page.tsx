import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import PixelLoader from "@/components/pixel/PixelLoader";

/** Google sends the browser back here. Clerk finishes its sign-in, then goes to /auth/callback. */
export default function SSOCallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <PixelLoader label="Logging in with Google" />
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/auth/callback"
        signUpFallbackRedirectUrl="/auth/callback"
      />
      {/* Clerk's bot check for new Google accounts renders here when it's needed */}
      <div id="clerk-captcha" />
    </div>
  );
}
