import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import PixelLoader from "@/components/pixel/PixelLoader";

export default function SSOCallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <PixelLoader label="Signing in with Google" />
      {/* Clerk handles the callback and then redirects to /auth/callback */}
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
