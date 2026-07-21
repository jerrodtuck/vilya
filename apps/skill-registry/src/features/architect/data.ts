// Feature slice: architect — node and flow definitions for the architect
// flow map. Node bodies are trusted, hand-authored HTML (same posture as the
// markdown pipeline in skill-detail). Content model per epic #132 §1: nodes
// ARCH · RECALL · SURVEY · RESEARCH · FORK · ADR · SPEC · EPIC · HANDOFF.
// Types live in the shared flow-map component
// (src/shared/ui/flow-map-types.ts) since orchestrator's data module
// conforms to the same shapes.

import type { FlowDef, FlowNode } from "@/shared/ui/flow-map-types";

export const NODES: Record<string, FlowNode> = {
  ARCH: {
    kicker: "The architect",
    title: "You",
    c: "--arch",
    bodyHtml: `
    <p>You don't run the boilerplate — you <b>decide and document</b>. Your output is issues on the board, ADRs (logged in <code>DECISIONS.md</code>), and specs.</p>
    <ul><li>Recall what's already been tried before you propose anything new.</li>
    <li>Ground every claim in as-built code or as-intended docs — and say which one it rests on.</li>
    <li>At a real fork, stop and hand the operator 2–3 options with a stated recommendation.</li></ul>
    <p>Nothing you write turns into running code in this session — that hand-off belongs to the orchestrator.</p>`,
  },
  RECALL: {
    kicker: "/vl-history + DECISIONS grep",
    title: "Recall before you propose",
    c: "--recall",
    bodyHtml: `
    <p>Before any direction call, know what's already been tried.</p>
    <ul><li><code>/vl-history</code> for the what-we-tried-in-order on any issue or topic.</li>
    <li>Grep <code>DECISIONS.md</code> for prior calls — never load the whole file.</li>
    <li>Board archaeology via <code>gh</code>: Done work by area, past epics, resolved <code>needs:decision</code> forks.</li></ul>`,
  },
  SURVEY: {
    kicker: "Ground truth",
    title: "As-built vs as-intended",
    c: "--survey",
    bodyHtml: `
    <p>Two different sources of truth, and you keep them separate:</p>
    <ul><li><b>As-built</b> — a read-only code survey of what's actually there.</li>
    <li><b>As-intended</b> — <code>docs/VISION.md</code> and the specs.</li></ul>
    <p>Any gap between the two is a <b>finding</b> — not a bug to fix here, a fact to report.</p>`,
  },
  RESEARCH: {
    kicker: "Deep research",
    title: "Every claim, labeled",
    c: "--research",
    bodyHtml: `
    <p>Research runs under the honesty bar: every claim carries its evidence class.</p>
    <ul><li><b>Verified</b> — primary source.</li>
    <li><b>Tested</b> — directly exercised.</li>
    <li><b>Unverified</b> — say so; never assert it as fact.</li></ul>
    <p>Findings feed a spec or an ADR — never code.</p>`,
  },
  FORK: {
    kicker: "Decision fork",
    title: "2–3 options, a stated recommendation",
    c: "--fork",
    bodyHtml: `
    <p>For a real design fork, surface <b>2–3 viable options</b> with their costs, and recommend one with your reasoning.</p>
    <p><b>The operator decides.</b> The issue moves to <code>needs:decision</code> until they call it.</p>`,
  },
  ADR: {
    kicker: "Decision record",
    title: "ADR",
    c: "--adr",
    bodyHtml: `
    <p>Once the operator calls it, the decision gets written down twice:</p>
    <ul><li>Appended to <code>DECISIONS.md</code>.</li>
    <li>Mirrored as a comment on the owning issue.</li></ul>
    <p>So the next architect session's <b>recall</b> finds it without re-litigating.</p>`,
  },
  SPEC: {
    kicker: "docs/specs",
    title: "Spec",
    c: "--spec",
    bodyHtml: `
    <p>Design-level intent for non-trivial work — not a task list.</p>
    <ul><li>Carries <b>Created</b> / <b>Last updated</b> so staleness is visible.</li>
    <li>Linked from the issue that will implement it.</li></ul>`,
  },
  EPIC: {
    kicker: "Fan-out",
    title: "Epic + sub-issues",
    c: "--epic",
    bodyHtml: `
    <p>A multi-stream initiative becomes an <b>Epic</b> with sub-issues — but the fan-out <b>stops at the board</b>.</p>
    <p>Dispatch is the orchestrator's job, not yours; you hand off a scoped set of issues, not a running build.</p>`,
  },
  HANDOFF: {
    kicker: "Hand-off",
    title: "The orchestrator picks up",
    c: "--handoff",
    bodyHtml: `
    <p>Everything an architect session produces — issues, ADRs, specs — lands on the board for the <b>orchestrator</b> to pick up.</p>
    <p>Nothing becomes code here; that's the whole point of keeping the roles separate.</p>`,
  },
};

