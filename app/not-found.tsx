import Link from "next/link";
import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page or skill you are looking for cannot be found in our inventory.",
};

export default function NotFound() {
  return (
    <main className="flex-1 w-full max-w-xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
      {/* Visual glowing 404 badge */}
      <div className="relative group mb-8">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-indigo-500 to-secondary opacity-75 blur-lg group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-zinc-950 border border-base-200/40 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          404
        </div>
      </div>

      {/* Message Info */}
      <h1 className="text-3xl font-extrabold tracking-tight text-base-content mb-3">
        Page Not Found
      </h1>
      <p className="text-base-content/60 max-w-sm mb-10 text-sm sm:text-base leading-relaxed">
        We couldn&apos;t find the capability, skill, or resource you were looking for. It might have been moved, deleted, or never existed in the catalog.
      </p>

      {/* Navigation Options */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link
          href="/skills"
          className="btn btn-primary gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 px-6"
        >
          <ClipboardList className="w-4 h-4" />
          Skills Inventory
        </Link>
        <Link
          href="/"
          className="btn btn-outline border-base-200/60 hover:bg-base-200/40 hover:border-transparent transition-all duration-200 px-6"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
