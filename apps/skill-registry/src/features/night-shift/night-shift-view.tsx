// Feature slice: night-shift — unattended Dev Loop via GitHub Actions (server component).
import Link from "next/link";

export function NightShiftView() {
  return (
    <>
      <div className="eyebrow">Autonomous · same chain as daytime</div>
      <h1>Night shift</h1>
      <p className="lead">
        Night-shift is <b>not</b> a second methodology. It runs the daytime Dev
        Loop unattended on a <b>product</b> repo via GitHub Actions + headless
        Claude Code. Vilya ships the skill and workflow templates; each product
        repo enables the runner.
      </p>

      <div className="chipstrip">
        <span className="lchip s">/start-feature</span>
        <span className="arrow">→</span>
        <span className="lchip">implement</span>
        <span className="arrow">→</span>
        <span className="lchip r">crucible</span>
        <span className="arrow">→</span>
        <span className="lchip f">/finish-feature</span>
        <span className="arrow">→</span>
        <span className="lchip f">PR (never merge)</span>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="kicker">Eligibility</div>
        <h3>What the loop will touch</h3>
        <ul className="muted" style={{ lineHeight: 1.6, marginTop: 8 }}>
          <li>
            Labeled <code>auto:ready</code> — your explicit opt-in
          </li>
          <li>
            Not <code>needs:decision</code>, not <code>type:epic</code>
          </li>
          <li>Clear brief + acceptance on the issue body</li>
          <li>
            At a real design fork: comment + recommendation, label{" "}
            <code>needs:decision</code>, Blocked, next issue — never guess
          </li>
        </ul>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="kicker">Actions setup</div>
        <h3>Personal account (default)</h3>
        <p className="muted" style={{ lineHeight: 1.55, marginTop: 8 }}>
          For <b>each</b> product repo you want overnight:
        </p>
        <ol className="muted" style={{ lineHeight: 1.7, marginTop: 8 }}>
          <li>
            Copy{" "}
            <code>.github/workflows/night-shift.yml</code> (or the CygNet
            template under <code>docs/project-tracking/templates/</code>)
          </li>
          <li>
            Register a self-hosted runner <b>on that repo</b> (same machine may
            be registered once per repo)
          </li>
          <li>
            Add repo secret <code>CLAUDE_CODE_OAUTH_TOKEN</code> from{" "}
            <code>claude setup-token</code> on your Max/Pro account
          </li>
          <li>
            Fire with Actions → night-shift → Run workflow, or{" "}
            <code>gh workflow run night-shift</code>. Manual-only until you
            uncomment <code>schedule:</code>
          </li>
        </ol>

        <h3 style={{ marginTop: 20 }}>Org later (shared runners)</h3>
        <p className="muted" style={{ lineHeight: 1.55, marginTop: 8 }}>
          Moving product repos under an org (e.g. <code>jestrion</code>) unlocks
          an <b>org runner pool</b> — one registration can serve many repos.
          Workflows stay per repo. This does <b>not</b> change the skills or the
          chain.
        </p>
        <ul className="muted" style={{ lineHeight: 1.7, marginTop: 8 }}>
          <li>
            <b>Claude Max/Pro</b> stays personal — the OAuth token still bills
            your subscription whether the secret lives on the repo or the org
          </li>
          <li>
            <b>Personal GitHub Pro</b> does not cover the org — org Actions
            entitlements follow the org&apos;s plan
          </li>
        </ul>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="kicker">Operator runbook</div>
        <div className="modes" style={{ marginTop: 12 }}>
          <div className="mode" style={{ ["--m" as string]: "var(--start)" }}>
            <b>1 · Before bed</b>
            <span>
              Label well-specified issues <code>auto:ready</code>. No label, no
              work.
            </span>
          </div>
          <div className="mode" style={{ ["--m" as string]: "var(--orch)" }}>
            <b>2 · Fire</b>
            <span>
              <code>gh workflow run night-shift</code> on the product repo. Up
              to 3 issues; prefer one finished cleanly.
            </span>
          </div>
          <div className="mode" style={{ ["--m" as string]: "var(--finish)" }}>
            <b>3 · Morning</b>
            <span>
              Triage the report; merge Ready PRs with <code>/merge-pr</code>;
              answer forks and drop <code>needs:decision</code> when you decide.
            </span>
          </div>
        </div>
      </div>

      <div className="note" style={{ marginTop: 16 }}>
        Config for every skill — including night-shift — lives in that
        product&apos;s{" "}
        <code>docs/project-tracking/GITHUB-PROJECTS.md</code>. See{" "}
        <Link href="/setup">Setup</Link> for Models keys and shared-file rules,{" "}
        <Link href="/flows">Flows</Link> for the map.
      </div>

      <div className="pagefoot">
        Instrument: <b>/night-shift</b> · opens PRs only · never merges.
      </div>
    </>
  );
}
