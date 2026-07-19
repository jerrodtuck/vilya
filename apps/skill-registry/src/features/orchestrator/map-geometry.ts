// Feature slice: orchestrator — SVG geometry for the orchestration map.
// Pure view data: edge paths, node boxes, labels. Interaction lives in the
// shared map (src/shared/ui/flow-map.tsx); flow/node semantics live in
// data.ts; types live in src/shared/ui/flow-map-types.ts.

import type { EdgeGeom, EdgeLabel, LensGeom, NodeGeom } from "@/shared/ui/flow-map-types";

export const EDGES: EdgeGeom[] = [
  // main pipeline
  { id: "o-s", d: "M150,150 L196,150", colorClass: "c-start" },
  { id: "s-i", d: "M343,150 L389,150", colorClass: "c-start" },
  { id: "i-r", d: "M531,150 L577,150", colorClass: "c-review" },
  { id: "r-f", d: "M719,150 L765,150", colorClass: "c-finish" },
  { id: "f-m", d: "M912,150 L958,150", colorClass: "c-finish" },
  { id: "m-d", d: "M1100,150 L1144,150", colorClass: "c-merge" },
  // review -> refactor loop
  { id: "r-ref", d: "M649,179 L649,291", colorClass: "c-review" },
  { id: "ref-r", d: "M584,315 C532,272 546,208 622,181", colorClass: "c-review" },
  // consult fork
  { id: "s-consult", d: "M292,177 C308,200 312,208 320,220", colorClass: "c-start", dashed: true },
  { id: "consult-i", d: "M400,238 C425,222 432,205 440,181", colorClass: "c-start", dashed: true },
  // blocked
  { id: "s-blocked", d: "M270,179 L270,291", colorClass: "c-blocked" },
  { id: "blocked-i", d: "M343,318 C410,332 435,240 458,182", colorClass: "c-blocked" },
  // docs / bug
  { id: "i-docs", d: "M461,179 L461,283", colorClass: "c-docs" },
  { id: "docs-bug", d: "M461,339 L461,411", colorClass: "c-docs" },
  { id: "r-docs", d: "M619,181 C534,232 516,258 480,289", colorClass: "c-docs", dashed: true },
  { id: "bug-impl", d: "M531,439 C615,418 610,240 520,182", colorClass: "c-docs" },
  // verify
  { id: "m-verify", d: "M1030,179 L1030,291", colorClass: "c-verify" },
  { id: "verify-d", d: "M1103,315 C1160,302 1185,240 1195,181", colorClass: "c-verify" },
  // epic
  { id: "o-epic", d: "M85,179 L85,291", colorClass: "c-epic" },
  { id: "epic-s", d: "M153,318 C210,332 222,240 239,183", colorClass: "c-epic" },
];

export const EDGE_LABELS: EdgeLabel[] = [
  { x: 512, y: 248, text: "not Ready →" },
  { x: 502, y: 262, text: "re-review" },
  { x: 276, y: 240, text: "external dep" },
  { x: 552, y: 332, text: "keep going ↑" },
  { x: 1040, y: 250, text: "live retest" },
];

export const NODE_GEOMS: NodeGeom[] = [
  { id: "ORCH", x: 20, y: 122, w: 130, h: 56, rx: 13, title: "You", role: "orchestrator", dot: true },
  { id: "START", x: 198, y: 122, w: 145, h: 56, rx: 13, title: "Start", role: "issue · branch · consult", dot: true },
  { id: "IMPL", x: 391, y: 122, w: 140, h: 56, rx: 13, title: "Implement", role: "in the vertical slice", dot: true },
  { id: "REVIEW", x: 579, y: 122, w: 140, h: 56, rx: 13, title: "Crucible", role: "refactor-oriented review", dot: true },
  { id: "FINISH", x: 767, y: 122, w: 145, h: 56, rx: 13, title: "Finish", role: "tests · PR · changelog", dot: true },
  { id: "MERGE", x: 960, y: 122, w: 140, h: 56, rx: 13, title: "Merge", role: "triage · smoke · squash", dot: true },
  { id: "DONE", x: 1146, y: 122, w: 114, h: 56, rx: 13, title: "Done", role: "Closes # · board", dot: true },
  { id: "EPIC", x: 20, y: 294, w: 130, h: 52, rx: 12, title: "Epic", role: "+ sub-issues" },
  { id: "BLOCKED", x: 200, y: 294, w: 140, h: 52, rx: 12, title: "Blocked", role: "external dependency" },
  { id: "CONSULT", x: 310, y: 222, w: 118, h: 46, rx: 12, title: "Consult", role: "2–3 options", smallTitle: true },
  { id: "DOCS", x: 391, y: 286, w: 140, h: 52, rx: 12, title: "Docs", role: "where does this go?" },
  { id: "BUG", x: 391, y: 414, w: 140, h: 52, rx: 12, title: "Bug issue", role: "linked · keep going" },
  { id: "REFACTOR", x: 579, y: 294, w: 140, h: 52, rx: 12, title: "Refactor", role: "top 1–3 by leverage" },
  { id: "VERIFY", x: 960, y: 294, w: 140, h: 52, rx: 12, title: "Verifying", role: "Refs # · live confirm" },
];

/** Review-lens decoration over the REVIEW node. */
export const LENSES: LensGeom[] = [
  { x: 584, y: 86, w: 52, tx: 610, ty: 98, text: "VSA" },
  { x: 640, y: 86, w: 56, tx: 668, ty: 98, text: "SOLID" },
  { x: 584, y: 66, w: 52, tx: 610, ty: 78, text: "Stack" },
  { x: 640, y: 66, w: 56, tx: 668, ty: 78, text: "Simplify" },
];

/** Stem from the lens chips down to the REVIEW node's top edge. */
export const LENS_CONNECTOR = "M649,104 L649,121";
