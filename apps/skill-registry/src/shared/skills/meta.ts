// Shared kernel: display metadata derived from a skill (category, stack, invocation).
import {
  AUTONOMOUS_SLUGS,
  isCrucibleSlug,
  RECALL_SLUGS,
  SKILL_SLUGS,
  STANDING_SESSION_SLUGS,
} from "./invokes";
import { codexSkillInvoke } from "./skill-affordance";
import type { CodexSupport, Skill, SkillCategory } from "./types";

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
  if (isCrucibleSlug(slug)) return "review";
  if (AUTONOMOUS_SLUGS.has(slug)) return "autonomous";
  if (RECALL_SLUGS.has(slug)) return "recall";
  return "process";
}

export function stackOf(slug: string): string {
  if (slug.endsWith("blazor")) return "Blazor / .NET";
  if (slug.endsWith("nextjs")) return "Next.js / React";
  if (slug.endsWith("fastapi")) return "FastAPI / Python";
  if (slug.endsWith("django")) return "Django / Python";
  if (slug.endsWith("-ml")) return "Python ML / Data"; // "-ml", not "ml": bare suffix would match slugs like *html
  return "any stack";
}

export function invocationOf(skill: Skill): string {
  if (skill.frontmatter["disable-model-invocation"]) return "manual only";
  if (skill.slug === SKILL_SLUGS.nightShift) return "scheduler-fired";
  if (STANDING_SESSION_SLUGS.has(skill.slug)) return "standing session";
  return "model + manual";
}

/** Install level; skills are user-level unless frontmatter says otherwise. */
export function levelOf(skill: Skill): "user" | "project" {
  return skill.frontmatter.level === "project" ? "project" : "user";
}

const CODEX_LABELS: Record<CodexSupport, string> = {
  "shared-compatible": "Shared-compatible",
  "codex-adapted": "Codex-adapted",
  "other-host-only": "Other host only",
  "unsupported-deferred": "Unsupported / deferred",
};

/** Normalize untrusted source metadata without inferring host compatibility. */
export function getCodexSkillSupport(skill: Skill): {
  support: CodexSupport | "unclassified";
  label: string;
  notes: string;
  invocation: string | null;
  prerequisites: string;
  canInvoke: boolean;
} {
  const fm = skill.frontmatter;
  const value = fm["codex-support"];
  const support = typeof value === "string" && Object.hasOwn(CODEX_LABELS, value)
    ? value as CodexSupport : "unclassified";
  const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
  const notes = text(fm["codex-notes"]);
  const prerequisites = text(fm["codex-prerequisites"]);
  const invocation = text(fm["codex-invocation"]);
  const supported = support === "shared-compatible" || support === "codex-adapted";
  // Supported commands must actually mention this skill, not a borrowed slash command.
  const command = codexSkillInvoke(skill.slug);
  const validInvocation = invocation === command || invocation.startsWith(command + " ");
  if (support === "unclassified" || !notes || !prerequisites || !invocation || (supported && !validInvocation)) {
    return {
      support: "unclassified", label: "Unclassified / incomplete",
      notes: ["Codex compatibility is unverified: metadata is missing, invalid or incomplete.", notes].filter(Boolean).join(" "),
      prerequisites: prerequisites || "Prerequisites have not been documented.",
      invocation: null, canInvoke: false,
    };
  }
  return { support, label: CODEX_LABELS[support], notes, prerequisites,
    invocation: supported ? invocation : null, canInvoke: supported };
}
