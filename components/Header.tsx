"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserAction, logoutAction } from "@/app/actions/auth";
import { useUser, useClerk } from "@clerk/nextjs";
import { User, LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { user: clerkUser, isSignedIn: isClerkSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatarUrl?: string;
    image?: string;
  } | null>(null);

  const checkUser = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser({
            ...parsed,
            avatarUrl: parsed.avatarUrl || parsed.image,
          });
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    checkUser();

    // Sync session on mount with server database
    async function syncSession() {
      try {
        const dbUser = await getCurrentUserAction();
        if (dbUser) {
          localStorage.setItem("user", JSON.stringify(dbUser));
        } else {
          localStorage.removeItem("user");
        }
        checkUser();
      } catch (e) {
        console.error("Failed to sync session with server:", e);
      }
    }
    syncSession();

    // Listen to storage changes to keep it in sync
    window.addEventListener("storage", checkUser);

    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener("storage", checkUser);
      clearInterval(interval);
    };
  }, []);

  // Derive the display user: prefer localStorage user, fall back to Clerk user
  const displayUser = user
    ? user
    : isClerkSignedIn && clerkUser
      ? {
          name: clerkUser.fullName || clerkUser.firstName || "User",
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          avatarUrl: clerkUser.imageUrl,
        }
      : null;

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (e) {
      console.error("Failed to logout on server:", e);
    }
    localStorage.removeItem("user");
    setUser(null);

    // Also sign out of Clerk if signed in via Google
    if (isClerkSignedIn) {
      await clerkSignOut();
    }

    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md">
      <div className="navbar max-w-[1200px] mx-auto px-6 flex justify-between h-16">
        <div className="flex-1 flex items-center">
          <Link
            href="/"
            className="group flex items-center justify-start w-32 h-10 overflow-hidden transition-opacity hover:opacity-80"
          >
            <img
              src="/logo.png"
              alt="Tackbox Logo"
              className="w-full h-full object-contain object-left"
            />
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <ul className="flex items-center gap-6 font-medium text-sm text-foreground/70">
            <li>
              <Link
                href="/skills"
                className="hover:text-foreground transition-colors"
              >
                Explore
              </Link>
            </li>
            <li>
              <Link
                href="/#categories"
                className="hover:text-foreground transition-colors"
              >
                Categories
              </Link>
            </li>

            <li>
              <Link
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-4">
            {displayUser ? (
              <>
                <Link
                  href="/my-skills"
                  className="hidden sm:flex text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  My Skills
                </Link>
                <div className="dropdown dropdown-end p-0">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar hover:bg-transparent overflow-hidden border border-white/10 w-9 h-9 flex items-center justify-center bg-white/[0.02]"
                  >
                    {displayUser.avatarUrl ? (
                      <img
                        src={displayUser.avatarUrl}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-medium text-sm text-foreground/80">
                        {displayUser.name
                          ? displayUser.name.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                    )}
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-1.5 shadow-2xl shadow-black bg-[#0A0A0A] rounded-lg w-56 border border-white/10"
                  >
                    <li className="px-3 py-2 border-b border-white/10 mb-1 pointer-events-none">
                      <span className="text-sm font-medium text-foreground block">
                        {displayUser.name}
                      </span>
                      <span className="text-xs font-normal text-foreground/50 block mt-0.5 truncate">
                        {displayUser.email}
                      </span>
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        className="px-3 py-2 rounded-md hover:bg-white/[0.04] text-foreground/80 hover:text-foreground transition-colors"
                      >
                        <User className="w-4 h-4 mr-2 opacity-70" />
                        Edit Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="px-3 py-2 rounded-md hover:bg-red-500/10 text-red-500/80 hover:text-red-500 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2 opacity-70" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="h-9 px-4 rounded-lg flex items-center justify-center text-sm font-medium text-foreground bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
