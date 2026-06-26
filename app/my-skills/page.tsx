"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUserSkills, toggleStarAction } from "@/app/actions/skills";
import { Skill } from "@/app/skills/skills";
import SkillCard from "@/components/SkillCard";
import { getCurrentUserAction } from "@/app/actions/auth";
import { Plus, PlusCircle, Upload } from "lucide-react";

export default function MySkillsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSkills() {
      try {
        const dbUser = await getCurrentUserAction();
        if (!dbUser) {
          localStorage.removeItem("user");
          router.push("/login?redirect=/my-skills");
          return;
        }
        setUser(dbUser);
        localStorage.setItem("user", JSON.stringify(dbUser));

        const data = await fetchUserSkills();
        setSkills(data);
      } catch (err) {
        console.error("Failed to load agent skills:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSkills();
  }, [router]);

  const handleStarToggle = async (id: string) => {
    if (!user) return;

    setSkills((prev) =>
      prev.map((skill) => {
        if (skill.id === id) {
          const currentlyStarred = skill.hasStarred;
          return {
            ...skill,
            hasStarred: !currentlyStarred,
            stars: (skill.stars || 0) + (currentlyStarred ? -1 : 1),
          };
        }
        return skill;
      })
    );

    try {
      await toggleStarAction(id);
    } catch (err) {
      console.error("Failed to toggle star", err);
    }
  };

  if (loading || !user) {
    return (
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12">
        {/* Header Panel Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 pb-8 border-b border-white/10">
          <div>
            <h1 className="text-4xl font-heading font-semibold tracking-tight text-foreground/50 animate-pulse">
              My Agent Skills
            </h1>
            <div className="mt-4 h-4 w-3/4 max-w-md bg-white/5 rounded"></div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="hidden sm:flex items-center bg-white/[0.02] border border-white/10 rounded-lg">
              <div className="py-2 px-6 border-r border-white/10">
                <div className="text-[10px] uppercase tracking-widest text-foreground/40 font-medium">Total Skills</div>
                <div className="h-6 w-8 mt-1 bg-white/5 rounded"></div>
              </div>
              <div className="py-2 px-6">
                <div className="text-[10px] uppercase tracking-widest text-foreground/40 font-medium">Categories</div>
                <div className="h-6 w-8 mt-1 bg-white/5 rounded"></div>
              </div>
            </div>
            <div className="h-10 w-40 rounded-lg bg-white/5"></div>
          </div>
        </div>

        {/* Grid of Skeleton Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white/[0.02] border border-white/10 p-6 flex flex-col justify-between h-[250px] rounded-lg animate-pulse"
            >
              <div>
                <div className="h-5 w-20 rounded bg-white/5 mb-4"></div>
                <div className="h-7 w-3/4 rounded bg-white/5 mb-5"></div>
                <div className="space-y-2 mt-4">
                  <div className="h-3 w-full rounded bg-white/5"></div>
                  <div className="h-3 w-5/6 rounded bg-white/5"></div>
                  <div className="h-3 w-4/6 rounded bg-white/5"></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                <div className="h-4 w-28 rounded bg-white/5"></div>
                <div className="h-4 w-16 rounded bg-white/5"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  const categoriesCount = new Set(skills.map((s) => s.category)).size;

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 pb-8 border-b border-white/10">
        <div>
          <h1 className="text-4xl font-heading font-semibold tracking-tight text-foreground">
            My Agent Skills
          </h1>
          <p className="mt-3 text-foreground/60 text-sm md:text-base max-w-xl">
            Explore, catalog, and manage your agent skills capability database. Filter by category, track progression, and add new capabilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden sm:flex items-center bg-white/[0.02] border border-white/10 rounded-lg">
            <div className="py-2.5 px-5 border-r border-white/10">
              <div className="text-[10px] uppercase tracking-widest text-foreground/40 font-medium mb-0.5">Total Skills</div>
              <div className="text-xl font-heading font-semibold text-foreground">{skills.length}</div>
            </div>
            <div className="py-2.5 px-5">
              <div className="text-[10px] uppercase tracking-widest text-foreground/40 font-medium mb-0.5">Categories</div>
              <div className="text-xl font-heading font-semibold text-foreground">{categoriesCount}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/skills/upload"
              className="h-10 px-4 flex items-center justify-center gap-2 rounded-lg bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-sm font-medium text-foreground transition-all"
            >
              <Upload className="w-4 h-4 opacity-70" />
              Upload
            </Link>
            <Link
              href="/skills/create"
              className="h-10 px-5 flex items-center justify-center gap-2 rounded-lg bg-white text-[#0A0A0A] hover:bg-white/90 text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Skill
            </Link>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-white/10 rounded-lg bg-white/[0.01] max-w-lg mx-auto">
          <div className="text-foreground/20 mb-6">
            <PlusCircle className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-heading font-semibold text-foreground">No agent skills in catalog</h3>
          <p className="text-foreground/50 mt-3 max-w-xs text-sm leading-relaxed">
            Get started by adding your first agent skill with execution instructions, descriptions, and category tags.
          </p>
          <Link href="/skills/create" className="h-10 px-6 mt-8 flex items-center justify-center rounded-md bg-white text-[#0A0A0A] text-sm font-medium hover:bg-white/90 transition-colors">
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
              authorAvatarColor={skill.authorAvatarColor || ""}
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
