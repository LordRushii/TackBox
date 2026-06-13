export default function SkillsLoading() {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Panel Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 pb-8 border-b border-base-200/40">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent animate-pulse">
            Agent Skills Showcase
          </h1>
          <p className="mt-2 text-base-content/60 text-sm md:text-base max-w-xl">
            Explore and run capabilities designed for autonomous AI agents. Test pre-configured tools, execute prompts, and discover skills.
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
            className="card bg-base-200/20 border border-base-200/40 p-6 flex flex-col justify-between h-[250px] rounded-2xl"
          >
            <div>
              {/* Category Badge Skeleton */}
              <div className="skeleton h-5 w-20 rounded-md mb-4 bg-base-content/10"></div>
              
              {/* Title Skeleton */}
              <div className="skeleton h-7 w-3/4 rounded-md mb-5 bg-base-content/10"></div>
              
              {/* Description Skeletons */}
              <div className="space-y-2 mt-4">
                <div className="skeleton h-3.5 w-full rounded bg-base-content/5"></div>
                <div className="skeleton h-3.5 w-5/6 rounded bg-base-content/5"></div>
                <div className="skeleton h-3.5 w-4/6 rounded bg-base-content/5"></div>
              </div>
            </div>

            {/* Footer Skeleton */}
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
