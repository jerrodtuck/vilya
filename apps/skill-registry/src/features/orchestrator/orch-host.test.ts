// #285 follow-on: /orch host filter — CC vs Cursor standing orders + path intros.
import { describe, expect, it } from "vitest";
import { SKILL_INVOKES } from "../../shared/skills/invokes";
import {
  CLAUDE_DISPATCH_PANEL_ID,
  CLAUDE_DISPATCH_PRIMARY_TITLE,
  CLAUDE_ORCH_PROMPT_LABEL,
} from "./claude-dispatch";
import {
  CURSOR_DISPATCH_PANEL_ID,
  CURSOR_ORCH_PROMPT_LABEL,
  CURSOR_WORKER_A_PROMPT_LABEL,
} from "./cursor-dispatch";
import {
  filterPromptsForHost,
  ORCH_INTRO_BY_HOST,
  ORCH_PAGE_HREF,
} from "./orch-host";
import { PROMPTS } from "./prompts";

describe("Orch host filter (#285)", () => {
  it("page href is /orch", () => {
    expect(ORCH_PAGE_HREF).toBe("/orch");
  });

  it("Cursor filter keeps Task/BoN orch + Worker A; drops Claude orch card", () => {
    const filtered = filterPromptsForHost(PROMPTS, "cursor");
    const orch = filtered.find((g) => g.node === "ORCH")!;
    const labels = orch.items.map((i) => i.label);
    expect(labels).toContain(CURSOR_ORCH_PROMPT_LABEL);
    expect(labels).toContain(CURSOR_WORKER_A_PROMPT_LABEL);
    expect(labels).not.toContain(CLAUDE_ORCH_PROMPT_LABEL);
    expect(orch.introHtml).toContain(`#${CURSOR_DISPATCH_PANEL_ID}`);
    expect(orch.introHtml).toMatch(/Task\/BoN/i);
  });

  it("Claude filter keeps spawn_task orch; drops Worker A/B", () => {
    const filtered = filterPromptsForHost(PROMPTS, "cc");
    const orch = filtered.find((g) => g.node === "ORCH")!;
    const labels = orch.items.map((i) => i.label);
    expect(labels).toContain(CLAUDE_ORCH_PROMPT_LABEL);
    expect(labels).not.toContain(CURSOR_ORCH_PROMPT_LABEL);
    expect(labels).not.toContain(CURSOR_WORKER_A_PROMPT_LABEL);
    expect(orch.introHtml).toContain(`#${CLAUDE_DISPATCH_PANEL_ID}`);
    expect(orch.introHtml).toContain(SKILL_INVOKES.chip);
    expect(orch.noteHtml).not.toMatch(/Worker A and B are mutually exclusive/i);
  });

  it("shared prune cards appear on both hosts", () => {
    for (const host of ["cc", "cursor"] as const) {
      const orch = filterPromptsForHost(PROMPTS, host).find((g) => g.node === "ORCH")!;
      expect(orch.items.some((i) => i.label.startsWith("Prune worktrees"))).toBe(
        true
      );
    }
  });

  it("host intros match path panel anchors", () => {
    expect(ORCH_INTRO_BY_HOST.cc).toContain(CLAUDE_DISPATCH_PANEL_ID);
    expect(ORCH_INTRO_BY_HOST.cursor).toContain(CURSOR_DISPATCH_PANEL_ID);
    expect(CLAUDE_DISPATCH_PRIMARY_TITLE).toMatch(/spawn_task/i);
  });
});
