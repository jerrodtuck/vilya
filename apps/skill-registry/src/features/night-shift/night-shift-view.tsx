// Feature slice: night-shift — unattended Dev Loop (server component).
import Link from "next/link";
import { NightAgentMap } from "./night-agent-map";

const REPO = "https://github.com/jerrodtuck/vilya";
const WORKFLOW_HREF = `${REPO}/blob/main/.github/workflows/night-shift.yml`;
const CYGNET_HREF = `${REPO}/blob/main/docs/project-tracking/templates/night-shift-dotnet-cygnet.yml`;
const SKILL_SRC_HREF = `${REPO}/blob/main/skills/night-shift/SKILL.md`;

export function NightShiftView() {
  return (
    <>
      <div className="eyebrow">Autonomous · same chain as daytime</div>
      <h1>Night shift</h1>
      <p className="lead">
        Night-shift is <b>not</b> a second methodology. It runs the daytime Dev
        Loop unattended on a <b>product</b> repo. This page maps the{" "}
        <b>agent machinery</b> — dispatch through morning report. The
        methodology map stays on <Link href="/flows">Flows</Link>.
      </p>

      <NightAgentMap
        aside={
          <div className="panel">
            <div className="kicker">Operator strip</div>
            <h3>Before / after sleep</h3>
            <div className="modes" style={{ marginTop: 12 }}>
              <div className="mode" style={{ ["--m" as string]: "var(--start)" }}>
                <b>1 · Before bed</b>
                <span>
                  Label well-specified issues <code>auto:ready</code>. No label,
                  no work. Then fire your chosen launcher (below).
                </span>
              </div>
              <div className="mode" style={{ ["--m" as string]: "var(--finish)" }}>
                <b>2 · Morning</b>
                <span>
                  Triage the report; merge Ready PRs with <code>/merge-pr</code>;
                  answer forks and drop <code>needs:decision</code> when you
                  decide.
                </span>
              </div>
              <div className="mode" style={{ ["--m" as string]: "var(--orch)" }}>
                <b>Config</b>
                <span>
                  Per-product{" "}
                  <code>docs/project-tracking/GITHUB-PROJECTS.md</code>. See{" "}
                  <Link href="/setup">Setup</Link> for Models keys; skill source
                  of truth is{" "}
                  <Link href="/skills/night-shift">/skills/night-shift</Link>.
                </span>
              </div>
            </div>
          </div>
        }
      />

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="kicker">Per-repo overnight setup</div>
        <h3>Wire the launcher once</h3>
        <p className="muted" style={{ lineHeight: 1.55, marginTop: 8 }}>
          Shared prerequisites on every product repo:{" "}
          <code>GITHUB-PROJECTS.md</code> filled, labels{" "}
          <code>auto:ready</code> / <code>needs:decision</code>, skills
          installed. The skill itself does <b>not</b> set permission mode —
          the <b>launcher</b> must pass Bypass (or you approve every tool).
          Do <b>not</b> put <code>defaultMode: bypassPermissions</code> in
          user settings if you want daytime worktrees to keep prompting.
        </p>

        <p className="muted" style={{ lineHeight: 1.55, marginTop: 12 }}>
          <b style={{ color: "var(--text)" }}>Artifacts</b>
          {" · "}
          <Link href="/skills/night-shift">skill (site)</Link>
          {" · "}
          <a href={SKILL_SRC_HREF} target="_blank" rel="noreferrer">
            skill source
          </a>
          {" · "}
          <a href={WORKFLOW_HREF} target="_blank" rel="noreferrer">
            night-shift.yml
          </a>
          {" · "}
          <a href={CYGNET_HREF} target="_blank" rel="noreferrer">
            CygNet template
          </a>
        </p>

        <div className="modes" style={{ marginTop: 14 }}>
          <div className="mode" style={{ ["--m" as string]: "var(--start)" }}>
            <b>A · GitHub Actions (canonical)</b>
            <span>
              Copy{" "}
              <a href={WORKFLOW_HREF} target="_blank" rel="noreferrer">
                <code>.github/workflows/night-shift.yml</code>
              </a>{" "}
              (or the{" "}
              <a href={CYGNET_HREF} target="_blank" rel="noreferrer">
                CygNet template
              </a>
              ). Register a self-hosted runner on that <b>private</b> repo (
              <code>self-hosted</code>, <code>windows</code>). Add secret{" "}
              <code>CLAUDE_CODE_OAUTH_TOKEN</code> from{" "}
              <code>claude setup-token</code>. Bypass is already in the
              workflow&apos;s <code>claude_args</code> (
              <code>--permission-mode bypassPermissions</code>). Fire with{" "}
              <code>gh workflow run night-shift</code> or wait for cron{" "}
              <code>0 8 * * *</code>.
            </span>
          </div>
          <div className="mode" style={{ ["--m" as string]: "var(--orch)" }}>
            <b>B · Claude Code Desktop routines</b>
            <span>
              Schedule a routine that opens the product repo (or its worktree)
              and runs the standing prompt: follow{" "}
              <Link href="/skills/night-shift">
                <code>skills/night-shift/SKILL.md</code>
              </Link>{" "}
              exactly. Enable <b>Allow bypass permissions mode</b> in Desktop
              Settings → Claude Code, then set that routine/session to{" "}
              <b>Bypass permissions</b>. Without that, overnight tool calls stop
              for approval. Prefer Actions when you need a hard non-interactive
              guarantee — Desktop scheduled tasks have been flaky about
              honoring Bypass.
            </span>
          </div>
        </div>
      </div>

      <div className="note teal" style={{ marginTop: 16 }}>
        Pipeline map above describes the <b>Actions</b> path (fresh{" "}
        <code>_work</code> clone, OIDC → <code>claude[bot]</code>, subscription
        brain). Desktop routines reuse your interactive checkout and identity —
        same skill gates, different runner. Self-hosted Actions runners belong
        on <b>private</b> repos only.
      </div>

      <div className="pagefoot">
        Instrument: <b>/night-shift</b> · opens PRs only · never merges ·{" "}
        <Link href="/flows">Flows</Link> for the daytime map.
      </div>
    </>
  );
}
