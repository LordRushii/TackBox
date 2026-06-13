import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSkill = query({
  args: { id: v.id("skills") },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.id);
    if (!skill) return null;
    const author = await ctx.db.get(skill.authorId);
    return { ...skill, author };
  },
});

export const getPublicSkills = query({
  args: {},
  handler: async (ctx) => {
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .order("desc")
      .take(100);

    const skillsWithAuthors = [];
    for (const skill of skills) {
      const author = await ctx.db.get(skill.authorId);
      skillsWithAuthors.push({ ...skill, author });
    }
    return skillsWithAuthors;
  },
});

export const getUserSkills = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_authorId", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .take(100);

    const skillsWithAuthors = [];
    for (const skill of skills) {
      const author = await ctx.db.get(skill.authorId);
      skillsWithAuthors.push({ ...skill, author });
    }
    return skillsWithAuthors;
  },
});

export const createSkill = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
    content: v.string(),
    visibility: v.union(v.literal("public"), v.literal("private")),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("skills", {
      title: args.title,
      description: args.description,
      category: args.category,
      tags: args.tags || [],
      content: args.content,
      visibility: args.visibility,
      authorId: args.authorId,
      views: 0,
      downloads: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateSkill = mutation({
  args: {
    id: v.id("skills"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    content: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
    views: v.optional(v.number()),
    downloads: v.optional(v.number()),
    callerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.id);
    if (!skill) {
      throw new Error("Skill not found");
    }
    if (skill.authorId !== args.callerId) {
      throw new Error("Unauthorized: Only the owner can edit this skill");
    }

    const { id, callerId, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const deleteSkill = mutation({
  args: {
    id: v.id("skills"),
    callerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.id);
    if (!skill) {
      throw new Error("Skill not found");
    }
    if (skill.authorId !== args.callerId) {
      throw new Error("Unauthorized: Only the owner can delete this skill");
    }
    await ctx.db.delete(args.id);
    return true;
  },
});

export const incrementViews = mutation({
  args: { id: v.id("skills") },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.id);
    if (skill) {
      await ctx.db.patch(args.id, {
        views: (skill.views || 0) + 1,
      });
      return true;
    }
    return false;
  },
});

export const incrementDownloads = mutation({
  args: { id: v.id("skills") },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.id);
    if (skill) {
      await ctx.db.patch(args.id, {
        downloads: (skill.downloads || 0) + 1,
      });
      return true;
    }
    return false;
  },
});
