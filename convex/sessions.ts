import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertServerSecret, sessionUser, userFromSession } from "./helpers";

/** Returns the signed-in user for a session token, without sensitive fields. */
export const getSessionUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await userFromSession(ctx, args.sessionToken);
    return user ? sessionUser(user) : null;
  },
});

/** Server only: sessions are created after the Next.js server has verified the login. */
export const createSession = mutation({
  args: {
    secret: v.string(),
    userId: v.id("users"),
    sessionToken: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    assertServerSecret(args.secret);
    if (args.sessionToken.length < 64) throw new Error("Invalid session token");

    // Opportunistically clear this user's expired sessions
    const now = Date.now();
    const expired = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .take(50);
    for (const s of expired) await ctx.db.delete(s._id);

    return await ctx.db.insert("sessions", {
      userId: args.userId,
      sessionToken: args.sessionToken,
      expiresAt: args.expiresAt,
      createdAt: now,
    });
  },
});

/** Logs out: the token itself is the proof of ownership. */
export const deleteSession = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .unique();
    if (session) {
      await ctx.db.delete(session._id);
      return true;
    }
    return false;
  },
});
