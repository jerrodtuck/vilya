// Shared chrome: GitHub Projects Status strip — the board every skill reports into.
import type { ReactNode } from "react";
import Link from "next/link";

const STATUSES = [
  {
    id: "todo",
    label: "Todo",
    blurb: "Not started — ready for a kickoff.",
  },
  {
    id: "inprog",
    label: "In Progress",
    blurb: "Branch + worktree active.",
  },
  {
    id: "blk",
    label: "Blocked",
    blurb: "Waiting on a decision or dependency.",
  },
  {
    id: "ver",
    label: "Verifying",
    blurb: "Merged; live / human check owed.",
  },
  {
    id: "dn",
    label: "Done",
    blurb: "Confirmed complete.",
  },
] as const;

type BoardStripProps = {
  /** Quieter hint under the strip (config / GITHUB-PROJECTS.md). */
  hint?: ReactNode;
  /** Anchor down to the mover-map section when shown on Overview. */
  moversHref?: string;
  /** Link the header into Orchestrator when shown on Overview. */
  orchestratorHref?: string;
  /** Screenshot figure (the real board) rendered inside the card. */
  figure?: ReactNode;
};

export function BoardStrip({
  hint,
  moversHref,
  orchestratorHref,
  figure,
}: BoardStripProps) {
  return (
    <section className="board" aria-label="GitHub Projects Status flow">
      <div className="board-head">
        <p className="mono-kicker board-kicker">02 · board</p>
        <div className="blabel">
          <b>GitHub Projects</b>
          <span className="board-sep">·</span>
          <span>the one shared state every skill reports into</span>
          {moversHref ? (
            <>
              <span className="board-sep">·</span>
              <Link href={moversHref}>see who moves each column ↓</Link>
            </>
          ) : null}
          {orchestratorHref ? (
            <>
              <span className="board-sep">·</span>
              <Link href={orchestratorHref}>
                the flows that drive it → Orchestrator
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <ol className="board-cols">
        {STATUSES.map((s, i) => (
          <li key={s.id} className="board-col">
            {i > 0 ? (
              <span className="board-arrow" aria-hidden>
                →
              </span>
            ) : null}
            <div className={`board-col-inner status-${s.id}`}>
              <span className="board-col-label">{s.label}</span>
              <span className="board-col-blurb">{s.blurb}</span>
            </div>
          </li>
        ))}
      </ol>

      {figure}

      {hint ? <div className="hint">{hint}</div> : null}
    </section>
  );
}
