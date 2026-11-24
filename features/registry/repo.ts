// The registry: one GitHub repo where every public skill lives at skills/<slug>/SKILL.md.
// Pages read it to show install commands, and publish.ts writes to it. Free of server-only
// imports, so client components can use it too.

export type RepoRef = { owner: string; repo: string };

/**
 * Reads a repo setting that may be a bare name ("TackBox"), "owner/repo" or a GitHub URL,
 * with or without a trailing slash or ".git". An owner inside the value wins over `owner`.
 */
export function parseRepo(owner: string, repo: string): RepoRef {
  const clean = repo.trim().replace(/\/+$/, "").replace(/\.git$/, "");
  let parts = clean.split("/").filter(Boolean);
  if (/^https?:\/\//.test(clean)) {
    try {
      parts = new URL(clean).pathname.split("/").filter(Boolean);
    } catch {
      console.warn(`Couldn't read the GitHub repo setting "${repo}"`);
    }
  }
  return parts.length >= 2 ? { owner: parts[0], repo: parts[1] } : { owner, repo: parts[0] ?? clean };
}

/** The registry repo, from the public settings (NEXT_PUBLIC_*) that the browser can read. */
export function registryRepo(): RepoRef {
  return parseRepo(
    process.env.NEXT_PUBLIC_GITHUB_OWNER || "LordRushii",
    process.env.NEXT_PUBLIC_GITHUB_REPO || "TackBox",
  );
}

export function repoUrl(repo: RepoRef = registryRepo()): string {
  return `https://github.com/${repo.owner}/${repo.repo}`;
}

/** Where a skill's file lives in the registry. */
export function skillFilePath(slug: string): string {
  return `skills/${slug}/SKILL.md`;
}

/** The commands that install one skill from the registry. */
export function installCommands(slug: string, repo: RepoRef = registryRepo()) {
  const folder = `${repo.owner}/${repo.repo}/skills/${slug}`;
  return {
    cli: `npx skills add ${folder}`,
    degit: `npx degit ${folder} ${slug}`,
  };
}
