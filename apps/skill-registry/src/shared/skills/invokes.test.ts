import { describe, expect, it } from "vitest";
import {
  AUTONOMOUS_SLUGS,
  isCrucibleSlug,
  RECALL_SLUGS,
  SKILL_INVOKES,
  SKILL_SLUGS,
} from "./invokes";

describe("SKILL_INVOKES / SKILL_SLUGS", () => {
  it("keeps slash invokes aligned with slugs", () => {
    expect(SKILL_INVOKES.startFeature).toBe(`/${SKILL_SLUGS.startFeature}`);
    expect(SKILL_INVOKES.cursorHandoff).toBe("/vilya-cursor-handoff");
    expect(SKILL_INVOKES.chip).toBe("/vilya-chip");
  });

  it("classifies autonomous, recall, and crucible buckets", () => {
    expect(AUTONOMOUS_SLUGS.has(SKILL_SLUGS.planner)).toBe(true);
    expect(RECALL_SLUGS.has(SKILL_SLUGS.history)).toBe(true);
    expect(isCrucibleSlug("vilya-crucible-nextjs")).toBe(true);
    expect(isCrucibleSlug(SKILL_SLUGS.chip)).toBe(false);
  });
});
