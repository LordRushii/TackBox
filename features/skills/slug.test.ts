import { describe, expect, test } from "vitest";
import { SLUG_PATTERN, slugCandidates, toSlug } from "./slug";

function firstCandidates(name: string, count: number) {
  const out: string[] = [];
  for (const slug of slugCandidates(name)) {
    out.push(slug);
    if (out.length === count) break;
  }
  return out;
}

describe("toSlug", () => {
  test.each([
    ["Code Reviewer", "code-reviewer"],
    ["  Next.js Launch Kit ", "nextjs-launch-kit"],
    ["C++ tips & tricks!", "c-tips-tricks"],
    ["many   spaces -- and dashes", "many-spaces-and-dashes"],
    ["already-a-slug", "already-a-slug"],
    ["Hello_World", "helloworld"],
    ["🚀", ""],
  ])("%j → %j", (name, slug) => {
    expect(toSlug(name)).toBe(slug);
  });
});

describe("slugCandidates", () => {
  test("starts with the plain slug, then numbers it", () => {
    expect(firstCandidates("Code Reviewer", 3)).toEqual(["code-reviewer", "code-reviewer-2", "code-reviewer-3"]);
  });

  test("a name with no letters or digits still gets a slug", () => {
    expect(firstCandidates("🚀🚀", 2)).toEqual(["skill", "skill-2"]);
  });

  test("every candidate is a path the registry accepts", () => {
    for (const slug of firstCandidates("Hello, World! (v2)", 5)) expect(slug).toMatch(SLUG_PATTERN);
  });
});
