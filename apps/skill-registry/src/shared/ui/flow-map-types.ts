// Shared UI: type definitions for the interactive flow map
// (src/shared/ui/flow-map.tsx) and its prompt-library companions. Feature
// slices (orchestrator, architect) hand-author their own node/flow/geometry/
// prompt data conforming to these shapes; the map and prompt list render
// whatever they're handed.

export interface FlowNode {
  kicker: string;
  title: string;
  /** CSS custom property for the node's accent color. */
  c: string;
  bodyHtml: string;
}

export interface FlowDef {
  label: string;
  descHtml: string;
  /** null = "everything": nothing faded, nothing lit. */
  nodes: string[] | null;
  edges: string[] | null;
}

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

/** Decorative lens chips floated over a node (orchestrator's REVIEW lenses). */
export interface LensGeom {
  x: number;
  y: number;
  w: number;
  tx: number;
  ty: number;
  text: string;
}

export interface PromptItem {
  label: string;
  text: string;
}

export interface PromptGroup {
  /** Map node id this group belongs to (drawer), or a standalone group. */
  node: string;
  group: string;
  /** CSS custom property used as the group's accent color. */
  c: string;
  wide?: boolean;
  /** Trusted, hand-authored HTML rendered directly under the group heading. */
  introHtml?: string;
  items: PromptItem[];
  /** Trusted, hand-authored HTML caveat rendered under the group's prompts. */
  noteHtml?: string;
}
