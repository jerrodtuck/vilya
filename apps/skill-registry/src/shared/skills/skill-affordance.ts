// Shared kernel: one wording for "run the skill / copy as fallback" (#254).
// PromptList and skill-detail both import from here so the copy cannot drift.

/** Lead-in before the slash invoke in prompt cards and skill detail. */
export const SKILL_AFFORDANCE_LEAD = "Apply prompt below — or run";

/** Slash invoke for a skill slug (no leading slash on input). */
export function skillInvoke(slug: string): string {
  return `/${slug}`;
}
