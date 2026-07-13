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
  /** Link the header into Flows when shown on Overview. */
  flowsHref?: string;
};

export function BoardStrip({ hint, flowsHref }: BoardStripProps) {
  return (
    <section className="board" aria-label="GitHub Projects Status flow">
      <div className="board-head">
        <p className="mono-kicker board-kicker">02 · board</p>
        <div className="blabel">
          <b>GitHub Projects</b>
          <span className="board-sep">·</span>
          <span>the one shared state every skill reports into</span>
          {flowsHref ? (
            <>
              <span className="board-sep">·</span>
              <Link href={flowsHref}>see it light up on Flows</Link>
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

      {hint ? <div className="hint">{hint}</div> : null}
    </section>
  );
}
