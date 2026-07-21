import { describe, expect, it } from "vitest";
import {
  AUTONOMOUS_SLUGS,
  isCrucibleSlug,
  RECALL_SLUGS,
  SKILL_INVOKES,
  SKILL_SLUGS,
  STANDING_SESSION_SLUGS,
} from "./invokes";

describe("SKILL_INVOKES / SKILL_SLUGS", () => {
  it("keeps slash invokes aligned with slugs", () => {
    expect(SKILL_INVOKES.startFeature).toBe(`/${SKILL_SLUGS.startFeature}`);
    expect(SKILL_INVOKES.cursorHandoff).toBe("/vl-cursor-handoff");
    expect(SKILL_INVOKES.architect).toBe("/vl-arch");
    expect(SKILL_INVOKES.orchestrator).toBe("/vl-orch-claude");
    expect(SKILL_INVOKES.orchestratorCursor).toBe("/vl-orch-cursor");
    expect(SKILL_INVOKES.askVilya).toBe("/vl-ask");
    expect(SKILL_INVOKES.chip).toBe("/vl-chip");
  });

  it("classifies autonomous, recall, and crucible buckets", () => {
    expect(AUTONOMOUS_SLUGS.has(SKILL_SLUGS.planner)).toBe(true);
    expect(AUTONOMOUS_SLUGS.has(SKILL_SLUGS.architect)).toBe(false);
    expect(AUTONOMOUS_SLUGS.has(SKILL_SLUGS.orchestrator)).toBe(false);
    expect(AUTONOMOUS_SLUGS.has(SKILL_SLUGS.orchestratorCursor)).toBe(false);
    expect(RECALL_SLUGS.has(SKILL_SLUGS.history)).toBe(true);
    expect(STANDING_SESSION_SLUGS.has(SKILL_SLUGS.planner)).toBe(true);
    expect(STANDING_SESSION_SLUGS.has(SKILL_SLUGS.architect)).toBe(true);
    expect(STANDING_SESSION_SLUGS.has(SKILL_SLUGS.orchestrator)).toBe(true);
    expect(STANDING_SESSION_SLUGS.has(SKILL_SLUGS.orchestratorCursor)).toBe(
      true
    );
    expect(STANDING_SESSION_SLUGS.has(SKILL_SLUGS.chip)).toBe(false);
    expect(isCrucibleSlug("vl-crucible-nextjs")).toBe(true);
    expect(isCrucibleSlug(SKILL_SLUGS.chip)).toBe(false);
  });
});
