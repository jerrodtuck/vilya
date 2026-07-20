// #254 / #268: graduated role cards carry skill metadata; orch seats must not
// map skill → vilya-chip (chip is dispatch, not the orchestrator seat).
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SKILL_AFFORDANCE_LEAD } from "../../shared/skills/skill-affordance";
import { SKILL_SLUGS } from "../../shared/skills/invokes";
import { PromptList } from "../../shared/ui/prompt-list";
import {
  CURSOR_ORCH_PROMPT_LABEL,
  CURSOR_WORKER_A_PROMPT_LABEL,
} from "./cursor-dispatch";
import { PROMPTS } from "./prompts";

const CLAUDE_ORCH_LABEL = "Claude Code — orchestrator · spawn_task chips";

function orchGroup() {
  const orch = PROMPTS.find((g) => g.node === "ORCH");
  expect(orch).toBeDefined();
  return orch!;
}

describe("orchestrator prompt skill metadata (#254 / #268)", () => {
  it("maps Worker A; leaves Claude + Cursor orch paste-only", () => {
    const orch = orchGroup();
    const workerA = orch.items.find((i) => i.label === CURSOR_WORKER_A_PROMPT_LABEL);
    const claudeOrch = orch.items.find((i) => i.label === CLAUDE_ORCH_LABEL);
    const cursorOrch = orch.items.find((i) => i.label === CURSOR_ORCH_PROMPT_LABEL);
    const workerB = orch.items.find(
      (i) => i.label === "Cursor — worker kickoff B · worker does its own setup"
    );

    expect(workerA?.skill).toBe(SKILL_SLUGS.cursorHandoff);
    expect(claudeOrch?.skill).toBeUndefined();
    expect(cursorOrch?.skill).toBeUndefined();
    expect(workerB?.skill).toBeUndefined();
  });

  it("never maps any ORCH standing-order item skill → vilya-chip", () => {
    const orch = orchGroup();
    for (const item of orch.items) {
      expect(item.skill).not.toBe(SKILL_SLUGS.chip);
    }
  });

  it("Claude orch card stays paste-only in PromptList (no chip affordance)", () => {
    const orch = orchGroup();
    const claudeOrch = orch.items.find((i) => i.label === CLAUDE_ORCH_LABEL)!;
    // Render the seat alone — body doctrine may still name /vilya-chip as dispatch.
    const html = renderToStaticMarkup(
      <PromptList group={{ ...orch, items: [claudeOrch] }} />
    );
    expect(html).toContain(CLAUDE_ORCH_LABEL);
    expect(html).not.toContain("pskill");
    expect(html).not.toContain(SKILL_AFFORDANCE_LEAD);
    expect(html).toContain("Copy");
  });

  it("maps process skill groups that already ship", () => {
    const byNode = (node: string) => PROMPTS.find((g) => g.node === node)!;
    expect(byNode("START").items.every((i) => i.skill === SKILL_SLUGS.startFeature)).toBe(
      true
    );
    expect(byNode("FINISH").items.every((i) => i.skill === SKILL_SLUGS.finishFeature)).toBe(
      true
    );
    expect(byNode("MERGE").items.every((i) => i.skill === SKILL_SLUGS.mergePr)).toBe(true);
    expect(byNode("DOCS").items.every((i) => i.skill === SKILL_SLUGS.updateDocs)).toBe(true);
    expect(byNode("HIST").items.every((i) => i.skill === SKILL_SLUGS.history)).toBe(true);
  });
});
