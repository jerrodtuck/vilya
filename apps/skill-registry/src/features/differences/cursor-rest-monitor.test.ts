// #223: Differences contrast Claude Monitor tool vs Cursor REST watcher.
import { describe, expect, it } from "vitest";
import { DIFFERENCES } from "./data";

function row(area: string) {
  const found = DIFFERENCES.find((r) => r.area === area);
  if (!found) throw new Error(`missing differences row: ${area}`);
  return found;
}

describe("differences chip-completion monitor (#223)", () => {
  it("dedicated row contrasts Monitor tool vs REST notify_on_output", () => {
    const monitor = row("Chip-completion / board monitor mechanism");
    expect(monitor.certainty).toBe("confirmed");
    expect(monitor.claudeCode).toContain("Monitor tool");
    expect(monitor.claudeCode).toContain("exit-only");
    expect(monitor.cursor).toContain("notify_on_output");
    expect(monitor.cursor).toContain("pulls?head=");
    expect(monitor.cursor).toContain("never `gh pr list`");
    expect(monitor.cursor).toContain("gh project item-list");
    expect(monitor.cursor).toContain("No Monitor tool");
    expect(monitor.note).toMatch(/Monitor equivalent/i);
  });

  it("completion-reliability Cursor cell mentions REST notify watcher", () => {
    const completion = row("Completion notification reliability");
    expect(completion.cursor).toContain("notify_on_output");
    expect(completion.cursor).toContain("REST");
    expect(completion.claudeCode).toContain("Monitor-tool");
  });
});
