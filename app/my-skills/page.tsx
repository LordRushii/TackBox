"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { fetchUserSkills, toggleStarAction } from "@/features/skills/actions";
import type { Skill } from "@/features/skills/skill";
import { useViewer } from "@/features/auth/viewer";
import SkillCard, { SkillCardSkeleton } from "@/components/SkillCard";

export default function MySkillsPage() {
  // The layout only renders this page for a signed-in viewer
  const user = useViewer();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserSkills()
      .then(setSkills)
      .catch((err) => console.error("Failed to load agent skills:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleStarToggle = async (id: string) => {
    if (!user) return;

    setSkills((prev) =>
      prev.map((skill) =>
        skill.id === id
          ? { ...skill, hasStarred: !skill.hasStarred, stars: (skill.stars || 0) + (skill.hasStarred ? -1 : 1) }
          : skill
      )
    );

    try {
      await toggleStarAction(id);
    } catch (err) {
      console.error("Failed to toggle star", err);
    }
  };

  const ready = !loading && user;
  const categoriesCount = new Set(skills.map((s) => s.category)).size;

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-24 pt-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-[32px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[40px]">
            My skills
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-6 text-subtle">
            Everything you&apos;ve written, public and private. Open a skill to edit it.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/skills/upload" className="btn btn-secondary h-10 gap-2 px-4 text-sm">
            <Upload className="size-4" strokeWidth={1.5} />
            Upload
          </Link>
          <Link href="/skills/create" className="btn btn-primary h-10 gap-2 px-4 text-sm">
            <Plus className="size-4" strokeWidth={1.5} />
            New skill
          </Link>
        </div>
      </header>

      <p className="mt-10 h-4 font-mono text-xs tabular-nums text-muted">
        {ready &&
          skills.length > 0 &&
          `${skills.length} ${skills.length === 1 ? "skill" : "skills"} · ${categoriesCount} ${
            categoriesCount === 1 ? "category" : "categories"
          }`}
      </p>

      {!ready ? (
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="mt-3 flex flex-col items-start gap-2 rounded-2xl border border-dashed border-line-strong p-8 sm:p-12">
          <h2 className="font-heading text-lg font-medium text-foreground">No skills yet</h2>
          <p className="max-w-md text-sm leading-[22px] text-subtle">
            Write one in the editor, or upload a Markdown file you already have.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/skills/create" className="btn btn-primary h-9 gap-2 px-3 text-sm">
              <Plus className="size-4" strokeWidth={1.5} />
              New skill
            </Link>
            <Link href="/skills/upload" className="btn btn-secondary h-9 gap-2 px-3 text-sm">
              <Upload className="size-4" strokeWidth={1.5} />
              Upload
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              id={skill.id}
              name={skill.name}
              category={skill.category}
              description={skill.description}
              authorName={skill.authorName || user?.name || "Unknown author"}
              authorAvatarUrl={skill.authorAvatarUrl || user?.image}
              starsCount={skill.stars || 0}
              hasStarred={skill.hasStarred || false}
              subSkillCount={(skill.subSkills || []).length}
              onStarToggle={handleStarToggle}
            />
          ))}
        </div>
      )}
    </main>
  );
}
