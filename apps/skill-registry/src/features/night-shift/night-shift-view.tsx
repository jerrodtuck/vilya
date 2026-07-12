// Feature slice: night-shift — unattended Dev Loop via GitHub Actions (server component).
import Link from "next/link";
import { NightAgentMap } from "./night-agent-map";

export function NightShiftView() {
  return (
    <>
      <div className="eyebrow">Autonomous · same chain as daytime</div>
      <h1>Night shift</h1>
      <p className="lead">
        Night-shift is <b>not</b> a second methodology. It runs the daytime Dev
        Loop unattended on a <b>product</b> repo via GitHub Actions + headless
        Claude Code. This page maps the <b>agent machinery</b> — dispatch through
        morning report. The methodology map stays on <Link href="/flows">Flows</Link>.
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
                  no work. Cron fires ~2–3am Chicago, or run{" "}
                  <code>gh workflow run night-shift</code>.
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
                  <Link href="/setup">Setup</Link> for Models keys and runner
                  notes; skill source of truth is{" "}
                  <Link href="/skills/night-shift">/skills/night-shift</Link>.
                </span>
              </div>
            </div>
          </div>
        }
      />

      <div className="note teal" style={{ marginTop: 16 }}>
        Vilya ships the skill and workflow templates; each product repo enables
        its own self-hosted runner and <code>CLAUDE_CODE_OAUTH_TOKEN</code>.
        Self-hosted runners belong on <b>private</b> repos only.
      </div>

      <div className="pagefoot">
        Instrument: <b>/night-shift</b> · opens PRs only · never merges ·{" "}
        <Link href="/flows">Flows</Link> for the daytime map.
      </div>
    </>
  );
}
