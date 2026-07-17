// Feature slice: differences — Cursor vs Claude Code, verified divergences.
import { DIFFERENCES } from "./data";

export function DifferencesView() {
  return (
    <>
      <div className="eyebrow">Living reference · grows as we verify more</div>
      <h1>Cursor vs Claude Code</h1>
      <p className="lead">
        Settings, mechanisms, and behavior that <b>diverge</b> between the two
        tools this loop runs on. A row only lands here once it&apos;s been
        checked against primary docs or tested directly — anything not yet
        confirmed is labeled <b>unverified</b> rather than asserted.
      </p>

      <div className="difftable">
        {DIFFERENCES.map((row) => (
          <div className="diffrow" key={row.area}>
            <div className="diffhead">
              <h3>{row.area}</h3>
              <span className={`tag ${row.certainty === "confirmed" ? "level" : "manual"}`}>
                {row.certainty}
              </span>
            </div>
            <div className="diffcols">
              <div className="diffcol">
                <span className="diffcol-label">Claude Code</span>
                <p>{row.claudeCode}</p>
              </div>
              <div className="diffcol">
                <span className="diffcol-label">Cursor</span>
                <p>{row.cursor}</p>
              </div>
            </div>
            {row.note ? <p className="muted diffnote">{row.note}</p> : null}
            {row.sources?.length ? (
              <p className="muted diffsources">
                Sources:{" "}
                {row.sources.map((s, i) => (
                  <span key={s.href}>
                    {i > 0 ? " · " : ""}
                    <a href={s.href} target="_blank" rel="noreferrer">
                      {s.label}
                    </a>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="note" style={{ marginTop: 24 }}>
        <b>Adding a row:</b> only from a primary source (official docs) or a
        directly-tested result — not a blog summary or a guess. Mark{" "}
        <code>unverified</code>{" "}
        until it&apos;s actually checked.
      </div>
    </>
  );
}
