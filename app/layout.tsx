import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ClerkSync from "@/features/auth/ClerkSync";
import { getViewer } from "@/features/auth/server";
import { ViewerProvider, type Viewer } from "@/features/auth/viewer";
import { ClerkProvider, GoogleOneTap, Show } from "@clerk/nextjs";
import { unstable_rethrow } from "next/navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Tackbox · Markdown skills for AI agents",
  description:
    "A public registry for Markdown-based AI agent skills. Find a skill.md that does what you need, fork it, ship it.",
};

/** A Convex outage shouldn't take down pages that don't need a user, so treat it as signed out. */
async function viewerOrNull(): Promise<Viewer | null> {
  try {
    return await getViewer();
  } catch (error) {
    // Next.js signals dynamic rendering with a thrown error; that one must get through
    unstable_rethrow(error);
    console.error("Couldn't read the session:", error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await viewerOrNull();

  return (
    <ClerkProvider>
      <html
        lang="en"
        data-theme="dark"
        className={`${inter.variable} ${interTight.variable} ${plexMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col font-body">
          <Show when="signed-out">
            <GoogleOneTap />
          </Show>
          <ViewerProvider initialViewer={viewer}>
            <ClerkSync />
            <Header />
            {children}
          </ViewerProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
