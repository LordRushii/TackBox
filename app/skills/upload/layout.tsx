import { requireViewer } from "@/features/auth/server";

/** Signed-in only: everyone else signs in first, then comes back here. */
export default async function UploadSkillLayout({ children }: { children: React.ReactNode }) {
  await requireViewer("/skills/upload");
  return children;
}
