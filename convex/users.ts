import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.optional(v.string()),
    image: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: args.passwordHash,
      image: args.image,
      createdAt: args.createdAt,
    });
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return true;
  },
});
