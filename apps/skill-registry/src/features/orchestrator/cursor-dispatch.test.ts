// #219 / #247: Cursor three-step path + /cursor-handoff invoke target.
import { describe, expect, it } from "vitest";
import {
  CURSOR_DISPATCH_PANEL_ID,
  CURSOR_HANDOFF_SKILL,
  CURSOR_ORCH_PROMPT_ID,
  CURSOR_ORCH_PROMPT_LABEL,
  CURSOR_WORKER_A_PROMPT_ID,
  CURSOR_WORKER_A_PROMPT_LABEL,
} from "./cursor-dispatch";
import { PROMPTS } from "./prompts";

function orchGroup() {
  const orch = PROMPTS.find((g) => g.node === "ORCH");
  expect(orch).toBeDefined();
  return orch!;
}

describe("Cursor three-step dispatch (#219 / #247)", () => {
  it("anchors orchestrator + Worker A paste cards for the path panel", () => {
    const orch = orchGroup();
    const orchKickoff = orch.items.find((i) => i.label === CURSOR_ORCH_PROMPT_LABEL);
    const workerA = orch.items.find((i) => i.label === CURSOR_WORKER_A_PROMPT_LABEL);
    expect(orchKickoff?.id).toBe(CURSOR_ORCH_PROMPT_ID);
    expect(workerA?.id).toBe(CURSOR_WORKER_A_PROMPT_ID);
  });

  it("standing-orders intro points at the numbered Cursor path and /cursor-handoff", () => {
    const orch = orchGroup();
    expect(orch.introHtml).toContain(`#${CURSOR_DISPATCH_PANEL_ID}`);
    expect(orch.introHtml).toContain("three-step");
    expect(orch.introHtml).toContain(`/${CURSOR_HANDOFF_SKILL}`);
  });

  it("keeps Worker A/B exclusivity on the standing-orders note", () => {
    const orch = orchGroup();
    expect(orch.noteHtml).toMatch(/Worker A and B are mutually exclusive/i);
  });
});
