// #200: structure polish — Runbook, Actions-first, naming, Setup order.
import { describe, expect, it } from "vitest";
import { SETUP_ONCE_STEPS } from "./operator-bands";
import { TROUBLESHOOT_ROWS } from "./operator-guide";
import { stepsBlob } from "./step-text";

describe("night-shift structure polish (#200)", () => {
  it("Setup once is prereqs → runner → workflow → secrets (no Bypass-first step)", () => {
    expect(SETUP_ONCE_STEPS.length).toBe(4);
    const blob = stepsBlob(SETUP_ONCE_STEPS);
    expect(blob).toMatch(/private/);
    expect(blob).toMatch(/self-hosted/);
    expect(blob).toContain("night-shift.yml");
    expect(blob).toContain("CLAUDE_CODE_OAUTH_TOKEN");
    expect(blob).not.toMatch(/Bypass permissions/i);
    expect(blob).not.toMatch(/launcher/i);
  });

  it("Troubleshoot shared-profile copy uses runner, not listener", () => {
    const blob = TROUBLESHOOT_ROWS.map((r) => r.fix).join("\n");
    expect(blob).toMatch(/runner process/);
    expect(blob).not.toMatch(/listener/i);
  });
});
