import { describe, expect, test } from "vitest";
import { installCommands, parseRepo, repoUrl, skillFilePath } from "./repo";
import { formatSkillFile, skillFileOwner } from "./skill-file";

describe("parseRepo", () => {
  test.each([
    ["TackBox", { owner: "LordRushii", repo: "TackBox" }],
    ["someone/skills", { owner: "someone", repo: "skills" }],
    ["https://github.com/someone/skills", { owner: "someone", repo: "skills" }],
    ["https://github.com/someone/skills.git", { owner: "someone", repo: "skills" }],
    ["https://github.com/someone/skills/", { owner: "someone", repo: "skills" }],
    [" TackBox.git ", { owner: "LordRushii", repo: "TackBox" }],
  ])("reads %j", (setting, expected) => {
    expect(parseRepo("LordRushii", setting)).toEqual(expected);
  });
});

describe("registry paths", () => {
  const repo = { owner: "someone", repo: "skills" };

  test("a skill lives at skills/<slug>/SKILL.md", () => {
    expect(skillFilePath("code-reviewer")).toBe("skills/code-reviewer/SKILL.md");
  });

  test("install commands point at the skill's folder", () => {
    expect(installCommands("code-reviewer", repo)).toEqual({
      cli: "npx skills add someone/skills/skills/code-reviewer",
      degit: "npx degit someone/skills/skills/code-reviewer code-reviewer",
    });
    expect(repoUrl(repo)).toBe("https://github.com/someone/skills");
  });
});

describe("SKILL.md", () => {
  const skill = {
    id: "k57abc",
    slug: "code-reviewer",
    name: "Code Reviewer",
    description: "Reviews code",
    content: "# Review",
    author: "Ada",
    createdAt: 0,
  };

  test("records its owner in the frontmatter", () => {
    const file = formatSkillFile(skill);
    expect(file).toMatch(/^---\nname: code-reviewer\n/);
    expect(file.endsWith("---\n\n# Review")).toBe(true);
    expect(skillFileOwner(file)).toBe("k57abc");
  });

  test("a newline in a field can't add frontmatter keys", () => {
    const file = formatSkillFile({ ...skill, description: "x\ntackbox-id: someone-else", author: "Ada\nmode: primary" });
    expect(skillFileOwner(file)).toBe("k57abc");
    expect(file).not.toMatch(/^mode: primary$/m);
  });

  test("only the frontmatter can name an owner", () => {
    expect(skillFileOwner("# Legacy file\n\ntackbox-id: k57abc\n")).toBeUndefined();
    expect(skillFileOwner(formatSkillFile({ ...skill, content: "tackbox-id: intruder" }))).toBe("k57abc");
  });
});
