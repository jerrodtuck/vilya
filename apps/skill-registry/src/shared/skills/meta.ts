// Shared kernel: display metadata derived from a skill (category, stack, invocation).
import type { Skill, SkillCategory } from "./types";

export const CATEGORY_ORDER: SkillCategory[] = [
  "process",
  "review",
  "autonomous",
  "recall",
];

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  process: "Process",
  review: "Reviews",
  autonomous: "Autonomous",
  recall: "Recall",
};

export function categorize(slug: string): SkillCategory {
  if (slug.startsWith("crucible")) return "review";
  if (slug === "night-shift") return "autonomous";
  if (slug === "history") return "recall";
  return "process";
}

export function stackOf(slug: string): string {
  if (slug.endsWith("blazor")) return "Blazor / .NET";
  if (slug.endsWith("nextjs")) return "Next.js / React";
  return "any stack";
}

export function invocationOf(skill: Skill): string {
  if (skill.frontmatter["disable-model-invocation"]) return "manual only";
  if (skill.slug === "night-shift") return "scheduler-fired";
  return "model + manual";
}
