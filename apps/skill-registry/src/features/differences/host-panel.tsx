// Feature slice: differences — host toggle + story (client leaf).
"use client";

import Link from "next/link";
import { DesktopHostSelector, useDesktopHost } from "@/shared/ui/desktop-host-selector";
import {
  FAILURE_MUSEUM,
  HOST_FLOWS,
  HOST_LABEL,
  SHARED_BOARD,
} from "./host-story";
import { CodexCapabilities } from "./codex-capabilities";
import { DifferencesMatrix } from "./matrix";

export function HostPanel() {
  const { host, selectHost } = useDesktopHost();

  const flow = HOST_FLOWS[host];
  const museum = FAILURE_MUSEUM.filter((f) => f.host === host || f.host === "both");

  return (
    <>
      <div className="diff-host-bar" data-host={host}>
        <DesktopHostSelector host={host} onSelect={selectHost} />
        <p className="muted diff-host-objective">{flow.objective}</p>
      </div>

      <section className="diff-shared" aria-labelledby="diff-shared-heading">
        <h2 id="diff-shared-heading">Shared board (does not move)</h2>
        <p className="muted">
          Same board contract across desktops. Mechanisms diverge below — never imply
          Cursor is “broken Claude” or Claude is “old Cursor.”
        </p>
        <div className="rolestrip diff-board-strip">
          {SHARED_BOARD.map((node, i) => (
            <span key={node.id} className="diff-board-node">
              {i > 0 ? <span className="arrow" aria-hidden>→</span> : null}
              <span className="rolechip" style={{ ["--rc" as string]: "var(--orch)" }}>
                <b>{node.label}</b>
                <span>{node.blurb}</span>
              </span>
            </span>
          ))}
        </div>
      </section>

      <section
        key={host}
        className="diff-host-flow"
        data-host={host}
        aria-labelledby="diff-flow-heading"
      >
        <h2 id="diff-flow-heading">{HOST_LABEL[host]} happy path</h2>
        <p className="muted">{flow.defaultPath}</p>
        <ol className="diff-flow-steps">
          {flow.steps.map((step) => (
            <li key={step.id}>
              <b>{step.label}</b>
              <span>{step.blurb}</span>
            </li>
          ))}
        </ol>
        {flow.advanced.length ? (
          <details className="diff-advanced">
            <summary>Advanced / lab stacks</summary>
            <ul>
              {flow.advanced.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      <section className="diff-museum" aria-labelledby="diff-museum-heading">
        <h2 id="diff-museum-heading">Only when it bites</h2>
        <p className="muted">
          Common failure modes for {HOST_LABEL[host]}. Full verified matrix is
          below — skim this first.
        </p>
        <details className="diff-advanced">
          <summary>Failure museum</summary>
          <ul className="diff-museum-list">
            {museum.map((item) => (
              <li key={item.title}>
                <b>{item.title}</b>
                <span>{item.bite}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="diff-matrix-section" aria-labelledby="diff-matrix-heading">
        <h2 id="diff-matrix-heading">Verified matrix</h2>
        <p className="muted">
          Living reference — a row lands only when checked against primary docs
          or tested directly. Unconfirmed claims stay{" "}
          <b>unverified</b>, never asserted as fact.
        </p>
        {host === "codex" ? <CodexCapabilities /> : <DifferencesMatrix />}
      </section>

      <div className="note teal" style={{ marginTop: 24 }}>
        <b>Install vs mechanisms.</b>{" "}
        <Link href="/setup">Setup</Link> is how you install skills and board
        config. This page is <i>why</i> desktops diverge. Lost on which seat to
        open? <Link href="/">Ask Vilya</Link> on Overview routes you.
      </div>

      <div className="note" style={{ marginTop: 14 }}>
        <b>Adding a row:</b> only from a primary source (official docs) or a
        directly-tested result — not a blog summary or a guess. Mark{" "}
        <code>unverified</code> until it&apos;s actually checked. ADR:{" "}
        <code>docs/DECISIONS.md</code> — <i>2026-07-20 — One board, two desktops</i>.
      </div>
    </>
  );
}
