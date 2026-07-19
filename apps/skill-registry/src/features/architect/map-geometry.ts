// Feature slice: architect — SVG geometry for the architect flow map. Pure
// view data: edge paths, node boxes, labels. Interaction lives in the shared
// map (src/shared/ui/flow-map.tsx); flow/node semantics live in data.ts;
// types live in src/shared/ui/flow-map-types.ts.
//
// Layout: a 2-tier grid mirroring the orchestrator map's coordinate style.
// Tier 1 (y=122, the main line): ARCH → RECALL → SURVEY → EPIC → HANDOFF.
// Tier 2 (y=294, branches): RESEARCH, ADR, SPEC. FORK sits offset between
// tiers (y=205), matching the orchestrator map's CONSULT node.

import type { EdgeGeom, EdgeLabel, NodeGeom } from "@/shared/ui/flow-map-types";

export const EDGES: EdgeGeom[] = [
  // main pipeline
  { id: "arch-recall", d: "M150,150 L196,150", colorClass: "c-arch" },
  { id: "recall-survey", d: "M343,150 L389,150", colorClass: "c-recall" },
  { id: "survey-epic", d: "M531,150 L577,150", colorClass: "c-survey" },
  { id: "epic-handoff", d: "M719,150 L1144,150", colorClass: "c-epic" },
  // arch -> research (straight drop, like the orchestrator's o-epic)
  { id: "arch-research", d: "M85,179 L95,291", colorClass: "c-research" },
  // arch -> survey, bypassing recall (dashed: an alternate route, not the spine)
  { id: "arch-survey", d: "M115,178 C115,270 461,270 461,178", colorClass: "c-survey", dashed: true },
  // recall -> fork -> adr (fork offset between tiers, like the orchestrator's CONSULT)
  { id: "recall-fork", d: "M292,178 C305,190 312,196 322,206", colorClass: "c-recall" },
  { id: "fork-adr", d: "M420,247 C550,270 650,280 765,296", colorClass: "c-fork" },
  // survey -> spec, arcing high over the top row
  { id: "survey-spec", d: "M461,178 C461,60 1030,60 1030,292", colorClass: "c-survey" },
  // research -> spec / adr, nested arcs under the row
  { id: "research-adr", d: "M95,346 C95,395 837,395 837,346", colorClass: "c-research" },
  { id: "research-spec", d: "M95,346 C95,435 1030,435 1030,346", colorClass: "c-research" },
  // spec / adr -> handoff
  { id: "spec-handoff", d: "M1103,315 C1160,302 1185,240 1195,181", colorClass: "c-spec" },
  { id: "adr-handoff", d: "M907,300 C1000,270 1080,220 1150,181", colorClass: "c-adr" },
];

export const EDGE_LABELS: EdgeLabel[] = [
  { x: 175, y: 258, text: "skip recall" },
  { x: 470, y: 415, text: "evidence-graded" },
];

export const NODE_GEOMS: NodeGeom[] = [
  { id: "ARCH", x: 20, y: 122, w: 130, h: 56, rx: 13, title: "You", role: "architect", dot: true },
  { id: "RECALL", x: 198, y: 122, w: 145, h: 56, rx: 13, title: "Recall", role: "/vilya-history + DECISIONS", dot: true },
  { id: "SURVEY", x: 391, y: 122, w: 140, h: 56, rx: 13, title: "Survey", role: "as-built vs intended", dot: true },
  { id: "EPIC", x: 579, y: 122, w: 140, h: 56, rx: 13, title: "Epic", role: "fan-out stops here", dot: true },
  { id: "HANDOFF", x: 1146, y: 122, w: 114, h: 56, rx: 13, title: "Handoff", role: "orchestrator picks up", dot: true },
  { id: "RESEARCH", x: 20, y: 294, w: 150, h: 52, rx: 12, title: "Research", role: "evidence-graded claims" },
  { id: "FORK", x: 330, y: 205, w: 110, h: 42, rx: 11, title: "Fork", role: "2–3 options", smallTitle: true },
  { id: "ADR", x: 767, y: 294, w: 140, h: 52, rx: 12, title: "ADR", role: "DECISIONS.md + issue" },
  { id: "SPEC", x: 960, y: 294, w: 140, h: 52, rx: 12, title: "Spec", role: "docs/specs" },
];
