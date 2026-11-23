// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { modules } from "./test.setup";

const fields = {
  description: "Reviews code before merge",
  category: "Testing",
  content: "# Review",
  visibility: "public" as const,
};

async function setup() {
  const t = convexTest(schema, modules);
  const sessionToken = "session-ada";
  const authorId = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", { name: "Ada", email: "ada@example.com", createdAt: Date.now() });
    await ctx.db.insert("sessions", { userId, sessionToken, expiresAt: Date.now() + 60_000, createdAt: Date.now() });
    return userId;
  });
  return {
    t,
    sessionToken,
    authorId,
    create: (name: string) => t.mutation(api.skills.createSkill, { sessionToken, name, ...fields }),
    read: (id: Id<"skills">) => t.query(api.skills.getSkill, { id, sessionToken }),
  };
}

describe("slugs", () => {
  test("a new skill gets a slug from its name", async () => {
    const { create, read } = await setup();
    expect(await read(await create("Code Reviewer"))).toMatchObject({
      name: "Code Reviewer",
      slug: "code-reviewer",
    });
  });

  test("a name that maps to a taken slug gets the next free one", async () => {
    const { create, read } = await setup();
    await create("Code Reviewer");
    const second = await read(await create("code reviewer!"));
    const third = await read(await create("Code   Reviewer"));
    expect([second?.slug, third?.slug]).toEqual(["code-reviewer-2", "code-reviewer-3"]);
  });

  test("renaming changes the name but keeps the slug", async () => {
    const { t, sessionToken, create, read } = await setup();
    const id = await create("Code Reviewer");
    await t.mutation(api.skills.updateSkill, { sessionToken, id, name: "PR Reviewer" });
    expect(await read(id)).toMatchObject({ name: "PR Reviewer", slug: "code-reviewer" });
  });

  test("a skill needs a name", async () => {
    const { t, sessionToken } = await setup();
    await expect(t.mutation(api.skills.createSkill, { sessionToken, ...fields })).rejects.toThrow("Name is required");
  });
});

describe("callers still sending the legacy title", () => {
  test("title works like name, and title keeps mirroring name", async () => {
    const { t, sessionToken, read } = await setup();
    const id = await t.mutation(api.skills.createSkill, { sessionToken, title: "Code Reviewer", ...fields });
    await t.mutation(api.skills.updateSkill, { sessionToken, id, title: "PR Reviewer" });
    expect(await read(id)).toMatchObject({ name: "PR Reviewer", title: "PR Reviewer", slug: "code-reviewer" });
  });
});

describe("backfillNamesAndSlugs", () => {
  test("gives legacy rows a name and slug, and the older skill keeps the plain slug", async () => {
    const { t, authorId, read } = await setup();
    const [older, newer] = await t.run(async (ctx) => {
      const legacy = (title: string) =>
        ctx.db.insert("skills", { title, ...fields, authorId, views: 0, downloads: 0, stars: 0, createdAt: 1, updatedAt: 1 });
      return [await legacy("Code Reviewer"), await legacy("Code Reviewer")];
    });

    expect(await t.mutation(internal.skills.backfillNamesAndSlugs, {})).toEqual({ updated: 2, total: 2 });
    expect(await read(older)).toMatchObject({ name: "Code Reviewer", slug: "code-reviewer" });
    expect(await read(newer)).toMatchObject({ name: "Code Reviewer", slug: "code-reviewer-2" });
  });

  test("leaves migrated rows alone, so it is safe to re-run", async () => {
    const { t, create } = await setup();
    await create("Code Reviewer");
    expect(await t.mutation(internal.skills.backfillNamesAndSlugs, {})).toEqual({ updated: 0, total: 1 });
  });
});
