// Resolves the GitHub owner/repo that hosts published skills.
// NEXT_PUBLIC_GITHUB_REPO may be a bare name, "owner/repo" or a full URL.
export function getSkillsRepo(): { owner: string; repo: string } {
  let owner = process.env.NEXT_PUBLIC_GITHUB_OWNER || "LordRushii";
  let repo = process.env.NEXT_PUBLIC_GITHUB_REPO || "TackBox";

  if (repo.includes("/")) {
    try {
      const clean = repo.replace(/\/$/, "").replace(/\.git$/, "");
      const parts = clean.startsWith("http://") || clean.startsWith("https://")
        ? new URL(clean).pathname.split("/").filter(Boolean)
        : clean.split("/");
      if (parts.length >= 2) {
        owner = parts[0];
        repo = parts[1];
      } else if (parts.length === 1) {
        repo = parts[0];
      }
    } catch (e) {
      console.warn("Error parsing NEXT_PUBLIC_GITHUB_REPO URL:", e);
    }
  }

  return { owner, repo };
}
