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
    subSkills: v.optional(
      v.array(
        v.object({
          title: v.string(),
          content: v.string(),
        })
      )
    ),
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
      subSkills: args.subSkills || [],
      visibility: args.visibility,
      authorId: args.authorId,
      views: 0,
      downloads: 0,
      stars: 0,
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
    subSkills: v.optional(
      v.array(
        v.object({
          title: v.string(),
          content: v.string(),
        })
      )
    ),
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

    const { id, callerId: _, ...updates } = args;
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

export const toggleStar = mutation({
  args: {
    skillId: v.id("skills"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_userId_and_skillId", (q) =>
        q.eq("userId", args.userId).eq("skillId", args.skillId)
      )
      .unique();

    const skill = await ctx.db.get(args.skillId);
    if (!skill) throw new Error("Skill not found");

    const currentStars = skill.stars || 0;

    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.skillId, { stars: Math.max(0, currentStars - 1) });
      return { hasStarred: false };
    } else {
      await ctx.db.insert("likes", {
        userId: args.userId,
        skillId: args.skillId,
      });
      await ctx.db.patch(args.skillId, { stars: currentStars + 1 });
      return { hasStarred: true };
    }
  },
});

export const getUserLikedSkillIds = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_userId_and_skillId", (q) => q.eq("userId", args.userId))
      .collect();
    
    return likes.map(like => like.skillId);
  },
});
