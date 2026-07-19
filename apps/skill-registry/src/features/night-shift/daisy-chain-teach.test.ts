// #216: site teaches chain prep → merge → promote → next night; skill stays dumb.
import { describe, expect, it } from "vitest";
import {
  DAISY_CHAIN_STEPS,
  RUN_TONIGHT_STEPS,
  SETUP_ONCE_STEPS,
} from "./operator-bands";
import { stepsBlob } from "./step-text";

describe("night-shift daisy-chain teach (#216)", () => {
  it("Setup once includes night-shift:chain and chain-promote.yml", () => {
    const blob = stepsBlob(SETUP_ONCE_STEPS);
    expect(blob).toContain("night-shift:chain");
    expect(blob).toContain("chain-promote.yml");
  });

  it("Run tonight points successors at Daisy chains, not ready", () => {
    const blob = stepsBlob(RUN_TONIGHT_STEPS);
    expect(blob).toContain("Daisy chains");
    expect(blob).toContain("night-shift:chain");
    expect(blob).toMatch(/never promotes/i);
  });

  it("Daisy chains band covers prep → merge → promote → next night", () => {
    expect(DAISY_CHAIN_STEPS).toHaveLength(3);
    const blob = stepsBlob(DAISY_CHAIN_STEPS);
    expect(blob).toContain("blocked-by");
    expect(blob).toContain("night-shift:chain");
    expect(blob).toContain("plan:ready");
    expect(blob).toContain("/merge-pr");
    expect(blob).toContain("chain-promote");
    expect(blob).toContain("night-shift:ready");
    expect(blob).toMatch(/one link per merge cycle/i);
    expect(blob).toMatch(/skill stayed dumb/i);
  });
});
