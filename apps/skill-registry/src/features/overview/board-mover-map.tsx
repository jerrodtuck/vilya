// Feature slice: overview — "The board moves itself" home section (#171).
// Static annotated board strip: extends the BoardStrip visual pattern with the
// live board's verbatim column descriptions and the epic #169 mover map — seven
// transitions, each labeled skill / automation / human; exactly one is human.
import Link from "next/link";
import { BOARD_COLUMNS, BOARD_TRANSITIONS } from "./board-movers";

export function BoardMoverMap() {
  return (
    <section className="movers" aria-label="Who moves the board">
      <div className="board-head">
        <p className="mono-kicker board-kicker">03 · movers</p>
        <h2 className="mv-headline">
          You don&apos;t move the board. The loop does.
        </h2>
        <p className="mv-sub">
          Your single touch: confirming live smoke at <b>Verifying</b> — every
          other Status move is a skill or a board automation.
        </p>
      </div>

      <ol className="board-cols">
        {BOARD_COLUMNS.map((c, i) => (
          <li key={c.id} className="board-col">
            {i > 0 ? (
              <span className="board-arrow" aria-hidden>
                →
              </span>
            ) : null}
            <div className={`board-col-inner status-${c.id}`}>
              <span className="board-col-label">{c.label}</span>
              <span className="board-col-blurb">{c.description}</span>
            </div>
          </li>
        ))}
      </ol>

      <ol className="mv-list" aria-label="Every Status transition and its mover">
        {BOARD_TRANSITIONS.map((t) => (
          <li
            key={`${t.from}-${t.to}`}
            className={
              t.moverClass === "human" ? "mv-row mv-row-human" : "mv-row"
            }
          >
            <span className="mv-hop">
              {t.from} <span className="mv-arrow" aria-hidden>→</span> {t.to}
            </span>
            <span className={`mv-badge mv-${t.moverClass}`}>{t.moverClass}</span>
            <span className="mv-who">{t.mover}</span>
          </li>
        ))}
      </ol>

      <div className="hint">
        Seven transitions, one human touch.{" "}
        <Link href="/setup">Get this board on your repo</Link>
        <span className="board-sep"> · </span>
        <Link href="/orchestrator">see who dispatches</Link>.
      </div>
    </section>
  );
}
