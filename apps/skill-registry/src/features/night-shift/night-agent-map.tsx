// Feature slice: night-shift — interactive night-agent pipeline map (client island).
"use client";

import { useState, type ReactNode } from "react";
import { STAGE_ORDER, STAGES, isDistinctKind, type StageId } from "./data";
import { EDGES, EDGE_LABELS, STAGE_GEOMS, edgeTouches } from "./map-geometry";

const DEFAULT_DRAWER = {
  kicker: "Night agent",
  title: "How unattended work actually runs",
  c: "--orch",
  bodyHtml: `
    <p>Click a stage on the pipeline. The happy path runs left to right —
    <b>Dispatch → Runner → Identity → Loop → Steering → Outputs</b>.</p>
    <ul>
      <li><b>Steering</b> and <b>Failure</b> use distinct styling — safety gates and bring-up walls are the product, not footnotes.</li>
      <li>This is the same daytime Dev Loop, driven headless by GitHub Actions + Claude Code on your self-hosted Windows box.</li>
      <li>The daytime methodology map stays on <a href="/orch">Orch</a>; this page teaches the agent machinery.</li>
    </ul>`,
};

export function NightAgentMap({ aside }: { aside?: ReactNode }) {
  const [selected, setSelected] = useState<StageId | null>(null);

  const drawer = selected ? STAGES[selected] : DEFAULT_DRAWER;

  const edgeClass = (edge: (typeof EDGES)[number]) => {
    const parts = ["edge", edge.kind === "fail" ? "dash ns-fail-edge" : "c-orch"];
    if (selected) {
      parts.push(edgeTouches(edge, selected) ? "lit" : "faded");
    }
    return parts.join(" ");
  };

  const nodeClass = (id: StageId) => {
    const stage = STAGES[id];
    const parts = ["node"];
    if (isDistinctKind(stage.kind)) parts.push("ns-distinct");
    if (stage.kind === "failure") parts.push("ns-failure");
    if (stage.kind === "safety") parts.push("ns-safety");
    if (selected) parts.push(selected === id ? "lit" : "faded");
    if (selected === id) parts.push("sel");
    return parts.join(" ");
  };

  return (
    <>
      <div className="chips">
        <button
          type="button"
          className={`chip all${selected === null ? " active" : ""}`}
          onClick={() => setSelected(null)}
        >
          <span className="dot" />
          Full pipeline
        </button>
        {STAGE_ORDER.map((id) => {
          const s = STAGES[id];
          return (
            <button
              type="button"
              key={id}
              className={`chip${selected === id ? " active" : ""}${isDistinctKind(s.kind) ? " ns-chip-distinct" : ""}`}
              style={{ color: `var(${s.c})` }}
              onClick={() => setSelected(id)}
            >
              <span className="dot" />
              {s.chipLabel}
            </button>
          );
        })}
      </div>
      <div className="flowdesc">
        {selected === null ? (
          <>
            Interactive pipeline of the night agent — click a stage for detail.
            <b> Steering</b> and <b>Failure</b> are visually distinct from the happy path.
          </>
        ) : (
          <>
            {STAGES[selected].kicker} — {STAGES[selected].title}
          </>
        )}
      </div>

      <div className="stage ns-stage">
        <svg viewBox="0 0 1280 320" role="img" aria-label="Night agent pipeline">
          <defs>
            <marker
              id="ns-arrow"
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
              className={edgeClass(e)}
              d={e.d}
              markerEnd="url(#ns-arrow)"
            />
          ))}
          {EDGE_LABELS.map((l) => (
            <text key={l.text} className="elabel" x={l.x} y={l.y} textAnchor="middle">
              {l.text}
            </text>
          ))}

          {STAGE_GEOMS.map((n) => {
            const stage = STAGES[n.id];
            return (
              <g
                key={n.id}
                className={nodeClass(n.id)}
                tabIndex={0}
                style={{ ["--c" as string]: `var(${stage.c})` }}
                onClick={() => setSelected(n.id)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    setSelected(n.id);
                  }
                }}
              >
                <rect className="nbox" x={n.x} y={n.y} width={n.w} height={n.h} rx={n.rx} />
                <text
                  className="ntitle"
                  x={n.x + n.w / 2}
                  y={n.y + 26}
                  textAnchor="middle"
                >
                  {stage.mapTitle}
                </text>
                <text
                  className="nrole"
                  x={n.x + n.w / 2}
                  y={n.y + 46}
                  textAnchor="middle"
                >
                  {stage.mapRole}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="legend">
        <span>
          <i /> happy-path spine
        </span>
        <span>
          <i className="dashed ns-legend-fail" /> failure / bring-up links
        </span>
        <span style={{ color: "var(--blocked)" }}>▸ safety gates (Steering)</span>
        <span style={{ color: "var(--bug)" }}>▸ failure layer</span>
        <span>click a stage for detail ↓</span>
      </div>

      <div className={selected ? "ns-drawer-full" : "grid"}>
        <div className={`panel${selected && isDistinctKind(STAGES[selected].kind) ? " ns-panel-distinct" : ""}`}>
          <div className="kicker">{drawer.kicker}</div>
          <h3 style={{ color: `var(${drawer.c})` }}>{drawer.title}</h3>
          <div
            className="drawerbody"
            dangerouslySetInnerHTML={{ __html: drawer.bodyHtml }}
          />
        </div>
        {!selected ? aside : null}
      </div>
    </>
  );
}
