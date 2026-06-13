"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const checkUser = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
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

    // Listen to storage changes to keep it in sync
    window.addEventListener("storage", checkUser);
    
    // Also poll slightly or listen to custom custom events if standard storage events don't trigger on same window
    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener("storage", checkUser);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-200/40 bg-base-100/70 backdrop-blur-md">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex-1">
          <Link href="/" className="group flex items-center gap-2 text-xl font-bold transition-all duration-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-content shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <span>S</span>
            </div>
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent font-extrabold tracking-tight transition-opacity group-hover:opacity-90">
              Skillhub
            </span>
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1 gap-2 font-medium items-center">
            <li>
              <Link 
                href="/skills" 
                className="rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                Agent Skills
              </Link>
            </li>
            <li>
              <Link 
                href="/about" 
                className="rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                About
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link 
                    href="/my-skills" 
                    className="rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    My Agent Skills
                  </Link>
                </li>
                <li className="hidden sm:block">
                  <span className="text-xs text-base-content/60 font-semibold cursor-default hover:bg-transparent">
                    {user.name}
                  </span>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-ghost btn-sm rounded-lg hover:bg-error/10 hover:text-error transition-all duration-200"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    href="/login" 
                    className="rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/register" 
                    className="btn btn-primary btn-sm rounded-lg shadow-sm hover:shadow transition-all duration-200"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}