import { requireViewer } from "@/features/auth/server";

/** Signed-in only: everyone else signs in first, then comes back here. */
export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await requireViewer("/profile");
  return children;
}
