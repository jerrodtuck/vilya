// Feature slice: night-shift — SVG geometry for the night-agent pipeline map.
// Labels/roles come from data.ts at render time; this file is boxes + paths only.

import type { StageId } from "./data";

export interface StageGeom {
  id: StageId;
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
}

export interface EdgeGeom {
  id: string;
  d: string;
  from: StageId;
  to: StageId;
  /** happy spine vs dashed link into failure / safety. */
  kind: "spine" | "fail";
}

/** viewBox 0 0 1280 320 — horizontal spine + failure under the middle. */
const Y = 70;
const H = 64;
const W = 150;
const GAP = 28;
const START_X = 40;

function xAt(i: number): number {
  return START_X + i * (W + GAP);
}

/** Six happy-path nodes left→right; FAILURE centered below. */
export const STAGE_GEOMS: StageGeom[] = [
  { id: "DISPATCH", x: xAt(0), y: Y, w: W, h: H, rx: 12 },
  { id: "RUNNER", x: xAt(1), y: Y, w: W, h: H, rx: 12 },
  { id: "IDENTITY", x: xAt(2), y: Y, w: W, h: H, rx: 12 },
  { id: "LOOP", x: xAt(3), y: Y, w: W, h: H, rx: 12 },
  { id: "STEERING", x: xAt(4), y: Y, w: W, h: H, rx: 12 },
  { id: "OUTPUTS", x: xAt(5), y: Y, w: W, h: H, rx: 12 },
  {
    id: "FAILURE",
    x: xAt(2) + 20,
    y: Y + H + 90,
    w: W + 80,
    h: H,
    rx: 12,
  },
];

function midRight(g: StageGeom): { x: number; y: number } {
  return { x: g.x + g.w, y: g.y + g.h / 2 };
}

function midLeft(g: StageGeom): { x: number; y: number } {
  return { x: g.x, y: g.y + g.h / 2 };
}

function midBottom(g: StageGeom): { x: number; y: number } {
  return { x: g.x + g.w / 2, y: g.y + g.h };
}

function midTop(g: StageGeom): { x: number; y: number } {
  return { x: g.x + g.w / 2, y: g.y };
}

const byId = Object.fromEntries(STAGE_GEOMS.map((g) => [g.id, g])) as Record<
  StageId,
  StageGeom
>;

function spine(from: StageId, to: StageId): string {
  const a = midRight(byId[from]);
  const b = midLeft(byId[to]);
  return `M${a.x},${a.y} L${b.x},${b.y}`;
}

function failLink(from: StageId): string {
  const a = midBottom(byId[from]);
  const b = midTop(byId.FAILURE);
  const midY = (a.y + b.y) / 2;
  return `M${a.x},${a.y} C${a.x},${midY} ${b.x},${midY} ${b.x},${b.y}`;
}

export const EDGES: EdgeGeom[] = [
  { id: "e-dispatch-runner", d: spine("DISPATCH", "RUNNER"), from: "DISPATCH", to: "RUNNER", kind: "spine" },
  { id: "e-runner-identity", d: spine("RUNNER", "IDENTITY"), from: "RUNNER", to: "IDENTITY", kind: "spine" },
  { id: "e-identity-loop", d: spine("IDENTITY", "LOOP"), from: "IDENTITY", to: "LOOP", kind: "spine" },
  { id: "e-loop-steering", d: spine("LOOP", "STEERING"), from: "LOOP", to: "STEERING", kind: "spine" },
  { id: "e-steering-outputs", d: spine("STEERING", "OUTPUTS"), from: "STEERING", to: "OUTPUTS", kind: "spine" },
  { id: "e-fail-dispatch", d: failLink("DISPATCH"), from: "DISPATCH", to: "FAILURE", kind: "fail" },
  { id: "e-fail-identity", d: failLink("IDENTITY"), from: "IDENTITY", to: "FAILURE", kind: "fail" },
  { id: "e-fail-loop", d: failLink("LOOP"), from: "LOOP", to: "FAILURE", kind: "fail" },
];

export const EDGE_LABELS: { text: string; x: number; y: number }[] = [
  { text: "walls hit here", x: xAt(2) + W / 2 + 40, y: Y + H + 48 },
];

export function edgeTouches(edge: EdgeGeom, stage: StageId): boolean {
  return edge.from === stage || edge.to === stage;
}
