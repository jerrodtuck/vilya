// Feature slice: differences — full comparison matrix (story second).
import { DIFFERENCES } from "./data";

export function DifferencesMatrix() {
  return (
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
  );
}
