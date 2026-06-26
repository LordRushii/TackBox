import Link from "next/link";
import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page or skill you are looking for cannot be found in our inventory.",
};

export default function NotFound() {
  return (
    <main className="flex-1 w-full max-w-xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center bg-background">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

      <div className="z-10 flex flex-col items-center">
        {/* Visual flat 404 badge */}
        <div className="mb-10">
          <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-white/[0.02] border border-white/10 text-6xl font-heading font-semibold text-foreground shadow-sm">
            404
          </div>
        </div>

        {/* Message Info */}
        <h1 className="text-3xl font-heading font-semibold tracking-tight text-foreground mb-4">
          Page Not Found
        </h1>
        <p className="text-foreground/60 max-w-sm mb-12 text-sm sm:text-base leading-relaxed">
          We couldn&apos;t find the capability, skill, or resource you were looking for. It might have been moved, deleted, or never existed in the catalog.
        </p>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/skills"
            className="h-11 px-8 flex items-center justify-center rounded-md bg-white text-[#0A0A0A] hover:bg-white/90 text-sm font-medium transition-all gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Skills Inventory
          </Link>
          <Link
            href="/"
            className="h-11 px-8 flex items-center justify-center rounded-md bg-white/[0.04] border border-white/10 hover:border-white/20 text-sm font-medium text-foreground transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
