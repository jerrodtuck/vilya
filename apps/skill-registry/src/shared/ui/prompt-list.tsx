// Shared UI: renders a prompt group's body: intro line, prompt items with
// copy buttons, caveat note. Server-safe: only the CopyButton leaf is
// client. Used by every page with a prompt library (orchestrator, architect,
// overview's Ask Vilya card).
import { CopyButton } from "./copy-button";
import type { PromptGroup } from "./flow-map-types";

export function PromptList({ group }: { group: PromptGroup }) {
  return (
    <>
      {group.introHtml ? (
        <p
          className="muted"
          style={{ margin: "2px 0 4px", fontSize: 12.5, lineHeight: 1.5 }}
          dangerouslySetInnerHTML={{ __html: group.introHtml }}
        />
      ) : null}
      {group.items.map((it) => (
        <div className="prompt" key={it.label}>
          <span className="plead">{it.label}</span>
          <span className="ptext">{it.text}</span>
          <CopyButton text={it.text} />
        </div>
      ))}
      {group.noteHtml ? (
        <div
          className="note"
          style={{ marginTop: 10, fontSize: 12 }}
          dangerouslySetInnerHTML={{ __html: group.noteHtml }}
        />
      ) : null}
    </>
  );
}
