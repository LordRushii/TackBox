"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getSessionUser } from "@/lib/auth";
import { Skill } from "../skills/skills";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function mapDbSkillToFrontend(dbSkill: any, likedSkillIds?: Set<string>): Skill {
  const author = dbSkill.author;
  return {
    id: dbSkill._id,
    name: dbSkill.title, // DB title maps to frontend name
    description: dbSkill.description,
    category: dbSkill.category,
    createdAt: new Date(dbSkill.createdAt).toISOString(),
    updatedAt: new Date(dbSkill.updatedAt).toISOString(),
    content: dbSkill.content,
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
    authorId: dbSkill.authorId,
  } as any;
}

export async function fetchSkills(): Promise<Skill[]> {
  try {
    const dbSkills = await convex.query(api.skills.getPublicSkills);
    const user = await getSessionUser();
    let likedSkillIds = new Set<string>();
    if (user) {
      const likes = await convex.query(api.skills.getUserLikedSkillIds, { userId: user.id });
      likedSkillIds = new Set(likes);
    }
    return dbSkills.map(s => mapDbSkillToFrontend(s, likedSkillIds));
  } catch (err) {
    console.error("Failed to fetch public skills:", err);
    return [];
  }
}

export async function fetchUserSkills(): Promise<Skill[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    
    const dbSkills = await convex.query(api.skills.getUserSkills, { userId: user.id });
    const likes = await convex.query(api.skills.getUserLikedSkillIds, { userId: user.id });
    const likedSkillIds = new Set(likes);
    
    return dbSkills.map(s => mapDbSkillToFrontend(s, likedSkillIds));
  } catch (err) {
    console.error("Failed to fetch user skills:", err);
    return [];
  }
}

export async function fetchSkillById(id: string): Promise<Skill | null> {
  try {
    const dbSkill = await convex.query(api.skills.getSkill, { id: id as Id<"skills"> });
    if (!dbSkill) return null;
    const user = await getSessionUser();
    let likedSkillIds = new Set<string>();
    if (user) {
      const likes = await convex.query(api.skills.getUserLikedSkillIds, { userId: user.id });
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
  const visibility = (formData.get("visibility") as "public" | "private") || "public";
  const content = formData.get("subSkills") as string;

  if (!name || !description || !category) {
    return { message: "Please fill in all fields" };
  }

  try {
    await convex.mutation(api.skills.createSkill, {
      title: name,
      description,
      category,
      tags: [category],
      content: content || "",
      visibility,
      authorId: user.id,
    });
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
  if (skillData.description !== undefined) updates.description = skillData.description;
  if (skillData.category !== undefined) updates.category = skillData.category;
  if (skillData.tags !== undefined) updates.tags = skillData.tags;
  if (skillData.content !== undefined) updates.content = skillData.content;
  if (skillData.visibility !== undefined) updates.visibility = skillData.visibility;
  if (skillData.views !== undefined) updates.views = skillData.views;
  if (skillData.downloads !== undefined) updates.downloads = skillData.downloads;

  await convex.mutation(api.skills.updateSkill, updates);

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
    await convex.mutation(api.skills.incrementViews, { id: id as Id<"skills"> });
  } catch (e) {
    console.error("Failed to increment views:", e);
  }
}

export async function incrementDownloadsAction(id: string) {
  try {
    await convex.mutation(api.skills.incrementDownloads, { id: id as Id<"skills"> });
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
