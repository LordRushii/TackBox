import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertServerSecret, checkImageUrl, checkLength, LIMITS, requireUser, sessionUser } from "./helpers";
import { consume, isSpent, reset } from "./rateLimits";

const loginKeys = {
  secret: v.string(),
  clientKey: v.string(), // HMAC of the client IP
  pairKey: v.string(), // HMAC of the client IP and email
};

/**
 * Server only: counts the attempt, then returns the password hash to verify against,
 * or `limited` when this client is over its budget.
 */
export const beginLogin = mutation({
  args: { ...loginKeys, email: v.string() },
  handler: async (ctx, args) => {
    assertServerSecret(args.secret);

    if (await isSpent(ctx, "login-fail", args.pairKey)) return { limited: true as const };
    if (!(await consume(ctx, "login", args.clientKey))) return { limited: true as const };

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) return { limited: false as const, user: null };

    return {
      limited: false as const,
      user: { ...sessionUser(user), passwordHash: user.passwordHash },
    };
  },
});

export const recordLoginFailure = mutation({
  args: loginKeys,
  handler: async (ctx, args) => {
    assertServerSecret(args.secret);
    await consume(ctx, "login-fail", args.pairKey);
  },
});

export const clearLoginFailures = mutation({
  args: loginKeys,
  handler: async (ctx, args) => {
    assertServerSecret(args.secret);
    await reset(ctx, "login-fail", args.pairKey);
  },
});

/**
 * Server only: creates a password account. Returns a reason instead of throwing,
 * because a throw would roll back the signup counter along with everything else.
 */
export const createUser = mutation({
  args: {
    secret: v.string(),
    clientKey: v.string(),
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    assertServerSecret(args.secret);
    checkLength(args.name, LIMITS.name, "Name");
    checkLength(args.email, LIMITS.email, "Email");

    // Every attempt counts, taken emails included, which caps how fast anyone can
    // probe which addresses have accounts
    if (!(await consume(ctx, "signup", args.clientKey))) {
      return { ok: false as const, reason: "limited" as const };
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) return { ok: false as const, reason: "taken" as const };

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: args.passwordHash,
      createdAt: Date.now(),
    });
    return { ok: true as const, userId };
  },
});

/** Server only: finds or creates the account for a verified OAuth email. */
export const findOrCreateOAuthUser = mutation({
  args: {
    secret: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertServerSecret(args.secret);
    checkLength(args.name, LIMITS.name, "Name");
    checkLength(args.email, LIMITS.email, "Email");
    checkImageUrl(args.image);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      // Don't overwrite an avatar the user uploaded themselves
      if (args.image && !existing.image) {
        await ctx.db.patch(existing._id, { image: args.image });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      image: args.image,
      createdAt: Date.now(),
    });
  },
});

/** Updates the signed-in user's own profile. */
export const updateProfile = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    const name = args.name.trim();
    if (!name) throw new Error("Name is required");
    checkLength(name, LIMITS.name, "Name");
    checkImageUrl(args.image || undefined);

    await ctx.db.patch(user._id, { name, image: args.image || undefined });
    return true;
  },
});
