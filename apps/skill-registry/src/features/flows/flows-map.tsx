// Feature slice: flows — the interactive orchestration map (client component).
// State: which flow is lit, which node is selected. Content comes from
// data.ts / prompts.ts; geometry from map-geometry.ts.
"use client";

import { useState } from "react";
import { FLOWS, FLOW_COLORS, NODES } from "./data";
import { EDGES, EDGE_LABELS, LENSES, NODE_GEOMS } from "./map-geometry";
import { promptsForNode } from "./prompts";
import { PromptList } from "./prompt-list";

const DEFAULT_DRAWER = {
  kicker: "The orchestrator",
  title: "You point, the skills execute",
  c: "--orch",
  bodyHtml: `
    <p>Pick any node in the map to see what that skill does, when you invoke it, and what it reads from the repo config. The whole ecosystem is designed so that <b>you make the decisions and the skills carry the mechanics.</b></p>
    <h4><span class="swatch" style="background:var(--start)"></span>The linear spine</h4>
    <ul>
      <li><code>/start-feature</code> → implement in the slice → <code>crucible</code> review → <code>/finish-feature</code> → Done.</li>
      <li>Everything writes status to the <b>board</b> — that's your single source of truth.</li>
    </ul>
    <h4><span class="swatch" style="background:var(--review)"></span>The engine: review ↔ refactor</h4>
    <ul>
      <li>The review no longer passes/fails — it returns ranked refactors + a readiness signal.</li>
      <li>You loop review → apply top refactors → re-review until it reads <b>Ready</b>, then hand to finish.</li>
    </ul>`,
};

export function FlowsMap({ aside }: { aside?: React.ReactNode }) {
  const [flow, setFlow] = useState<string>("everything");
  const [selected, setSelected] = useState<string | null>(null);

  const active = FLOWS[flow];
  const litNodes = active.nodes ? new Set(active.nodes) : null;
  const litEdges = active.edges ? new Set(active.edges) : null;

  const edgeClass = (id: string, colorClass: string, dashed?: boolean) => {
    const parts = ["edge", colorClass];
    if (dashed) parts.push("dash");
    if (litEdges) parts.push(litEdges.has(id) ? "lit" : "faded");
    return parts.join(" ");
  };
  const nodeClass = (id: string) => {
    const parts = ["node"];
    if (litNodes) parts.push(litNodes.has(id) ? "lit" : "faded");
    if (selected === id) parts.push("sel");
    return parts.join(" ");
  };

  const drawer = selected ? NODES[selected] : DEFAULT_DRAWER;
  const drawerPrompts = selected ? promptsForNode(selected) : undefined;

  return (
    <>
      <div className="chips">
        {Object.entries(FLOWS).map(([id, f]) => (
          <button
            type="button"
            key={id}
            className={`chip${id === "everything" ? " all" : ""}${flow === id ? " active" : ""}`}
            style={
              id === "everything"
                ? undefined
                : { color: `var(${FLOW_COLORS[id]})` }
            }
            onClick={() => setFlow(id)}
          >
            <span className="dot" />
            {f.label}
          </button>
        ))}
      </div>
      <div
        className="flowdesc"
        dangerouslySetInnerHTML={{ __html: active.descHtml }}
      />

      <div className="stage">
        <svg viewBox="0 0 1280 520" role="img" aria-label="Skill orchestration map">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
            </marker>
          </defs>

          {EDGES.map((e) => (
            <path
              key={e.id}
              className={edgeClass(e.id, e.colorClass, e.dashed)}
              d={e.d}
              markerEnd="url(#arrow)"
            />
          ))}
          {EDGE_LABELS.map((l) => (
            <text key={l.text} className="elabel" x={l.x} y={l.y}>
              {l.text}
            </text>
          ))}

          <g opacity="0.95">
            {LENSES.map((ln) => (
              <g key={ln.text}>
                <rect className="lens" x={ln.x} y={ln.y} width={ln.w} height={17} rx={5} />
                <text className="lenstxt" x={ln.tx} y={ln.ty} textAnchor="middle">
                  {ln.text}
                </text>
              </g>
            ))}
            <path className="edge" d="M770,104 L770,121" stroke="var(--review)" opacity=".5" />
          </g>

          {NODE_GEOMS.map((n) => (
            <g
              key={n.id}
              className={nodeClass(n.id)}
              tabIndex={0}
              style={{ ["--c" as string]: `var(${NODES[n.id].c})` }}
              onClick={() => setSelected(n.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(n.id);
                }
              }}
            >
              <rect className="nbox" x={n.x} y={n.y} width={n.w} height={n.h} rx={n.rx} />
              {n.dot ? <circle className="ndot" cx={n.x + 20} cy={n.y + 28} r={4} /> : null}
              <text
                className="ntitle"
                x={n.x + n.w / 2}
                y={n.y + (n.h === 56 ? 24 : 20)}
                textAnchor="middle"
                style={n.smallTitle ? { fontSize: "12.5px" } : undefined}
              >
                {n.title}
              </text>
              <text
                className="nrole"
                x={n.x + n.w / 2}
                y={n.y + (n.h === 56 ? 42 : n.h === 46 ? 36 : 39)}
                textAnchor="middle"
              >
                {n.role}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="legend">
        <span>
          <i /> control / hand-off
        </span>
        <span>
          <i className="dashed" /> conditional branch
        </span>
        <span style={{ color: "var(--review)" }}>▸ pulsing = active flow</span>
        <span>click a node for detail ↓</span>
      </div>

      <div className="grid">
        <div className="panel">
          <div className="kicker">{drawer.kicker}</div>
          <h3 style={{ color: `var(${drawer.c})` }}>{drawer.title}</h3>
          <div
            className="drawerbody"
            dangerouslySetInnerHTML={{ __html: drawer.bodyHtml }}
          />
          {drawerPrompts ? (
            <div className="prompts">
              <div className="plabel">Prompts you can use</div>
              <PromptList items={drawerPrompts.items} />
            </div>
          ) : null}
        </div>
        {aside}
      </div>
    </>
  );
}
