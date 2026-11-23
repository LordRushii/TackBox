import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.optional(v.string()),
    image: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_sessionToken", ["sessionToken"])
    .index("by_userId", ["userId"]),

  skills: defineTable({
    name: v.string(),
    // Registry path skills/<slug>/SKILL.md: assigned once at creation, unique, never changed
    slug: v.string(),
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
    views: v.number(),
    downloads: v.number(),
    stars: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_authorId", ["authorId"])
    .index("by_visibility", ["visibility"])
    .index("by_slug", ["slug"]),

  // Fixed-window counters for login, signup and view/download dedupe.
  // Keys are hashed by the Next.js server, so no raw IPs or emails are stored.
  rateLimits: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
    expiresAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_expiresAt", ["expiresAt"]),

  likes: defineTable({
    userId: v.id("users"),
    skillId: v.id("skills"),
  })
    .index("by_userId_and_skillId", ["userId", "skillId"])
    .index("by_skillId", ["skillId"]),
});
