// Feature slice: planner — page composition (server component). Same page
// shape as architect / orchestrator (#134 / #208): header → BoardStrip →
// interactive map → prompt library, with a cardinality aside.
import Link from "next/link";
import { BoardStrip } from "@/shared/ui/board-strip";
import { FlowMap } from "@/shared/ui/flow-map";
import { PromptList } from "@/shared/ui/prompt-list";
import { DEFAULT_DRAWER, FLOWS, FLOW_COLORS, NODES } from "./data";
import { EDGES, EDGE_LABELS, NODE_GEOMS } from "./map-geometry";
import { PROMPTS } from "./prompts";

export function PlannerView() {
  return (
    <>
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
          slice, and stop at forks that would make the kickoff wrong. Click a{" "}
          <b>flow</b> to light its path, or click any <b>node</b> to see what
          that step does.
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
            <Link href="/orchestrator">orchestrator</Link> arms the Monitor;
            night-shift consumes <code>plan:ready</code> ∧{" "}
            <code>night-shift:ready</code>.
          </>
        }
      />

      <FlowMap
        nodes={NODES}
        flows={FLOWS}
        flowColors={FLOW_COLORS}
        edges={EDGES}
        edgeLabels={EDGE_LABELS}
        nodeGeoms={NODE_GEOMS}
        defaultDrawer={DEFAULT_DRAWER}
        prompts={PROMPTS}
        viewBox="0 0 1280 480"
        ariaLabel="Planner flow map"
        aside={
          <div className="panel">
            <div className="kicker">Scope of the role</div>
            <h3>Cardinality</h3>
            <div className="modes" style={{ marginTop: 12 }}>
              <div
                className="mode"
                style={{ ["--m" as string]: "var(--planner)" }}
              >
                <b>One Planner, one repo</b>
                <span>
                  Planning quality needs a pinned Fable session that owns that
                  repo&apos;s <code>needs:plan</code> queue — not a chip and
                  not the thin orchestrator. Two Planners on one repo means two
                  writers to the same label queue and kickoff comments.
                </span>
              </div>
              <div
                className="mode"
                style={{ ["--m" as string]: "var(--orch)" }}
              >
                <b>Beside the orchestrator</b>
                <span>
                  After{" "}
                  <Link href="/architect">Architect</Link> direction, before
                  (or beside){" "}
                  <Link href="/orchestrator">Orchestrator</Link> dispatch.
                  Planner plans onto the board; orchestrator dispatches chips
                  that execute. Daytime may skip Planner when the issue is
                  already clear.
                </span>
              </div>
            </div>
          </div>
        }
      />

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="kicker">Copy-paste</div>
        <h3>Planner prompt library</h3>
        <p className="muted" style={{ margin: "6px 0 0", lineHeight: 1.5 }}>
          The words you actually say to drive the plan loop. Fill the{" "}
          <code>&lt;placeholders&gt;</code>
          {" "}
          and paste. Every prompt also shows up in its node&apos;s detail
          panel above — click <b>Copy</b> on any of them.
        </p>
        <div className="lib">
          {PROMPTS.map((g) => (
            <div
              key={g.group}
              className={`libcard${g.wide ? " wide" : ""}`}
              style={{ ["--lc" as string]: `var(${g.c})` }}
            >
              <h4>{g.group}</h4>
              <PromptList group={g} />
            </div>
          ))}
        </div>
      </div>

      <div className="pagefoot">
        The planner never implements, dispatches, or merges — output is{" "}
        <b>kickoff · verify plan · plan:ready</b> on the board, for the{" "}
        <Link href="/orchestrator">orchestrator</Link> (and night-shift) to
        pick up.
      </div>
    </>
  );
}
