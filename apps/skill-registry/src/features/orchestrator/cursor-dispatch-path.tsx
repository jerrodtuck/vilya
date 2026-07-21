// Feature slice: orchestrator — daytime Task/BoN Cursor path (#285);
// Worker A three-step demoted to collapsed fallback (#219 / #253).
// Local steps markup (same setupsteps pattern as Setup / Night shift);
// VSA forbids importing those features' step components.
import Link from "next/link";
import {
  CURSOR_DISPATCH_FALLBACK_SUMMARY,
  CURSOR_DISPATCH_PANEL_ID,
  CURSOR_DISPATCH_PRIMARY_KICKER,
  CURSOR_DISPATCH_PRIMARY_TITLE,
  CURSOR_DISPATCH_STEP3_LEAD,
  CURSOR_HANDOFF_SKILL,
  CURSOR_ORCH_PROMPT_ID,
  CURSOR_ORCH_PROMPT_LABEL,
  CURSOR_WORKER_A_PROMPT_ID,
  CURSOR_WORKER_A_PROMPT_LABEL,
} from "./cursor-dispatch";

export function CursorDispatchPath() {
  return (
    <div className="panel" style={{ marginTop: 16 }} id={CURSOR_DISPATCH_PANEL_ID}>
      <div className="kicker">{CURSOR_DISPATCH_PRIMARY_KICKER}</div>
      <h3>{CURSOR_DISPATCH_PRIMARY_TITLE}</h3>
      <p className="muted" style={{ margin: "6px 0 0", lineHeight: 1.55 }}>
        Daytime default on Cursor: seat the orch, leave a kickoff, then dispatch a{" "}
        <b>Task/BoN worktree-first</b> chip. Wake is Task return + the issue
        completion comment (mortal REST <code>notify_on_output</code> is backup).
        Board/PR remain the durable channel. Why seats diverge:{" "}
        <Link href="/differences">Two desktops</Link>.
      </p>
      <div className="setupsteps" style={{ marginTop: 12 }}>
        <div className="step">
          <span className="n">1</span>
          <span className="t">
            <b>Seat</b>{" "}
            <a href={`#${CURSOR_ORCH_PROMPT_ID}`}>{CURSOR_ORCH_PROMPT_LABEL}</a>{" "}
            (<code>/vilya-orch-cursor</code>) on the main clone.
            <small>
              Dispatch lock — board, worktrees, merge queue. Does not implement.
            </small>
          </span>
        </div>
        <div className="step">
          <span className="n">2</span>
          <span className="t">
            <b>Orch:</b> issue + worktree + kickoff (+ optional plan).
            <small>
              <code>/vilya-start-feature</code> writes the brief on the issue.
              Daytime Planner is optional — enqueue <code>needs:plan</code> for
              night-shift / hard forks.
            </small>
          </span>
        </div>
        <div className="step">
          <span className="n">3</span>
          <span className="t">
            <b>Dispatch Task/BoN</b> in the existing worktree (or an explicit
            worktree-first ask).
            <small>
              Single-model OK. Optional two-Task model split on the same
              worktree. Never assume BoN isolates without a worktree ask.
            </small>
          </span>
        </div>
        <div className="step">
          <span className="n">4</span>
          <span className="t">
            <b>Wake:</b> Task return + issue comment (+ mortal REST monitor).
            <small>
              Arm REST <code>notify_on_output</code> same-turn as dispatch —
              re-arm when dead. Always verify before merge.
            </small>
          </span>
        </div>
        <div className="step">
          <span className="n">5</span>
          <span className="t">
            <b>
              <code>/vilya-merge-pr</code> → <code>/vilya-prune</code>
            </b>{" "}
            from the main clone.
            <small>
              Squash-merge, then prune worktrees. Never merge from inside the
              feature worktree.
            </small>
          </span>
        </div>
      </div>

      <details className="diff-advanced" style={{ marginTop: 14 }}>
        <summary>
          {CURSOR_DISPATCH_FALLBACK_SUMMARY}{" "}
          <span className="muted">(collapsed)</span>
        </summary>
        <p className="muted" style={{ margin: "8px 0 0", lineHeight: 1.55 }}>
          Use when not running Task chips — open the worktree folder and run{" "}
          <code>/{CURSOR_HANDOFF_SKILL}</code> (Worker A seat). There is no
          session-to-session auto-handoff on this path; the issue kickoff is the
          brief.
        </p>
        <div className="setupsteps" style={{ marginTop: 10 }}>
          <div className="step">
            <span className="n">1</span>
            <span className="t">
              <b>Paste</b>{" "}
              <a href={`#${CURSOR_ORCH_PROMPT_ID}`}>{CURSOR_ORCH_PROMPT_LABEL}</a>{" "}
              in the main-clone session.
              <small>
                Seats the orchestrator. It runs <code>/vilya-start-feature</code>{" "}
                and leaves the kickoff — it does not implement.
              </small>
            </span>
          </div>
          <div className="step">
            <span className="n">2</span>
            <span className="t">
              <b>Open the worktree folder</b> in a new Cursor window / agent
              rooted there.
              <small>
                Path:{" "}
                <code>
                  %USERPROFILE%\.cursor\worktrees\&lt;repo&gt;\&lt;issue#&gt;-&lt;slug&gt;
                </code>
              </small>
            </span>
          </div>
          <div className="step">
            <span className="n">3</span>
            <span className="t">
              <b>{CURSOR_DISPATCH_STEP3_LEAD}</b>{" "}
              <code>/{CURSOR_HANDOFF_SKILL}</code>.
              <small>
                Worker A seat — already in the worktree; do not re-run{" "}
                <code>/vilya-start-feature</code>.{" "}
                <b>A and B are mutually exclusive.</b> Paste fallback:{" "}
                <a href={`#${CURSOR_WORKER_A_PROMPT_ID}`}>
                  {CURSOR_WORKER_A_PROMPT_LABEL}
                </a>
                .
              </small>
            </span>
          </div>
        </div>
      </details>
    </div>
  );
}
