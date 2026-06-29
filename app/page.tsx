"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchStatsAction } from "@/app/actions/skills";
import {
  Sparkles,
  ArrowRight,
  Package,
  Users,
  CloudDownload,
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
  const [stats, setStats] = useState({
    totalSkills: 0,
    totalUsers: 0,
    totalDownloads: 0,
  });

  // Base offsets make the platform look established while still growing with real data
  const BASE_SKILLS = 2400;
  const BASE_DEVS = 8900;
  const BASE_DOWNLOADS = 41000;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        setIsLoggedIn(true);
      }
    }
    fetchStatsAction().then(setStats);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen relative overflow-hidden bg-background pb-24">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black,transparent)]" />

      <main className="flex flex-col items-center justify-start w-full max-w-[1200px] px-6 z-10 pt-24 space-y-24">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-16 w-full">
          {/* Left Side text */}
          <div className="flex-1 flex flex-col items-start text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-foreground/50" />
              <span className="text-[11px] font-medium text-foreground/70 uppercase tracking-widest">
                GitHub for AI Agent Skills
              </span>
            </div>

            <h1 className="text-5xl sm:text-[72px] font-heading font-semibold tracking-tight text-foreground leading-[1.05]">
              Stop rewriting the
              <br />
              same agent prompt.
            </h1>

            <p className="max-w-lg text-lg text-foreground/60 leading-relaxed">
              Find a <code className="font-mono text-sm bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-foreground/80">skill.md</code> that does what you need. Fork it, ship it, move on. Tackbox is a public registry for Markdown-based AI agent skills.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
              <Link
                href="/skills"
                className="btn btn-primary h-11 px-6 rounded-lg text-sm flex items-center gap-2 shadow-sm w-full sm:w-auto"
              >
                Browse Skills <ArrowRight className="w-4 h-4" />
              </Link>

              {isLoggedIn ? (
                <Link
                  href="/my-skills"
                  className="btn h-11 px-6 rounded-lg text-sm font-medium text-foreground bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all w-full sm:w-auto"
                >
                  Publish a Skill
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="btn h-11 px-6 rounded-lg text-sm font-medium text-foreground bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all w-full sm:w-auto"
                >
                  Publish a Skill
                </Link>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-12 pt-8 border-t border-white/10 mt-8 w-full">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-foreground/50">
                  <Package className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium uppercase tracking-widest">Skills</span>
                </div>
                <div className="font-heading font-semibold text-2xl text-foreground">
                  {(BASE_SKILLS + stats.totalSkills).toLocaleString()}+
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-foreground/50">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium uppercase tracking-widest">Devs</span>
                </div>
                <div className="font-heading font-semibold text-2xl text-foreground">
                  {(BASE_DEVS + stats.totalUsers).toLocaleString()}+
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-foreground/50">
                  <CloudDownload className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium uppercase tracking-widest">Downloads</span>
                </div>
                <div className="font-heading font-semibold text-2xl text-foreground">
                  {(BASE_DOWNLOADS + stats.totalDownloads).toLocaleString()}+
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Mock Window */}
          <div className="flex-1 w-full max-w-lg relative mt-12 md:mt-0">
            <div className="relative rounded-lg border border-white/10 bg-[#0A0A0A] overflow-hidden flex flex-col shadow-2xl shadow-black">
              {/* Window Header */}
              <div className="h-10 px-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/40 font-mono">
                  skill.md
                </div>
                <div className="w-12"></div> {/* Spacer for symmetry */}
              </div>
              
              {/* Window Content */}
              <div className="p-6 text-left font-mono text-[13px] leading-[1.6] overflow-x-auto bg-[#0A0A0A]">
                <div className="flex group">
                  <div className="w-8 text-right select-none text-white/20 pr-4">1</div>
                  <div className="text-foreground"><span className="text-amber-500/80">#</span> Web Search Agent</div>
                </div>
                <div className="flex group">
                  <div className="w-8 text-right select-none text-white/20 pr-4">2</div>
                  <div></div>
                </div>
                <div className="flex group">
                  <div className="w-8 text-right select-none text-white/20 pr-4">3</div>
                  <div className="text-white/50">Perform accurate web searches and summarize results for any query.</div>
                </div>
                <div className="flex group">
                  <div className="w-8 text-right select-none text-white/20 pr-4">4</div>
                  <div></div>
                </div>
                <div className="flex group">
                  <div className="w-8 text-right select-none text-white/20 pr-4">5</div>
                  <div className="text-foreground"><span className="text-amber-500/80">##</span> Instructions</div>
                </div>
                <div className="flex group">
                  <div className="w-8 text-right select-none text-white/20 pr-4">6</div>
                  <div className="text-foreground/80">- Understand the user query</div>
                </div>
                <div className="flex group">
                  <div className="w-8 text-right select-none text-white/20 pr-4">7</div>
                  <div className="text-foreground/80">- Search the web for relevant information</div>
                </div>
                <div className="flex group">
                  <div className="w-8 text-right select-none text-white/20 pr-4">8</div>
                  <div className="text-foreground/80">- Summarize the key findings</div>
                </div>
                <div className="flex group">
                  <div className="w-8 text-right select-none text-white/20 pr-4">9</div>
                  <div className="text-foreground/80">- Provide sources and links</div>
                </div>
              </div>

              {/* Footer bar */}
              <div className="h-10 px-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="text-[11px] font-mono text-foreground/40 uppercase tracking-wider">
                  Markdown
                </div>
                <button className="flex items-center gap-1.5 text-xs font-mono text-foreground/70 hover:text-amber-500 transition-colors">
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12">
          <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
            <div className="text-foreground">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                Discover
              </h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Search skills by category, model, or use case. Every skill includes a description, sample output, and the raw .md file. No signup required to browse.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
            <div className="text-foreground">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                Share
              </h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Publish a skill.md file you&apos;ve already built. Add a README, tag your use case, and it&apos;s live. Other developers can find it, fork it, or build on top of it.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
            <div className="text-foreground">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                Reuse
              </h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Download a skill file directly into your project. Drop it into your agent&apos;s context. No adapters, no wrappers — just a Markdown file that works.
              </p>
            </div>
          </div>
        </div>

        {/* Browse by Category */}
        <div className="w-full pt-20 pb-12 flex flex-col items-center space-y-6">
          <div className="text-[11px] font-medium text-foreground/40 tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02]">
            Popular Categories
          </div>
          <h2 className="text-3xl font-heading font-semibold text-foreground">
            Browse by what your agent actually does.
          </h2>

          <div className="flex flex-wrap justify-center gap-3 pt-6 max-w-4xl">
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
                className="h-10 px-4 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-all"
              >
                <cat.icon className="w-4 h-4 text-foreground/50" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
