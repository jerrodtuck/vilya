// #254: graduated orchestrator cards carry skill metadata for PromptList.
import { describe, expect, it } from "vitest";
import { SKILL_SLUGS } from "../../shared/skills/invokes";
import {
  CURSOR_ORCH_PROMPT_LABEL,
  CURSOR_WORKER_A_PROMPT_LABEL,
} from "./cursor-dispatch";
import { PROMPTS } from "./prompts";

function orchGroup() {
  const orch = PROMPTS.find((g) => g.node === "ORCH");
  expect(orch).toBeDefined();
  return orch!;
}

describe("orchestrator prompt skill metadata (#254)", () => {
  it("maps Worker A + Claude chip dispatch; leaves Cursor orch paste-only", () => {
    const orch = orchGroup();
    const workerA = orch.items.find((i) => i.label === CURSOR_WORKER_A_PROMPT_LABEL);
    const chip = orch.items.find(
      (i) => i.label === "Claude Code — orchestrator · spawn_task chips"
    );
    const cursorOrch = orch.items.find((i) => i.label === CURSOR_ORCH_PROMPT_LABEL);
    const workerB = orch.items.find(
      (i) => i.label === "Cursor — worker kickoff B · worker does its own setup"
    );

    expect(workerA?.skill).toBe(SKILL_SLUGS.cursorHandoff);
    expect(chip?.skill).toBe(SKILL_SLUGS.chip);
    expect(cursorOrch?.skill).toBeUndefined();
    expect(workerB?.skill).toBeUndefined();
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
