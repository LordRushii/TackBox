"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SkillCard from "@/components/SkillCard";
import { Search, Loader2, CheckCircle2 } from "lucide-react";

import { fetchSkills, toggleStarAction } from "@/app/actions/skills";
import { Skill } from "./skills";

export default function AgentSkillsShowcasePage() {
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [runningSkillId, setRunningSkillId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRunningSuccess, setIsRunningSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          setUser(null);
        }
      }
    }
  }, []);

  useEffect(() => {
    async function loadSkills() {
      try {
        const data = await fetchSkills();
        setSkills(data);
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
      }),
    );

    try {
      await toggleStarAction(id);
    } catch (err) {
      console.error("Failed to toggle star", err);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(skills.map((s) => s.category))),
  ];

  const filteredSkills = skills.filter((skill) => {
    const authorName = skill.authorName || "";
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      authorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || skill.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-16 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      {/* Hero Section */}
      <div className="text-center mb-16 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-heading font-semibold tracking-tight text-foreground mb-4">
          Agent Skills Showcase
        </h1>
        <p className="mt-3 text-foreground/60 text-base max-w-2xl mx-auto leading-relaxed">
          Explore and run capabilities designed for autonomous AI agents. Test
          pre-configured tools, execute prompts, and discover skills shared by
          our system creators.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-white/[0.02] border border-white/10 p-4 rounded-lg relative z-10">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search agent skills, topics, or agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#0A0A0A] border border-white/10 rounded-md text-sm text-foreground placeholder:text-foreground/30 focus:border-white/20 focus:outline-none transition-all"
            suppressHydrationWarning={true}
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`h-8 px-3 rounded-md text-[13px] font-medium transition-all ${
                selectedCategory === category
                  ? "bg-white/10 text-foreground border border-white/10"
                  : "bg-transparent text-foreground/60 border border-transparent hover:bg-white/[0.04] hover:border-white/10"
              }`}
              suppressHydrationWarning={true}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Showcase Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 mb-20">
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
      ) : filteredSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-lg bg-white/[0.02] max-w-xl mx-auto relative z-10 mb-20">
          <h3 className="text-lg font-semibold text-foreground/80">
            No matching agent skills found
          </h3>
          <p className="text-foreground/50 mt-2 max-w-sm text-sm">
            Try adjusting your search query or choosing a different category
            tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 mb-20">
          {filteredSkills.map((skill) => {
            return (
              <SkillCard
                key={skill.id}
                id={skill.id}
                name={skill.name}
                category={skill.category}
                level={skill.level || "Intermediate"}
                description={skill.description}
                authorName={skill.authorName || "Anonymous"}
                authorRole={skill.authorRole || "Developer"}
                authorAvatarColor={skill.authorAvatarColor}
                authorAvatarUrl={skill.authorAvatarUrl}
                starsCount={skill.stars || 0}
                hasStarred={skill.hasStarred || false}
                subSkillCount={(skill.subSkills || []).length}
                onStarToggle={handleStarToggle}
              />
            );
          })}
        </div>
      )}

      {/* Floating Action/Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-2 max-w-sm animate-in slide-in-from-bottom-5">
          <div
            className={`border shadow-2xl shadow-black rounded-lg flex items-center gap-3 p-4 bg-[#0A0A0A] border-white/10`}
          >
            {!isRunningSuccess ? (
              <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span className="font-medium text-sm text-foreground">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      {/* Call to Action Banner */}
      <div className="relative z-10 max-w-4xl mx-auto rounded-lg overflow-hidden border border-white/10 bg-white/[0.02] p-10 sm:p-12 text-center">
        {user ? (
          <div>
            <h3 className="text-2xl font-heading font-semibold text-foreground mb-3">
              Ready to Publish Agent Skills, {user.name}?
            </h3>
            <p className="text-sm text-foreground/60 max-w-md mx-auto mb-8 leading-relaxed">
              You are signed in. Jump over to your private console to upload
              instructions and execute your agents' skills.
            </p>
            <Link
              href="/my-skills"
              className="inline-flex items-center justify-center h-11 px-8 rounded-md bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-foreground font-medium transition-colors"
            >
              Go to My Agent Skills
            </Link>
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-heading font-semibold text-foreground mb-3">
              Upload Your Own Agent Skills
            </h3>
            <p className="text-sm text-foreground/60 max-w-md mx-auto mb-8 leading-relaxed">
              Join Tackbox today. Create a pre-configured capability inventory
              to test triggers, track execution statuses, and publish agent
              tools.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login?redirect=/my-skills"
                className="inline-flex items-center justify-center h-11 px-8 rounded-md bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-foreground font-medium transition-colors w-full sm:w-auto"
              >
                Sign In Now
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-11 px-8 rounded-md bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] text-foreground font-medium transition-colors w-full sm:w-auto"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
