import Link from "next/link";
import React from "react";
import { Star } from "lucide-react";

export type SkillCardProps = {
  id: string;
  name: string;
  category: string;
  description: string;
  authorName: string;
  authorAvatarUrl?: string;
  starsCount: number;
  hasStarred?: boolean;
  subSkillCount?: number;
  onStarToggle?: (id: string, e: React.MouseEvent) => void;
};

export default function SkillCard({
  id,
  name,
  category,
  description,
  authorName,
  authorAvatarUrl,
  starsCount,
  hasStarred = false,
  subSkillCount = 0,
  onStarToggle,
}: SkillCardProps) {
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const meta = [category, subSkillCount > 0 ? `+${subSkillCount} ${subSkillCount === 1 ? "skill" : "skills"}` : null].filter(Boolean);

  return (
    <Link
      href={`/skills/${id}`}
      className="group flex flex-col rounded-2xl border border-line bg-card p-5 transition-colors duration-150 ease-out hover:border-line-strong hover:bg-raised"
    >
      <p className="font-mono text-xs text-muted">{meta.join(" · ")}</p>

      <h2 className="mt-3 break-words font-heading text-lg font-medium leading-6 text-foreground">{name}</h2>

      <p className="mt-2 line-clamp-3 min-h-[66px] text-sm leading-[22px] text-subtle">{description}</p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="flex min-w-0 items-center gap-2">
          {authorAvatarUrl ? (
            <img src={authorAvatarUrl} alt="" className="size-6 shrink-0 rounded-md border border-line object-cover" />
          ) : (
            <span className="grid size-6 shrink-0 place-items-center rounded-md border border-line bg-raised text-[10px] font-medium text-subtle">
              {initials}
            </span>
          )}
          <span className="truncate text-[13px] text-subtle">{authorName}</span>
        </span>

        <button
          type="button"
          onClick={(e) => {
            if (onStarToggle) {
              e.preventDefault();
              e.stopPropagation();
              onStarToggle(id, e);
            }
          }}
          aria-pressed={hasStarred}
          aria-label={hasStarred ? `Unstar ${name}` : `Star ${name}`}
          className={`-mr-2 flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 font-mono text-xs tabular-nums transition-colors duration-150 ease-out hover:bg-raised-strong ${
            hasStarred ? "text-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          <Star
            className={`size-4 ${hasStarred ? "text-amber" : ""}`}
            fill={hasStarred ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
          {starsCount}
        </button>
      </div>
    </Link>
  );
}

/** Same shape as a card, no shimmer: it holds the space until the list arrives. */
export function SkillCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col rounded-2xl border border-line bg-card p-5">
      <span className="h-4 w-24 rounded bg-raised" />
      <span className="mt-3 h-6 w-3/4 rounded bg-raised" />
      <span className="mt-2 flex min-h-[66px] flex-col gap-2 pt-1">
        <span className="h-3 w-full rounded bg-raised" />
        <span className="h-3 w-5/6 rounded bg-raised" />
        <span className="h-3 w-2/3 rounded bg-raised" />
      </span>
      <span className="mt-5 flex items-center gap-2 border-t border-line pt-4">
        <span className="size-6 rounded-md bg-raised" />
        <span className="h-3 w-24 rounded bg-raised" />
      </span>
    </div>
  );
}
