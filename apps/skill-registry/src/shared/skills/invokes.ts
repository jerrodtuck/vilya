// Shared kernel: canonical skill slugs + slash invokes (vilya-* hard cut).
// Teaching copy and meta helpers import from here so renames stay one edit.

export const SKILL_SLUGS = {
  chip: "vilya-chip",
  startFeature: "vilya-start-feature",
  finishFeature: "vilya-finish-feature",
  mergePr: "vilya-merge-pr",
  updateDocs: "vilya-update-docs",
  prune: "vilya-prune",
  planner: "vilya-planner",
  nightShift: "vilya-night-shift",
  cursorHandoff: "vilya-cursor-handoff",
  architect: "vilya-architect",
  orchestrator: "vilya-orchestrator",
  orchestratorCursor: "vilya-orchestrator-cursor",
  askVilya: "vilya-ask-vilya",
  history: "vilya-history",
  productMap: "vilya-product-map",
  adr: "vilya-adr",
} as const;

export type SkillSlug = (typeof SKILL_SLUGS)[keyof typeof SKILL_SLUGS];

export const SKILL_INVOKES = {
  chip: `/${SKILL_SLUGS.chip}`,
  startFeature: `/${SKILL_SLUGS.startFeature}`,
  finishFeature: `/${SKILL_SLUGS.finishFeature}`,
  mergePr: `/${SKILL_SLUGS.mergePr}`,
  updateDocs: `/${SKILL_SLUGS.updateDocs}`,
  prune: `/${SKILL_SLUGS.prune}`,
  planner: `/${SKILL_SLUGS.planner}`,
  nightShift: `/${SKILL_SLUGS.nightShift}`,
  cursorHandoff: `/${SKILL_SLUGS.cursorHandoff}`,
  architect: `/${SKILL_SLUGS.architect}`,
  orchestrator: `/${SKILL_SLUGS.orchestrator}`,
  orchestratorCursor: `/${SKILL_SLUGS.orchestratorCursor}`,
  askVilya: `/${SKILL_SLUGS.askVilya}`,
  history: `/${SKILL_SLUGS.history}`,
  productMap: `/${SKILL_SLUGS.productMap}`,
  adr: `/${SKILL_SLUGS.adr}`,
} as const;

export const AUTONOMOUS_SLUGS = new Set<string>([
  SKILL_SLUGS.nightShift,
  SKILL_SLUGS.planner,
]);

export const RECALL_SLUGS = new Set<string>([
  SKILL_SLUGS.history,
  SKILL_SLUGS.productMap,
]);

/** Standing-session seats — invocationOf labels these distinctly from model+manual. */
export const STANDING_SESSION_SLUGS = new Set<string>([
  SKILL_SLUGS.planner,
  SKILL_SLUGS.architect,
  SKILL_SLUGS.orchestrator,
  SKILL_SLUGS.orchestratorCursor,
]);

export function isCrucibleSlug(slug: string): boolean {
  return slug.startsWith("vilya-crucible");
}
