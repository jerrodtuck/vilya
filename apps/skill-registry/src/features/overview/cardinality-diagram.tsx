// Feature slice: overview — cardinality panel (epic #132 §3, Fork C →
// option 2 — server component, static SVG, no interactivity). One architect
// node fans out over N repo columns; each column runs its own orchestrator →
// chips → PRs. Stays short by design: the full why lives on the Architect
// page's aside (src/features/architect/architect-view.tsx), the parallel
// slot to this one.
import Link from "next/link";

const REPO_COLS = [
  { id: "a", label: "REPO A", cx: 85 },
  { id: "b", label: "REPO B", cx: 235 },
  { id: "c", label: "REPO C", cx: 385 },
];
const MORE_REPOS_CX = 535;
const ARCH_CX = 310;

export function CardinalityDiagram() {
  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <div className="kicker">Scope of the role</div>
      <h3>One architect, N repos</h3>
      <p className="muted" style={{ margin: "6px 0 0", lineHeight: 1.55 }}>
        The architect&apos;s state is docs and the board — nothing to collide
        across repos, so one architect spans every product you run. Each repo
        runs its own orchestrator, the dispatch lock on that repo&apos;s main
        clone. Full rationale on the{" "}
        <Link href="/architect">Architect page</Link>.
      </p>
      <div className="card-diagram" style={{ marginTop: 14 }}>
        <svg
          viewBox="0 0 620 250"
          role="img"
          aria-label="One architect fans out over N repo columns; each column runs its own orchestrator, chips, and PRs"
        >
          <defs>
            <marker
              id="cardinality-arrow"
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
            </marker>
          </defs>

          <rect
            className="nbox"
            x={ARCH_CX - 85}
            y={6}
            width={170}
            height={46}
            rx={12}
            style={{ ["--c" as string]: "var(--arch)" }}
          />
          <text className="ntitle" x={ARCH_CX} y={26} textAnchor="middle">
            Architect
          </text>
          <text className="nrole" x={ARCH_CX} y={42} textAnchor="middle">
            direction · every repo
          </text>

          {REPO_COLS.map((col) => (
            <g key={col.id}>
              <path
                className="edge"
                d={`M${ARCH_CX},52 C${ARCH_CX},58 ${col.cx},56 ${col.cx},62`}
                style={{ stroke: "var(--arch)", opacity: 0.6 }}
                markerEnd="url(#cardinality-arrow)"
              />
              <rect
                x={col.cx - 73}
                y={62}
                width={146}
                height={152}
                rx={14}
                fill="none"
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
              <text className="elabel" x={col.cx} y={80} textAnchor="middle">
                {col.label}
              </text>
              <rect
                className="nbox"
                x={col.cx - 65}
                y={90}
                width={130}
                height={36}
                rx={10}
                style={{ ["--c" as string]: "var(--orch)" }}
              />
              <text
                className="ntitle"
                x={col.cx}
                y={112}
                textAnchor="middle"
                style={{ fontSize: "12.5px" }}
              >
                Orchestrator
              </text>
              <path
                className="edge"
                d={`M${col.cx},126 L${col.cx},136`}
                style={{ stroke: "var(--orch)", opacity: 0.55 }}
                markerEnd="url(#cardinality-arrow)"
              />
              <rect
                className="nbox"
                x={col.cx - 65}
                y={136}
                width={130}
                height={30}
                rx={10}
                style={{ ["--c" as string]: "var(--start)" }}
              />
              <text
                className="ntitle"
                x={col.cx}
                y={155}
                textAnchor="middle"
                style={{ fontSize: "12.5px" }}
              >
                chips
              </text>
              <path
                className="edge"
                d={`M${col.cx},166 L${col.cx},176`}
                style={{ stroke: "var(--start)", opacity: 0.55 }}
                markerEnd="url(#cardinality-arrow)"
              />
              <rect
                className="nbox"
                x={col.cx - 65}
                y={176}
                width={130}
                height={30}
                rx={10}
                style={{ ["--c" as string]: "var(--finish)" }}
              />
              <text
                className="ntitle"
                x={col.cx}
                y={195}
                textAnchor="middle"
                style={{ fontSize: "12.5px" }}
              >
                PRs
              </text>
            </g>
          ))}

          <path
            className="edge"
            d={`M${ARCH_CX},52 C${ARCH_CX},58 ${MORE_REPOS_CX},56 ${MORE_REPOS_CX},62`}
            style={{ stroke: "var(--arch)", opacity: 0.3 }}
            strokeDasharray="4 4"
          />
          <rect
            x={MORE_REPOS_CX - 40}
            y={62}
            width={80}
            height={70}
            rx={14}
            fill="none"
            stroke="var(--border)"
            strokeDasharray="4 4"
            opacity={0.6}
          />
          <text
            x={MORE_REPOS_CX}
            y={100}
            textAnchor="middle"
            fill="var(--faint)"
            fontSize={20}
          >
            ···
          </text>
          <text
            className="elabel"
            x={MORE_REPOS_CX}
            y={122}
            textAnchor="middle"
            opacity={0.7}
          >
            MORE REPOS
          </text>
        </svg>
      </div>
    </div>
  );
}
