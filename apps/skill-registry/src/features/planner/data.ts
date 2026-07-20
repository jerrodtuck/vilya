// Feature slice: planner — node and flow definitions for the planner flow
// map. Content model mirrors docs/specs/planner-flow.md + the /vilya-planner skill:
// PLAN · QUEUE · RECALL · WRITE · FORK · READY · HANDOFF.
// Types live in src/shared/ui/flow-map-types.ts.

import type { FlowDef, FlowNode } from "@/shared/ui/flow-map-types";

export const NODES: Record<string, FlowNode> = {
  PLAN: {
    kicker: "The planner",
    title: "You",
    c: "--planner",
    bodyHtml: `
    <p>You are the <b>standing plan loop</b> — peer of orchestrator and night-shift, not a direction seat. One Planner session <b>per repo</b>, launched on <b>Fable</b>.</p>
    <ul><li>Drain <code>needs:plan</code>; write kickoff + verify plan on the issue; mark <code>plan:ready</code>.</li>
    <li>Never implement, never dispatch chips, never merge, never arm process/completion self-watches.</li>
    <li>When idle, arm one Planner-owned <b>intake Monitor</b> for <code>needs:plan</code> (REST + host wake) and leave it running across drains.</li>
    <li>Enqueue is opt-in: the board queue is the brief list — the operator does not paste each issue into this chat.</li></ul>`,
  },
  QUEUE: {
    kicker: "needs:plan",
    title: "Drain the queue",
    c: "--queue",
    bodyHtml: `
    <p>Poll open issues labeled <code>needs:plan</code> (highest priority, then oldest).</p>
    <ul><li>If the operator names an issue, plan that one — apply <code>needs:plan</code> if missing so the transition is visible.</li>
    <li>When the queue is empty, arm one intake Monitor if needed (≥120s, every-tick <code>last-seen</code> sync, wake only when the open set <b>gains</b> an issue). Leave it running across drains — do not kill/re-arm to re-seed. Stay standing — do not wait for a ping.</li></ul>`,
  },
  RECALL: {
    kicker: "Ground the brief",
    title: "Read issue + slice",
    c: "--recall",
    bodyHtml: `
    <p>Before writing the kickoff, ground the plan in what's already there.</p>
    <ul><li>Issue body, linked specs/ADRs, owning vertical slice.</li>
    <li>Prefer real architecture in that slice — do not invent layer-cake dumping grounds.</li>
    <li>Correct misunderstandings of the goal here, before execute starts.</li></ul>`,
  },
  WRITE: {
    kicker: "Kickoff + verify plan",
    title: "Plan the item",
    c: "--planitem",
    bodyHtml: `
    <p>Write <b>one kickoff comment</b> on the issue — not a private note. Cover:</p>
    <ul><li>Repo, default branch, owning slice, linked spec if any.</li>
    <li>Goal + acceptance restated tightly.</li>
    <li>File ownership / out of scope when parallel streams exist.</li>
    <li><b>Verify plan</b> and <b>merge routing</b>: <code>tests-only</code> · <code>local-smoke</code> · <code>live-only</code>.</li>
    <li>When step 1 is an unknown: <b>Investigate-first / hard-stop</b> section — non-negotiable stop after findings + options; no auto-pick.</li>
    <li>Explicit: chips/workers implement; Planner does not.</li></ul>`,
  },
  FORK: {
    kicker: "Decision fork",
    title: "2–3 options, a recommendation",
    c: "--fork",
    bodyHtml: `
    <p>At a real design fork while planning, surface <b>2–3 options</b> with costs and a stated recommendation on the issue.</p>
    <ul><li><b>Plan can finish with open forks</b> for the implementer → still set <code>plan:ready</code>.</li>
    <li><b>Plan cannot finish</b> without an operator call → <code>needs:decision</code>, Status <b>Blocked</b>, keep <code>needs:plan</code>, do <b>not</b> set <code>plan:ready</code>.</li>
    <li><b>Investigate-first</b> (execute-time unknown) → daytime kickoff section with a hard stop; unattended uses <code>needs:decision</code>. Does not replace ordinary <code>plan:ready</code>.</li></ul>`,
  },
  READY: {
    kicker: "plan:ready",
    title: "Label the handoff",
    c: "--ready",
    bodyHtml: `
    <p>Label transition: <b>remove</b> <code>needs:plan</code>, <b>add</b> <code>plan:ready</code>.</p>
    <p>That is the planning gate night-shift requires (<code>plan:ready</code> ∧ <code>night-shift:ready</code>). Daytime may skip Planner when the issue is already clear.</p>
    <p>Planner never applies <code>night-shift:ready</code> — that label is night-shift ownership.</p>`,
  },
  HANDOFF: {
    kicker: "Orchestrator signal",
    title: "Board Monitor picks up",
    c: "--handoff",
    bodyHtml: `
    <p>When the orchestrator (or operator) enqueued <code>needs:plan</code>, <b>they</b> armed a <b>completion</b> board Monitor watching <code>plan:ready</code> and/or this kickoff comment.</p>
    <p>Planner arms <b>intake</b> for <code>needs:plan</code> only — never process/completion self-watches, and never spawn chips. You are not a chip.</p>`,
  },
};

