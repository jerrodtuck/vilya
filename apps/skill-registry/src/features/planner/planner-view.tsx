// Feature slice: planner — page composition (server component). Same page
// shape as architect / orchestrator (#134 / #208): header → BoardStrip →
// interactive map → prompt library, with a cardinality aside.
import { DesktopHostContent } from "../../shared/ui/desktop-host-selector";
import { PlannerHostPanel } from "./planner-host-panel";
import { CodexPlanning } from "./codex-planning";
import Link from "next/link";
import { BoardStrip } from "@/shared/ui/board-strip";

export function PlannerView() {
  return (
    <>
      <DesktopHostContent codex={<CodexPlanning />}>
      <header>
        <div className="eyebrow">
          Plan loop · needs:plan → plan:ready · Fable session
        </div>
        <h1>
          <span className="you">You</span> are the planner
        </h1>
        <p className="lead">
          Your output is a kickoff + verify plan on the issue — never running
          code. Drain <code>needs:plan</code>, ground every brief in the owning
          slice, and stop at forks that would make the kickoff wrong. Required
          for Claude Code chip-flow and night-shift prep;{" "}
          <b>optional daytime on Cursor</b> (orch or in-session plan may write
          the kickoff — see <Link href="/differences">Desktop differences</Link>).
          Click a <b>flow</b> to light its path, or click any <b>node</b> to see
          what that step does.
        </p>
        <div style={{ marginTop: 14 }}>
          <Link className="setupbtn" href="/setup">
            Per-project setup
          </Link>
        </div>
      </header>

      <BoardStrip
        hint={
          <>
            Planner writes onto the same board every skill reports into —{" "}
            <code>needs:plan</code> in, kickoff + <code>plan:ready</code> out.
            The{" "}
            <Link href="/orch">orch</Link> arms the Monitor;
            night-shift consumes <code>plan:ready</code> ∧{" "}
            <code>night-shift:ready</code>.
          </>
        }
      />

      <PlannerHostPanel />

      <div className="pagefoot">
        The planner never implements, dispatches, or merges — output is{" "}
        <b>kickoff · verify plan · plan:ready</b> on the board, for the{" "}
        <Link href="/orch">orch</Link> (and night-shift) to
        pick up.
      </div>
      </DesktopHostContent>
    </>
  );
}
