"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, Download, Info } from "lucide-react";

interface SkillInstallProps {
  slug: string;
  skillName?: string;
}

export default function SkillInstall({ slug, skillName }: SkillInstallProps) {
  const [activeTab, setActiveTab] = useState<"cli" | "degit">("cli");
  const [copied, setCopied] = useState(false);

  // Extract owner and repo from public environment variables
  const envOwner = process.env.NEXT_PUBLIC_GITHUB_OWNER || "LordRushii";
  const envRepo = process.env.NEXT_PUBLIC_GITHUB_REPO || "TackBox";

  let owner = envOwner;
  let repo = envRepo;

  if (envRepo.includes("/")) {
    try {
      const cleanRepo = envRepo.replace(/\/$/, "").replace(/\.git$/, "");
      if (cleanRepo.startsWith("http://") || cleanRepo.startsWith("https://")) {
        const url = new URL(cleanRepo);
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1];
        } else if (parts.length === 1) {
          repo = parts[0];
        }
      } else {
        const parts = cleanRepo.split("/");
        owner = parts[0];
        repo = parts[1];
      }
    } catch (e) {
      console.warn("Error parsing NEXT_PUBLIC_GITHUB_REPO URL:", e);
    }
  }

  // Construct commands
  const primaryCommand = `npx skills add ${owner}/${repo}/skills/${slug}`;
  const degitCommand = `npx degit ${owner}/${repo}/skills/${slug} ${slug}`;

  const currentCommand = activeTab === "cli" ? primaryCommand : degitCommand;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy command:", err);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-base-200 bg-base-200/25 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-primary/5 hover:border-primary/20">
      {/* Glow decorative background elements */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-base-200/40">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-base-content/95">
            🚀 Quick Install
          </span>
          {skillName && (
            <span className="badge badge-sm badge-neutral font-semibold text-xs tracking-wide">
              {skillName}
            </span>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex bg-base-300/80 rounded-xl p-1 border border-base-200/40 self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveTab("cli");
              setCopied(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === "cli"
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Tackbox CLI
          </button>
          <button
            onClick={() => {
              setActiveTab("degit");
              setCopied(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === "degit"
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            degit
          </button>
        </div>
      </div>

      {/* Command Display Block */}
      <div className="mt-5">
        <div className="relative flex items-center justify-between gap-3 bg-black/40 rounded-xl p-4 border border-base-300/60 font-mono text-sm group transition-all duration-300 hover:border-primary/20 hover:bg-black/50">
          <div className="flex items-center min-w-0 flex-1">
            <span className="text-primary/70 select-none mr-2 font-bold">$</span>
            <div className="overflow-x-auto whitespace-nowrap scrollbar-none text-neutral-100 flex-1 py-0.5 selection:bg-primary/30 selection:text-white">
              {currentCommand}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 active:scale-95 shrink-0 ${
              copied
                ? "bg-success/10 border-success/30 text-success"
                : "bg-base-100/50 border-base-300 text-base-content/80 hover:bg-primary hover:border-primary hover:text-primary-content shadow-sm"
            }`}
            title="Copy command to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 animate-bounce-short" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Description / Instructions */}
      <div className="mt-4 flex items-start gap-2.5 text-xs text-base-content/60 leading-relaxed bg-base-300/10 rounded-lg p-3 border border-base-200/20">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          {activeTab === "cli" ? (
            <p>
              Installs this skill template directly into your project's local directory using the Tackbox CLI. Run this in the root of your agent workspace.
            </p>
          ) : (
            <p>
              Uses <code className="text-primary font-mono bg-primary/10 px-1 rounded">degit</code> to download the raw skill directory from GitHub without cloning git history. Perfect for custom integration!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
