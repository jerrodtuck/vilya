// Feature slice: overview — cardinality panel (epic #132 §3, Fork C →
// option 2 — server component, static SVG, no interactivity; scoping
// corrected per #148). One product board: its architect fans out over that
// product's repo columns; each column runs its own orchestrator → chips →
// PRs. Other products are their own boards with their own architect — the
// architect edge never crosses the board border. Stays short by design: the
// full why lives on the Architect page's aside
// (src/features/architect/architect-view.tsx), the parallel slot to this one.
import Link from "next/link";

const REPO_COLS = [
  { id: "a", label: "REPO A", cx: 85 },
  { id: "b", label: "REPO B", cx: 235 },
  { id: "c", label: "REPO C", cx: 385 },
];
const ARCH_CX = 235;
const MORE_PRODUCTS_CX = 552;

export function CardinalityDiagram() {
  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <div className="kicker">Scope of the roles</div>
      <h3>One architect, one product board</h3>
      <p className="muted" style={{ margin: "6px 0 0", lineHeight: 1.55 }}>
        The architect&apos;s state is the product&apos;s board and its
        direction docs — nothing to collide across that product&apos;s repos,
        so one seat spans them; another product board means another architect.
        Each repo runs its own orchestrator (dispatch lock on that
        repo&apos;s main clone). A standing{" "}
        <Link href="/planner">Planner</Link> (Fable) is required for Claude
        Code chip-flow and night-shift prep; on Cursor daytime it is optional.
        Full rationale on the <Link href="/architect">Architect page</Link>.
      </p>
      <div className="card-diagram" style={{ marginTop: 14 }}>
        <svg
          viewBox="0 0 620 258"
          role="img"
          aria-label="One product board: its architect fans out over that product's repo columns; each repo column runs its own orchestrator, chips, and PRs. Other product boards have their own architect."
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
            x={6}
            y={6}
            width={462}
            height={244}
            rx={16}
            fill="none"
            stroke="var(--arch)"
            strokeDasharray="6 5"
            opacity={0.45}
          />
          <text className="elabel" x={20} y={24}>
            PRODUCT BOARD
          </text>

          <rect
            className="nbox"
            x={ARCH_CX - 95}
            y={34}
            width={190}
            height={46}
            rx={12}
            style={{ ["--c" as string]: "var(--arch)" }}
          />
          <text className="ntitle" x={ARCH_CX} y={54} textAnchor="middle">
            Architect
          </text>
          <text className="nrole" x={ARCH_CX} y={70} textAnchor="middle">
            direction · this product&apos;s repos
          </text>

          {REPO_COLS.map((col) => (
            <g key={col.id}>
              <path
                className="edge"
                d={`M${ARCH_CX},80 C${ARCH_CX},86 ${col.cx},84 ${col.cx},90`}
                style={{ stroke: "var(--arch)", opacity: 0.6 }}
                markerEnd="url(#cardinality-arrow)"
              />
              <rect
                x={col.cx - 73}
                y={90}
                width={146}
                height={152}
                rx={14}
                fill="none"
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
              <text className="elabel" x={col.cx} y={108} textAnchor="middle">
                {col.label}
              </text>
              <rect
                className="nbox"
                x={col.cx - 65}
                y={118}
                width={130}
                height={36}
                rx={10}
                style={{ ["--c" as string]: "var(--orch)" }}
              />
              <text
                className="ntitle"
                x={col.cx}
                y={140}
                textAnchor="middle"
                style={{ fontSize: "12.5px" }}
              >
                Orchestrator
              </text>
              <path
                className="edge"
                d={`M${col.cx},154 L${col.cx},164`}
                style={{ stroke: "var(--orch)", opacity: 0.55 }}
                markerEnd="url(#cardinality-arrow)"
              />
              <rect
                className="nbox"
                x={col.cx - 65}
                y={164}
                width={130}
                height={30}
                rx={10}
                style={{ ["--c" as string]: "var(--start)" }}
              />
              <text
                className="ntitle"
                x={col.cx}
                y={183}
                textAnchor="middle"
                style={{ fontSize: "12.5px" }}
              >
                chips
              </text>
              <path
                className="edge"
                d={`M${col.cx},194 L${col.cx},204`}
                style={{ stroke: "var(--start)", opacity: 0.55 }}
                markerEnd="url(#cardinality-arrow)"
              />
              <rect
                className="nbox"
                x={col.cx - 65}
                y={204}
                width={130}
                height={30}
                rx={10}
                style={{ ["--c" as string]: "var(--finish)" }}
              />
              <text
                className="ntitle"
                x={col.cx}
                y={223}
                textAnchor="middle"
                style={{ fontSize: "12.5px" }}
              >
                PRs
              </text>
            </g>
          ))}

          <rect
            x={MORE_PRODUCTS_CX - 52}
            y={6}
            width={104}
            height={244}
            rx={16}
            fill="none"
            stroke="var(--border)"
            strokeDasharray="6 5"
            opacity={0.6}
          />
          <rect
            x={MORE_PRODUCTS_CX - 42}
            y={34}
            width={84}
            height={34}
            rx={10}
            fill="none"
            stroke="var(--arch)"
            strokeDasharray="4 4"
            opacity={0.45}
          />
          <text
            x={MORE_PRODUCTS_CX}
            y={55}
            textAnchor="middle"
            fill="var(--faint)"
            fontSize={11}
          >
            Architect
          </text>
          <text
            x={MORE_PRODUCTS_CX}
            y={130}
            textAnchor="middle"
            fill="var(--faint)"
            fontSize={20}
          >
            ···
          </text>
          <text
            className="elabel"
            x={MORE_PRODUCTS_CX}
            y={156}
            textAnchor="middle"
            opacity={0.7}
          >
            MORE PRODUCTS
          </text>
          <text
            className="elabel"
            x={MORE_PRODUCTS_CX}
            y={172}
            textAnchor="middle"
            opacity={0.55}
          >
            own architect
          </text>
        </svg>
      </div>
    </div>
  );
}
