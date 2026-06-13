import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    image: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_sessionToken", ["sessionToken"]),

  skills: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
    content: v.string(),
    visibility: v.union(v.literal("public"), v.literal("private")),
    authorId: v.id("users"),
    views: v.number(),
    downloads: v.number(),
    stars: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_authorId", ["authorId"])
    .index("by_visibility", ["visibility"]),

  likes: defineTable({
    userId: v.id("users"),
    skillId: v.id("skills"),
  })
    .index("by_userId_and_skillId", ["userId", "skillId"])
    .index("by_skillId", ["skillId"]),
});
