"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { User, LogOut } from "lucide-react";
import { useSignOut, useViewer } from "@/features/auth/viewer";

// Transparent over the hero, a solid surface once the page scrolls under it
const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};
const useScrolled = () =>
  useSyncExternalStore(subscribeScroll, () => window.scrollY > 8, () => false);

export default function Header() {
  const scrolled = useScrolled();
  const viewer = useViewer();
  const signOut = useSignOut();

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-[background-color,border-color] duration-200 ease-out ${
        scrolled ? "border-line bg-background/85 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="navbar max-w-[1200px] mx-auto px-6 flex justify-between h-16">
        <div className="flex-1 flex items-center">
          <Link
            href="/"
            className="group flex items-center justify-start w-40 h-10 overflow-hidden transition-opacity duration-150 ease-out hover:opacity-80"
          >
            <img
              src="/logo.png"
              alt="Tackbox Logo"
              className="w-full h-full object-contain object-left"
            />
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <ul className="flex items-center gap-8 font-medium text-sm text-subtle">
            <li>
              <Link
                href="/skills"
                className="transition-colors duration-150 ease-out hover:text-foreground"
              >
                Explore
              </Link>
            </li>
            <li>
              <Link
                href="/#categories"
                className="transition-colors duration-150 ease-out hover:text-foreground"
              >
                Categories
              </Link>
            </li>

            <li>
              <Link
                href="/about"
                className="transition-colors duration-150 ease-out hover:text-foreground"
              >
                About
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-4">
            {viewer ? (
              <>
                <Link
                  href="/my-skills"
                  className="hidden sm:flex text-sm font-medium text-subtle transition-colors duration-150 ease-out hover:text-foreground"
                >
                  My skills
                </Link>
                <div className="dropdown dropdown-end p-0">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar hover:bg-transparent overflow-hidden border border-line w-9 h-9 flex items-center justify-center bg-card"
                  >
                    {viewer.image ? (
                      <img
                        src={viewer.image}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-medium text-sm text-subtle">
                        {viewer.name ? viewer.name.charAt(0).toUpperCase() : "U"}
                      </span>
                    )}
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] bg-card rounded-xl w-56 border border-line"
                  >
                    <li className="px-3 py-2 border-b border-line mb-1 pointer-events-none">
                      <span className="text-sm font-medium text-foreground block">
                        {viewer.name}
                      </span>
                      <span className="text-xs font-normal text-muted block mt-0.5 truncate">
                        {viewer.email}
                      </span>
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        className="px-3 py-2 rounded-lg text-subtle transition-colors duration-150 ease-out hover:bg-raised hover:text-foreground"
                      >
                        <User className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Edit profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={signOut}
                        className="px-3 py-2 rounded-lg text-negative transition-colors duration-150 ease-out hover:bg-negative/10"
                      >
                        <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Log out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-subtle transition-colors duration-150 ease-out hover:text-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="h-9 px-4 rounded-[10px] flex items-center justify-center text-sm font-medium text-foreground bg-raised border border-line transition-colors duration-150 ease-out hover:border-line-strong hover:bg-raised-strong"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
