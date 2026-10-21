"use client";

import Link from "next/link";
import { useDesktopHost } from "../../shared/ui/desktop-host-selector";
import { FlowMap } from "../../shared/ui/flow-map";
import { PromptList } from "../../shared/ui/prompt-list";
import { DEFAULT_DRAWER, FLOWS, FLOW_COLORS, NODES } from "./data";
import { EDGES, EDGE_LABELS, NODE_GEOMS } from "./map-geometry";
import { PROMPTS } from "./prompts";

export function PlannerHostPanel() {
  const { host } = useDesktopHost();
  const prompts = PROMPTS.map(group => ({ ...group, items: group.items.filter(item => !item.host || item.host === host) }));
  return <>
      <FlowMap
        nodes={NODES}
        flows={FLOWS}
        flowColors={FLOW_COLORS}
        edges={EDGES}
        edgeLabels={EDGE_LABELS}
        nodeGeoms={NODE_GEOMS}
        defaultDrawer={DEFAULT_DRAWER}
        prompts={prompts}
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
                  When seated, planning quality needs a pinned Fable session that
                  owns that repo&apos;s <code>needs:plan</code> queue — not a
                  chip and not the thin orchestrator. Two Planners on one repo
                  means two writers to the same label queue. Cursor daytime may
                  skip seating Planner entirely.
                </span>
              </div>
              <div
                className="mode"
                style={{ ["--m" as string]: "var(--orch)" }}
              >
                <b>Beside the orch</b>
                <span>
                  After{" "}
                  <Link href="/architect">Architect</Link> direction, before
                  (or beside){" "}
                  <Link href="/orch">Orch</Link> dispatch. Planner plans onto
                  the board; orch dispatches chips that execute. Daytime may
                  skip Planner when the issue is already clear.
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
          {prompts.map((g) => (
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

  </>;
}
