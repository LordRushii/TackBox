import { mutation, MutationCtx, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import {
  assertServerSecret,
  checkLength,
  LIMITS,
  publicAuthor,
  requireUser,
  userFromSession,
} from "./helpers";
import { slugCandidates } from "../features/skills/slug";
import { consume } from "./rateLimits";

const subSkillValidator = v.array(
  v.object({
    title: v.string(),
    content: v.string(),
  }),
);

type SkillFields = {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  content?: string;
  subSkills?: { title: string; content: string }[];
};

function validateSkillFields(f: SkillFields) {
  checkLength(f.name, LIMITS.skillName, "Name");
  checkLength(f.description, LIMITS.description, "Description");
  checkLength(f.category, LIMITS.category, "Category");
  checkLength(f.content, LIMITS.content, "Content");
  if (f.name !== undefined && !f.name.trim()) throw new Error("Name is required");
  if (f.tags) {
    if (f.tags.length > LIMITS.tags) throw new Error(`At most ${LIMITS.tags} tags`);
    f.tags.forEach((t) => checkLength(t, LIMITS.tag, "Tag"));
  }
  if (f.subSkills) {
    if (f.subSkills.length > LIMITS.subSkills) throw new Error(`At most ${LIMITS.subSkills} sub-skills`);
    for (const s of f.subSkills) {
      checkLength(s.title, LIMITS.subSkillTitle, "Sub-skill title");
      checkLength(s.content, LIMITS.content, "Sub-skill content");
    }
  }
}

function canRead(skill: Doc<"skills">, viewer: Doc<"users"> | null) {
  return skill.visibility === "public" || (viewer !== null && skill.authorId === viewer._id);
}

/** The first free slug for `name`: code-reviewer, then code-reviewer-2, code-reviewer-3, … */
async function claimSlug(ctx: MutationCtx, name: string): Promise<string> {
  for (const slug of slugCandidates(name)) {
    const holder = await ctx.db
      .query("skills")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!holder) return slug;
  }
  throw new Error("unreachable");
}

/** A public skill for anyone, or a private skill for its owner only. */
export const getSkill = query({
  args: { id: v.id("skills"), sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.id);
    if (!skill) return null;
    const viewer = await userFromSession(ctx, args.sessionToken);
    if (!canRead(skill, viewer)) return null;
    const author = await ctx.db.get(skill.authorId);
    return { ...skill, author: publicAuthor(author) };
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
      skillsWithAuthors.push({ ...skill, author: publicAuthor(author) });
    }
    return skillsWithAuthors;
  },
});

/** The signed-in user's own skills, public and private. */
export const getMySkills = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await userFromSession(ctx, args.sessionToken);
    if (!user) return [];
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_authorId", (q) => q.eq("authorId", user._id))
      .order("desc")
      .take(100);
    const author = publicAuthor(user);
    return skills.map((skill) => ({ ...skill, author }));
  },
});

export const createSkill = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
    content: v.string(),
    subSkills: v.optional(subSkillValidator),
    visibility: v.union(v.literal("public"), v.literal("private")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    const { sessionToken: _, ...fields } = args;
    const name = fields.name.trim();
    validateSkillFields({ ...fields, name });

    const now = Date.now();
    return await ctx.db.insert("skills", {
      name,
      slug: await claimSlug(ctx, name),
      description: fields.description,
      category: fields.category,
      tags: fields.tags || [],
      content: fields.content,
      subSkills: fields.subSkills || [],
      visibility: fields.visibility,
      authorId: user._id,
      views: 0,
      downloads: 0,
      stars: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Owner only. Counters (views, downloads, stars) and the slug can't be set through here. */
export const updateSkill = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("skills"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    content: v.optional(v.string()),
    subSkills: v.optional(subSkillValidator),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    const skill = await ctx.db.get(args.id);
    if (!skill) throw new Error("Skill not found");
    if (skill.authorId !== user._id) {
      throw new Error("Unauthorized: Only the owner can edit this skill");
    }

    const { id, sessionToken: _, name: rawName, ...updates } = args;
    const name = rawName?.trim();
    validateSkillFields({ ...updates, name });
    await ctx.db.patch(id, {
      ...updates,
      // A rename changes only the name; the slug, and so the registry path, stays
      ...(name !== undefined && { name }),
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const deleteSkill = mutation({
  args: { sessionToken: v.string(), id: v.id("skills") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    const skill = await ctx.db.get(args.id);
    if (!skill) throw new Error("Skill not found");
    if (skill.authorId !== user._id) {
      throw new Error("Unauthorized: Only the owner can delete this skill");
    }

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_skillId", (q) => q.eq("skillId", args.id))
      .collect();
    for (const like of likes) await ctx.db.delete(like._id);

    await ctx.db.delete(args.id);
    return true;
  },
});

/**
 * Server only. A view or download counts once per viewer per skill per day, and only on
 * public skills, so refreshing or scripting the button can't inflate the numbers.
 * `viewerKey` is an HMAC of the signed-in user or client IP, computed by the Next.js server.
 */
async function countOnce(
  ctx: MutationCtx,
  args: { secret: string; id: Id<"skills">; viewerKey: string },
  field: "views" | "downloads",
) {
  assertServerSecret(args.secret);
  const skill = await ctx.db.get(args.id);
  if (!skill || skill.visibility !== "public") return false;
  if (!(await consume(ctx, field, `${args.id}:${args.viewerKey}`))) return false;
  await ctx.db.patch(args.id, { [field]: (skill[field] || 0) + 1 });
  return true;
}

const counterArgs = { secret: v.string(), id: v.id("skills"), viewerKey: v.string() };

export const incrementViews = mutation({
  args: counterArgs,
  handler: (ctx, args) => countOnce(ctx, args, "views"),
});

export const incrementDownloads = mutation({
  args: counterArgs,
  handler: (ctx, args) => countOnce(ctx, args, "downloads"),
});

export const toggleStar = mutation({
  args: { sessionToken: v.string(), skillId: v.id("skills") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    const skill = await ctx.db.get(args.skillId);
    if (!skill || !canRead(skill, user)) throw new Error("Skill not found");

    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_userId_and_skillId", (q) =>
        q.eq("userId", user._id).eq("skillId", args.skillId),
      )
      .unique();

    const currentStars = skill.stars || 0;

    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.skillId, { stars: Math.max(0, currentStars - 1) });
      return { hasStarred: false };
    }
    await ctx.db.insert("likes", { userId: user._id, skillId: args.skillId });
    await ctx.db.patch(args.skillId, { stars: currentStars + 1 });
    return { hasStarred: true };
  },
});

export const getMyLikedSkillIds = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await userFromSession(ctx, args.sessionToken);
    if (!user) return [];
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_userId_and_skillId", (q) => q.eq("userId", user._id))
      .collect();
    return likes.map((like) => like.skillId);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const publicSkills = await ctx.db
      .query("skills")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .collect();

    const totalSkills = publicSkills.length;
    const totalDownloads = publicSkills.reduce((sum, s) => sum + (s.downloads || 0), 0);

    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;

    return { totalSkills, totalUsers, totalDownloads };
  },
});
