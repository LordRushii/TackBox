"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSkills } from "@/app/actions/skills";
import { Skill } from "@/app/skills/skills";
import SkillCard from "@/components/SkillCard";

export default function MySkillsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check client-side authentication
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login?redirect=/my-skills");
      return;
    }
    setUser(JSON.parse(stored));

    // Load user's skills
    async function loadSkills() {
      try {
        const data = await fetchSkills();
        setSkills(data);
      } catch (err) {
        console.error("Failed to load agent skills:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSkills();
  }, [router]);

  if (loading || !user) {
    // Return loading skeleton matching the previous aesthetics
    return (
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Panel Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 pb-8 border-b border-base-200/40">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent animate-pulse">
              My Agent Skills
            </h1>
            <p className="mt-2 text-base-content/60 text-sm md:text-base max-w-xl">
              Explore, catalog, and manage your agent skills capability database. Filter by category, track progression, and add new capabilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Quick Stats Skeleton */}
            <div className="stats shadow bg-base-200/30 border border-base-200/40 hidden sm:flex">
              <div className="stat py-2 px-6">
                <div className="stat-title text-xs text-base-content/50">Total Skills</div>
                <div className="skeleton h-7 w-8 mt-1 bg-base-content/10"></div>
              </div>
              <div className="stat py-2 px-6">
                <div className="stat-title text-xs text-base-content/50">Categories</div>
                <div className="skeleton h-7 w-8 mt-1 bg-base-content/10"></div>
              </div>
            </div>

            <div className="skeleton h-12 w-36 rounded-lg bg-base-content/10"></div>
          </div>
        </div>

        {/* Grid of Skeleton Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="card bg-base-200/20 border border-base-200/40 p-6 flex flex-col justify-between h-[250px] rounded-2xl animate-pulse"
            >
              <div>
                <div className="skeleton h-5 w-20 rounded-md mb-4 bg-base-content/10"></div>
                <div className="skeleton h-7 w-3/4 rounded-md mb-5 bg-base-content/10"></div>
                <div className="space-y-2 mt-4">
                  <div className="skeleton h-3.5 w-full rounded bg-base-content/5"></div>
                  <div className="skeleton h-3.5 w-5/6 rounded bg-base-content/5"></div>
                  <div className="skeleton h-3.5 w-4/6 rounded bg-base-content/5"></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-base-200/40">
                <div className="skeleton h-4 w-28 rounded bg-base-content/5"></div>
                <div className="skeleton h-4 w-16 rounded bg-base-content/10"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  const categoriesCount = new Set(skills.map((s) => s.category)).size;

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 pb-8 border-b border-base-200/40">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent">
            My Agent Skills
          </h1>
          <p className="mt-2 text-base-content/60 text-sm md:text-base max-w-xl">
            Explore, catalog, and manage your agent skills capability database. Filter by category, track progression, and add new capabilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Quick Stats */}
          <div className="stats shadow bg-base-200/30 border border-base-200/40 hidden sm:flex">
            <div className="stat py-2 px-4">
              <div className="stat-title text-xs text-base-content/50">Total Skills</div>
              <div className="stat-value text-xl text-primary">{skills.length}</div>
            </div>
            <div className="stat py-2 px-4">
              <div className="stat-title text-xs text-base-content/50">Categories</div>
              <div className="stat-value text-xl text-secondary">{categoriesCount}</div>
            </div>
          </div>

          <Link
            href="/skills/create"
            className="btn btn-primary gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Agent Skill
          </Link>
        </div>
      </div>

      {/* Skills Grid */}
      {skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-base-200/60 rounded-2xl bg-base-200/10 max-w-lg mx-auto">
          <div className="p-4 rounded-full bg-base-200/40 text-base-content/40 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-base-content/90">No agent skills in catalog</h3>
          <p className="text-base-content/50 mt-2 max-w-xs text-sm">
            Get started by adding your first agent skill with execution instructions, descriptions, and category tags.
          </p>
          <Link href="/skills/create" className="btn btn-primary mt-6 btn-sm">
            Create First Agent Skill
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              id={skill.id}
              name={skill.name}
              category={skill.category}
              description={skill.description || "No description provided."}
              authorName={skill.authorName || user?.name || "Anonymous"}
              authorRole={skill.authorRole || user?.role || "Developer"}
              authorAvatarColor={skill.authorAvatarColor || "from-primary to-secondary"}
              starsCount={skill.stars || 0}
            />
          ))}
        </div>
      )}
    </main>
  );
}
