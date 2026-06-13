"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserAction, logoutAction } from "@/app/actions/auth";
import { User, LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; avatarUrl?: string; image?: string } | null>(null);

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

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (e) {
      console.error("Failed to logout on server:", e);
    }
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-200/40 bg-base-100/70 backdrop-blur-md">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between">
        <div className="flex-1">
          <Link href="/" className="group flex items-center gap-2 text-xl font-bold transition-all duration-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-600 text-primary-content shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <span>S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-base-content transition-opacity group-hover:opacity-90">
              SkillHub
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex flex-1 justify-center">
          <ul className="menu menu-horizontal px-1 gap-2 font-medium text-base-content/80">
            <li>
              <Link href="/skills" className="rounded-lg hover:bg-base-200/50 hover:text-base-content transition-all duration-200">
                Explore
              </Link>
            </li>
            <li>
              <Link href="/#categories" className="rounded-lg hover:bg-base-200/50 hover:text-base-content transition-all duration-200">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/docs" className="rounded-lg hover:bg-base-200/50 hover:text-base-content transition-all duration-200">
                Docs
              </Link>
            </li>
            <li>
              <Link href="/about" className="rounded-lg hover:bg-base-200/50 hover:text-base-content transition-all duration-200">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex-1 justify-end">
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/my-skills"
                  className="hidden sm:flex text-sm font-medium text-base-content/80 hover:text-base-content transition-all duration-200"
                >
                  My Skills
                </Link>
                <div className="dropdown dropdown-end p-0">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder hover:bg-transparent overflow-hidden">
                    {user.avatarUrl ? (
                      <div className="w-10 rounded-full shadow-sm transition-transform hover:scale-105">
                        <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="bg-primary text-primary-content rounded-full w-10 shadow-sm transition-transform hover:scale-105">
                        <span className="font-semibold">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                      </div>
                    )}
                  </div>
                  <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg shadow-base-300/50 bg-base-100 rounded-box w-52 border border-base-200/50">
                    <li className="menu-title px-4 py-2 border-b border-base-200/50 mb-1">
                      <span className="text-base font-bold text-base-content">{user.name}</span>
                      <span className="text-xs font-normal text-base-content/60 block mt-0.5 break-all">{user.email}</span>
                    </li>
                    <li>
                      <Link href="/profile" className="py-2 hover:bg-base-200/50">
                        <User className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="py-2 text-error hover:bg-error/10">
                        <LogOut className="w-4 h-4 mr-2" />
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
                  className="text-sm font-medium text-base-content/80 hover:text-base-content transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 border-0 btn-sm h-10 px-6 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-200 text-sm font-semibold"
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