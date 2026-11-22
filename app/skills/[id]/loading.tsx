// Holds the shape of the skill page, without shimmer, until the skill arrives
export default function SkillDetailLoading() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-24 pt-8">
      <span className="sr-only">Loading skill</span>
      <span className="block h-5 w-24 rounded bg-raised" />

      <div className="mt-8 border-b border-line pb-8">
        <span className="block h-4 w-32 rounded bg-raised" />
        <span className="mt-3 block h-10 w-2/3 max-w-xl rounded bg-raised" />
        <span className="mt-4 block h-4 w-full max-w-2xl rounded bg-raised" />
        <span className="mt-2 block h-4 w-1/2 max-w-md rounded bg-raised" />
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-[480px] rounded-2xl border border-line-strong bg-deep" />
        <div className="flex flex-col gap-4">
          <div className="h-40 rounded-2xl border border-line bg-card" />
          <div className="h-20 rounded-2xl border border-line bg-card" />
          <div className="h-28 rounded-2xl border border-line bg-card" />
        </div>
      </div>
    </main>
  );
}
