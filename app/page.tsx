"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-base-100">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700" />
      
      <main className="flex flex-col items-center justify-center w-full max-w-4xl px-6 text-center z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200/50 border border-base-200 backdrop-blur-md mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider">SkillHub Platform v2.0</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-base-content leading-tight">
          Supercharge your <br />
          <span className="bg-gradient-to-r from-primary via-indigo-500 to-secondary bg-clip-text text-transparent drop-shadow-sm">
            AI Agent Skills
          </span>
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl text-base-content/60 leading-relaxed font-medium">
          Discover, deploy, and manage pre-configured capability scripts for autonomous AI agents. Build a reusable knowledge base for your workflows.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 w-full sm:w-auto">
          <Link
            href="/skills"
            className="btn btn-primary bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 border-0 rounded-2xl px-8 h-14 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-lg"
          >
            Explore Skills
          </Link>

          {isLoggedIn ? (
            <Link
              href="/my-skills"
              className="btn btn-outline border-base-200/60 hover:bg-base-200/40 rounded-2xl px-8 h-14 font-bold shadow-sm hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-lg bg-base-200/20 backdrop-blur-md"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn btn-outline border-base-200/60 hover:bg-base-200/40 rounded-2xl px-8 h-14 font-bold shadow-sm hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-lg bg-base-200/20 backdrop-blur-md"
            >
              Sign In
            </Link>
          )}
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 w-full max-w-4xl opacity-80">
          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 className="font-bold text-base-content">Fast Execution</h3>
            <p className="text-sm text-base-content/60">Trigger agent scripts instantly with pre-configured parameters.</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </div>
            <h3 className="font-bold text-base-content">Reusable Knowledge</h3>
            <p className="text-sm text-base-content/60">Build a shared repository of capabilities across teams.</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="font-bold text-base-content">Secure Access</h3>
            <p className="text-sm text-base-content/60">Control visibility with granular private and public scopes.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
