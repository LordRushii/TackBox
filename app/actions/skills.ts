"use server";

import { z } from "zod";
import { after } from "next/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convex, serverSecret } from "@/lib/convex";
import { viewerKey } from "@/lib/rate-keys";
import { getSessionCookie } from "@/lib/cookies";
import { getSessionUser, requireSessionToken } from "@/lib/auth";
import { publishSkillToGitHub } from "@/lib/github-publish";
import { Skill } from "../skills/skills";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Generate a URL-safe slug from a skill name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/** Publishes after the response is sent, so a slow GitHub call never blocks the user. */
function publishInBackground(skill: {
  _id: string;
  title: string;
  description: string;
  content: string;
}, author: string) {
  after(() =>
    publishSkillToGitHub({
      id: skill._id,
      slug: generateSlug(skill.title),
      name: skill.title,
      description: skill.description,
      content: skill.content || "",
      author,
    }).catch((error) => console.error("[GitHub Publish] Error:", error)),
  );
}

type DbSkill = {
  _id: string;
  title: string;
  description: string;
  category: string;
  createdAt: number;
  updatedAt: number;
  content: string;
  subSkills?: { title: string; content: string }[];
  tags?: string[];
  visibility: "public" | "private";
  views: number;
  downloads: number;
  stars: number;
  authorId: string;
  author: { _id: string; name: string; image?: string; username: string } | null;
};

function mapDbSkillToFrontend(dbSkill: DbSkill, likedSkillIds?: Set<string>): Skill {
  const author = dbSkill.author;
  return {
    id: dbSkill._id,
    name: dbSkill.title, // DB title maps to frontend name
    description: dbSkill.description,
    category: dbSkill.category,
    createdAt: new Date(dbSkill.createdAt).toISOString(),
    updatedAt: new Date(dbSkill.updatedAt).toISOString(),
    content: dbSkill.content,
    subSkills: dbSkill.subSkills || [],
    tags: dbSkill.tags || [],
    visibility: dbSkill.visibility,
    views: dbSkill.views || 0,
    downloads: dbSkill.downloads || 0,
    stars: dbSkill.stars || 0,
    hasStarred: likedSkillIds ? likedSkillIds.has(dbSkill._id) : false,
    // Version, license, role and bio aren't stored, so they're left out rather than invented
    authorName: author?.name || "Deleted user",
    authorUsername: author?.username,
    authorAvatarUrl: author?.image || undefined,
    authorId: dbSkill.authorId,
  } as Skill;
}

async function likedIds(sessionToken: string | undefined) {
  if (!sessionToken) return new Set<string>();
  const likes = await convex.query(api.skills.getMyLikedSkillIds, { sessionToken });
  return new Set<string>(likes);
}

const subSkillsSchema = z
  .array(z.object({ title: z.string(), content: z.string() }).strict())
  .max(20);

const skillUpdateSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    content: z.string(),
    subSkills: subSkillsSchema,
    visibility: z.enum(["public", "private"]),
  })
  .partial();

export async function fetchSkills(): Promise<Skill[]> {
  try {
    const dbSkills = await convex.query(api.skills.getPublicSkills);
    const liked = await likedIds(await getSessionCookie());
    return dbSkills.map((s) => mapDbSkillToFrontend(s, liked));
  } catch (err) {
    console.error("Failed to fetch public skills:", err);
    return [];
  }
}

export async function fetchUserSkills(): Promise<Skill[]> {
  try {
    const sessionToken = await getSessionCookie();
    if (!sessionToken) return [];
    const dbSkills = await convex.query(api.skills.getMySkills, { sessionToken });
    const liked = await likedIds(sessionToken);
    return dbSkills.map((s) => mapDbSkillToFrontend(s, liked));
  } catch (err) {
    console.error("Failed to fetch user skills:", err);
    return [];
  }
}

export async function fetchSkillById(id: string): Promise<Skill | null> {
  try {
    const sessionToken = await getSessionCookie();
    const dbSkill = await convex.query(api.skills.getSkill, {
      id: id as Id<"skills">,
      sessionToken,
    });
    if (!dbSkill) return null;
    return mapDbSkillToFrontend(dbSkill, await likedIds(sessionToken));
  } catch (err) {
    console.error(`Failed to fetch skill with ID ${id}:`, err);
    return null;
  }
}

