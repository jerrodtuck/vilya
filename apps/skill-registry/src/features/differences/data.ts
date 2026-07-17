// Feature slice: differences — verified Cursor vs Claude Code divergences as data.
// A living reference: add a row only once it's actually been checked against
// primary docs or tested directly. "confirmed" rows cite a source; "unverified"
// rows are flagged, never asserted as fact.

export type Certainty = "confirmed" | "unverified";

export interface DifferenceRow {
  area: string;
  claudeCode: string;
  cursor: string;
  certainty: Certainty;
  note?: string;
  sources?: { label: string; href: string }[];
}

export const DIFFERENCES: DifferenceRow[] = [
  {
    area: "Copy gitignored files into a fresh worktree",
    claudeCode: "`.worktreeinclude` — declarative gitignore-pattern list; copy is automatic",
    cursor: "`.cursor/worktrees.json` — imperative; runs a `setup-worktree(-windows|-unix)` script you write",
    certainty: "confirmed",
    note: "Neither tool reads the other's file — a repo needing both (e.g. vendor SDK binaries) needs both configs, kept in sync by hand.",
    sources: [
      { label: "Claude Code — Worktrees", href: "https://code.claude.com/docs/en/worktrees" },
      { label: "Cursor — Worktrees", href: "https://cursor.com/docs/configuration/worktrees" },
    ],
  },
  {
    area: "Background/dispatched work unit",
    claudeCode: "`spawn_task` chip / agent-view background session → own worktree, own `claude/*` branch",
    cursor: "Cloud Agent, dispatched via `POST /v1/agents` → own remote sandbox, auto-branch `cursor/...`",
    certainty: "confirmed",
    sources: [
      { label: "Claude Code — Agent view", href: "https://code.claude.com/docs/en/agent-view" },
      { label: "Cursor — Cloud Agents API", href: "https://cursor.com/docs/background-agent/api/overview" },
    ],
  },
  {
    area: "Completion notification reliability",
    claudeCode: "Two diagnosed mechanisms, not flakiness: model-initiated `send_message` reports are permission-gated in the unattended chip session — allow `mcp__ccd_session_mgmt__send_message` in user-level settings and they send; harness end-pings never fire because chip sessions idle rather than end. Poll `list_sessions`/`gh pr list` as backup.",
    cursor: "Poll a run-status endpoint, or hold an SSE stream open — official docs state webhooks are \"coming soon\" (not yet available in v1)",
    certainty: "confirmed",
    note: "Same underlying lesson on both tools: a push notification is a claim, not proof — verify against `gh` before acting on it.",
    sources: [
      { label: "Cursor — Cloud Agents API", href: "https://cursor.com/docs/background-agent/api/overview" },
    ],
  },
  {
    area: "Does a dispatched worker ever merge its own PR?",
    claudeCode: "Never — opens the PR, stops. Merge is the operator/orchestrator's job from the main clone.",
    cursor: "Never — `autoCreatePR` opens the PR for human review; no auto-merge parameter exists.",
    certainty: "confirmed",
    sources: [
      { label: "Cursor — Cloud Agents API", href: "https://cursor.com/docs/background-agent/api/overview" },
    ],
  },
  {
    area: "Plan-model / execute-model routing",
    claudeCode: "No automatic mid-session switch — tried `opusplan` (`ANTHROPIC_DEFAULT_OPUS_MODEL` / `ANTHROPIC_DEFAULT_SONNET_MODEL` env overrides) and it did not reliably drive plan→execute in our chip flow. Model is fixed at session startup — but the chip flow already splits plan/execute across sessions: the orchestrator plans on its `/model` pick, the chip executes on the `model` in the `settings.local.json` copied into its worktree via `.worktreeinclude`. The model boundary is the dispatch boundary.",
    cursor: "No automatic plan→execute model switch documented either — but Cloud Agents accept `mode: \"plan\"` for the first run and a per-dispatch `model.id`, so a plan-dispatch → execute-dispatch split on different models is expressible directly in the API",
    certainty: "confirmed",
    sources: [
      { label: "Claude Code — Model config", href: "https://code.claude.com/docs/en/model-config" },
      { label: "Cursor — Cloud Agents API", href: "https://cursor.com/docs/background-agent/api/overview" },
    ],
  },
  {
    area: "Where the model choice lives",
    claudeCode: "`model` in `.claude/settings.local.json` — read at session startup, so it sets the default for every new session, and chips inherit it via the copy `.worktreeinclude` places in their worktree. `/model` overrides the current session only. `spawn_task` has no model parameter — a chip's model is whatever that copied file says.",
    cursor: "IDE: per-conversation model dropdown. Cloud Agents: `model.id` on `POST /v1/agents` per dispatch; when omitted, resolves user default → team default → system default — all account-level, no repo-file-based model config. Neither tool reads the other's setting: both tools on one repo means setting the model in each separately.",
    certainty: "confirmed",
    note: "Claude Code side directly tested (2026-07-17); Cursor side from the Cloud Agents API reference. Notable asymmetry: Cursor can pin a model per dispatched worker in the API call; Claude Code pins it via the file copied into the chip's worktree.",
    sources: [
      { label: "Claude Code — Model config", href: "https://code.claude.com/docs/en/model-config" },
      { label: "Cursor — Cloud Agents API", href: "https://cursor.com/docs/background-agent/api/overview" },
    ],
  },
];
