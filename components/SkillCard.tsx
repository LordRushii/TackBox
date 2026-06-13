import Link from "next/link";
import React from "react";
import { Star, ArrowRight } from "lucide-react";

export type SkillCardProps = {
  id: string;
  name: string;
  category: string;
  level?: string;
  description: string;
  authorName: string;
  authorRole: string;
  authorAvatarColor?: string;
  starsCount: number;
  hasStarred?: boolean;
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
  authorAvatarColor = "from-primary to-secondary",
  starsCount,
  hasStarred = false,
  onStarToggle,
}: SkillCardProps) {
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Link
      href={`/skills/${id}`}
      className="card bg-base-200/30 hover:bg-base-200/60 border border-base-200/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 group flex flex-col justify-between block text-left"
    >
      <div className="card-body p-5 sm:p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="badge badge-primary badge-outline text-[11px] font-semibold px-2 py-0.5 rounded">
            {category}
          </span>
          {level && (
            <span className="text-[11px] text-base-content/40 font-bold uppercase tracking-wider">
              {level}
            </span>
          )}
        </div>

        <h2 className="card-title text-lg sm:text-xl font-extrabold text-base-content/95 group-hover:text-primary transition-colors duration-200">
          {name}
        </h2>

        <p className="text-base-content/75 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed min-h-[4rem] sm:min-h-[4.5rem] line-clamp-3">
          {description}
        </p>

        {/* Footer info: Who made it + likes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2 mt-5 sm:mt-6 pt-4 border-t border-base-200/40">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gradient-to-br ${authorAvatarColor} text-white font-bold text-xs sm:text-sm shadow shrink-0`}>
              {initials}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-base-content/85 truncate">
                {authorName}
              </span>
              <span className="text-[10px] text-base-content/40 truncate">
                {authorRole}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-1.5 shrink-0 justify-end">
            <button
              onClick={(e) => {
                if (onStarToggle) {
                  e.preventDefault();
                  e.stopPropagation();
                  onStarToggle(id, e);
                }
              }}
              className={`btn btn-ghost btn-xs h-8 px-2 rounded-lg flex items-center gap-1 transition-colors duration-200 ${
                hasStarred ? "text-amber-400 hover:bg-amber-400/10" : "text-base-content/40 hover:text-amber-400 hover:bg-amber-400/5"
              }`}
              title="Star this Agent Skill"
            >
              <Star
                className="w-4 h-4 transition-transform duration-200 active:scale-125"
                fill={hasStarred ? "currentColor" : "none"}
                strokeWidth={hasStarred ? 0 : 2}
              />
              <span className="font-semibold text-xs">{starsCount}</span>
            </button>
            <div className="text-primary font-semibold text-[11px] sm:text-xs hover:underline flex items-center gap-1">
              View <span className="hidden sm:inline">Details</span> <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
