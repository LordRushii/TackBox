import { describe, expect, test } from "vitest";
import { safeRedirect } from "./safe-redirect";

describe("safeRedirect", () => {
  test("keeps paths on this site, with their query and hash", () => {
    expect(safeRedirect("/skills/abc")).toBe("/skills/abc");
    expect(safeRedirect("/skills?category=Design#top")).toBe("/skills?category=Design#top");
  });

  test.each([
    "https://evil.example/phish",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "skills",
    "",
  ])("sends %j to the fallback", (target) => {
    expect(safeRedirect(target)).toBe("/my-skills");
  });

  test("uses the fallback when there is no target", () => {
    expect(safeRedirect(null, "/")).toBe("/");
    expect(safeRedirect(undefined)).toBe("/my-skills");
  });
});
