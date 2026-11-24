"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import SkillCard, { SkillCardSkeleton } from "@/components/SkillCard";
import { fetchSkills, toggleStarAction } from "@/features/skills/actions";
import type { Skill } from "@/features/skills/skill";
import { useViewer } from "@/features/auth/viewer";

type BrowseSkillsPageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default function BrowseSkillsPage({ searchParams }: BrowseSkillsPageProps) {
  const { category } = use(searchParams);
  const user = useViewer();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState((Array.isArray(category) ? category[0] : category) || "All");

  useEffect(() => {
    async function loadSkills() {
      try {
        setSkills(await fetchSkills());
      } catch (err) {
        console.error("Failed to load public skills:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSkills();
  }, []);

  const handleStarToggle = async (id: string) => {
    if (!user) {
      window.location.href = "/login?redirect=/skills";
      return;
    }

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

  const categories = [
    "All",
    ...Array.from(
      new Set([...skills.map((s) => s.category), ...(selectedCategory !== "All" ? [selectedCategory] : [])])
    ),
  ];

  const query = searchQuery.toLowerCase();
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(query) ||
      skill.description.toLowerCase().includes(query) ||
      (skill.authorName || "").toLowerCase().includes(query);
    const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-24 pt-12">
      <header>
        <h1 className="font-heading text-[32px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[40px]">
          Browse skills
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-6 text-subtle">
          Public skills from the registry. Open one to read the whole file before you install it.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="search"
            aria-label="Search skills"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field h-10 pl-9 pr-3"
          />
        </div>

        <div role="group" aria-label="Category" className="flex flex-wrap items-center gap-1">
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedCategory(category)}
                className={`flex h-8 items-center gap-2 rounded-lg px-3 text-[13px] transition-colors duration-150 ease-out ${
                  active ? "bg-raised text-foreground" : "text-muted hover:bg-raised hover:text-foreground"
                }`}
              >
                {/* The amber cursor tile marks the current filter */}
                {active && <span aria-hidden className="size-1.5 bg-amber" />}
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-8 h-4 font-mono text-xs tabular-nums text-muted">
        {!loading && `${filteredSkills.length} ${filteredSkills.length === 1 ? "skill" : "skills"}`}
      </p>

      {loading ? (
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="mt-3 flex flex-col items-start gap-2 rounded-2xl border border-dashed border-line-strong p-8 sm:p-12">
          {skills.length === 0 ? (
            <>
              <h2 className="font-heading text-lg font-medium text-foreground">No public skills yet</h2>
              <p className="text-sm text-subtle">Skills show up here once someone publishes one</p>
            </>
          ) : (
            <>
              <h2 className="font-heading text-lg font-medium text-foreground">No skills match</h2>
              <p className="text-sm text-subtle">Try another search or category</p>
              <button type="button" onClick={clearFilters} className="btn btn-secondary mt-4 h-9 px-3 text-sm">
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              id={skill.id}
              name={skill.name}
              category={skill.category}
              description={skill.description}
              authorName={skill.authorName || "Unknown author"}
              authorAvatarUrl={skill.authorAvatarUrl}
              starsCount={skill.stars || 0}
              hasStarred={skill.hasStarred || false}
              subSkillCount={(skill.subSkills || []).length}
              onStarToggle={handleStarToggle}
            />
          ))}
        </div>
      )}

      <section className="mt-24 flex flex-col gap-8 rounded-[20px] border border-line bg-card px-8 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-medium text-foreground">Publish your own skill</h2>
          <p className="mt-2 max-w-md text-[15px] leading-6 text-subtle">
            {user
              ? "Write a skill in Markdown or upload a file you already have."
              : "Log in to write a skill in Markdown or upload one you already have. Public skills show who wrote them."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user ? (
            <Link href="/my-skills" className="btn btn-primary h-10 gap-2 px-4 text-sm">
              My skills
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
          ) : (
            <>
              <Link href="/login?redirect=/my-skills" className="btn btn-primary h-10 px-4 text-sm">
                Log in
              </Link>
              <Link href="/register" className="btn btn-secondary h-10 px-4 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
