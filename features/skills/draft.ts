import type { Skill, SkillEdit } from "./skill";

// An owner's unsaved edit of a skill. It lives outside the form, so previewing the page and
// coming back keeps it.

export type DraftEntry = { id: string; title: string; content: string };

export type SkillDraft = {
  name: string;
  category: string;
  visibility: "public" | "private";
  description: string;
  content: string;
  tags: string[];
  /** The sub-skills, in order */
  entries: DraftEntry[];
};

// Sub-skills written in the editor are titled by position ("Skill 2"), so they are renumbered
// when one before them is removed. Uploaded ones keep their file name.
const POSITIONAL_TITLE = /^Skill \d+$/;

/** The title a sub-skill is shown and saved under, from its position after the main file. */
export function entryLabel(entry: Pick<DraftEntry, "title">, index: number): string {
  return entry.title && !POSITIONAL_TITLE.test(entry.title) ? entry.title : `Skill ${index + 2}`;
}

let nextId = 0;
/** A key for a sub-skill that exists only in the draft. */
export const newEntryId = () => `entry-${++nextId}`;

export function draftFrom(skill: Skill): SkillDraft {
  return {
    name: skill.name,
    category: skill.category,
    visibility: skill.visibility,
    description: skill.description,
    content: skill.content,
    tags: skill.tags,
    entries: skill.subSkills.map((s) => ({ id: newEntryId(), title: s.title, content: s.content })),
  };
}

/** What gets saved: empty sub-skills are dropped and the rest are titled by `entryLabel`. */
export function draftToEdit(draft: SkillDraft): SkillEdit {
  const { entries, ...fields } = draft;
  return {
    ...fields,
    subSkills: entries
      .filter((entry) => entry.content.trim())
      .map((entry, i) => ({ title: entryLabel(entry, i), content: entry.content })),
  };
}

/** Why the draft can't be saved yet, or null. */
export function draftProblem(draft: SkillDraft): string | null {
  if (!draft.name.trim() || !draft.description.trim() || !draft.category) {
    return "Name, category and description are required";
  }
  return null;
}
