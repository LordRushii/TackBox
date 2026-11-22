"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, Copy, FileText, GitBranch, ShieldCheck, Tag } from "lucide-react";

// An excerpt of skills/code-reviewer/SKILL.md, the first skill published to the registry
type Tone = "key" | "mark" | "value" | "body" | "heading";
const SKILL_LINES: [string, Tone][][] = [
  [["---", "mark"]],
  [["name:", "key"], [" code-reviewer", "value"]],
  [["description:", "key"], [" Reviews code for bugs, security, auth, and best practices", "value"]],
  [["mode:", "key"], [" subagent", "value"]],
  [["temperature:", "key"], [" 0.1", "value"]],
  [["tools:", "key"]],
  [["  write:", "key"], [" false", "value"]],
  [["  edit:", "key"], [" false", "value"]],
  [["---", "mark"]],
  [],
  [["You are a code reviewer. Give actionable, prioritized feedback.", "body"]],
  [],
  [["## ", "key"], ["Review scope", "heading"]],
  [["1. Redundancies and refactor opportunities", "body"]],
  [["2. Reuse existing logic before writing new code", "body"]],
  [["3. Test coverage where it makes sense", "body"]],
];

const TONE_CLASS: Record<Tone, string> = {
  key: "text-amber",
  mark: "text-muted",
  value: "text-foreground",
  body: "text-subtle",
  heading: "text-foreground",
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function SkillWindow({ installCommand }: { installCommand: string }) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy command:", err);
    }
  };

  return (
    <div className="relative">
      {/* Annotation chips, the metadata Tackbox reads from the file */}
      <Chip className="-left-16 top-24" delay={1.1} icon={Tag} label="category" value="Fullstack" />
      <Chip className="-right-14 top-10" delay={1.3} icon={GitBranch} label="pushed to" value="main" />
      <Chip className="-right-20 bottom-28" delay={1.5} icon={ShieldCheck} label="tools" value="read-only" />

      <div className="relative overflow-hidden rounded-2xl border border-line-strong bg-deep shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)]">
        <div className="flex h-11 items-center justify-between gap-4 border-b border-line px-4 font-mono text-xs">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-[2px] bg-raised-strong" />
              <span className="size-2.5 rounded-[2px] bg-raised-strong" />
              <span className="size-2.5 rounded-[2px] bg-raised-strong" />
            </span>
            <FileText className="size-4 shrink-0 text-muted" strokeWidth={1.5} />
            <span className="truncate text-muted">
              skills/code-reviewer/<span className="text-foreground">SKILL.md</span>
            </span>
          </div>
          <span className="shrink-0 text-muted">Markdown</span>
        </div>

        <div className="overflow-hidden py-5 font-mono text-[12.5px] leading-5 sm:text-[13px]">
          {SKILL_LINES.map((segments, i) => (
            <motion.div
              key={i}
              className="flex"
              initial={reduce ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.045, ease }}
            >
              <span className="w-12 shrink-0 select-none pr-4 text-right tabular-nums text-muted/60">
                {i + 1}
              </span>
              <span className="whitespace-pre pr-6">
                {segments.map(([text, tone], j) => (
                  <span key={j} className={TONE_CLASS[tone]}>
                    {text}
                  </span>
                ))}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="flex h-12 items-center gap-3 border-t border-line bg-card pl-4 pr-2 font-mono text-xs">
          <span className="select-none text-amber">$</span>
          <span className="flex min-w-0 flex-1 items-center gap-1 text-subtle">
            <span className="truncate">{installCommand}</span>
            {/* Block cursor, the amber tile from the logo */}
            <span aria-hidden className="cursor-blink inline-block h-3.5 w-[7px] shrink-0 bg-amber" />
          </span>
          <button
            type="button"
            onClick={copyInstall}
            aria-label={copied ? "Copied" : "Copy install command"}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors duration-150 ease-out hover:bg-raised hover:text-foreground"
          >
            {copied ? (
              <Check className="size-4 text-amber" strokeWidth={1.5} />
            ) : (
              <Copy className="size-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({
  className,
  delay,
  icon: Icon,
  label,
  value,
}: {
  className: string;
  delay: number;
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={`absolute z-10 hidden items-center gap-2 rounded-lg border border-line-strong bg-card px-3 py-2 text-xs shadow-float lg:flex ${className}`}
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease }}
    >
      <Icon className="size-3.5 text-muted" strokeWidth={1.5} />
      <span className="text-muted">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </motion.div>
  );
}
