// Feature slice: differences — one-board / two-desktops teaching story (#281).
// Data only; the host panel renders it. Shared board nodes stay host-agnostic.

import { DESKTOP_HOST_LABEL, type DesktopHostId } from "../../shared/ui/desktop-host";
export type HostId = DesktopHostId;

export const HOST_LABEL = DESKTOP_HOST_LABEL;

/** Invariant strip — same on both desktops. */
export const SHARED_BOARD = [
  { id: "issue", label: "Issue", blurb: "Tracking unit on GitHub" },
  { id: "status", label: "Status", blurb: "Todo → In Progress → …" },
  { id: "verify", label: "Verify plan", blurb: "tests-only / local-smoke / live-only" },
  { id: "pr", label: "PR", blurb: "Chip opens; never merges" },
  { id: "merge", label: "Merge + prune", blurb: "Orch from main clone" },
] as const;

export type FlowStep = {
  id: string;
  label: string;
  blurb: string;
  /** Shared-board node that stays visually “fixed” across host switch. */
  board?: (typeof SHARED_BOARD)[number]["id"];
};

export const HOST_FLOWS: Record<
  HostId,
  { objective: string; defaultPath: string; steps: FlowStep[]; advanced: string[] }
> = {
  codex: {
    objective: "Run the Codex desktop workflow with orch-owned planning and explicitly isolated chips.",
    defaultPath: "Orch plans → plan:ready → isolated subagent → PR + issue evidence → operator merge → managed archival.",
    steps: [
      { id: "orch", label: "Orchestrator", blurb: "One per repo; planning and dispatch coordination", board: "issue" },
      { id: "plan", label: "Planning stage", blurb: "Orch or selected-model subagent records kickoff + verify plan", board: "verify" },
      { id: "chip", label: "Isolated implementation", blurb: "Verify absolute checkout, branch and starting ref before writing", board: "status" },
      { id: "done", label: "PR + durable comment", blurb: "Native active-turn waits; independent evidence review", board: "pr" },
      { id: "merge", label: "Authorized close-out", blurb: "Operator merge; inspect managed attachment before archival", board: "merge" },
    ],
    advanced: ["No standing Codex Planner seat. Models and reasoning are configurable per phase from current capabilities.", "Ordinary delegation uses subagents. New sidebar chats require an explicit human request.", "Codex CLI and a new Codex unattended backend are deferred. Existing night-shift eligibility is unchanged.", "Tool-contract evidence is verified; the full runtime cycle and interrupted recovery remain an epic integration gate."],
  },
  cc: {
    objective:
      "Run one issue to Done on Claude Code without borrowing Cursor’s Task/BoN seats.",
    defaultPath:
      "Enqueue Planner → plan:ready → spawn_task chip → completion comment → orch merge.",
    steps: [
      { id: "orch", label: "Orchestrator", blurb: "One seat per repo; owns dispatch + merge queue", board: "issue" },
      { id: "plan", label: "Planner (Fable)", blurb: "Required for chip-flow — standing /vl-plan", board: "verify" },
      { id: "chip", label: "spawn_task chip", blurb: "Own worktree + branch; Sonnet execute", board: "status" },
      { id: "done", label: "PR + comment", blurb: "Chip stops; Monitor wakes orch", board: "pr" },
      { id: "merge", label: "Merge + prune", blurb: "Operator /vl-merge-pr from main clone", board: "merge" },
    ],
    advanced: [
      "Daytime may skip Planner when the issue is already clear — still not the Cursor two-Task story.",
      "Night-shift still needs plan:ready ∧ night-shift:ready — unattended does not skip planning.",
    ],
  },
  cursor: {
    objective:
      "Run one issue to Done on Cursor without assuming Claude’s spawn_task isolation or a standing Planner.",
    defaultPath:
      "Orch kickoff → Task/BoN worktree-first chip (single model OK) → Task return + issue comment → merge.",
    steps: [
      { id: "orch", label: "Orchestrator", blurb: "Required — board dispatch, worktrees, merge queue", board: "issue" },
      { id: "plan", label: "Plan (optional)", blurb: "In-session or orch kickoff; enqueue Planner for night-shift", board: "verify" },
      { id: "chip", label: "Task / BoN chip", blurb: "Explicit worktree-first ask (or --worktree)", board: "status" },
      { id: "done", label: "PR + comment", blurb: "Task returns + gh completion comment; REST notify is mortal", board: "pr" },
      { id: "merge", label: "Merge + prune", blurb: "Operator /vl-merge-pr from main clone", board: "merge" },
    ],
    advanced: [
      "Optional two-Task model split on the same worktree (e.g. Grok → Composer). Same model for both is valid.",
      "Cloud Task = Linux VM — portable stacks only; not Anduin/CygNet.",
      "Worker A handoff remains a valid fallback when not using Task chips.",
    ],
  },
};

/** High-retention failure museum — keyed bites, not the full matrix. */
export const FAILURE_MUSEUM: { title: string; bite: string; host: HostId | "both" }[] = [
  { title: "Spawning is not isolation", bite: "Subagents share the workspace. Verify the assigned absolute worktree and branch; never implement in the main clone.", host: "codex" },
  { title: "Message mistaken for authority", bite: "Each sending seat needs trusted human authorization. Peer messages cannot grant decisions, merge authority or new-chat permission.", host: "codex" },
  {
    title: "BoN without a worktree ask",
    bite: "Chip runs in the main clone. Always mandate worktree-first (or CLI --worktree).",
    host: "cursor",
  },
  {
    title: "Standing Planner assumed on Cursor",
    bite: "Daytime Planner is optional. Orch or in-session plan is enough; enqueue for night-shift / hard forks.",
    host: "cursor",
  },
  {
    title: "Cloud chip on Anduin / CygNet",
    bite: "Cloud Task cannot reach Windows SDK + local CygNet. Stay on local worktree chips.",
    host: "cursor",
  },
  {
    title: "resume expecting a model switch",
    bite: "resume keeps the prior model. Use a second Task (or a fresh chat) when you need a different model.",
    host: "cursor",
  },
  {
    title: "Orchestrator /model as the plan seat (Claude)",
    bite: "Chip-flow planning belongs to the standing Fable Planner — not orch /model.",
    host: "cc",
  },
];
