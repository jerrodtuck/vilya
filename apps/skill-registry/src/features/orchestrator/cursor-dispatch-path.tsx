// Feature slice: orchestrator — numbered Cursor dispatch ritual (#219).
// Local steps markup (same setupsteps pattern as Setup / Night shift);
// VSA forbids importing those features' step components.
import {
  CURSOR_DISPATCH_PANEL_ID,
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
        Claude Code chips self-start via <code>spawn_task</code>. Cursor has no
        session-to-session comms — you open the worktree folder and paste{" "}
        <b>Worker A</b>. There is no auto-handoff yet.
      </p>
      <div className="setupsteps" style={{ marginTop: 12 }}>
        <div className="step">
          <span className="n">1</span>
          <span className="t">
            <b>Paste</b>{" "}
            <a href={`#${CURSOR_ORCH_PROMPT_ID}`}>{CURSOR_ORCH_PROMPT_LABEL}</a>{" "}
            in the main-clone session.
            <small>
              Seats the orchestrator. It runs <code>/start-feature</code> and
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
            <b>Paste</b>{" "}
            <a href={`#${CURSOR_WORKER_A_PROMPT_ID}`}>
              {CURSOR_WORKER_A_PROMPT_LABEL}
            </a>{" "}
            in that worker session.
            <small>
              <b>A and B are mutually exclusive.</b> Use A when the orchestrator
              already ran <code>/start-feature</code>. B is solo / no-orchestrator
              only — pasting it here would double-create the worktree.
            </small>
          </span>
        </div>
      </div>
    </div>
  );
}
