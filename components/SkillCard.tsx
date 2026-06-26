import Link from "next/link";
import React from "react";
import { Star, ArrowRight, Plus } from "lucide-react";

export type SkillCardProps = {
  id: string;
  name: string;
  category: string;
  level?: string;
  description: string;
  authorName: string;
  authorRole: string;
  authorAvatarColor?: string;
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
  level = "Intermediate",
  description,
  authorName,
  authorRole,
  authorAvatarColor, // Kept for API compat, but unused in flat design
  authorAvatarUrl,
  starsCount,
  hasStarred = false,
  subSkillCount = 0,
  onStarToggle,
}: SkillCardProps) {
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Link
      href={`/skills/${id}`}
      className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors rounded-lg flex flex-col justify-between block text-left group p-5 sm:p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/60 px-2 py-1 rounded border border-white/10 bg-white/[0.02]">
          {category}
        </span>
        <div className="flex items-center gap-2">
          {subSkillCount > 0 && (
            <span className="text-[10px] text-foreground/60 font-medium border border-white/10 bg-white/[0.02] rounded px-1.5 py-0.5 flex items-center gap-0.5">
              <Plus className="w-2.5 h-2.5 opacity-70" />
              {subSkillCount} more
            </span>
          )}
          {level && (
            <span className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">
              {level}
            </span>
          )}
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground group-hover:text-amber-500 transition-colors duration-200">
        {name}
      </h2>

      <p className="text-foreground/60 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed min-h-[4rem] sm:min-h-[4.5rem] line-clamp-3">
        {description}
      </p>

      {/* Footer info: Who made it + likes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2 mt-5 sm:mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {authorAvatarUrl ? (
            <img
              src={authorAvatarUrl}
              alt={authorName}
              className="h-8 w-8 rounded-md object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className={`flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-foreground font-medium text-xs shadow-sm shrink-0`}>
              {initials}
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-medium text-foreground truncate">
              {authorName}
            </span>
            <span className="text-[10px] text-foreground/40 truncate">
              {authorRole}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-end">
          <button
            onClick={(e) => {
              if (onStarToggle) {
                e.preventDefault();
                e.stopPropagation();
                onStarToggle(id, e);
              }
            }}
            className={`h-7 px-2 rounded flex items-center gap-1.5 transition-colors duration-200 ${
              hasStarred ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20" : "text-foreground/40 hover:text-amber-500 hover:bg-amber-500/10"
            }`}
            title="Star this Agent Skill"
          >
            <Star
              className="w-3.5 h-3.5"
              fill={hasStarred ? "currentColor" : "none"}
              strokeWidth={hasStarred ? 0 : 2}
            />
            <span className="font-medium text-xs">{starsCount}</span>
          </button>
          <div className="text-foreground/50 group-hover:text-amber-500 transition-colors font-medium text-[11px] sm:text-xs flex items-center gap-1">
            View <span className="hidden sm:inline">Details</span> <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
