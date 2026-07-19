// Feature slice: setup — Plan→execute section (#209, server component).
import type { ReactNode } from "react";
import {
  EXECUTE_MODEL_JSON,
  PLAN_EXECUTE_BLOCKS,
  PLAN_EXECUTE_INTRO,
} from "./plan-execute-routing";

/** Render `code`, **bold**, and [label](/href) from plan-execute data strings. */
function rich(text: string): ReactNode[] {
  const tokens = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokens);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <b key={i}>{part.slice(2, -2)}</b>;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      return (
        <a key={i} href={link[2]}>
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

export function PlanExecuteSection() {
  return (
    <>
      <h2>Plan → execute (models)</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        {rich(PLAN_EXECUTE_INTRO)}
      </p>
      {PLAN_EXECUTE_BLOCKS.map((block) => (
        <div key={block.title ?? block.body.slice(0, 24)}>
          <p className="muted" style={{ lineHeight: 1.55 }}>
            {block.title ? (
              <>
                <b>{rich(block.title)}</b> {rich(block.body)}
              </>
            ) : (
              rich(block.body)
            )}
          </p>
          {block.followWith === "execute-model-json" ? (
            <pre>{EXECUTE_MODEL_JSON}</pre>
          ) : null}
        </div>
      ))}
    </>
  );
}
