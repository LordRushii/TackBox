"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getSessionUser } from "@/lib/auth";
import { Skill, SubSkill } from "../skills/skills";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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

/**
 * Publish skill to GitHub in the background (non-blocking)
 */
async function publishToGitHub(skill: {
  slug: string;
  name: string;
  description?: string;
  content: string;
  author?: string;
}) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/skills/publish-to-github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ skill }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("[GitHub Publish] Success:", data);
    } else {
      console.error("[GitHub Publish] Failed:", data);
    }
  } catch (error) {
    console.error("[GitHub Publish] Error:", error);
  }
}

function mapDbSkillToFrontend(
  dbSkill: any,
  likedSkillIds?: Set<string>,
): Skill {
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
    saves: 0,
    stars: dbSkill.stars || 0,
    hasStarred: likedSkillIds ? likedSkillIds.has(dbSkill._id) : false,
    version: "1.0.0",
    license: "MIT",
    authorName: author?.name || "Deleted User",
    authorUsername: author ? author.email.split("@")[0] : "deleted",
    authorRole: "Member",
    authorBio: "Developer, systems architect, and automation enthusiast.",
    authorAvatarColor: "from-pink-500 to-rose-500",
    authorAvatarUrl: author?.image || undefined,
    authorId: dbSkill.authorId,
  } as any;
}

export async function fetchSkills(): Promise<Skill[]> {
  try {
    const dbSkills = await convex.query(api.skills.getPublicSkills);
    const user = await getSessionUser();
    let likedSkillIds = new Set<string>();
    if (user) {
      const likes = await convex.query(api.skills.getUserLikedSkillIds, {
        userId: user.id,
      });
      likedSkillIds = new Set(likes);
    }
    return dbSkills.map((s) => mapDbSkillToFrontend(s, likedSkillIds));
  } catch (err) {
    console.error("Failed to fetch public skills:", err);
    return [];
  }
}

export async function fetchUserSkills(): Promise<Skill[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];

    const dbSkills = await convex.query(api.skills.getUserSkills, {
      userId: user.id,
    });
    const likes = await convex.query(api.skills.getUserLikedSkillIds, {
      userId: user.id,
    });
    const likedSkillIds = new Set(likes);

    return dbSkills.map((s) => mapDbSkillToFrontend(s, likedSkillIds));
  } catch (err) {
    console.error("Failed to fetch user skills:", err);
    return [];
  }
}

export async function fetchSkillById(id: string): Promise<Skill | null> {
  try {
    const dbSkill = await convex.query(api.skills.getSkill, {
      id: id as Id<"skills">,
    });
    if (!dbSkill) return null;
    const user = await getSessionUser();
    let likedSkillIds = new Set<string>();
    if (user) {
      const likes = await convex.query(api.skills.getUserLikedSkillIds, {
        userId: user.id,
      });
      likedSkillIds = new Set(likes);
    }
    return mapDbSkillToFrontend(dbSkill, likedSkillIds);
  } catch (err) {
    console.error(`Failed to fetch skill with ID ${id}:`, err);
    return null;
  }
}

export async function createSkill(prevState: any, formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    return { message: "You must be logged in to create skills." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const visibility =
    (formData.get("visibility") as "public" | "private") || "public";
  const content = formData.get("mainContent") as string;

  // Parse sub-skills from FormData (JSON encoded)
  let subSkills: SubSkill[] = [];
  const subSkillsJson = formData.get("subSkillsData") as string;
  if (subSkillsJson) {
    try {
      subSkills = JSON.parse(subSkillsJson);
    } catch {
      subSkills = [];
    }
  }

  if (!name || !description || !category) {
    return { message: "Please fill in all fields" };
  }

  try {
    // Save to database first
    await convex.mutation(api.skills.createSkill, {
      title: name,
      description,
      category,
      tags: [category],
      content: content || "",
      subSkills,
      visibility,
      authorId: user.id,
    });

    // Only publish to GitHub if the skill is public
    if (visibility === "public") {
      // Fire-and-forget GitHub publish (non-blocking)
      // This runs asynchronously and won't block the user flow
      publishToGitHub({
        slug: generateSlug(name),
        name,
        description,
        content: content || "",
        author: user.name || user.email?.split("@")[0] || "Anonymous",
      }).catch((error) => {
        // Silently log errors - don't affect main flow
        console.error("[createSkill] GitHub publish error (ignored):", error);
      });
    }
  } catch (err: any) {
    return { message: err.message || "Failed to create skill" };
  }

  revalidatePath("/skills");
  revalidatePath("/my-skills");
  redirect("/my-skills");
}

export async function updateSkillAction(id: string, skillData: Partial<Skill>) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("You must be logged in to update skills.");
  }

  // Map updates (especially frontend name to DB title)
  const updates: any = {
    id: id as Id<"skills">,
    callerId: user.id,
  };

  if (skillData.name !== undefined) updates.title = skillData.name;
  if (skillData.description !== undefined)
    updates.description = skillData.description;
  if (skillData.category !== undefined) updates.category = skillData.category;
  if (skillData.tags !== undefined) updates.tags = skillData.tags;
  if (skillData.content !== undefined) updates.content = skillData.content;
  if (skillData.subSkills !== undefined)
    updates.subSkills = skillData.subSkills;
  if (skillData.visibility !== undefined)
    updates.visibility = skillData.visibility;
  if (skillData.views !== undefined) updates.views = skillData.views;
  if (skillData.downloads !== undefined)
    updates.downloads = skillData.downloads;

  // Update in database first
  await convex.mutation(api.skills.updateSkill, updates);

  // Fetch the updated skill to get complete data for GitHub publish
  const updatedSkill = await convex.query(api.skills.getSkill, {
    id: id as Id<"skills">,
  });

  // Only publish to GitHub if the skill is public
  if (updatedSkill && updatedSkill.visibility === "public") {
    // Fire-and-forget GitHub publish (non-blocking)
    publishToGitHub({
      slug: generateSlug(updatedSkill.title),
      name: updatedSkill.title,
      description: updatedSkill.description,
      content: updatedSkill.content || "",
      author: user.name || user.email?.split("@")[0] || "Anonymous",
    }).catch((error) => {
      // Silently log errors - don't affect main flow
      console.error("[updateSkill] GitHub publish error (ignored):", error);
    });
  }

  revalidatePath("/skills");
  revalidatePath(`/skills/${id}`);
  revalidatePath("/my-skills");
}

export async function deleteSkillAction(id: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("You must be logged in to delete skills.");
  }

  await convex.mutation(api.skills.deleteSkill, {
    id: id as Id<"skills">,
    callerId: user.id,
  });

  revalidatePath("/skills");
  revalidatePath("/my-skills");
}

export async function incrementViewsAction(id: string) {
  try {
    await convex.mutation(api.skills.incrementViews, {
      id: id as Id<"skills">,
    });
  } catch (e) {
    console.error("Failed to increment views:", e);
  }
}

export async function incrementDownloadsAction(id: string) {
  try {
    await convex.mutation(api.skills.incrementDownloads, {
      id: id as Id<"skills">,
    });
  } catch (e) {
    console.error("Failed to increment downloads:", e);
  }
}

export async function toggleStarAction(id: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("You must be logged in to like skills.");
  }

  const result = await convex.mutation(api.skills.toggleStar, {
    skillId: id as Id<"skills">,
    userId: user.id,
  });

  revalidatePath("/skills");
  revalidatePath("/my-skills");
  return result;
}
