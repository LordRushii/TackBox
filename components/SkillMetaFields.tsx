"use client";

import { useState } from "react";
import { Globe, Lock } from "lucide-react";

export const CATEGORIES = ["Frontend", "Backend", "Fullstack", "DevOps", "Design", "Soft Skills"];

const VISIBILITY = [
  { value: "public", icon: Globe, label: "Public", hint: "Anyone can view it" },
  { value: "private", icon: Lock, label: "Private", hint: "Only you can view it" },
] as const;

/** Name, category, visibility and description for the create and upload forms. Uncontrolled, posted by name. */
export default function SkillMetaFields({ disabled }: { disabled?: boolean }) {
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [descLength, setDescLength] = useState(0);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-line bg-card p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-2">
          <label htmlFor="skill-name" className="field-label">
            Name
          </label>
          <input
            id="skill-name"
            name="name"
            type="text"
            placeholder="code-reviewer"
            className="field h-10 px-3"
            required
            disabled={disabled}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="skill-category" className="field-label">
            Category
          </label>
          <select id="skill-category" name="category" className="field h-10 pl-3 invalid:text-muted" required defaultValue="" disabled={disabled}>
            <option value="" disabled>
              Choose a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span id="skill-visibility" className="field-label">
          Visibility
        </span>
        <div role="radiogroup" aria-labelledby="skill-visibility" className="grid grid-cols-2 gap-2 sm:max-w-md">
          {VISIBILITY.map(({ value, icon: Icon, label, hint }) => {
            const active = visibility === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setVisibility(value)}
                disabled={disabled}
                className={`flex items-start gap-3 rounded-[10px] border p-3 text-left transition-colors duration-150 ease-out ${
                  active ? "border-line-strong bg-raised" : "border-line hover:border-line-strong"
                }`}
              >
                <Icon className={`mt-0.5 size-4 shrink-0 ${active ? "text-foreground" : "text-muted"}`} strokeWidth={1.5} />
                <span>
                  <span className={`block text-sm ${active ? "text-foreground" : "text-subtle"}`}>{label}</span>
                  <span className="mt-0.5 block text-xs text-muted">{hint}</span>
                </span>
              </button>
            );
          })}
        </div>
        <input type="hidden" name="visibility" value={visibility} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="skill-description" className="field-label">
            Description
          </label>
          <span className="font-mono text-xs tabular-nums text-muted">{descLength}/200</span>
        </div>
        <textarea
          id="skill-description"
          name="description"
          rows={3}
          maxLength={200}
          placeholder="What the skill does and when to use it"
          className="field resize-y px-3 py-2.5"
          required
          onChange={(e) => setDescLength(e.target.value.length)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
