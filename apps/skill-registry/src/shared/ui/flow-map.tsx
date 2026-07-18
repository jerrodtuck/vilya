// Shared UI: the interactive flow map (client component). State: which
// flow(s) are lit, which node is selected. All content — nodes, flows, geometry,
// prompts, the default drawer — comes in as props from the feature slice's
// own data modules (orchestrator/data.ts + map-geometry.ts, architect's
// equivalents, …), so this component owns no domain knowledge of its own.
"use client";

import { Fragment, useState } from "react";
import type {
  EdgeGeom,
  EdgeLabel,
  FlowDef,
  FlowNode,
  LensGeom,
  NodeGeom,
  PromptGroup,
} from "./flow-map-types";
import { PromptList } from "./prompt-list";

export interface FlowMapProps {
  nodes: Record<string, FlowNode>;
  flows: Record<string, FlowDef>;
  flowColors: Record<string, string>;
  edges: EdgeGeom[];
  edgeLabels: EdgeLabel[];
  nodeGeoms: NodeGeom[];
  /** Optional decorative lens chips (orchestrator's VSA/SOLID/Stack/Simplify over REVIEW). */
  lenses?: LensGeom[];
  /** Stem path connecting the lens chips down to their node — required if `lenses` is set. */
  lensConnector?: string;
  /** Drawer content shown before any node is selected. */
  defaultDrawer: FlowNode;
  /**
   * The full prompt library, keyed by group.node. Passed as data (not a
   * lookup function) because this is a client component fed by a server
   * component — functions can't cross that boundary.
   */
  prompts: PromptGroup[];
  /** SVG viewBox; defaults to the orchestrator map's 1280x520 canvas. */
  viewBox?: string;
  ariaLabel: string;
  aside?: React.ReactNode;
}

export function FlowMap({
  nodes,
  flows,
  flowColors,
  edges,
  edgeLabels,
  nodeGeoms,
  lenses,
  lensConnector,
  defaultDrawer,
  prompts,
  viewBox = "0 0 1280 520",
  ariaLabel,
  aside,
}: FlowMapProps) {
  // Chip clicks select one flow; node clicks select every flow passing
  // through that node (#183) — so the active selection is a list. When it
  // contains "everything" (null nodes/edges), nothing is lit or faded.
  const [activeFlowIds, setActiveFlowIds] = useState<string[]>(["everything"]);
  const [selected, setSelected] = useState<string | null>(null);

  const activeDefs = activeFlowIds.map((id) => flows[id]);
  const showAll = activeDefs.some((f) => !f.nodes);
  const litNodes = showAll
    ? null
    : new Set(activeDefs.flatMap((f) => f.nodes ?? []));
  const litEdges = showAll
    ? null
    : new Set(activeDefs.flatMap((f) => f.edges ?? []));

  const selectNode = (id: string) => {
    setSelected(id);
    const containing = Object.keys(flows).filter((fid) =>
      flows[fid].nodes?.includes(id),
    );
    if (containing.length > 0) setActiveFlowIds(containing);
  };

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

  const drawer = selected ? nodes[selected] : defaultDrawer;
  const drawerPrompts = selected
    ? prompts.find((g) => g.node === selected)
    : undefined;

  return (
    <>
      <div className="chips">
        {Object.entries(flows).map(([id, f]) => (
          <button
            type="button"
            key={id}
            className={`chip${id === "everything" ? " all" : ""}${activeFlowIds.includes(id) ? " active" : ""}`}
            style={
              id === "everything"
                ? undefined
                : { color: `var(${flowColors[id]})` }
            }
            onClick={() => setActiveFlowIds([id])}
          >
            <span className="dot" />
            {f.label}
          </button>
        ))}
      </div>
      {activeDefs.length === 1 ? (
        <div
          className="flowdesc"
          dangerouslySetInnerHTML={{ __html: activeDefs[0].descHtml }}
        />
      ) : (
        <div className="flowdesc">
          <b>{nodeGeoms.find((n) => n.id === selected)?.title ?? "This step"}</b>{" "}
          sits in {activeDefs.length} flows —{" "}
          {activeDefs.map((f) => f.label).join(", ")}. Each flow&apos;s arrows
          are lit in its own color.
        </div>
      )}

      <div className="stage">
        <svg viewBox={viewBox} role="img" aria-label={ariaLabel}>
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

          {edges.map((e) => (
            <path
              key={e.id}
              className={edgeClass(e.id, e.colorClass, e.dashed)}
              d={e.d}
              markerEnd="url(#arrow)"
            />
          ))}
          {edgeLabels.map((l) => (
            <text key={l.text} className="elabel" x={l.x} y={l.y}>
              {l.text}
            </text>
          ))}

          {lenses && lenses.length > 0 ? (
            <g opacity="0.95">
              {lenses.map((ln) => (
                <g key={ln.text}>
                  <rect className="lens" x={ln.x} y={ln.y} width={ln.w} height={17} rx={5} />
                  <text className="lenstxt" x={ln.tx} y={ln.ty} textAnchor="middle">
                    {ln.text}
                  </text>
                </g>
              ))}
              {lensConnector ? (
                <path className="edge" d={lensConnector} stroke="var(--review)" opacity=".5" />
              ) : null}
            </g>
          ) : null}

          {nodeGeoms.map((n) => (
            <g
              key={n.id}
              className={nodeClass(n.id)}
              tabIndex={0}
              style={{ ["--c" as string]: `var(${nodes[n.id].c})` }}
              onClick={() => selectNode(n.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectNode(n.id);
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
              <PromptList group={drawerPrompts} />
            </div>
          ) : null}
        </div>
        {/* `aside` is JSX authored by a server component (OrchestratorView /
            ArchitectView) and handed across the RSC boundary as a prop. In
            dev, React can't verify a server-created element placed into a
            multi-child slot was keyed correctly, so it warns unless we key
            it here explicitly — even though there's no real list. */}
        {aside ? <Fragment key="aside">{aside}</Fragment> : null}
      </div>
    </>
  );
}
