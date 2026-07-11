// Feature slice: flows — SVG geometry for the orchestration map.
// Pure view data: edge paths, node boxes, labels. Interaction lives in
// flows-map.tsx; flow/node semantics live in data.ts.

export interface EdgeGeom {
  id: string;
  d: string;
  colorClass: string;
  dashed?: boolean;
}

export interface EdgeLabel {
  x: number;
  y: number;
  text: string;
}

export interface NodeGeom {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
  title: string;
  role: string;
  dot?: boolean;
  smallTitle?: boolean;
}

export const EDGES: EdgeGeom[] = [
  // main pipeline
  { id: "o-s", d: "M185,150 L253,150", colorClass: "c-start" },
  { id: "s-i", d: "M407,150 L473,150", colorClass: "c-start" },
  { id: "i-r", d: "M627,150 L693,150", colorClass: "c-review" },
  { id: "r-f", d: "M847,150 L913,150", colorClass: "c-finish" },
  { id: "f-d", d: "M1067,150 L1113,150", colorClass: "c-finish" },
  // review -> refactor loop
  { id: "r-ref", d: "M770,179 L770,291", colorClass: "c-review" },
  { id: "ref-r", d: "M700,315 C648,272 662,208 738,181", colorClass: "c-review" },
  // consult fork
  { id: "s-consult", d: "M356,177 C382,205 400,214 418,229", colorClass: "c-start", dashed: true },
  { id: "consult-i", d: "M476,241 C505,224 516,206 524,181", colorClass: "c-start", dashed: true },
  // blocked
  { id: "s-blocked", d: "M330,179 L330,291", colorClass: "c-blocked" },
  { id: "blocked-i", d: "M403,318 C470,332 512,240 542,182", colorClass: "c-blocked" },
  // docs / bug
  { id: "i-docs", d: "M550,179 L550,283", colorClass: "c-docs" },
  { id: "docs-bug", d: "M550,339 L550,411", colorClass: "c-docs" },
  { id: "r-docs", d: "M735,181 C650,232 632,258 596,289", colorClass: "c-docs", dashed: true },
  { id: "bug-impl", d: "M620,439 C704,418 706,232 630,182", colorClass: "c-docs" },
  // verify
  { id: "f-verify", d: "M990,179 L990,291", colorClass: "c-verify" },
  { id: "verify-d", d: "M1060,315 C1132,300 1176,238 1190,181", colorClass: "c-verify" },
  // epic
  { id: "o-epic", d: "M110,179 L110,291", colorClass: "c-epic" },
  { id: "epic-s", d: "M180,318 C238,332 268,236 296,183", colorClass: "c-epic" },
];

export const EDGE_LABELS: EdgeLabel[] = [
  { x: 628, y: 248, text: "not Ready →" },
  { x: 618, y: 262, text: "re-review" },
  { x: 336, y: 240, text: "external dep" },
  { x: 648, y: 332, text: "keep going ↑" },
  { x: 1000, y: 250, text: "live retest" },
];

export const NODE_GEOMS: NodeGeom[] = [
  { id: "ORCH", x: 35, y: 122, w: 150, h: 56, rx: 13, title: "You", role: "orchestrator", dot: true },
  { id: "START", x: 255, y: 122, w: 152, h: 56, rx: 13, title: "/start-feature", role: "issue · branch · consult", dot: true },
  { id: "IMPL", x: 475, y: 122, w: 150, h: 56, rx: 13, title: "Implement", role: "in the vertical slice", dot: true },
  { id: "REVIEW", x: 695, y: 122, w: 150, h: 56, rx: 13, title: "crucible", role: "refactor-oriented review", dot: true },
  { id: "FINISH", x: 915, y: 122, w: 152, h: 56, rx: 13, title: "/finish-feature", role: "tests · PR · changelog", dot: true },
  { id: "DONE", x: 1115, y: 122, w: 130, h: 56, rx: 13, title: "Done", role: "Closes # · merged", dot: true },
  { id: "EPIC", x: 40, y: 294, w: 140, h: 52, rx: 12, title: "Epic", role: "+ sub-issues" },
  { id: "BLOCKED", x: 260, y: 294, w: 140, h: 52, rx: 12, title: "Blocked", role: "external dependency" },
  { id: "CONSULT", x: 418, y: 220, w: 118, h: 46, rx: 12, title: "Consult", role: "2–3 options", smallTitle: true },
  { id: "DOCS", x: 480, y: 286, w: 140, h: 52, rx: 12, title: "/update-docs", role: "where does this go?" },
  { id: "BUG", x: 480, y: 414, w: 140, h: 52, rx: 12, title: "Bug issue", role: "linked · keep going" },
  { id: "REFACTOR", x: 700, y: 294, w: 140, h: 52, rx: 12, title: "Refactor", role: "top 1–3 by leverage" },
  { id: "VERIFY", x: 920, y: 294, w: 140, h: 52, rx: 12, title: "Verifying", role: "Refs # · live confirm" },
];

/** Review-lens decoration over the REVIEW node. */
export const LENSES = [
  { x: 700, y: 86, w: 52, tx: 726, ty: 98, text: "VSA" },
  { x: 756, y: 86, w: 56, tx: 784, ty: 98, text: "SOLID" },
  { x: 700, y: 66, w: 52, tx: 726, ty: 78, text: "Stack" },
  { x: 756, y: 66, w: 56, tx: 784, ty: 78, text: "Simplify" },
];
