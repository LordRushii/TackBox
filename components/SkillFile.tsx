"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, FileText } from "lucide-react";

/**
 * A skill file shown the way the hero window on the home page shows it:
 * line numbers, frontmatter keys in amber, headings bright and body text one step down.
 * This is the one rich moment on the skill page; everything around it stays neutral.
 */

type Tone = "key" | "value" | "mark" | "marker" | "heading" | "body" | "code";

const TONE_CLASS: Record<Tone, string> = {
  key: "text-amber",
  value: "text-foreground",
  mark: "text-muted",
  marker: "text-amber",
  heading: "text-foreground",
  body: "text-subtle",
  code: "text-foreground",
};

type Segment = [string, Tone];

function highlight(content: string): Segment[][] {
  // Files saved on Windows end lines with \r\n; split on both so the patterns below match
  const lines = content.split(/\r?\n/);
  const fmEnd = lines[0]?.trim() === "---" ? lines.findIndex((l, i) => i > 0 && l.trim() === "---") : -1;
  let inFence = false;

  return lines.map((line, i): Segment[] => {
    if (fmEnd > 0 && i <= fmEnd) {
      if (line.trim() === "---") return [[line, "mark"]];
      const kv = /^(\s*[\w.-]+:)(.*)$/.exec(line);
      return kv ? [[kv[1], "key"], [kv[2], "value"]] : [[line, "value"]];
    }
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      return [[line, "mark"]];
    }
    if (inFence) return [[line, "code"]];

    const heading = /^(#{1,6}\s)(.*)$/.exec(line);
    if (heading) return [[heading[1], "marker"], [heading[2], "heading"]];
    const item = /^(\s*(?:[-*+]|\d+\.|>)\s)(.*)$/.exec(line);
    if (item) return [[item[1], "mark"], [item[2], "body"]];
    return [[line, "body"]];
  });
}

/** The numbered lines alone, for use inside another surface. Long lines wrap so prose stays readable. */
export function FileLines({ content }: { content: string }) {
  const lines = highlight(content || "");
  return (
    <div className="py-4 font-mono text-[13px] leading-[22px]">
      {lines.map((segments, i) => (
        <div key={i} className="flex">
          <span className="w-12 shrink-0 select-none pr-4 text-right tabular-nums text-muted/60">{i + 1}</span>
          <span className="min-w-0 flex-1 whitespace-pre-wrap break-words pr-6">
            {segments.map(([text, tone], j) => (
              <span key={j} className={TONE_CLASS[tone]}>
                {text}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Icon button that copies text and shows a check for two seconds. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors duration-150 ease-out hover:bg-raised hover:text-foreground"
    >
      {copied ? <Check className="size-4 text-positive" strokeWidth={1.5} /> : <Copy className="size-4" strokeWidth={1.5} />}
    </button>
  );
}

export default function SkillFile({
  path,
  content,
  actions,
}: {
  path: string;
  content: string;
  actions?: ReactNode;
}) {
  const slash = path.lastIndexOf("/");
  const dir = path.slice(0, slash + 1);
  const file = path.slice(slash + 1);
  const lineCount = (content || "").split(/\r?\n/).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-deep">
      <div className="flex h-11 items-center justify-between gap-4 border-b border-line pl-4 pr-2 font-mono text-xs">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-4 shrink-0 text-muted" strokeWidth={1.5} />
          <span className="truncate text-muted">
            {dir}
            <span className="text-foreground">{file}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="pr-2 tabular-nums text-muted">{lineCount} lines</span>
          {actions}
        </div>
      </div>
      <FileLines content={content} />
    </div>
  );
}
