// Feature slice: night-shift — operator-first page (server component).
// Bands: Header → Setup once → Run tonight → How it works → Troubleshoot.
import Link from "next/link";
import { SKILL_INVOKES, SKILL_SLUGS } from "../../shared/skills/invokes";
import { loadNightShiftTemplate } from "./load-night-shift-template";
import { NightAgentMap } from "./night-agent-map";
import { NightShiftWorkflowTool } from "./night-shift-workflow-tool";
import {
  DAISY_CHAIN_STEPS,
  RUN_TONIGHT_STEPS,
  SETUP_ONCE_STEPS,
} from "./operator-bands";
import { VERIFY_CHECKS } from "./operator-guide";
import { OperatorSteps } from "./operator-steps";
import { Runbook } from "./runbook";
import { TroubleshootTable } from "./troubleshoot-table";

const REPO = "https://github.com/jerrodtuck/vilya";
const WORKFLOW_HREF = `${REPO}/blob/master/.github/workflows/night-shift.yml`;
const TEMPLATE_HREF = `${REPO}/blob/master/docs/project-tracking/templates/night-shift.yml`;
const CHAIN_PROMOTE_HREF = `${REPO}/blob/master/docs/project-tracking/templates/chain-promote.yml`;
const SKILL_SRC_HREF = `${REPO}/blob/master/skills/${SKILL_SLUGS.nightShift}/SKILL.md`;
const SKILL_SITE_HREF = `/skills/${SKILL_SLUGS.nightShift}`;

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
            Safety gates (<code>night-shift:ready</code> ∧{" "}
            <code>plan:ready</code>, fork stop, never merge) — visually distinct
            on purpose.
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

function ArtifactLinks() {
  return (
    <p className="muted" style={{ lineHeight: 1.55, marginTop: 16 }}>
      <b style={{ color: "var(--text)" }}>Artifacts</b>
      {" · "}
      <Link href={SKILL_SITE_HREF}>skill (site)</Link>
      {" · "}
      <a href={SKILL_SRC_HREF} target="_blank" rel="noreferrer">
        skill source
      </a>
      {" · "}
      <a href={TEMPLATE_HREF} target="_blank" rel="noreferrer">
        portable template
      </a>
      {" · "}
      <a href={CHAIN_PROMOTE_HREF} target="_blank" rel="noreferrer">
        chain-promote template
      </a>
      {" · "}
      <a href={WORKFLOW_HREF} target="_blank" rel="noreferrer">
        live workflow
      </a>
    </p>
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
        <Link href="/orch">Orch</Link>.
      </p>
      <div className="metarow" aria-label="Night-shift scope">
        <span className="badge">once per product repo</span>
        <span className="badge">private</span>
        <span className="badge">Windows</span>
        <span className="badge">PRs only</span>
        <span className="badge">never merges</span>
      </div>

      <h2 id="setup-once">Setup once</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        <b>Actions</b> on a self-hosted Windows runner is the primary path. One
        action per step; each step names what you should see when it worked.
      </p>
      <div
        className="metarow"
        aria-label="Optional setup milestones"
        style={{ marginBottom: 8 }}
      >
        <span className="badge">Not started</span>
        <span className="badge">Online</span>
        <span className="badge">First green</span>
      </div>
      <OperatorSteps steps={SETUP_ONCE_STEPS} />

      <div className="note" style={{ marginTop: 16 }} id="unattended-permissions">
        <b>Unattended permissions</b> — keep{" "}
        <code>--permission-mode bypassPermissions</code> only on the overnight{" "}
        <b>Job</b> (the workflow template already sets it). Do not make Bypass
        your interactive user default — daytime sessions should still prompt.
      </div>

      <ArtifactLinks />

      <div className="panel" style={{ marginTop: 20 }} id="generate-workflow">
        <div className="kicker">Per-repo overnight setup</div>
        <h3>Generate workflow YAML</h3>
        <p className="muted" style={{ lineHeight: 1.55, marginTop: 8 }}>
          One generic <b>Workflow</b>
          {" "}
          for every stack. Type the product repo and your machine&apos;s{" "}
          <code>claude.exe</code> path — download{" "}
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
      </div>

      <details className="ns-desktop" id="desktop-secondary">
        <summary>
          Alternative · Claude Code Desktop{" "}
          <span className="muted">(collapsed · secondary)</span>
        </summary>
        <p className="muted" style={{ lineHeight: 1.55, marginTop: 10 }}>
          Schedule a routine that opens the product repo and follows{" "}
          <Link href={SKILL_SITE_HREF}>
            <code>skills/{SKILL_SLUGS.nightShift}/SKILL.md</code>
          </Link>
          . Prefer Actions when you need a hard non-interactive guarantee.
        </p>
        <p className="ns-safety-note" style={{ marginTop: 10 }}>
          <b>Bypass warning:</b> Desktop has been flaky about Bypass. If you use
          this path, keep Bypass scoped to the overnight routine — never as your
          interactive default.
        </p>
      </details>

      <h2 id="run-tonight">Run tonight</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        Procedure only — label, dispatch, morning triage. Theory is under{" "}
        <a href="#how-it-works">How it works</a>. Before/after sleep summary:{" "}
        <a href="#runbook">Runbook</a>.
      </p>
      <OperatorSteps steps={RUN_TONIGHT_STEPS} />

      <h2 id="daisy-chains">Daisy chains</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        Night-shift stays <b>dumb</b> — it only picks issues already{" "}
        <code>night-shift:ready</code> ∧ <code>plan:ready</code>. Multi-issue
        paths use <code>night-shift:chain</code> + native blocked-by;{" "}
        <a href={CHAIN_PROMOTE_HREF} target="_blank" rel="noreferrer">
          <code>chain-promote.yml</code>
        </a>{" "}
        owns promote after merge. Cadence: prep → merge → promote → next night.
      </p>
      <OperatorSteps steps={DAISY_CHAIN_STEPS} />

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

      <Runbook />

      <h2 id="how-it-works">How it works</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        Understand the agent machinery — dispatch through morning report. Not
        required to complete Setup or Run. Terms:{" "}
        <b>Workflow · Runner · Job · Skill</b>.
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
        Instrument: <b>{SKILL_INVOKES.nightShift}</b> · opens PRs only · never merges ·{" "}
        <Link href="/orch">Orch</Link> for the daytime map.
      </div>
    </>
  );
}
