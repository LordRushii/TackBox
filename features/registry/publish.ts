import "server-only";
import { Octokit } from "@octokit/rest";
import { SLUG_PATTERN } from "@/features/skills/slug";
import { parseRepo, skillFilePath } from "./repo";
import { type PublishableSkill, formatSkillFile, skillFileOwner } from "./skill-file";

export type { PublishableSkill };

/** The repo to publish to and the token to do it, from the server-only settings. */
function publishTarget() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) return null;
  return { token, ...parseRepo(owner, repo) };
}

/**
 * Files published before they carried a tackbox-id have no recorded owner. Slugs are unique,
 * so the skill holding this slug may adopt the file only if it already existed when the file
 * was first committed. A file committed by hand (like code-reviewer) predates any copycat, so
 * a skill created later that happens to get the same slug can never take it over.
 */
async function canClaimLegacyFile(
  octokit: Octokit,
  file: { owner: string; repo: string; path: string },
  skillCreatedAt: number,
) {
  const commits = await octokit.paginate(octokit.repos.listCommits, {
    owner: file.owner,
    repo: file.repo,
    path: file.path,
    per_page: 100,
  });
  const firstDate = commits.at(-1)?.commit.committer?.date ?? commits.at(-1)?.commit.author?.date;
  if (!firstDate) return false;
  return skillCreatedAt <= new Date(firstDate).getTime();
}

/**
 * Writes skills/<slug>/SKILL.md to the configured repo. Only called from server actions
 * after the caller's ownership of the skill has been checked.
 */
export async function publishSkillToGitHub(skill: PublishableSkill) {
  if (!SLUG_PATTERN.test(skill.slug)) {
    console.warn(`[GitHub Publish] Skipped: "${skill.name}" has no usable slug`);
    return;
  }
  const config = publishTarget();
  if (!config) {
    console.warn("[GitHub Publish] Skipped: GITHUB_TOKEN, GITHUB_OWNER or GITHUB_REPO is not set");
    return;
  }

  const { token, owner, repo } = config;
  const octokit = new Octokit({ auth: token });
  const path = skillFilePath(skill.slug);

  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if (Array.isArray(data) || data.type !== "file") {
      console.warn(`[GitHub Publish] Skipped: ${path} is not a file`);
      return;
    }
    const existing = Buffer.from(data.content, "base64").toString("utf8");
    const fileSkillId = skillFileOwner(existing);
    const mayWrite = fileSkillId
      ? fileSkillId === skill.id
      : await canClaimLegacyFile(octokit, { owner, repo, path }, skill.createdAt);
    if (!mayWrite) {
      console.warn(`[GitHub Publish] Skipped: ${path} belongs to another skill`);
      return;
    }
    sha = data.sha;
  } catch (error) {
    if (!(error && typeof error === "object" && "status" in error && error.status === 404)) {
      throw error;
    }
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `${sha ? "Update" : "Add"} skill: ${skill.slug}`,
    content: Buffer.from(formatSkillFile(skill), "utf8").toString("base64"),
    sha,
  });
  console.log(`[GitHub Publish] Published ${path}`);
}
