"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Package,
  Users,
  CloudDownload,
  FileCode,
  Download,
  Compass,
  Upload,
  Code,
  Settings,
  Search,
  Megaphone,
  Pencil,
  Zap,
  Bot,
} from "lucide-react";

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
    <div className="flex flex-col items-center justify-start min-h-screen relative overflow-hidden bg-base-100 pb-20">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700" />

      <main className="flex flex-col items-center justify-start w-full max-w-6xl px-6 z-10 pt-20 space-y-16">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 w-full">
          {/* Left Side text */}
          <div className="flex-1 flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-200/50 border border-base-200 backdrop-blur-md shadow-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider">
                GitHub for AI Agent Skills
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-base-content leading-tight">
              Stop rewriting the
              <br />
              <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
                same agent prompt.
              </span>
            </h1>

            <p className="max-w-xl text-lg sm:text-xl text-base-content/60 leading-relaxed font-medium">
              Find a skill.md that does what you need. Fork it, ship it, move on. Tackbox is a public registry for Markdown-based AI agent skills.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
              <Link
                href="/skills"
                className="btn btn-primary bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 border-0 rounded-xl px-6 h-12 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-base flex items-center gap-2"
              >
                Browse Skills <ArrowRight className="w-4 h-4" />
              </Link>

              {isLoggedIn ? (
                <Link
                  href="/my-skills"
                  className="btn btn-outline border-base-200/60 hover:bg-base-200/40 rounded-xl px-6 h-12 font-bold shadow-sm hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-base bg-base-200/20 backdrop-blur-md"
                >
                  Publish a Skill
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-outline border-base-200/60 hover:bg-base-200/40 rounded-xl px-6 h-12 font-bold shadow-sm hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-base bg-base-200/20 backdrop-blur-md"
                >
                  Publish a Skill
                </Link>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-8 pt-8 opacity-90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xl text-base-content">
                    2,400+
                  </div>
                  <div className="text-xs text-base-content/60">
                    Skills published
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xl text-base-content">8,900+</div>
                  <div className="text-xs text-base-content/60">Developers</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <CloudDownload className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xl text-base-content">41,000+</div>
                  <div className="text-xs text-base-content/60">Skill files downloaded</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Mock Window */}
          <div className="flex-1 w-full max-w-md relative mt-10 md:mt-0">
            {/* Glow behind window */}
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative rounded-2xl border border-base-200/30 bg-base-200/30 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
              {/* Window Header */}
              <div className="h-12 px-4 border-b border-base-200/40 flex items-center justify-between bg-base-200/40">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-base-100/50 text-xs text-base-content/70 font-mono">
                  <FileCode className="w-3 h-3" /> skill.md
                </div>
              </div>
              {/* Window Content */}
              <div className="p-6 text-left space-y-6">
                <h3 className="text-xl font-bold text-base-content">
                  Web Search Agent
                </h3>

                <div>
                  <div className="text-sm font-semibold text-primary mb-1">
                    Description
                  </div>
                  <p className="text-sm text-base-content/80">
                    Perform accurate web searches and summarize results for any
                    query.
                  </p>
                </div>

                <div>
                  <div className="text-sm font-semibold text-primary mb-1">
                    Instructions
                  </div>
                  <ul className="text-sm text-base-content/80 space-y-1">
                    <li>- Understand the user query</li>
                    <li>- Search the web for relevant information</li>
                    <li>- Summarize the key findings</li>
                    <li>- Provide sources and links</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-sm font-semibold text-primary mb-2">
                      Category
                    </div>
                    <span className="px-3 py-1 rounded-full bg-base-200/50 text-xs font-medium text-base-content/80">
                      Research
                    </span>
                  </div>
                  <button className="btn btn-outline btn-sm rounded-lg border-base-200 hover:bg-base-200/50 text-xs mt-6 flex items-center gap-2">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full opacity-90 mt-12">
          <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content mb-2">
                Discover
              </h3>
              <p className="text-sm text-base-content/60 leading-relaxed">
                Search skills by category, model, or use case. Every skill includes a description, sample output, and the raw .md file. No signup required to browse.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content mb-2">
                Share
              </h3>
              <p className="text-sm text-base-content/60 leading-relaxed">
                Publish a skill.md file you&apos;ve already built. Add a README, tag your use case, and it&apos;s live. Other developers can find it, fork it, or build on top of it.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content mb-2">
                Reuse
              </h3>
              <p className="text-sm text-base-content/60 leading-relaxed">
                Download a skill file directly into your project. Drop it into your agent&apos;s context. No adapters, no wrappers — just a Markdown file that works.
              </p>
            </div>
          </div>
        </div>

        {/* Browse by Category */}
        <div className="w-full pt-16 flex flex-col items-center space-y-6">
          <div className="text-xs font-bold text-base-content/50 tracking-widest uppercase px-4 py-1 rounded-full bg-base-200/30">
            Popular Categories
          </div>
          <h2 className="text-3xl font-bold text-base-content">
            Browse by what your agent actually does.
          </h2>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {[
              { icon: Code, label: "Coding" },
              { icon: Settings, label: "Automation" },
              { icon: Search, label: "Research" },
              { icon: Megaphone, label: "Marketing" },
              { icon: Pencil, label: "Writing" },
              { icon: Zap, label: "Productivity" },
              { icon: Bot, label: "AI Agents" },
            ].map((cat, i) => (
              <button
                key={i}
                className="btn btn-sm h-10 px-4 rounded-xl border border-base-200/40 bg-base-200/20 hover:bg-base-200/50 flex items-center gap-2 font-medium text-sm text-base-content/80 hover:text-base-content transition-colors"
              >
                <cat.icon className="w-4 h-4 text-base-content/60" />{" "}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
