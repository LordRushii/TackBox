import "server-only";
import { Octokit } from "@octokit/rest";
import { api } from "@/convex/_generated/api";
import { convex, serverSecret } from "./convex";

export type PublishableSkill = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  content: string;
  author?: string;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** A YAML scalar that can't break out of its line: JSON strings are valid YAML. */
function yamlString(value: string) {
  return JSON.stringify(value.replace(/[\r\n]+/g, " ").trim());
}

function formatSkillContent(skill: PublishableSkill): string {
  const lines = [
    "---",
    `name: ${skill.slug}`,
    `description: ${yamlString(skill.description || skill.name)}`,
    "mode: subagent",
    "temperature: 0.1",
    "tools:",
    "  write: false",
    "  edit: false",
  ];
  if (skill.author) lines.push(`author: ${yamlString(skill.author)}`);
  // Ties the file to one skill, so a different skill with the same name can't overwrite it
  lines.push(`tackbox-id: ${skill.id}`);
  lines.push("---");
  return [...lines, "", skill.content].join("\n");
}

function repoFromEnv() {
  const token = process.env.GITHUB_TOKEN;
  let owner = process.env.GITHUB_OWNER;
  let repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) return null;

  if (repo.includes("/")) {
    const clean = repo.replace(/\/$/, "").replace(/\.git$/, "");
    const parts = clean.startsWith("http") ? new URL(clean).pathname.split("/").filter(Boolean) : clean.split("/");
    if (parts.length >= 2) [owner, repo] = parts;
    else if (parts.length === 1) repo = parts[0];
  }
  return { token, owner, repo };
}

/**
 * Files published before they carried a tackbox-id have no recorded owner. A skill may
 * adopt one only if it is the single skill with this slug that already existed when the
 * file was first committed. A file committed by hand (like code-reviewer) or by an older
 * skill predates any copycat, so a same-named skill created later can never take it over.
 */
async function canClaimLegacyFile(
  octokit: Octokit,
  file: { owner: string; repo: string; path: string; slug: string; skillId: string },
) {
  const commits = await octokit.paginate(octokit.repos.listCommits, {
    owner: file.owner,
    repo: file.repo,
    path: file.path,
    per_page: 100,
  });
  const firstDate = commits.at(-1)?.commit.committer?.date ?? commits.at(-1)?.commit.author?.date;
  if (!firstDate) return false;

  const candidates = await convex.query(api.skills.skillsWithSlugCreatedBefore, {
    secret: serverSecret(),
    slug: file.slug,
    before: new Date(firstDate).getTime(),
  });
  return candidates.length === 1 && candidates[0] === file.skillId;
}

/**
 * Writes skills/<slug>/SKILL.md to the configured repo. Only called from server actions
 * after the caller's ownership of the skill has been checked.
 */
export async function publishSkillToGitHub(skill: PublishableSkill) {
  if (!SLUG.test(skill.slug)) {
    console.warn(`[GitHub Publish] Skipped: "${skill.name}" has no usable slug`);
    return;
  }
  const config = repoFromEnv();
  if (!config) {
    console.warn("[GitHub Publish] Skipped: GITHUB_TOKEN, GITHUB_OWNER or GITHUB_REPO is not set");
    return;
  }

  const { token, owner, repo } = config;
  const octokit = new Octokit({ auth: token });
  const path = `skills/${skill.slug}/SKILL.md`;

  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if (Array.isArray(data) || data.type !== "file") {
      console.warn(`[GitHub Publish] Skipped: ${path} is not a file`);
      return;
    }
    const existing = Buffer.from(data.content, "base64").toString("utf8");
    const fileSkillId = existing.match(/^tackbox-id:\s*(\S+)\s*$/m)?.[1];
    const mayWrite = fileSkillId
      ? fileSkillId === skill.id
      : await canClaimLegacyFile(octokit, { owner, repo, path, slug: skill.slug, skillId: skill.id });
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
    content: Buffer.from(formatSkillContent(skill), "utf8").toString("base64"),
    sha,
  });
  console.log(`[GitHub Publish] Published ${path}`);
}
