// Feature slice: orchestrator — Cursor daytime Task/BoN dispatch anchors (#285).
// Worker A three-step remains fallback (#219 / #247 / #253).
// Shared ids so the path panel, prompt cards, and tests stay aligned.
import { SKILL_SLUGS } from "../../shared/skills/invokes";

export const CURSOR_DISPATCH_PANEL_ID = "cursor-dispatch";
export const CURSOR_HANDOFF_SKILL = SKILL_SLUGS.cursorHandoff;
export const CURSOR_ORCH_PROMPT_ID = "cursor-orch-kickoff";
export const CURSOR_WORKER_A_PROMPT_ID = "cursor-worker-a";

export const CURSOR_ORCH_PROMPT_LABEL =
  "Cursor — orchestrator · Task/BoN chips";
export const CURSOR_WORKER_A_PROMPT_LABEL =
  "Cursor — worker kickoff A · orchestrator did setup";

/** Primary daytime path — Task/BoN worktree-first (not Worker A). */
export const CURSOR_DISPATCH_PRIMARY_KICKER = "Cursor · Task/BoN default";
export const CURSOR_DISPATCH_PRIMARY_TITLE = "Task/BoN Cursor path";

/** Collapsed fallback summary — three-step Worker A. */
export const CURSOR_DISPATCH_FALLBACK_SUMMARY =
  "Fallback · Worker A three-step";

/** Fallback Step 3 — run the seat skill in the worktree. */
export const CURSOR_DISPATCH_STEP3_LEAD = "In the worktree, run";
