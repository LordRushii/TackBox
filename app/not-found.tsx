import Link from "next/link";
import type { Metadata } from "next";
import PixelC from "@/components/pixel/PixelC";

export const metadata: Metadata = {
  title: "Page not found · Tackbox",
  description: "There's no page at this address.",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <PixelC tile={10} gap={3} />
      <p className="mt-10 font-mono text-xs text-muted">404</p>
      <h1 className="mt-3 font-heading text-[32px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">
        Nothing at this address
      </h1>
      <p className="mt-3 max-w-sm text-[15px] leading-6 text-subtle">
        The link may be wrong, or the skill was deleted or made private.
      </p>
      <div className="mt-8 flex gap-2">
        <Link href="/skills" className="btn btn-primary h-10 px-4 text-sm">
          Browse skills
        </Link>
        <Link href="/" className="btn btn-secondary h-10 px-4 text-sm">
          Home
        </Link>
      </div>
    </main>
  );
}
