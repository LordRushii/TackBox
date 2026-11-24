// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";
import { consume, isSpent, RATE_LIMITS, reset } from "./rateLimits";
import { modules } from "./test.setup";

const SECRET = "s".repeat(32);

beforeEach(() => {
  vi.stubEnv("CONVEX_SERVER_SECRET", SECRET);
  vi.useFakeTimers({ toFake: ["Date"] });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("rate limits", () => {
  test("a key gets its budget, then is refused until the window ends", async () => {
    const t = convexTest(schema, modules);
    const { max, windowMs } = RATE_LIMITS.signup;

    const results = await t.run(async (ctx) => {
      const out = [];
      for (let i = 0; i <= max; i++) out.push(await consume(ctx, "signup", "client-a"));
      return out;
    });
    expect(results).toEqual([...Array(max).fill(true), false]);
    expect(await t.run((ctx) => consume(ctx, "signup", "client-b"))).toBe(true);

    vi.advanceTimersByTime(windowMs + 1);
    expect(await t.run((ctx) => consume(ctx, "signup", "client-a"))).toBe(true);
  });

  test("isSpent looks without using any budget, and reset gives it all back", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      for (let i = 0; i < RATE_LIMITS["login-fail"].max; i++) await consume(ctx, "login-fail", "pair");
    });
    expect(await t.run((ctx) => isSpent(ctx, "login-fail", "pair"))).toBe(true);
    expect(await t.run((ctx) => isSpent(ctx, "login-fail", "other"))).toBe(false);

    await t.run((ctx) => reset(ctx, "login-fail", "pair"));
    expect(await t.run((ctx) => isSpent(ctx, "login-fail", "pair"))).toBe(false);
  });

  test("the same key under two limits is two budgets", async () => {
    const t = convexTest(schema, modules);
    expect(await t.run((ctx) => consume(ctx, "views", "skill:viewer"))).toBe(true);
    expect(await t.run((ctx) => consume(ctx, "downloads", "skill:viewer"))).toBe(true);
    expect(await t.run((ctx) => consume(ctx, "views", "skill:viewer"))).toBe(false);
  });

  test("cleanup deletes only expired windows", async () => {
    const t = convexTest(schema, modules);
    await t.run((ctx) => consume(ctx, "login", "old"));
    vi.advanceTimersByTime(RATE_LIMITS.login.windowMs + 1);
    await t.run((ctx) => consume(ctx, "login", "new"));

    expect(await t.mutation(internal.rateLimits.cleanup, {})).toBe(1);
    const keys = await t.run(async (ctx) => (await ctx.db.query("rateLimits").collect()).map((r) => r.key));
    expect(keys).toEqual(["login:new"]);
  });
});

describe("the limits as the app hits them", () => {
  const keys = { secret: SECRET, clientKey: "client", pairKey: "client+ada" };

  test("ten failed logins lock that email from that client, and a success clears them", async () => {
    const t = convexTest(schema, modules);
    const begin = () => t.mutation(api.users.beginLogin, { ...keys, email: "ada@example.com" });

    for (let i = 0; i < RATE_LIMITS["login-fail"].max; i++) {
      expect((await begin()).limited).toBe(false);
      await t.mutation(api.users.recordLoginFailure, keys);
    }
    expect((await begin()).limited).toBe(true);

    await t.mutation(api.users.clearLoginFailures, keys);
    expect((await begin()).limited).toBe(false);
  });

  test("the sixth sign-up in an hour is refused, and the count survives the refusal", async () => {
    const t = convexTest(schema, modules);
    const signUp = (n: number) =>
      t.mutation(api.users.createUser, {
        secret: SECRET,
        clientKey: "client",
        name: `User ${n}`,
        email: `user${n}@example.com`,
        passwordHash: "hash",
      });

    for (let n = 1; n <= RATE_LIMITS.signup.max; n++) expect((await signUp(n)).ok).toBe(true);
    expect(await signUp(99)).toEqual({ ok: false, reason: "limited" });
    expect(await signUp(100)).toEqual({ ok: false, reason: "limited" });
  });

  test("a viewer's views count once a day", async () => {
    const t = convexTest(schema, modules);
    const id = await t.run(async (ctx) => {
      const authorId = await ctx.db.insert("users", { name: "Ada", email: "ada@example.com", createdAt: Date.now() });
      return await ctx.db.insert("skills", {
        name: "Code Reviewer",
        slug: "code-reviewer",
        description: "",
        category: "Backend",
        content: "",
        visibility: "public",
        authorId,
        views: 0,
        downloads: 0,
        stars: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });
    const view = (viewerKey: string) => t.mutation(api.skills.incrementViews, { secret: SECRET, id, viewerKey });

    expect([await view("ada"), await view("ada"), await view("bob")]).toEqual([true, false, true]);
    vi.advanceTimersByTime(RATE_LIMITS.views.windowMs + 1);
    expect(await view("ada")).toBe(true);
    expect((await t.run((ctx) => ctx.db.get(id)))?.views).toBe(3);
  });
});
