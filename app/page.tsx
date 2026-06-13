"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Zap, BookOpen, ShieldCheck } from "lucide-react";

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
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base-content">Fast Execution</h3>
            <p className="text-sm text-base-content/60">Trigger agent scripts instantly with pre-configured parameters.</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base-content">Reusable Knowledge</h3>
            <p className="text-sm text-base-content/60">Build a shared repository of capabilities across teams.</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base-content">Secure Access</h3>
            <p className="text-sm text-base-content/60">Control visibility with granular private and public scopes.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
