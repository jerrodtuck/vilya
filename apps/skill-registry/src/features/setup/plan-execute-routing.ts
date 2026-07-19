// Feature slice: setup — Plan→execute model routing doctrine (#209).
// Data behind the Setup "Plan → execute (models)" section. Tests pin these
// strings; the view only renders them.

export const AUTONOMY_LABELS = [
  "needs:plan",
  "plan:ready",
  "night-shift:ready",
  "needs:decision",
] as const;

export const PLAN_EXECUTE_INTRO =
  "Not stored in `GITHUB-PROJECTS.md` — pickers differ across Cursor and Claude Code, and preferences change often. Skills cannot flip the picker. Cursor Plan mode / CLI `--mode=plan` are optional helpers, not the contract.";

export type PlanExecuteBlock = {
  /** Bold lead-in; omit for a plain paragraph. */
  title?: string;
  body: string;
  /** Render the execute-model JSON sample after this block. */
  followWith?: "execute-model-json";
};

/** Bodies use a tiny markup: `code`, **bold**, [label](/href). */
export const PLAN_EXECUTE_BLOCKS: PlanExecuteBlock[] = [
  {
    title: "Claude Code — Planner session is the plan seat.",
    body: 'Chip flow is **not** "orchestrator `/model` plans → chip executes." Planning for chip flow belongs to a standing [Planner](/planner) session on **Fable** (`claude --model fable` or session `/model`). That session writes the kickoff + verify plan onto the issue and labels `plan:ready`. The orchestrator dispatches and monitors; it is not the planning seat. `spawn_task` has no model parameter.',
  },
  {
    title: "Chips (and the orchestrator) execute on Sonnet",
    body: "via `model` in `.claude/settings.local.json`, copied into each chip worktree by `.worktreeinclude`. Model is read at **session startup** and fixed for that session. Set the file to your **execution model**:",
    followWith: "execute-model-json",
  },
  {
    title: "Daytime",
    body: "may skip Planner when the issue is already clear (attended judgment) — hand the worker a build without waiting for `plan:ready`. Use Planner when scope, verify plan, or forks need a planning pass. **Night-shift** requires `plan:ready` ∧ `night-shift:ready` — planning is already locked on the issue; the unattended job stays on one model for the whole run.",
  },
  {
    title: "`opusplan` does not automate this.",
    body: "We tried pairing it with env overrides (`ANTHROPIC_DEFAULT_OPUS_MODEL` / `ANTHROPIC_DEFAULT_SONNET_MODEL` in `.claude/settings.local.json`) for a mid-session Fable → Sonnet switch. It did not reliably drive plan→execute in our flow — treat it as unproven. The real split is **Planner session (Fable)** vs **chip session (Sonnet file)**, not orchestrator `/model`.",
  },
  {
    title: "Single-session footnote.",
    body: "When one session both plans and implements (no Planner / no chip), `/start-feature` still asks you to switch from a planning model to an execution model before coding. That stop is not the chip-flow story.",
  },
  {
    title: "Cursor is a different mechanism.",
    body: "`.claude/settings.local.json`, `/model`, and `.worktreeinclude` are Claude Code only — Cursor reads none of them. In **Cursor**, the IDE model is chosen per conversation in the chat's model dropdown (planning and execution alike). Cursor has no repo-file-based model config — Cloud Agents take a `model.id` per dispatch in `POST /v1/agents`, falling back to your user default → team default → system default, all account-level. If you run both tools on one repo, set the model in each tool separately; neither inherits from the other.",
  },
];

export const EXECUTE_MODEL_JSON = `{
  "model": "claude-sonnet-5"
}`;
