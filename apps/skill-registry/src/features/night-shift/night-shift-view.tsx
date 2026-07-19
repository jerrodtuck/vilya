// Feature slice: night-shift — operator-first page (server component).
// Bands: Header → Setup once → Run tonight → How it works → Troubleshoot.
import Link from "next/link";
import { loadNightShiftTemplate } from "./load-night-shift-template";
import { NightAgentMap } from "./night-agent-map";
import { NightShiftWorkflowTool } from "./night-shift-workflow-tool";
import { SETUP_ONCE_STEPS, RUN_TONIGHT_STEPS } from "./operator-bands";
import { VERIFY_CHECKS } from "./operator-guide";
import { OperatorSteps } from "./operator-steps";
import { TroubleshootTable } from "./troubleshoot-table";

const REPO = "https://github.com/jerrodtuck/vilya";
const WORKFLOW_HREF = `${REPO}/blob/master/.github/workflows/night-shift.yml`;
const TEMPLATE_HREF = `${REPO}/blob/master/docs/project-tracking/templates/night-shift.yml`;
const SKILL_SRC_HREF = `${REPO}/blob/master/skills/night-shift/SKILL.md`;

function MapAside() {
  return (
    <div className="panel">
      <div className="kicker">Reading the map</div>
      <h3>Theory band</h3>
      <div className="modes" style={{ marginTop: 12 }}>
        <div className="mode" style={{ ["--m" as string]: "var(--orch)" }}>
          <b>Happy path</b>
          <span>
            Dispatch → Runner → Identity → Loop → Steering → Outputs. Click a
            stage for detail.
          </span>
        </div>
        <div className="mode" style={{ ["--m" as string]: "var(--blocked)" }}>
          <b>Steering</b>
          <span>
            Safety gates (<code>auto:ready</code>, fork stop, never merge) —
            visually distinct on purpose.
          </span>
        </div>
        <div className="mode" style={{ ["--m" as string]: "var(--bug)" }}>
          <b>Failure</b>
          <span>
            Visual ledger of bring-up walls. Operable fixes:{" "}
            <a href="#troubleshoot">Troubleshoot</a>.
          </span>
        </div>
      </div>
    </div>
  );
}

export function NightShiftView() {
  const workflowTemplate = loadNightShiftTemplate();

  return (
    <>
      <div className="eyebrow">Operator first · unattended Dev Loop</div>
      <h1>Night shift</h1>
      <p className="lead">
        Wire a product repo once, then start overnight runs.{" "}
        <b>Setup once → Run tonight</b> — the pipeline map comes after you can
        operate. Same daytime Dev Loop, unattended; methodology stays on{" "}
        <Link href="/orchestrator">Orchestrator</Link>.
      </p>

      <h2 id="setup-once">Setup once</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        Mode A is <b>GitHub Actions</b> on a self-hosted Windows runner. One
        action per step; each step names what you should see when it worked.
      </p>
      <OperatorSteps steps={SETUP_ONCE_STEPS} />

      <div className="panel" style={{ marginTop: 20 }} id="generate-workflow">
        <div className="kicker">Per-repo overnight setup</div>
        <h3>Generate workflow YAML</h3>
        <p className="muted" style={{ lineHeight: 1.55, marginTop: 8 }}>
          One generic workflow for every stack. Type the product repo and your
          machine&apos;s <code>claude.exe</code> path — download{" "}
          <code>night-shift.yml</code> into <code>.github/workflows/</code>.{" "}
          <b>Stack</b>, <b>Crucible variant</b>, and <b>Test command</b>
          {" "}
          live in each product&apos;s <code>GITHUB-PROJECTS.md</code> (use{" "}
          <Link href="/setup">Setup → Regenerate</Link>).
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
              Schedule a routine that opens the product repo and follows{" "}
              <Link href="/skills/night-shift">
                <code>skills/night-shift/SKILL.md</code>
              </Link>
              . Prefer Actions when you need a hard non-interactive guarantee —
              Desktop has been flaky about Bypass.
            </span>
          </div>
        </div>
      </div>

      <h2 id="run-tonight">Run tonight</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        Procedure only — label, dispatch, morning triage. Theory is under{" "}
        <a href="#how-it-works">How it works</a>.
      </p>
      <OperatorSteps steps={RUN_TONIGHT_STEPS} />

      <div className="note teal" style={{ marginTop: 16 }} id="verify">
        <b>Verify</b> before you trust overnight cron (or after the first manual
        dispatch):
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.55 }}>
          {VERIFY_CHECKS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        Any miss → <a href="#troubleshoot">Troubleshoot</a>.
      </div>

      <h2 id="how-it-works">How it works</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        Understand the agent machinery — dispatch through morning report. Not
        required to complete Setup or Run.
      </p>
      <NightAgentMap aside={<MapAside />} />
      <div className="note teal" style={{ marginTop: 16 }}>
        Pipeline map describes the <b>Actions</b> path (fresh <code>_work</code>{" "}
        clone, OIDC → <code>claude[bot]</code>, subscription brain). Desktop
        routines reuse your interactive checkout — same skill gates, different
        runner. Self-hosted Actions runners belong on <b>private</b> repos only.
      </div>

      <h2 id="troubleshoot">Troubleshoot</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        Symptom → fix. Unstick a run here; the Failure stage on the map is only
        the visual ledger.
      </p>
      <TroubleshootTable />

      <div className="pagefoot">
        Instrument: <b>/night-shift</b> · opens PRs only · never merges ·{" "}
        <Link href="/orchestrator">Orchestrator</Link> for the daytime map.
      </div>
    </>
  );
}