export const FLOWS: Record<string, FlowDef> = {
  everything: {
    label: "Everything",
    descHtml:
      "<b>Everything.</b> All flows at once — the full planner surface. Pick one to isolate it.",
    nodes: null,
    edges: null,
  },
  drain: {
    label: "Drain the queue",
    descHtml:
      "<b>Drain the queue.</b> Poll <code>needs:plan</code>, ground the brief, write kickoff + verify plan, mark <code>plan:ready</code>, hand off via the completion board Monitor.",
    nodes: ["PLAN", "QUEUE", "RECALL", "WRITE", "READY", "HANDOFF"],
    edges: [
      "plan-queue",
      "queue-recall",
      "recall-write",
      "write-ready",
      "ready-handoff",
    ],
  },
  recall: {
    label: "Ground a brief",
    descHtml:
      "<b>Ground a brief.</b> Read the issue, linked specs, and owning slice before you write the kickoff.",
    nodes: ["PLAN", "RECALL", "WRITE"],
    edges: ["plan-recall", "recall-write"],
  },
  fork: {
    label: "Fork while planning",
    descHtml:
      "<b>Fork while planning.</b> Costed options on the issue — either finish with consult notes (<code>plan:ready</code>) or stop at <code>needs:decision</code>.",
    nodes: ["PLAN", "RECALL", "FORK", "WRITE", "READY"],
    edges: ["plan-recall", "recall-fork", "fork-write", "write-ready"],
  },
  handoff: {
    label: "Handoff to orchestrator",
    descHtml:
      "<b>Handoff.</b> <code>plan:ready</code> is the signal — the orchestrator's completion board Monitor (not the Planner process) picks it up.",
    nodes: ["READY", "HANDOFF"],
    edges: ["ready-handoff"],
  },
};

/** Chip accent per flow (CSS custom property name). */
export const FLOW_COLORS: Record<string, string> = {
  everything: "--planner",
  drain: "--queue",
  recall: "--recall",
  fork: "--fork",
  handoff: "--handoff",
};

/** Drawer content shown before any node is selected. */
export const DEFAULT_DRAWER: FlowNode = {
  kicker: "The planner",
  title: "Plan onto the board — never execute",
  c: "--planner",
  bodyHtml: `
    <p>Pick any node to see what that step does. The planner loop is designed so <b>kickoff + verify plan land on the issue once</b> — chips and night-shift consume <code>plan:ready</code>; nothing becomes code in this session.</p>
    <h4><span class="swatch" style="background:var(--queue)"></span>Drain <code>needs:plan</code></h4>
    <ul>
      <li>Opt-in enqueue; standing Fable session; one seat per repo.</li>
      <li>Never implement, dispatch, merge, or arm process/completion self-watches.</li>
      <li>When idle, arm one intake Monitor and leave it running across drains.</li>
    </ul>
    <h4><span class="swatch" style="background:var(--ready)"></span>Signal is the board</h4>
    <ul>
      <li>Remove <code>needs:plan</code>, add <code>plan:ready</code>.</li>
      <li>Orchestrator arms the <b>completion board Monitor</b>; Planner arms <b>intake</b> when idle.</li>
    </ul>`,
};
