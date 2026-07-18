// Feature slice: setup — shared numbered-step list (server component).
// Extracted from setup-view so board-guide can reuse it without a cycle.

export type SetupStep = { text: React.ReactNode; sub?: React.ReactNode };

export function Steps({ steps }: { steps: SetupStep[] }) {
  return (
    <div className="setupsteps">
      {steps.map((s, i) => (
        <div className="step" key={i}>
          <span className="n">{i + 1}</span>
          <span className="t">
            {s.text}
            {s.sub ? <small>{s.sub}</small> : null}
          </span>
        </div>
      ))}
    </div>
  );
}
