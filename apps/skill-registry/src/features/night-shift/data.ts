// Feature slice: night-shift — typed stage content for the night-agent pipeline map.
// Stage bodies are trusted, hand-authored HTML (same posture as flows/data.ts).

export type StageKind = "happy" | "safety" | "failure";

export interface NightStage {
  id: string;
  kicker: string;
  title: string;
  /** Short label on the SVG node. */
  mapTitle: string;
  /** Subtitle under the map title. */
  mapRole: string;
  /** CSS custom property for the stage accent. */
  c: string;
  kind: StageKind;
  chipLabel: string;
  bodyHtml: string;
}

/** Ordered happy-path spine, then failure. */
export const STAGE_ORDER = [
  "DISPATCH",
  "RUNNER",
  "IDENTITY",
  "LOOP",
  "STEERING",
  "OUTPUTS",
  "FAILURE",
] as const;

export type StageId = (typeof STAGE_ORDER)[number];

export const STAGES: Record<StageId, NightStage> = {
  DISPATCH: {
    id: "DISPATCH",
    kicker: "1 · Dispatch",
    title: "How the run starts",
    mapTitle: "Dispatch",
    mapRole: "trigger",
    c: "--start",
    kind: "happy",
    chipLabel: "Dispatch",
    bodyHtml: `
    <p>Two triggers on <code>.github/workflows/night-shift.yml</code>:</p>
    <ul>
      <li><b>Manual</b> — <code>workflow_dispatch</code> from Actions UI or <code>gh workflow run night-shift</code>.</li>
      <li><b>Scheduled</b> — cron <code>0 8 * * *</code> (~2–3am America/Chicago, UTC). Active on this repo.</li>
    </ul>
    <p>Concurrency group <code>night-shift</code> with <code>cancel-in-progress: false</code> — one overnight run finishes before another cancels it.</p>
    <h4><span class="swatch" style="background:var(--start)"></span>Operator strip</h4>
    <ul>
      <li>Before bed: label eligible issues <code>auto:ready</code>.</li>
      <li>Optional: fire manually if you do not want to wait for cron.</li>
    </ul>`,
  },
  RUNNER: {
    id: "RUNNER",
    kicker: "2 · Runner",
    title: "Self-hosted Windows box",
    mapTitle: "Runner",
    mapRole: "Listener · _work",
    c: "--orch",
    kind: "happy",
    chipLabel: "Runner",
    bodyHtml: `
    <p>Job runs on <code>runs-on: [self-hosted, windows]</code> for every product repo
    (Next.js or CygNet). The listener long-polls GitHub, then spawns a worker for the job.</p>
    <ul>
      <li>Fresh <b>full-history</b> clone (<code>actions/checkout@v4</code>, <code>fetch-depth: 0</code>) under the runner&apos;s <code>_work</code> directory.</li>
      <li>That checkout is <b>distinct</b> from the operator&apos;s daytime clone — night-shift never shares your dirty working tree.</li>
      <li>Node, Git for Windows, and <code>gh</code> must be on the listener process PATH.</li>
    </ul>
    <h4><span class="swatch" style="background:var(--orch)"></span>Setup (once per repo)</h4>
    <ul>
      <li>Register a self-hosted runner on the <b>private</b> product repo; separate folder per repo; labels <code>self-hosted</code>, <code>windows</code>. Per-repo registration scopes the box — no stack label required.</li>
      <li><b>Bring-up:</b> <code>.\\run.cmd</code> (foreground; keep the terminal open). <b>Always-on:</b> <code>.\\svc.cmd install</code> + <code>start</code> when that script exists (admin).</li>
      <li>Change labels later in Settings → Runners → edit Labels (or remove + re-register). Missing labels = job queued forever.</li>
      <li>Bash: workflow pins Git Bash via <code>GITHUB_PATH</code> — host PATH tweaks unnecessary when that pin is present. See Failure layer.</li>
    </ul>`,
  },
  IDENTITY: {
    id: "IDENTITY",
    kicker: "3 · Identity",
    title: "Two identities, one loop",
    mapTitle: "Identity",
    mapRole: "OIDC · OAuth",
    c: "--impl",
    kind: "happy",
    chipLabel: "Identity",
    bodyHtml: `
    <p>The teaching moment: <b>writes</b> and <b>brain</b> are separate credentials.</p>
    <ul>
      <li><b>GitHub writes as <code>claude[bot]</code></b> — <code>id-token: write</code> lets
        <code>anthropics/claude-code-action</code> exchange an OIDC token for a Claude GitHub App installation token. PRs and commits land as the App, not as you.</li>
      <li><b>Subscription brain</b> — repo secret <code>CLAUDE_CODE_OAUTH_TOKEN</code> from
        <code>claude setup-token</code> (Max/Pro). Inference bills the subscription, not pay-per-token API.</li>
      <li><code>GH_TOKEN: \${{ github.token }}</code> is also present for Actions-scoped API calls.</li>
    </ul>
    <p>Permissions on the workflow: <code>contents</code>, <code>pull-requests</code>, <code>issues</code> write; <code>id-token: write</code>; <code>actions: read</code>.</p>`,
  },
  LOOP: {
    id: "LOOP",
    kicker: "4 · Headless loop",
    title: "Think → tool → result",
    mapTitle: "Loop",
    mapRole: "max-turns 60",
    c: "--review",
    kind: "happy",
    chipLabel: "Loop",
    bodyHtml: `
    <p>Single job step: <code>anthropics/claude-code-action@v1</code> with a prompt that points at
    <code>skills/night-shift/SKILL.md</code>.</p>
    <ul>
      <li><code>--max-turns 60</code> caps the think → tool → result cycles.</li>
      <li>Allowed tools: <code>Edit</code>, <code>Read</code>, <code>Write</code>, <code>Bash</code> —
        Bash is how it runs <code>git</code> / <code>gh</code> / <code>npm</code> with the same conventions you use daytime.</li>
      <li><code>--permission-mode bypassPermissions</code> — unattended; the skill&apos;s gates replace interactive consent.</li>
      <li><code>path_to_claude_code_executable</code> points at a pre-installed
        <code>claude.exe</code> — the action&apos;s Windows CLI installer is unsupported.</li>
    </ul>`,
  },
  STEERING: {
    id: "STEERING",
    kicker: "5 · Skill steering",
    title: "Operator judgment, written down",
    mapTitle: "Steering",
    mapRole: "auto:ready · gates",
    c: "--blocked",
    kind: "safety",
    chipLabel: "Steering",
    bodyHtml: `
    <p><code>skills/night-shift/SKILL.md</code> is not a second methodology — it runs the
    <b>same daytime chain</b> with hard unattended rules.</p>
    <ul>
      <li><b>Preflight</b> — abort loudly if <code>git</code>/<code>gh</code>/tests are unavailable.</li>
      <li><b>Eligibility</b> — only <code>auto:ready</code>; skip <code>needs:decision</code> and <code>type:epic</code>.</li>
      <li><b>Chain</b> — <code>/start-feature</code> → implement → <code>/crucible-&lt;stack&gt;</code> (≤3 rounds to Ready) → <code>/finish-feature</code>.</li>
      <li><b>Fork stop</b> — comment + recommendation, label <code>needs:decision</code>, Blocked, next issue. Never guess.</li>
      <li><b>PR never merge</b> — open only; operator merges via <code>/merge-pr</code> in the morning.</li>
      <li><b>Morning report</b> — PR opened / needs call / stuck / skipped.</li>
      <li>Budget: up to 3 issues per run.</li>
    </ul>
    <p class="ns-safety-note">Safety gates are the product — visually distinct from the happy-path spine on purpose.</p>`,
  },
  OUTPUTS: {
    id: "OUTPUTS",
    kicker: "6 · Outputs",
    title: "What you wake up to",
    mapTitle: "Outputs",
    mapRole: "PR · board · report",
    c: "--finish",
    kind: "happy",
    chipLabel: "Outputs",
    bodyHtml: `
    <p>Proven on the first green overnight run (#29 → PR #34):</p>
    <ul>
      <li>Feature branch authored as <b><code>claude[bot]</code></b>.</li>
      <li>Pull request opened (<code>Closes #</code> or <code>Refs #</code> per merge routing) — <b>never merged</b> by the agent.</li>
      <li>Board Status moved (In Progress → Done / Blocked / Verifying as appropriate).</li>
      <li>Morning report posted so triage is a review queue, not archaeology.</li>
    </ul>
    <h4><span class="swatch" style="background:var(--finish)"></span>Your morning</h4>
    <ul>
      <li>Triage the report; merge Ready PRs with <code>/merge-pr</code>.</li>
      <li>Answer forks and drop <code>needs:decision</code> when you decide.</li>
    </ul>`,
  },
  FAILURE: {
    id: "FAILURE",
    kicker: "7 · Failure layer",
    title: "Bring-up ledger (teaching aid)",
    mapTitle: "Failure",
    mapRole: "walls hit · fixed",
    c: "--bug",
    kind: "failure",
    chipLabel: "Failure",
    bodyHtml: `
    <p>Real walls from wiring the runner (#23, PRs #31–#33) — keep them visible so the next
    machine does not rediscover them silently:</p>
    <ol>
      <li><b>WSL bash stub</b> — <code>bash</code> often resolves to <code>System32\\bash.exe</code>. With only <code>docker-desktop</code>, steps die with <code>execvpe(/bin/bash) failed</code>. Fix: workflow Git Bash pin (<code>GITHUB_PATH</code> + <code>CLAUDE_CODE_GIT_BASH_PATH</code>) — shipped in the generic template.</li>
      <li><b>Label mismatch</b> — job <code>runs-on</code> must be a subset of the runner&apos;s labels (extra labels on the runner are fine; a missing required label → queued forever).</li>
      <li><b><code>id-token: write</code></b> — required for OIDC → Claude GitHub App token exchange.</li>
      <li><b>Claude GitHub App install</b> — App must be installed on the repo or org.</li>
      <li><b>Windows CLI installer</b> — unsupported; point at a <b>pre-installed</b> <code>claude.exe</code>.</li>
      <li><b>Expired OAuth session</b> — refresh with <code>claude setup-token</code> and update the repo secret.</li>
    </ol>
    <p class="ns-safety-note"><b>Shared-profile caveat:</b> a service or long-lived <code>run.cmd</code> listener uses the operator&apos;s
    <code>~/.claude</code> profile on this machine. An expired desktop session can break overnight runs
    even when the repo secret looks fine.</p>`,
  },
};

export function stageList(): NightStage[] {
  return STAGE_ORDER.map((id) => STAGES[id]);
}

export function isDistinctKind(kind: StageKind): boolean {
  return kind === "safety" || kind === "failure";
}
