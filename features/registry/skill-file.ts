// The SKILL.md file the registry holds for each public skill: YAML frontmatter, then the
// skill's Markdown. The frontmatter records which Tackbox skill owns the file.

export type PublishableSkill = {
  id: string;
  /** The skill's stored slug, unique across all skills */
  slug: string;
  name: string;
  description?: string;
  content: string;
  author?: string;
  /** Epoch ms */
  createdAt: number;
};

/** A YAML scalar that can't break out of its line: JSON strings are valid YAML. */
function yamlString(value: string) {
  return JSON.stringify(value.replace(/[\r\n]+/g, " ").trim());
}

export function formatSkillFile(skill: PublishableSkill): string {
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

/**
 * The id of the skill that owns a SKILL.md, or undefined for files published before ids.
 * Only the frontmatter counts, so a skill's own text can't claim a file.
 */
export function skillFileOwner(file: string): string | undefined {
  const frontmatter = file.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  return frontmatter?.match(/^tackbox-id:\s*(\S+)\s*$/m)?.[1];
}
