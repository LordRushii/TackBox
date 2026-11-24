"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LogOut, Menu, User, X } from "lucide-react";
import { useSignOut, useViewer } from "@/features/auth/viewer";

const NAV = [
  { href: "/skills", label: "Explore" },
  { href: "/#categories", label: "Categories" },
  { href: "/about", label: "About" },
];

// Full width over the top of the page. Once the page scrolls, the bar floats: it narrows into a
// pill, drops a little and gets a surface. Adapted from Aceternity UI's resizable navbar.
const FLOAT_AFTER_PX = 24;
const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};
const useFloating = () =>
  useSyncExternalStore(subscribeScroll, () => window.scrollY > FLOAT_AFTER_PX, () => false);

const isActive = (pathname: string, href: string) =>
  href === "/skills" ? pathname === "/skills" || pathname.startsWith("/skills/") : pathname === href;

function Avatar({ name, image, className }: { name: string; image?: string; className: string }) {
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-card ${className}`}>
      {image ? (
        <img src={image} alt="" className="size-full object-cover" />
      ) : (
        <span className="text-sm font-medium text-subtle">{name ? name.charAt(0).toUpperCase() : "U"}</span>
      )}
    </span>
  );
}

export default function Header() {
  const floating = useFloating();
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const viewer = useViewer();
  const signOut = useSignOut();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 34 };
  const closeMenu = () => setMenuOpen(false);

  return (
    // The 64px box stays put, so pages that tuck their hero under it keep their layout
    <motion.header
      initial={false}
      animate={{ paddingLeft: floating ? 12 : 0, paddingRight: floating ? 12 : 0 }}
      transition={spring}
      className="sticky top-0 z-50 h-16 w-full"
    >
      <motion.nav
        aria-label="Main"
        initial={false}
        animate={{ maxWidth: floating ? 880 : 1200, height: floating ? 52 : 64, y: floating ? 10 : 0 }}
        transition={spring}
        className={`relative mx-auto flex items-center justify-between rounded-full border transition-[background-color,border-color,box-shadow,padding] duration-200 ease-out ${
          floating
            ? "border-line bg-background/80 pl-5 pr-2 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md"
            : "border-transparent bg-transparent px-6"
        }`}
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="flex h-10 w-36 shrink-0 items-center overflow-hidden transition-opacity duration-150 ease-out hover:opacity-80"
        >
          <img src="/logo.png" alt="Tackbox" className="h-full w-full object-contain object-left" />
        </Link>

        {/* Desktop links, with a pill that follows the pointer */}
        <ul
          onMouseLeave={() => setHovered(null)}
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 text-sm font-medium md:flex"
        >
          {NAV.map((item, i) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onMouseEnter={() => setHovered(i)}
                  aria-current={active ? "page" : undefined}
                  className={`relative block rounded-full px-4 py-2 transition-colors duration-150 ease-out ${
                    active ? "text-foreground" : "text-subtle hover:text-foreground"
                  }`}
                >
                  {hovered === i && (
                    <motion.span
                      layoutId="nav-hover"
                      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 36 }}
                      className="absolute inset-0 rounded-full bg-raised"
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop account */}
        <div className="hidden items-center gap-3 md:flex">
          {viewer ? (
            <>
              <Link
                href="/my-skills"
                className="text-sm font-medium text-subtle transition-colors duration-150 ease-out hover:text-foreground"
              >
                My skills
              </Link>
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" aria-label="Account menu" className="cursor-pointer rounded-full">
                  <Avatar name={viewer.name} image={viewer.image} className="size-9" />
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content z-[1] mt-3 w-56 rounded-xl border border-line bg-card p-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]"
                >
                  <li className="pointer-events-none mb-1 border-b border-line px-3 py-2">
                    <span className="block text-sm font-medium text-foreground">{viewer.name}</span>
                    <span className="mt-0.5 block truncate text-xs font-normal text-muted">{viewer.email}</span>
                  </li>
                  <li>
                    <Link
                      href="/profile"
                      className="rounded-lg px-3 py-2 text-subtle transition-colors duration-150 ease-out hover:bg-raised hover:text-foreground"
                    >
                      <User className="mr-2 size-4" strokeWidth={1.5} />
                      Edit profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={signOut}
                      className="rounded-lg px-3 py-2 text-negative transition-colors duration-150 ease-out hover:bg-negative/10"
                    >
                      <LogOut className="mr-2 size-4" strokeWidth={1.5} />
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
                className="flex h-9 items-center justify-center rounded-full border border-line bg-raised px-4 text-sm font-medium text-foreground transition-colors duration-150 ease-out hover:border-line-strong hover:bg-raised-strong"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Phones: everything moves into one menu */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-full text-subtle transition-colors duration-150 ease-out hover:bg-raised hover:text-foreground md:hidden"
        >
          {menuOpen ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute top-full mt-2 flex flex-col gap-1 rounded-2xl border border-line bg-card p-2 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] md:hidden ${
                floating ? "inset-x-0" : "inset-x-3"
              }`}
            >
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="rounded-xl px-4 py-3 text-[15px] text-subtle transition-colors duration-150 ease-out hover:bg-raised hover:text-foreground aria-[current=page]:text-foreground"
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-1 h-px bg-line" />

              {viewer ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <Avatar name={viewer.name} image={viewer.image} className="size-8" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{viewer.name}</p>
                      <p className="truncate text-xs text-muted">{viewer.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/my-skills"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-[15px] text-subtle transition-colors duration-150 ease-out hover:bg-raised hover:text-foreground"
                  >
                    My skills
                  </Link>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-[15px] text-subtle transition-colors duration-150 ease-out hover:bg-raised hover:text-foreground"
                  >
                    Edit profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      signOut();
                    }}
                    className="rounded-xl px-4 py-3 text-left text-[15px] text-negative transition-colors duration-150 ease-out hover:bg-negative/10"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2">
                  <Link href="/login" onClick={closeMenu} className="btn btn-secondary h-10 text-sm">
                    Log in
                  </Link>
                  <Link href="/register" onClick={closeMenu} className="btn btn-primary h-10 text-sm">
                    Sign up
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.header>
  );
}
