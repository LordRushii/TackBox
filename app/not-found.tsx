import Link from "next/link";
import type { Metadata } from "next";

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408.01-.01m-3.137 0 .01-.01M6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
            />
          </svg>
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
