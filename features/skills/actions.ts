"use server";

import { z } from "zod";
import { after } from "next/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convex, serverSecret } from "@/lib/convex";
import { viewerKey } from "@/lib/rate-keys";
import { getViewer, requireSessionToken, getSessionToken } from "@/features/auth/server";
import { publishSkillToGitHub } from "@/lib/github-publish";
import { Skill, SkillEdit, SkillRow, toSkill } from "./skill";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Publishes after the response is sent, so a slow GitHub call never blocks the user. */
function publishInBackground(row: SkillRow, author: string) {
  const skill = toSkill(row);
  after(() =>
    publishSkillToGitHub({
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      description: skill.description,
      content: skill.content,
      author,
      createdAt: row.createdAt,
    }).catch((error) => console.error("[GitHub Publish] Error:", error)),
  );
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
    const liked = await likedIds(await getSessionToken());
    return dbSkills.map((s) => toSkill(s, liked));
  } catch (err) {
    console.error("Failed to fetch public skills:", err);
    return [];
  }
}

export async function fetchUserSkills(): Promise<Skill[]> {
  try {
    const sessionToken = await getSessionToken();
    if (!sessionToken) return [];
    const dbSkills = await convex.query(api.skills.getMySkills, { sessionToken });
    const liked = await likedIds(sessionToken);
    return dbSkills.map((s) => toSkill(s, liked));
  } catch (err) {
    console.error("Failed to fetch user skills:", err);
    return [];
  }
}

export async function fetchSkillById(id: string): Promise<Skill | null> {
  try {
    const sessionToken = await getSessionToken();
    const dbSkill = await convex.query(api.skills.getSkill, {
      id: id as Id<"skills">,
      sessionToken,
    });
    if (!dbSkill) return null;
    return toSkill(dbSkill, await likedIds(sessionToken));
  } catch (err) {
    console.error(`Failed to fetch skill with ID ${id}:`, err);
    return null;
  }
}

export async function createSkill(prevState: unknown, formData: FormData) {
  const user = await getViewer();
  const sessionToken = await getSessionToken();
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
      name,
      description,
      category,
      tags: [category],
      content,
      subSkills,
      visibility,
    });

    if (visibility === "public") {
      // Read it back for the slug Convex assigned
      const created = await convex.query(api.skills.getSkill, { id, sessionToken });
      if (created) publishInBackground(created, user.name);
    }
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Failed to create skill" };
  }

  revalidatePath("/skills");
  revalidatePath("/my-skills");
  redirect("/my-skills");
}

export async function updateSkillAction(id: string, edit: SkillEdit) {
  const sessionToken = await requireSessionToken();
  const user = await getViewer();
  if (!user) throw new Error("You must be logged in to update skills.");

  // Only editable fields pass; counters, the slug and anything else are dropped
  const parsed = skillUpdateSchema.safeParse(edit);
  if (!parsed.success) throw new Error("Invalid skill data");
  const updates = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined),
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
  const user = await getViewer();
  return {
    secret: serverSecret(),
    id: id as Id<"skills">,
    viewerKey: await viewerKey(user?.id),
  };
}

/** Counts a view; true when it counted (each viewer counts once a day). */
export async function incrementViewsAction(id: string): Promise<boolean> {
  try {
    return await convex.mutation(api.skills.incrementViews, await counterArgs(id));
  } catch (e) {
    console.error("Failed to increment views:", e);
    return false;
  }
}

/** Counts a download; true when it counted (each viewer counts once a day). */
export async function incrementDownloadsAction(id: string): Promise<boolean> {
  try {
    return await convex.mutation(api.skills.incrementDownloads, await counterArgs(id));
  } catch (e) {
    console.error("Failed to increment downloads:", e);
    return false;
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
