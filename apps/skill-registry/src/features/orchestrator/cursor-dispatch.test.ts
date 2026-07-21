// #285: Cursor daytime Task/BoN primary; Worker A three-step is fallback.
// Anchors from #219 / #247 / #253 remain for the collapsed fallback path.
import { describe, expect, it } from "vitest";
import {
  CURSOR_DISPATCH_FALLBACK_SUMMARY,
  CURSOR_DISPATCH_PANEL_ID,
  CURSOR_DISPATCH_PRIMARY_KICKER,
  CURSOR_DISPATCH_PRIMARY_TITLE,
  CURSOR_DISPATCH_STEP3_LEAD,
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

describe("Cursor Task/BoN dispatch (#285)", () => {
  it("anchors orchestrator + Worker A paste cards for the path panel", () => {
    const orch = orchGroup();
    const orchKickoff = orch.items.find((i) => i.label === CURSOR_ORCH_PROMPT_LABEL);
    const workerA = orch.items.find((i) => i.label === CURSOR_WORKER_A_PROMPT_LABEL);
    expect(orchKickoff?.id).toBe(CURSOR_ORCH_PROMPT_ID);
    expect(workerA?.id).toBe(CURSOR_WORKER_A_PROMPT_ID);
  });

  it("standing-orders intro points at Task/BoN primary and Worker A fallback", () => {
    const orch = orchGroup();
    expect(orch.introHtml).toContain(`#${CURSOR_DISPATCH_PANEL_ID}`);
    expect(orch.introHtml).toMatch(/Task\/BoN/i);
    expect(orch.introHtml).toMatch(/fallback/i);
    expect(orch.introHtml).toContain(`/${CURSOR_HANDOFF_SKILL}`);
    expect(orch.introHtml).not.toMatch(/three-step path/i);
  });

  it("primary path titles Task/BoN; Worker A is collapsed fallback", () => {
    expect(CURSOR_DISPATCH_PRIMARY_KICKER).toMatch(/Task\/BoN/i);
    expect(CURSOR_DISPATCH_PRIMARY_TITLE).toMatch(/Task\/BoN/i);
    expect(CURSOR_DISPATCH_FALLBACK_SUMMARY).toMatch(/Fallback.*Worker A/i);
  });

  it("fallback Step 3 is run /vl-cursor-handoff in the worktree", () => {
    expect(CURSOR_DISPATCH_STEP3_LEAD).toBe("In the worktree, run");
    expect(CURSOR_HANDOFF_SKILL).toBe("vl-cursor-handoff");
  });

  it("Cursor orch standing orders teach Task/BoN wake, not Worker-A-only", () => {
    const orch = orchGroup();
    const cursorOrch = orch.items.find((i) => i.id === CURSOR_ORCH_PROMPT_ID);
    expect(cursorOrch?.text).toMatch(/Task\/BoN/i);
    expect(cursorOrch?.text).toMatch(/Task return/i);
    expect(cursorOrch?.text).toMatch(/worktree-first/i);
    expect(cursorOrch?.text).toMatch(/stop long-lived smoke/i);
    expect(cursorOrch?.text).toMatch(/Fallback when not using Task chips/i);
    expect(cursorOrch?.text).not.toMatch(
      /I start a separate agent session on each worktree/i
    );
  });

  it("keeps Worker A/B exclusivity on the standing-orders note", () => {
    const orch = orchGroup();
    expect(orch.noteHtml).toMatch(/Worker A and B are mutually exclusive/i);
    expect(orch.noteHtml).toMatch(/Task\/BoN/i);
  });
});
