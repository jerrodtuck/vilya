// Feature slice: night-shift — unattended Dev Loop (server component).
import Link from "next/link";
import { loadNightShiftTemplate } from "./load-night-shift-template";
import { NightAgentMap } from "./night-agent-map";
import { NightShiftWorkflowTool } from "./night-shift-workflow-tool";

const REPO = "https://github.com/jerrodtuck/vilya";
const WORKFLOW_HREF = `${REPO}/blob/main/.github/workflows/night-shift.yml`;
const TEMPLATE_HREF = `${REPO}/blob/main/docs/project-tracking/templates/night-shift.yml`;
const SKILL_SRC_HREF = `${REPO}/blob/main/skills/night-shift/SKILL.md`;

export function NightShiftView() {
  const workflowTemplate = loadNightShiftTemplate();

  return (
    <>
      <div className="eyebrow">Autonomous · same chain as daytime</div>
      <h1>Night shift</h1>
      <p className="lead">
        Night-shift is <b>not</b> a second methodology. It runs the daytime Dev
        Loop unattended on a <b>product</b> repo. This page maps the{" "}
        <b>agent machinery</b> — dispatch through morning report. The
        methodology map stays on <Link href="/orchestrator">Orchestrator</Link>.
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
                  <Link href="/setup">Setup</Link> for repo config; skill source
                  of truth is{" "}
                  <Link href="/skills/night-shift">/skills/night-shift</Link>.
                </span>
              </div>
            </div>
          </div>
        }
      />

      <div className="panel" style={{ marginTop: 20 }} id="generate-workflow">
        <div className="kicker">Per-repo overnight setup</div>
        <h3>Generate workflow YAML</h3>
        <p className="muted" style={{ lineHeight: 1.55, marginTop: 8 }}>
          One generic workflow for every stack. Type the product repo and your
          machine&apos;s <code>claude.exe</code> path — download{" "}
          <code>night-shift.yml</code> into{" "}
          <code>.github/workflows/</code>.{" "}
          <b>Stack</b>, <b>Crucible variant</b>, and <b>Test command</b> stay in
          that repo&apos;s <code>GITHUB-PROJECTS.md</code> (use{" "}
          <Link href="/setup">Setup → Regenerate</Link>). Prerequisites: private
          repo, skills + autonomy labels, Bypass only in the launcher (not user
          defaults).
        </p>

        {workflowTemplate ? (
          <NightShiftWorkflowTool template={workflowTemplate} />
        ) : (
          <p className="note" style={{ marginTop: 12 }}>
            Template unavailable at runtime — copy{" "}
            <a href={TEMPLATE_HREF} target="_blank" rel="noreferrer">
              <code>docs/project-tracking/templates/night-shift.yml</code>
            </a>{" "}
            and set <code>path_to_claude_code_executable</code> by hand.
          </p>
        )}

        <p className="muted" style={{ lineHeight: 1.55, marginTop: 16 }}>
          <b style={{ color: "var(--text)" }}>Artifacts</b>
          {" · "}
          <Link href="/skills/night-shift">skill (site)</Link>
          {" · "}
          <a href={SKILL_SRC_HREF} target="_blank" rel="noreferrer">
            skill source
          </a>
          {" · "}
          <a href={TEMPLATE_HREF} target="_blank" rel="noreferrer">
            portable template
          </a>
          {" · "}
          <a href={WORKFLOW_HREF} target="_blank" rel="noreferrer">
            live workflow
          </a>
        </p>

        <div className="modes" style={{ marginTop: 14 }}>
          <div className="mode" style={{ ["--m" as string]: "var(--orch)" }}>
            <b>Alternative · Claude Code Desktop routines</b>
            <span>
              Schedule a routine that opens the product repo (or its worktree)
              and runs the standing prompt: follow{" "}
              <Link href="/skills/night-shift">
                <code>skills/night-shift/SKILL.md</code>
              </Link>{" "}
              exactly. Enable <b>Allow bypass permissions mode</b> in Desktop
              Settings → Claude Code, then set that routine/session to{" "}
              <b>Bypass permissions</b>. Prefer Actions when you need a hard
              non-interactive guarantee — Desktop has been flaky about Bypass.
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
        <Link href="/orchestrator">Orchestrator</Link> for the daytime map.
      </div>
    </>
  );
}
