import { describe, expect, test } from "vitest";
import { draftFrom, draftProblem, draftToEdit, entryLabel } from "./draft";
import type { Skill } from "./skill";

const skill: Skill = {
  id: "s1",
  slug: "code-reviewer",
  name: "Code Reviewer",
  description: "Reviews code",
  category: "Backend",
  tags: ["Backend"],
  content: "# Review",
  subSkills: [
    { title: "Skill 2", content: "written in the editor" },
    { title: "checklist.md", content: "uploaded" },
  ],
  visibility: "public",
  views: 0,
  downloads: 0,
  stars: 0,
  hasStarred: false,
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
  authorId: "u1",
  authorName: "Ada",
};

describe("skill drafts", () => {
  test("saving an untouched draft changes nothing", () => {
    const { name, description, category, tags, content, subSkills, visibility } = skill;
    expect(draftToEdit(draftFrom(skill))).toEqual({ name, description, category, tags, content, subSkills, visibility });
  });

  test("uploaded sub-skills keep their file name when another one is removed", () => {
    const draft = draftFrom(skill);
    draft.entries = draft.entries.slice(1);
    expect(draftToEdit(draft).subSkills).toEqual([{ title: "checklist.md", content: "uploaded" }]);
  });

  test("editor sub-skills are renumbered by position, and empty ones are dropped", () => {
    const draft = draftFrom(skill);
    draft.entries = [
      { id: "a", title: "", content: "   " },
      { id: "b", title: "Skill 4", content: "second" },
      { id: "c", title: "", content: "new" },
    ];
    expect(draftToEdit(draft).subSkills).toEqual([
      { title: "Skill 2", content: "second" },
      { title: "Skill 3", content: "new" },
    ]);
  });

  test("labels follow the same rule", () => {
    expect(entryLabel({ title: "" }, 0)).toBe("Skill 2");
    expect(entryLabel({ title: "Skill 9" }, 1)).toBe("Skill 3");
    expect(entryLabel({ title: "notes.md" }, 1)).toBe("notes.md");
  });

  test("a draft needs a name, category and description", () => {
    expect(draftProblem(draftFrom(skill))).toBeNull();
    expect(draftProblem({ ...draftFrom(skill), name: "  " })).toMatch(/required/);
    expect(draftProblem({ ...draftFrom(skill), description: "" })).toMatch(/required/);
  });
});
