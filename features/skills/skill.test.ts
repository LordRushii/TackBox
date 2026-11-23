import { expect, test } from "vitest";
import { toSkill, type SkillRow } from "./skill";

function row(overrides: Partial<SkillRow> = {}): SkillRow {
  return {
    _id: "skill1" as SkillRow["_id"],
    _creationTime: 0,
    name: "Code Reviewer",
    slug: "code-reviewer",
    description: "Reviews code before merge",
    category: "Testing",
    content: "# Review",
    visibility: "public",
    authorId: "user1" as SkillRow["authorId"],
    views: 3,
    downloads: 2,
    stars: 1,
    createdAt: Date.UTC(2026, 5, 13),
    updatedAt: Date.UTC(2026, 5, 14),
    author: { _id: "user1" as SkillRow["authorId"], name: "Ada", image: undefined, username: "ada-ser1" },
    ...overrides,
  };
}

test("maps a row to the skill the app shows", () => {
  expect(toSkill(row(), new Set(["skill1"]))).toEqual({
    id: "skill1",
    slug: "code-reviewer",
    name: "Code Reviewer",
    description: "Reviews code before merge",
    category: "Testing",
    tags: [],
    content: "# Review",
    subSkills: [],
    visibility: "public",
    views: 3,
    downloads: 2,
    stars: 1,
    hasStarred: true,
    createdAt: "2026-06-13T00:00:00.000Z",
    updatedAt: "2026-06-14T00:00:00.000Z",
    authorId: "user1",
    authorName: "Ada",
    authorUsername: "ada-ser1",
    authorAvatarUrl: undefined,
  });
});

test("not starred unless the viewer starred it", () => {
  expect(toSkill(row()).hasStarred).toBe(false);
});

test("a deleted author shows as Deleted user", () => {
  expect(toSkill(row({ author: null }))).toMatchObject({ authorName: "Deleted user", authorUsername: undefined });
});
