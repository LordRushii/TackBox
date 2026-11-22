"use client";

import { X } from "lucide-react";
import { parseMarkdown } from "@/lib/markdown";

type Tab = "write" | "preview";

type SkillEditorProps = {
  id: string;
  label: string;
  content: string;
  onContentChange: (value: string) => void;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  onRemove?: () => void;
  disabled?: boolean;
  required?: boolean;
  /** On wide screens show the Markdown and the preview side by side */
  split?: boolean;
};

/**
 * Markdown editor with line numbers and a preview. Lines don't wrap, so the numbers stay
 * next to the line they count. The current tab is marked with the amber cursor tile.
 */
export default function SkillEditor({
  id,
  label,
  content,
  onContentChange,
  tab,
  onTabChange,
  onRemove,
  disabled,
  required,
  split = false,
}: SkillEditorProps) {
  const lineCount = Math.max(1, content.split("\n").length);
  const lineMeta = `${lineCount} ${lineCount === 1 ? "line" : "lines"}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-6 items-center justify-between">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${label}`}
            title={`Remove ${label}`}
            className="grid size-6 place-items-center rounded-md text-muted transition-colors duration-150 ease-out hover:bg-negative/10 hover:text-negative"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-deep transition-[border-color,box-shadow] duration-150 ease-out has-[textarea:focus]:border-amber has-[textarea:focus]:shadow-[0_0_0_1px_var(--amber)]">
        {/* Toolbar: tabs on narrow screens, column labels when split on wide ones */}
        <div className={`flex h-11 items-center justify-between border-b border-line bg-card px-2 ${split ? "lg:hidden" : ""}`}>
          <div role="tablist" aria-label={`${label} view`} className="flex items-center gap-1">
            {(["write", "preview"] as const).map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onTabChange(t)}
                  className={`flex h-8 items-center gap-2 rounded-lg px-3 text-[13px] transition-colors duration-150 ease-out ${
                    active ? "bg-raised text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  <span aria-hidden className={`size-1.5 ${active ? "bg-amber" : "bg-transparent"}`} />
                  {t === "write" ? "Write" : "Preview"}
                </button>
              );
            })}
          </div>
          <span className="pr-2 font-mono text-xs tabular-nums text-muted">{lineMeta}</span>
        </div>
        {split && (
          <div className="hidden h-11 grid-cols-2 border-b border-line bg-card text-[13px] lg:grid">
            <div className="flex items-center justify-between border-r border-line px-4">
              <span className="text-foreground">Markdown</span>
              <span className="font-mono text-xs tabular-nums text-muted">{lineMeta}</span>
            </div>
            <div className="flex items-center px-6 text-muted">Preview</div>
          </div>
        )}

        <div className={split ? "lg:grid lg:grid-cols-2" : ""}>
          <div className={`${tab === "write" ? "flex" : "hidden"} ${split ? "lg:flex lg:border-r lg:border-line" : ""} min-h-[240px] font-mono text-[13px] leading-[22px]`}>
            <div aria-hidden className="w-12 shrink-0 select-none py-4 pr-4 text-right tabular-nums text-muted/60">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              id={id}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Write the skill in Markdown"
              wrap="off"
              spellCheck={false}
              disabled={disabled}
              required={required}
              className="min-w-0 flex-1 resize-none overflow-x-auto overflow-y-hidden whitespace-pre bg-transparent py-4 pr-4 text-foreground outline-none placeholder:text-muted focus:outline-none"
            />
          </div>
          <div
            className={`${tab === "preview" ? "block" : "hidden"} ${split ? "lg:block" : ""} max-h-[640px] min-h-[240px] overflow-y-auto p-6`}
          >
            {parseMarkdown(content)}
          </div>
        </div>
      </div>
    </div>
  );
}
