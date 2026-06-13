export default function SkillDetailLoading() {
  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 flex flex-col">
      {/* Back button skeleton */}
      <div className="flex items-center gap-2 mb-6 self-start text-base-content/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        <span className="skeleton h-4 w-28 bg-base-content/10"></span>
      </div>

      {/* Main card skeleton */}
      <div className="card bg-base-200/20 border border-base-200/40 shadow-xl rounded-2xl">
        <div className="card-body p-6 sm:p-10 gap-6">
          {/* Header info skeleton */}
          <div>
            <div className="skeleton h-5 w-24 rounded-md mb-4 bg-base-content/10"></div>
            <div className="skeleton h-10 w-2/3 rounded-md mb-2 bg-base-content/10"></div>
          </div>

          {/* Description Section skeleton */}
          <div className="py-6 border-t border-b border-base-200/40">
            <div className="skeleton h-4 w-36 rounded mb-4 bg-base-content/10"></div>
            <div className="space-y-2.5">
              <div className="skeleton h-4 w-full rounded bg-base-content/5"></div>
              <div className="skeleton h-4 w-11/12 rounded bg-base-content/5"></div>
              <div className="skeleton h-4 w-9/12 rounded bg-base-content/5"></div>
            </div>
          </div>

          {/* Timestamps Info Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-base-200/10 border border-base-200/30">
              <div className="skeleton h-5 w-5 rounded-full bg-base-content/10 shrink-0"></div>
              <div className="flex flex-col gap-1.5 w-full">
                <div className="skeleton h-3 w-24 rounded bg-base-content/5"></div>
                <div className="skeleton h-4 w-32 rounded bg-base-content/10"></div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-base-200/10 border border-base-200/30">
              <div className="skeleton h-5 w-5 rounded-full bg-base-content/10 shrink-0"></div>
              <div className="flex flex-col gap-1.5 w-full">
                <div className="skeleton h-3 w-20 rounded bg-base-content/5"></div>
                <div className="skeleton h-4 w-32 rounded bg-base-content/10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
