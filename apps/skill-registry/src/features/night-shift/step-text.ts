// Feature slice: night-shift — collect plain text from OperatorStep React trees (tests).
import type { OperatorStep } from "./operator-steps";

export function collectText(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(collectText).join("");
  if (typeof node === "object" && "props" in node) {
    const el = node as { props?: { children?: unknown } };
    return collectText(el.props?.children);
  }
  return "";
}

export function stepsBlob(steps: OperatorStep[]): string {
  return steps
    .map((s) => `${collectText(s.text)}\n${collectText(s.expect)}`)
    .join("\n");
}