export const FLOWS: Record<string, FlowDef> = {
  everything: {
    label: "Everything",
    descHtml:
      "<b>Everything.</b> All flows at once — the full architect surface. Pick one to isolate it.",
    nodes: null,
    edges: null,
  },
  epic: {
    label: "Shape an epic",
    descHtml:
      "<b>Shape an epic.</b> Recall what's been tried, survey as-built vs as-intended, then fan out an Epic with sub-issues — hand off to the orchestrator to dispatch.",
    nodes: ["ARCH", "RECALL", "SURVEY", "EPIC", "HANDOFF"],
    edges: ["arch-recall", "recall-survey", "survey-epic", "epic-handoff"],
  },
  call: {
    label: "Make a call",
    descHtml:
      "<b>Make a call.</b> Recall prior decisions, lay out 2–3 options at the fork, then log the call as an ADR.",
    nodes: ["ARCH", "RECALL", "FORK", "ADR"],
    edges: ["arch-recall", "recall-fork", "fork-adr"],
  },
  survey: {
    label: "Survey as-built vs intended",
    descHtml:
      "<b>Survey as-built vs intended.</b> A read-only code survey against VISION/specs — any gap between them becomes a finding in a spec.",
    nodes: ["ARCH", "SURVEY", "SPEC"],
    edges: ["arch-survey", "survey-spec"],
  },
  research: {
    label: "Deep research",
    descHtml:
      "<b>Deep research.</b> Every claim carries its evidence class — verified, tested, or unverified — feeding a spec or an ADR.",
    nodes: ["ARCH", "RESEARCH", "SPEC", "ADR"],
    edges: ["arch-research", "research-spec", "research-adr"],
  },
  handoff: {
    label: "Handoff",
    descHtml:
      "<b>Handoff.</b> Specs, ADRs, and epics all land on the board the same way — the orchestrator picks up from here.",
    nodes: ["SPEC", "ADR", "EPIC", "HANDOFF"],
    edges: ["spec-handoff", "adr-handoff", "epic-handoff"],
  },
};

/** Chip accent per flow (CSS custom property name). */
export const FLOW_COLORS: Record<string, string> = {
  everything: "--arch",
  epic: "--epic",
  call: "--fork",
  survey: "--survey",
  research: "--research",
  handoff: "--handoff",
};

/** Drawer content shown before any node is selected. */
export const DEFAULT_DRAWER: FlowNode = {
  kicker: "The architect",
  title: "You decide, the board records",
  c: "--arch",
  bodyHtml: `
    <p>Pick any node in the map to see what that role does. The whole architect flow is designed so <b>decisions get made once, written down, and handed off</b> — never re-litigated, never silently implemented in this session.</p>
    <h4><span class="swatch" style="background:var(--recall)"></span>Recall before you propose</h4>
    <ul>
      <li><code>/vl-history</code> + a <code>DECISIONS.md</code> grep before any new call.</li>
      <li>Ground every claim in as-built code or as-intended docs — say which.</li>
    </ul>
    <h4><span class="swatch" style="background:var(--fork)"></span>Every fork gets a recommendation</h4>
    <ul>
      <li>2–3 options, their costs, and a stated recommendation — the operator decides.</li>
      <li>The call gets written down twice: <code>DECISIONS.md</code> and the owning issue.</li>
    </ul>`,
};
