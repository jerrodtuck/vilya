// Shared kernel: canonical skill slugs + slash invokes (vl-* hard cut).
// Teaching copy and meta helpers import from here so renames stay one edit.

export const SKILL_SLUGS = {
  chip: "vl-chip",
  startFeature: "vl-start-feature",
  finishFeature: "vl-finish-feature",
  mergePr: "vl-merge-pr",
  updateDocs: "vl-update-docs",
  prune: "vl-prune",
  planner: "vl-plan",
  nightShift: "vl-night-shift",
  cursorHandoff: "vl-cursor-handoff",
  architect: "vl-arch",
  orchestrator: "vl-orch-claude",
  orchestratorCursor: "vl-orch-cursor",
  askVilya: "vl-ask",
  history: "vl-history",
  productMap: "vl-product-map",
  adr: "vl-adr",
  adhd: "vl-adhd",
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
  adhd: `/${SKILL_SLUGS.adhd}`,
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
  return slug.startsWith("vl-crucible");
}
