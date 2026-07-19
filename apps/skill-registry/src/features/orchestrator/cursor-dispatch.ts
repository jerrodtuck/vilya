// Feature slice: orchestrator — Cursor dispatch anchors (#219)
// + Worker A seat skill invoke (#247 / #253).
// Shared ids so the path panel, prompt cards, and tests stay aligned.

export const CURSOR_DISPATCH_PANEL_ID = "cursor-dispatch";
export const CURSOR_HANDOFF_SKILL = "cursor-handoff";
export const CURSOR_ORCH_PROMPT_ID = "cursor-orch-kickoff";
export const CURSOR_WORKER_A_PROMPT_ID = "cursor-worker-a";

export const CURSOR_ORCH_PROMPT_LABEL =
  "Cursor — orchestrator kickoff (no comms layer)";
export const CURSOR_WORKER_A_PROMPT_LABEL =
  "Cursor — worker kickoff A · orchestrator did setup";

/** Step 3 of the numbered Cursor path — run the seat skill in the worktree. */
export const CURSOR_DISPATCH_STEP3_LEAD =
  "In the worktree, run";
