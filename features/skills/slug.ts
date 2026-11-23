// The one rule that turns a skill name into its registry path, skills/<slug>/SKILL.md.
// Convex (which assigns and stores slugs) and the Next.js app both import this file,
// so it must stay free of imports.

/** "Code Reviewer!" → "code-reviewer". Returns "" for a name with no letters or digits. */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Lowercase words joined by single hyphens: the only shape the registry accepts. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Candidate slugs for a new skill, in order: base, base-2, base-3, … Never empty. */
export function* slugCandidates(name: string): Generator<string> {
  const base = toSlug(name) || "skill";
  yield base;
  for (let n = 2; ; n++) yield `${base}-${n}`;
}
