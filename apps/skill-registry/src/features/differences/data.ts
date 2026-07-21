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
    cursor:
      "Local: Task / `best-of-n-runner` with an **explicit worktree-first** ask (or CLI `--worktree`) — BoN does **not** auto-isolate (Support 2026-07-20). Cloud: `POST /v1/agents` → Linux VM sandbox, auto-branch `cursor/...` (portable stacks only; see cloud platform gate).",
    certainty: "confirmed",
    note: "Same outcome (chip opens PR, never merges). Different spawn APIs — never teach silent isolation on Cursor.",
    sources: [
      { label: "Claude Code — Agent view", href: "https://code.claude.com/docs/en/agent-view" },
      { label: "Cursor — Cloud Agents API", href: "https://cursor.com/docs/background-agent/api/overview" },
    ],
  },
  {
    area: "Local Task / BoN worktree isolation",
    claudeCode: "`spawn_task` always lands in its own worktree — isolation is the product default.",
    cursor:
      "BoN / local Task does **not** auto-create a worktree. Kickoff must mandate worktree-first, or use CLI `--worktree`. Without that ask, the chip can run in the main clone (probed 2026-07-20; confirmed with Cursor Support the same day).",
    certainty: "confirmed",
    note: "Failure museum: BoN without worktree ask → main clone. Cloud Task is a different path (remote VM), not a substitute for local isolation.",
  },
  {
    area: "Cloud Task platform gate",
    claudeCode: "N/A as primary desktop chip path — chips are local `spawn_task` worktrees.",
    cursor:
      "Cloud Task = Linux VM. OK for portable stacks (Next.js, docs, most pure-cloud work). **Not** Anduin / CygNet — Windows SDK + local CygNet network are unreachable from that VM.",
    certainty: "confirmed",
    note: "Pick cloud vs local from the product’s host/network reality, not from habit. SCADA / CygNet products stay on local worktree chips.",
  },
  {
    area: "Completion notification reliability",
    claudeCode: "Two diagnosed mechanisms, not flakiness: model-initiated `send_message` always prompts the user for confirmation by product contract — no permission rule silences it (directly tested twice, 2026-07-17) — so it cannot carry an unattended report; harness end-pings never fire because chip sessions idle rather than end. Unattended signal = `gh` side channels (completion comment on the issue, REST `pulls?head=`) + an orchestrator Monitor-tool monitor armed at dispatch.",
    cursor: "Cloud Agents API: poll a run-status endpoint, or hold an SSE stream open — official docs state webhooks are \"coming soon\" (not yet available in v1). IDE orchestrator: unattended signal = the same `gh` side channels + a background shell with `notify_on_output` on REST (`pulls?head=` + issue comments) — not Projects/GraphQL / `gh pr list`. Local Task also returns to the parent session when it finishes (same-session wake) — still verify against the issue comment.",
    certainty: "confirmed",
    note: "Same underlying lesson on both tools: a push notification is a claim, not proof — verify against `gh` before acting on it.",
    sources: [
      { label: "Cursor — Cloud Agents API", href: "https://cursor.com/docs/background-agent/api/overview" },
    ],
  },
  {
    area: "Chip-completion / board monitor mechanism",
    claudeCode: "Monitor tool — each stdout line streams to the session as a live event. Never an exit-only background shell watch loop (detects in the output file but never notifies while the loop is still running).",
    cursor: "No Monitor tool. Equivalent: background shell + `notify_on_output` (stdout match wakes the session). Watch REST only — `gh api …/pulls?head=<owner>:<branch>&state=open` + `gh api …/issues/<N>/comments?since=<iso>` at **≥120s**; seed last-seen PR number + comment id and wake **only on change** (never re-announce a standing open PR). Those shells are **mortal** — Cursor may tear them down; arm → assume mortal → re-arm on noticed death / long gaps / missing expected signal (one REST check). Do not kill/re-arm every drain. Never `gh pr list` / `gh project item-list` / GraphQL on the hot path (Projects GraphQL exhausted a 5k/hour budget in minutes in a 2026-07-19 experiment).",
    certainty: "confirmed",
    note: "The old \"never a background shell loop\" rule means never an exit-only notifier. Cursor's `notify_on_output` watcher is the Monitor equivalent, but not lifetime-parity with Claude's Monitor tool (#270). Claude's Monitor tool, if it shells `gh`, uses the same REST endpoints — never `gh pr list`. Doctrine (side channel = issue/PR comments) is shared; mechanism differs by host. Full recipe: `/vilya-chip` §3.",
  },
  {
    area: "Does a dispatched worker ever merge its own PR?",
    claudeCode: "Never — opens the PR, stops. Merge is the operator/orchestrator's job from the main clone.",
    cursor: "Never — `autoCreatePR` opens the PR for human review; no auto-merge parameter exists. Local Task chips likewise open the PR and stop.",
    certainty: "confirmed",
    sources: [
      { label: "Cursor — Cloud Agents API", href: "https://cursor.com/docs/background-agent/api/overview" },
    ],
  },
  {
    area: "Plan-model / execute-model routing",
    claudeCode: "No automatic mid-session switch — tried `opusplan` + env overrides and it did not reliably drive plan→execute inside one session. Chip-flow split is across sessions: a standing Planner on Fable writes the kickoff + verify plan and labels `plan:ready`; the chip session executes on Sonnet. The orchestrator is not the planning seat. Daytime may skip Planner when the issue is already clear; night-shift requires `plan:ready` ∧ `night-shift:ready`.",
    cursor:
      "Daytime Planner is **optional** (#271 Option A): orchestrator or in-session plan may write the kickoff; enqueue standing `/vilya-planner` only for night-shift / hard forks / when you want the Fable drain. Optional plan→execute **model** split: two Tasks on the same worktree (e.g. Grok then Composer). **Same model for both is valid** — single-model chips are the default shortcut. `resume` keeps the prior model (no mid-flight switch). Cloud Agents still accept `mode: \"plan\"` + per-dispatch `model.id` when using the API path.",
    certainty: "confirmed",
    note: "Do not teach “chip flow = orchestrator `/model` plans → Sonnet chip.” That was the #89 altitude error; Planner session = plan model, chip session = execute model. On Cursor, do not assume a standing Planner seat is required for ordinary daytime chips.",
    sources: [
      { label: "Claude Code — Model config", href: "https://code.claude.com/docs/en/model-config" },
      { label: "Cursor — Cloud Agents API", href: "https://cursor.com/docs/background-agent/api/overview" },
    ],
  },
  {
    area: "Where the model choice lives",
    claudeCode: "Planner seat: launch or session `/model` on the standing Fable session (not a repo file). Execute path: `model` in `.claude/settings.local.json` — read at session startup; chips inherit it via `.worktreeinclude`. `/model` overrides the current session only. `spawn_task` has no model parameter — a chip's model is whatever that copied file says.",
    cursor: "IDE: per-conversation / per-Task model dropdown — not Claude's settings file. Optional two-Task sequence picks a model per Task on the same worktree. Cloud Agents: `model.id` on `POST /v1/agents` per dispatch; when omitted, resolves user default → team default → system default — all account-level, no repo-file-based model config. Neither tool reads the other's setting: both tools on one repo means setting the model in each separately.",
    certainty: "confirmed",
    note: "Claude Code side directly tested (2026-07-17); Cursor side from the Cloud Agents API reference + IDE picker behavior + 2026-07-20 two-Task probe. Asymmetry: Cursor pins per dispatch / Task; Claude Code pins chip execute via the worktree file and pins plan via the Planner session's `/model` — not via orchestrator `/model`.",
    sources: [
      { label: "Claude Code — Model config", href: "https://code.claude.com/docs/en/model-config" },
      { label: "Cursor — Cloud Agents API", href: "https://cursor.com/docs/background-agent/api/overview" },
    ],
  },
  {
    area: "Cross-session communication / session management",
    claudeCode:
      "`ccd_session_mgmt` MCP server — any session can manage the others: `list_sessions` enumerates sessions with cwd/branch/PR state, `send_message` pushes a message into another session's chat but always prompts the user for confirmation by product contract (not permission-gated — an allow rule does not silence it), `archive_session` stops a session's process and releases its worktree hold (also exposed as an \"Auto-archive on PR close\" preference). Unattended chip→orchestrator reporting therefore rides the same workaround as Cursor: `gh` side channels (completion comment on the issue) plus an orchestrator monitor. All three tools directly exercised 2026-07-17.",
    cursor:
      "No documented equivalent of `ccd_session_mgmt` — the Cloud Agents API is pull-only from the outside: poll the run-status endpoint or hold an SSE stream open (webhooks \"coming soon\"). The API reference surfaces no agent-initiated push into another conversation, and no session-enumeration or archive API surfaced to conversations. IDE orchestrator unattended reporting: `gh` side channels + background shell with `notify_on_output` on REST (see chip-completion monitor row). Local Task return to the parent is same-session only — not a peer-session bus.",
    certainty: "confirmed",
    note: "Pairs with the model-selection asymmetry row: Cursor gives the dispatcher more control going in (per-dispatch `model.id`); Claude Code gives the orchestrator more session control (`list_sessions` / `archive_session`). For unattended reporting the tools converge on `gh` side channels — Claude arms the Monitor tool, Cursor arms REST + `notify_on_output`.",
    sources: [
      { label: "Claude Code — Agent view", href: "https://code.claude.com/docs/en/agent-view" },
      { label: "Cursor — Cloud Agents API", href: "https://cursor.com/docs/background-agent/api/overview" },
    ],
  },
];