export async function createSkill(prevState: unknown, formData: FormData) {
  const user = await getSessionUser();
  const sessionToken = await getSessionCookie();
  if (!user || !sessionToken) {
    return { message: "You must be logged in to create skills." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const category = String(formData.get("category") ?? "");
  const visibility = formData.get("visibility") === "private" ? "private" : "public";
  const content = String(formData.get("mainContent") ?? "");

  let subSkills: { title: string; content: string }[] = [];
  const subSkillsJson = formData.get("subSkillsData");
  if (typeof subSkillsJson === "string" && subSkillsJson) {
    try {
      const parsed = subSkillsSchema.safeParse(JSON.parse(subSkillsJson));
      if (!parsed.success) return { message: "Invalid sub-skills" };
      subSkills = parsed.data;
    } catch {
      return { message: "Invalid sub-skills" };
    }
  }

  if (!name || !description || !category) {
    return { message: "Please fill in all fields" };
  }

  try {
    const id = await convex.mutation(api.skills.createSkill, {
      sessionToken,
      title: name,
      description,
      category,
      tags: [category],
      content,
      subSkills,
      visibility,
    });

    if (visibility === "public") {
      publishInBackground({ _id: id, title: name, description, content }, user.name);
    }
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Failed to create skill" };
  }

  revalidatePath("/skills");
  revalidatePath("/my-skills");
  redirect("/my-skills");
}

export async function updateSkillAction(id: string, skillData: Partial<Skill>) {
  const sessionToken = await requireSessionToken();
  const user = await getSessionUser();
  if (!user) throw new Error("You must be logged in to update skills.");

  // Only editable fields pass; counters like views and downloads are ignored
  const parsed = skillUpdateSchema.safeParse({
    name: skillData.name,
    description: skillData.description,
    category: skillData.category,
    tags: skillData.tags,
    content: skillData.content,
    subSkills: skillData.subSkills,
    visibility: skillData.visibility,
  });
  if (!parsed.success) throw new Error("Invalid skill data");
  const { name, ...rest } = parsed.data;
  const updates = Object.fromEntries(
    Object.entries({ title: name, ...rest }).filter(([, value]) => value !== undefined),
  );

  await convex.mutation(api.skills.updateSkill, {
    sessionToken,
    id: id as Id<"skills">,
    ...updates,
  });

  const updatedSkill = await convex.query(api.skills.getSkill, {
    id: id as Id<"skills">,
    sessionToken,
  });
  if (updatedSkill && updatedSkill.visibility === "public") {
    publishInBackground(updatedSkill, user.name);
  }

  revalidatePath("/skills");
  revalidatePath(`/skills/${id}`);
  revalidatePath("/my-skills");
}

export async function deleteSkillAction(id: string) {
  const sessionToken = await requireSessionToken();

  await convex.mutation(api.skills.deleteSkill, {
    sessionToken,
    id: id as Id<"skills">,
  });

  revalidatePath("/skills");
  revalidatePath("/my-skills");
}

async function counterArgs(id: string) {
  const user = await getSessionUser();
  return {
    secret: serverSecret(),
    id: id as Id<"skills">,
    viewerKey: await viewerKey(user?.id),
  };
}

export async function incrementViewsAction(id: string) {
  try {
    await convex.mutation(api.skills.incrementViews, await counterArgs(id));
  } catch (e) {
    console.error("Failed to increment views:", e);
  }
}

export async function incrementDownloadsAction(id: string) {
  try {
    await convex.mutation(api.skills.incrementDownloads, await counterArgs(id));
  } catch (e) {
    console.error("Failed to increment downloads:", e);
  }
}

export async function toggleStarAction(id: string) {
  const sessionToken = await requireSessionToken();

  const result = await convex.mutation(api.skills.toggleStar, {
    sessionToken,
    skillId: id as Id<"skills">,
  });

  revalidatePath("/skills");
  revalidatePath("/my-skills");
  return result;
}

export async function fetchStatsAction(): Promise<{
  totalSkills: number;
  totalUsers: number;
  totalDownloads: number;
} | null> {
  try {
    return await convex.query(api.skills.getStats);
  } catch (err) {
    // Return null rather than zeros so the page can hide stats it doesn't have
    console.error("Failed to fetch stats:", err);
    return null;
  }
}
