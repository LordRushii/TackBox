"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; avatarUrl?: string } | null>(null);

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
                <li className="ml-2">
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
                        <Link href="/profile" className="py-2 hover:bg-primary/10 hover:text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                          Edit Profile
                        </Link>
                      </li>
                      <li>
                        <button onClick={handleLogout} className="py-2 text-error hover:bg-error/10">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                          </svg>
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
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