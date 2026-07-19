// Feature slice: planner — SVG geometry for the planner flow map. Pure view
// data: edge paths, node boxes, labels. Interaction lives in the shared map
// (src/shared/ui/flow-map.tsx); flow/node semantics live in data.ts.
//
// Layout: 2-tier grid matching architect/orchestrator coordinate style.
// Tier 1 (y=122): PLAN → QUEUE → RECALL → WRITE → READY → HANDOFF.
// Tier 2: FORK sits offset between tiers (y=205), like architect's FORK /
// orchestrator's CONSULT.

import type { EdgeGeom, EdgeLabel, NodeGeom } from "@/shared/ui/flow-map-types";

export const EDGES: EdgeGeom[] = [
  // main drain spine
  { id: "plan-queue", d: "M150,150 L196,150", colorClass: "c-planner" },
  { id: "queue-recall", d: "M343,150 L389,150", colorClass: "c-queue" },
  { id: "recall-write", d: "M531,150 L577,150", colorClass: "c-recall" },
  { id: "write-ready", d: "M719,150 L845,150", colorClass: "c-planitem" },
  { id: "ready-handoff", d: "M987,150 L1144,150", colorClass: "c-handoff" },
  // plan -> recall, bypassing queue (named issue / already in hand)
  {
    id: "plan-recall",
    d: "M115,178 C115,270 461,270 461,178",
    colorClass: "c-recall",
    dashed: true,
  },
  // recall -> fork -> write
  {
    id: "recall-fork",
    d: "M461,178 C480,190 500,200 545,215",
    colorClass: "c-recall",
  },
  {
    id: "fork-write",
    d: "M620,205 C620,190 649,190 649,178",
    colorClass: "c-fork",
  },
];

export const EDGE_LABELS: EdgeLabel[] = [
  { x: 220, y: 258, text: "named issue" },
  { x: 620, y: 268, text: "costed options" },
];

export const NODE_GEOMS: NodeGeom[] = [
  {
    id: "PLAN",
    x: 20,
    y: 122,
    w: 130,
    h: 56,
    rx: 13,
    title: "You",
    role: "planner · Fable",
    dot: true,
  },
  {
    id: "QUEUE",
    x: 198,
    y: 122,
    w: 145,
    h: 56,
    rx: 13,
    title: "Queue",
    role: "drain needs:plan",
    dot: true,
  },
  {
    id: "RECALL",
    x: 391,
    y: 122,
    w: 140,
    h: 56,
    rx: 13,
    title: "Recall",
    role: "issue + slice",
    dot: true,
  },
  {
    id: "WRITE",
    x: 579,
    y: 122,
    w: 140,
    h: 56,
    rx: 13,
    title: "Plan item",
    role: "kickoff + verify",
    dot: true,
  },
  {
    id: "READY",
    x: 847,
    y: 122,
    w: 140,
    h: 56,
    rx: 13,
    title: "plan:ready",
    role: "label handoff",
    dot: true,
  },
  {
    id: "HANDOFF",
    x: 1146,
    y: 122,
    w: 114,
    h: 56,
    rx: 13,
    title: "Handoff",
    role: "board Monitor",
    dot: true,
  },
  {
    id: "FORK",
    x: 555,
    y: 205,
    w: 130,
    h: 42,
    rx: 11,
    title: "Fork",
    role: "2–3 options",
    smallTitle: true,
  },
];
