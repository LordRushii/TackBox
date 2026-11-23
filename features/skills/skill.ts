import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";

/** A skill row as the Convex skill queries return it, author attached. */
export type SkillRow = NonNullable<FunctionReturnType<typeof api.skills.getSkill>>;

export type SubSkill = { title: string; content: string };

/** A skill as the app shows it. */
export type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  subSkills: SubSkill[];
  visibility: "public" | "private";
  views: number;
  downloads: number;
  stars: number;
  /** Whether the signed-in viewer has starred it */
  hasStarred: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
};

/** What an owner can change. The slug is fixed once assigned, so it isn't here. */
export type SkillEdit = Partial<
  Pick<Skill, "name" | "description" | "category" | "tags" | "content" | "subSkills" | "visibility">
>;

export function toSkill(row: SkillRow, starredIds: ReadonlySet<string> = new Set()): Skill {
  return {
    id: row._id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    tags: row.tags ?? [],
    content: row.content,
    subSkills: row.subSkills ?? [],
    visibility: row.visibility,
    views: row.views,
    downloads: row.downloads,
    stars: row.stars,
    hasStarred: starredIds.has(row._id),
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    authorId: row.authorId,
    authorName: row.author?.name ?? "Deleted user",
    authorUsername: row.author?.username,
    authorAvatarUrl: row.author?.image,
  };
}
