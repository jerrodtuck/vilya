// Feature slice: orchestrator — Claude Code spawn_task daytime path (#285 follow-on).
// Local steps markup (same setupsteps pattern as Setup / Cursor path);
// VSA forbids importing those features' step components.
import Link from "next/link";
import { SKILL_INVOKES } from "../../shared/skills/invokes";
import {
  CLAUDE_DISPATCH_PANEL_ID,
  CLAUDE_DISPATCH_PRIMARY_KICKER,
  CLAUDE_DISPATCH_PRIMARY_TITLE,
  CLAUDE_ORCH_PROMPT_LABEL,
} from "./claude-dispatch";

export function ClaudeDispatchPath() {
  return (
    <div className="panel" style={{ marginTop: 16 }} id={CLAUDE_DISPATCH_PANEL_ID}>
      <div className="kicker">{CLAUDE_DISPATCH_PRIMARY_KICKER}</div>
      <h3>{CLAUDE_DISPATCH_PRIMARY_TITLE}</h3>
      <p className="muted" style={{ margin: "6px 0 0", lineHeight: 1.55 }}>
        Daytime default on Claude Code: seat the orch, enqueue Planner when owed,
        dispatch via <code>{SKILL_INVOKES.chip}</code> (<code>spawn_task</code>).
        Wake is Monitor + the chip&apos;s issue completion comment. Why seats
        diverge: <Link href="/differences">Two desktops</Link>.
      </p>
      <div className="setupsteps" style={{ marginTop: 12 }}>
        <div className="step">
          <span className="n">1</span>
          <span className="t">
            <b>Seat</b> {CLAUDE_ORCH_PROMPT_LABEL} (
            <code>{SKILL_INVOKES.orchestrator}</code>) on the main clone.
            <small>
              Dispatch lock — board, chips, merge queue. Does not implement.
            </small>
          </span>
        </div>
        <div className="step">
          <span className="n">2</span>
          <span className="t">
            <b>Planner</b> when owed → <code>plan:ready</code> on the issue.
            <small>
              Standing Fable <code>{SKILL_INVOKES.planner}</code> drains{" "}
              <code>needs:plan</code>. Daytime may skip when the issue is already
              clear; night-shift still needs <code>plan:ready</code>.
            </small>
          </span>
        </div>
        <div className="step">
          <span className="n">3</span>
          <span className="t">
            <b>Dispatch</b> via <code>{SKILL_INVOKES.chip}</code> →{" "}
            <code>spawn_task</code>.
            <small>
              Never call <code>spawn_task</code> freehand — the chip skill owns
              the brief template. One chip = one branch = one worktree.
            </small>
          </span>
        </div>
        <div className="step">
          <span className="n">4</span>
          <span className="t">
            <b>Wake:</b> Monitor tool + issue completion comment.
            <small>
              Same-turn Monitor on REST pulls + comments; always verify before
              merge.
            </small>
          </span>
        </div>
        <div className="step">
          <span className="n">5</span>
          <span className="t">
            <b>
              <code>{SKILL_INVOKES.mergePr}</code> →{" "}
              <code>{SKILL_INVOKES.prune}</code>
            </b>{" "}
            from the main clone.
            <small>Squash-merge, then prune. Never merge from the chip.</small>
          </span>
        </div>
      </div>
    </div>
  );
}
