// Feature slice: night-shift — numbered steps (same visual pattern as Setup’s setupsteps).
// Local copy: VSA forbids importing setup-steps from another feature.

import type { ReactNode } from "react";

export type OperatorStep = { text: ReactNode; expect?: ReactNode };

export function OperatorSteps({ steps }: { steps: OperatorStep[] }) {
  return (
    <div className="setupsteps">
      {steps.map((s, i) => (
        <div className="step" key={i}>
          <span className="n">{i + 1}</span>
          <span className="t">
            {s.text}
            {s.expect ? <small>{s.expect}</small> : null}
          </span>
        </div>
      ))}
    </div>
  );
}
