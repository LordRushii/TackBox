"use server";

import { addSkill, getSkills, updateSkill, deleteSkill, Skill } from "../skills/skills";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function fetchSkills() {
    return getSkills();
}

export async function createSkill(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const visibility = (formData.get("visibility") as "public" | "private") || "public";
    const content = formData.get("subSkills") as string;

    if (!name || !description || !category) {
        return { message: "Please fill in all fields" };
    }

    const newSkill: Skill = {
        id: Date.now().toString(),
        name,
        description,
        category,
        visibility,
        content: content || "",
        tags: [category],
        views: 0,
        downloads: 0,
        saves: 0,
        stars: 0,
        version: "1.0.0",
        license: "MIT",
        authorName: "Demo User",
        authorUsername: "demouser",
        authorRole: "Member",
        authorBio: "Developer, systems architect, and automation enthusiast.",
        authorAvatarColor: "from-pink-500 to-rose-500",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await addSkill(newSkill);
    revalidatePath("/skills");
    revalidatePath("/my-skills");
    redirect("/my-skills");
}

export async function updateSkillAction(id: string, skillData: Partial<Skill>) {
    await updateSkill(id, skillData);
    revalidatePath("/skills");
    revalidatePath(`/skills/${id}`);
    revalidatePath("/my-skills");
}

export async function deleteSkillAction(id: string) {
    await deleteSkill(id);
    revalidatePath("/skills");
    revalidatePath("/my-skills");
}

