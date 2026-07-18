// Feature slice: architect — page composition (server component). The
// interactive map is the client island; everything else renders on the
// server. Same page shape as the orchestrator page (#134): header →
// BoardStrip → interactive map → prompt library, with an aside slot
// (cardinality summary here; #135 fills it further).
import Link from "next/link";
import { BoardStrip } from "@/shared/ui/board-strip";
import { FlowMap } from "@/shared/ui/flow-map";
import { PromptList } from "@/shared/ui/prompt-list";
import { DEFAULT_DRAWER, FLOWS, FLOW_COLORS, NODES } from "./data";
import { EDGES, EDGE_LABELS, NODE_GEOMS } from "./map-geometry";
import { PROMPTS } from "./prompts";

export function ArchitectView() {
  return (
    <>
      <header>
        <div className="eyebrow">
          Direction · ADRs · specs · Claude Code + Cursor
        </div>
        <h1>
          <span className="you">You</span> are the architect
        </h1>
        <p className="lead">
          Your output is issues, ADRs, and specs — never running code. Recall
          what&apos;s been tried, ground every claim in as-built or
          as-intended, and stop at every real fork with a stated
          recommendation. Click a <b>flow</b> to light its path, or click any{" "}
          <b>node</b> to see what that role does.
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
            Architect output lands on the same board every skill reports
            into — issues, <code>needs:decision</code>{" "}
            forks, and epics the orchestrator picks up from here.
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
        ariaLabel="Architect flow map"
        aside={
          <div className="panel">
            <div className="kicker">Scope of the role</div>
            <h3>Cardinality</h3>
            <div className="modes" style={{ marginTop: 12 }}>
              <div className="mode" style={{ ["--m" as string]: "var(--arch)" }}>
                <b>One architect, N repos</b>
                <span>
                  State is documents and boards — VISION, ADRs, specs, issues.
                  Read-only toward code, write-only toward docs/board, so
                  nothing collides across repos. Direction only works if
                  it&apos;s coherent across products.
                </span>
              </div>
              <div className="mode" style={{ ["--m" as string]: "var(--orch)" }}>
                <b>One orchestrator, one repo</b>
                <span>
                  The orchestrator is the repo&apos;s dispatch lock —
                  worktrees, monitors, the merge queue, all repo-local. Two
                  orchestrators on one repo means two writers to the same
                  main clone.
                </span>
              </div>
            </div>
          </div>
        }
      />

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="kicker">Copy-paste</div>
        <h3>Architect prompt library</h3>
        <p className="muted" style={{ margin: "6px 0 0", lineHeight: 1.5 }}>
          The words you actually say to drive each role. Fill the{" "}
          <code>&lt;placeholders&gt;</code>{" "}
          and paste. Every prompt also shows
          up in its node&apos;s detail panel above — click <b>Copy</b> on any
          of them.
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
        The architect never implements, dispatches, or merges — output is{" "}
        <b>issues · ADRs · specs</b> on the board, for the{" "}
        <Link href="/orchestrator">orchestrator</Link> to pick up.
      </div>
    </>
  );
}
