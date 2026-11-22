import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ClerkSyncProvider from "@/components/ClerkSyncProvider";
import { ClerkProvider, GoogleOneTap, Show } from '@clerk/nextjs'


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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <ClerkSyncProvider>
            <Header />
            {children}
          </ClerkSyncProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
