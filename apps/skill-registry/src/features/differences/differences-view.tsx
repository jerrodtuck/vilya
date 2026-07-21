// Feature slice: differences — one board, two desktops (#281).
import { Suspense } from "react";
import { HostPanel } from "./host-panel";

export function DifferencesView() {
  return (
    <>
      <div className="eyebrow">One board · two desktops</div>
      <h1>Same board. Different desktop machinery.</h1>
      <p className="lead">
        After this page you can run one issue to Done on <b>your</b>
        {" "}
        desktop without borrowing the other host&apos;s seats. Shared contract
        first; host mechanisms second; verified matrix last.
      </p>

      <Suspense
        fallback={
          <p className="muted" style={{ marginTop: 16 }}>
            Loading desktop path…
          </p>
        }
      >
        <HostPanel />
      </Suspense>
    </>
  );
}
