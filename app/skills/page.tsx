"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SkillCard from "@/components/SkillCard";

import { fetchSkills } from "@/app/actions/skills";
import { Skill } from "./skills";

export default function AgentSkillsShowcasePage() {
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [starredSkills, setStarredSkills] = useState<Record<string, boolean>>({});
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

  const handleStarToggle = (id: string) => {
    setStarredSkills((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleStartSkill = (id: string, name: string) => {
    if (runningSkillId) return; // Prevent double starting
    setRunningSkillId(id);
    setIsRunningSuccess(false);
    setToastMessage(`Initializing agent skill: "${name}"...`);

    setTimeout(() => {
      setIsRunningSuccess(true);
      setToastMessage(`Agent skill "${name}" is now running active!`);
      
      setTimeout(() => {
        setRunningSkillId(null);
        setToastMessage(null);
        setIsRunningSuccess(false);
      }, 3000);
    }, 1500);
  };

  const categories = ["All", ...Array.from(new Set(skills.map((s) => s.category)))];

  const filteredSkills = skills.filter((skill) => {
    const authorName = skill.authorName || "";
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      authorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      {/* Background Glows */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-secondary/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Hero Section */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent mb-4">
          Agent Skills Showcase
        </h1>
        <p className="mt-3 text-base-content/60 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Explore and run capabilities designed for autonomous AI agents. Test pre-configured tools, execute prompts, and discover skills shared by our system creators.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-base-200/20 border border-base-200/50 p-4 rounded-2xl backdrop-blur-md relative z-10">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21-21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search agent skills, topics, or agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10 bg-base-100/40 border-base-200 focus:input-primary transition-all duration-200 placeholder:text-base-content/30"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`btn btn-xs sm:btn-sm rounded-lg transition-all duration-300 font-semibold border-0 ${
                selectedCategory === category
                  ? "bg-primary text-primary-content shadow-md shadow-primary/20"
                  : "bg-base-200/50 hover:bg-base-200 text-base-content/70"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Showcase Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 mb-16">
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
      ) : filteredSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-base-200/60 rounded-2xl bg-base-200/10 max-w-lg mx-auto relative z-10">
          <h3 className="text-xl font-bold text-base-content/85">No matching agent skills found</h3>
          <p className="text-base-content/50 mt-2 max-w-xs text-sm">
            Try adjusting your search query or choosing a different category tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 mb-16">
          {filteredSkills.map((skill) => {
            const hasStarred = !!starredSkills[skill.id];
            const displayStars = (skill.stars || 0) + (hasStarred ? 1 : 0);

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
                starsCount={displayStars}
                hasStarred={hasStarred}
                onStarToggle={handleStarToggle}
              />
            );
          })}
        </div>
      )}

      {/* Floating Action/Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-2 max-w-sm animate-bounce">
          <div className={`alert border shadow-2xl rounded-2xl flex items-center gap-3 p-4 bg-base-300 border-base-200`}>
            {!isRunningSuccess ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                className="w-5 h-5 text-primary animate-spin shrink-0"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                className="w-5 h-5 text-emerald-500 shrink-0"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            )}
            <span className="font-bold text-xs sm:text-sm text-base-content/90">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Call to Action Banner */}
      <div className="relative z-10 max-w-4xl mx-auto rounded-3xl overflow-hidden border border-base-200/50 bg-gradient-to-br from-base-200/20 to-base-300/10 backdrop-blur-xl p-8 sm:p-10 shadow-2xl text-center">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        
        {user ? (
          <div>
            <h3 className="text-2xl font-extrabold text-base-content/95 mb-2">
              Ready to Publish Agent Skills, {user.name}?
            </h3>
            <p className="text-sm text-base-content/60 max-w-md mx-auto mb-6">
              You are signed in. Jump over to your private console to upload instructions and execute your agents' skills.
            </p>
            <Link
              href="/my-skills"
              className="btn btn-primary bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 border-0 rounded-xl px-8 font-semibold shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-300"
            >
              Go to My Agent Skills
            </Link>
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-extrabold text-base-content/95 mb-2">
              Upload Your Own Agent Skills
            </h3>
            <p className="text-sm text-base-content/60 max-w-md mx-auto mb-6">
              Join Skillhub today. Create a pre-configured capability inventory to test triggers, track execution statuses, and publish agent tools.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login?redirect=/my-skills"
                className="btn btn-primary bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 border-0 rounded-xl px-8 w-full sm:w-auto font-semibold shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-300"
              >
                Sign In Now
              </Link>
              <Link
                href="/register"
                className="btn btn-outline border-base-200/80 hover:bg-base-200/40 rounded-xl px-8 w-full sm:w-auto font-semibold transition-all duration-300"
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