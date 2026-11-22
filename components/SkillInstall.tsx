"use client";

import { useState } from "react";
import { getSkillsRepo } from "@/lib/github";
import { CopyButton } from "./SkillFile";

interface SkillInstallProps {
  slug: string;
  /** Kept for API compatibility; the page already shows the name */
  skillName?: string;
}

const TABS = [
  { id: "cli", label: "npx skills", caption: "Run it from the root of your agent workspace." },
  { id: "degit", label: "degit", caption: "Copies the skill folder from GitHub without the git history." },
] as const;

export default function SkillInstall({ slug }: SkillInstallProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("cli");
  const { owner, repo } = getSkillsRepo();

  const commands = {
    cli: `npx skills add ${owner}/${repo}/skills/${slug}`,
    degit: `npx degit ${owner}/${repo}/skills/${slug} ${slug}`,
  };
  const command = commands[activeTab];
  const caption = TABS.find((t) => t.id === activeTab)!.caption;

  return (
    <section aria-labelledby="install-title" className="rounded-2xl border border-line bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="install-title" className="font-heading text-[15px] font-medium text-foreground">
          Install
        </h2>
        <div role="tablist" aria-label="Install method" className="flex rounded-lg border border-line bg-deep p-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={`h-7 rounded-md px-3 font-mono text-xs transition-colors duration-150 ease-out ${
                activeTab === t.id ? "bg-raised text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-line bg-deep py-2 pl-4 pr-2">
        <p className="min-w-0 flex-1 break-words py-1.5 font-mono text-xs leading-5 text-subtle">
          <span className="select-none text-amber">$ </span>
          {/* Long paths wrap after a slash, never inside a name */}
          {command.split("/").map((part, i, parts) => (
            <span key={i}>
              {i > 0 && (
                <>
                  /<wbr />
                </>
              )}
              {i < parts.length - 1 ? (
                part
              ) : (
                // The last word keeps the block cursor, the amber tile from the logo, on its line
                <span className="whitespace-nowrap">
                  {part}
                  <span aria-hidden className="ml-1 inline-block h-3.5 w-[7px] translate-y-0.5 bg-amber" />
                </span>
              )}
            </span>
          ))}
        </p>
        <CopyButton text={command} label="Copy install command" />
      </div>

      <p className="mt-3 text-[13px] leading-5 text-muted">{caption}</p>
    </section>
  );
}
