// Feature slice: night-shift — before/after sleep Runbook (outside the map grid).
// OUTPUTS on the map stays artifacts-only; morning chores live here.

export function Runbook() {
  return (
    <div className="panel ns-runbook" id="runbook">
      <div className="kicker">Operator strip</div>
      <h3>Runbook</h3>
      <p className="muted" style={{ lineHeight: 1.55, marginTop: 8 }}>
        One card for the overnight window — prep before sleep, triage after.
        Pipeline <b>Outputs</b> are artifacts only.
      </p>
      <div className="grid2" style={{ marginTop: 14 }}>
        <div>
          <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Before sleep</h4>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.55 }}>
            <li>
              Head issue: <code>plan:ready</code>, then{" "}
              <code>night-shift:ready</code>. Both required.
            </li>
            <li>
              Chain successors stay on <code>night-shift:chain</code> — not ready
              until <code>chain-promote</code> flips them.
            </li>
            <li>
              Optional: <code>gh workflow run night-shift</code> if you do not
              want to wait for cron.
            </li>
          </ul>
        </div>
        <div>
          <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>After sleep</h4>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.55 }}>
            <li>
              Triage the morning report; merge Ready PRs with{" "}
              <code>/merge-pr</code>.
            </li>
            <li>
              Answer forks and drop <code>needs:decision</code> when you decide.
            </li>
            <li>
              Daisy chain: closing the blocker lets <code>chain-promote</code>{" "}
              flip the next <code>night-shift:chain</code> (+{" "}
              <code>plan:ready</code>) issue to <code>night-shift:ready</code>{" "}
              for the following night.
            </li>
            <li>
              Run <code>/prune</code> from the daytime clone (and Actions{" "}
              <code>_work</code> if trees remain).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
