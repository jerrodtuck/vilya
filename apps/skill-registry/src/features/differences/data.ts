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
    claudeCode: "Push-style completion ping to the spawning session — observed unreliable in practice; poll `list_sessions`/`gh pr list` instead",
    cursor: "Poll a run-status endpoint, or hold an SSE stream open — official docs state webhooks are \"coming soon\" (not yet available in v1)",
    certainty: "confirmed",
    note: "Same underlying lesson on both tools: don't trust a push notification for orchestration — poll.",
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
    claudeCode: "`opusplan` mode: plan phase runs the `opus` alias, execute runs `sonnet` — repoint either via `ANTHROPIC_DEFAULT_OPUS_MODEL` / `ANTHROPIC_DEFAULT_SONNET_MODEL` env overrides in `settings.local.json`",
    cursor: "Not yet checked — don't assume Cursor has (or lacks) an equivalent automatic plan→execute model switch",
    certainty: "unverified",
    sources: [
      { label: "Claude Code — Model config", href: "https://code.claude.com/docs/en/model-config" },
    ],
  },
];
