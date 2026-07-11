// Feature slice: flows — renders prompt items with copy buttons.
// Server-safe: only the CopyButton leaf is client.
import { CopyButton } from "./copy-button";
import type { PromptItem } from "./prompts";

export function PromptList({ items }: { items: PromptItem[] }) {
  return (
    <>
      {items.map((it) => (
        <div className="prompt" key={it.label}>
          <span className="plead">{it.label}</span>
          <span className="ptext">{it.text}</span>
          <CopyButton text={it.text} />
        </div>
      ))}
    </>
  );
}
