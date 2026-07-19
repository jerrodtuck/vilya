// Feature slice: orchestrator — numbered Cursor dispatch ritual (#219 / #253).
// Local steps markup (same setupsteps pattern as Setup / Night shift);
// VSA forbids importing those features' step components.
import {
  CURSOR_DISPATCH_PANEL_ID,
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
      <div className="kicker">Cursor · manual dispatch</div>
      <h3>Three-step Cursor path</h3>
      <p className="muted" style={{ margin: "6px 0 0", lineHeight: 1.55 }}>
        Claude Code chips self-start via <code>spawn_task</code> (
        <code>/vilya-chip</code>). Cursor has no session-to-session comms — seat the
        orchestrator, open the worktree, then run{" "}
        <code>/{CURSOR_HANDOFF_SKILL}</code> in that worker session (Worker A
        seat). There is no auto-handoff yet.
      </p>
      <div className="setupsteps" style={{ marginTop: 12 }}>
        <div className="step">
          <span className="n">1</span>
          <span className="t">
            <b>Paste</b>{" "}
            <a href={`#${CURSOR_ORCH_PROMPT_ID}`}>{CURSOR_ORCH_PROMPT_LABEL}</a>{" "}
            in the main-clone session.
            <small>
              Seats the orchestrator. It runs <code>/vilya-start-feature</code> and
              leaves the kickoff on the issue — it does not implement.
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
    </div>
  );
}
