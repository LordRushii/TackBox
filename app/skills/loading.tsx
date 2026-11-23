import PixelLoader from "@/components/pixel/PixelLoader";

// Shared by every route under /skills, so it stays generic: the tile loader from the logo
export default function SkillsLoading() {
  return (
    <main className="flex flex-1 items-center justify-center py-32">
      <PixelLoader />
      <span className="sr-only">Loading</span>
    </main>
  );
}
