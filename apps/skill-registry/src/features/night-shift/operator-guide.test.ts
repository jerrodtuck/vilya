import { describe, expect, it } from "vitest";
import { TROUBLESHOOT_ROWS, VERIFY_CHECKS } from "./operator-guide";
import { STAGES } from "./data";

describe("night-shift operator guide", () => {
  it("Verify box covers runner, labels, secret, App, and Queued pickup", () => {
    const blob = VERIFY_CHECKS.join("\n");
    expect(blob).toMatch(/Online/i);
    expect(blob).toMatch(/labels/i);
    expect(blob).toContain("CLAUDE_CODE_OAUTH_TOKEN");
    expect(blob).toMatch(/GitHub App/i);
    expect(blob).toMatch(/Queued/);
    expect(VERIFY_CHECKS.length).toBeGreaterThanOrEqual(5);
  });

  it("Troubleshoot table promotes the Failure-stage bring-up walls", () => {
    const blob = TROUBLESHOOT_ROWS.map((r) => `${r.symptom} ${r.fix}`).join("\n");
    expect(blob).toContain("Queued forever");
    expect(blob).toContain("bash");
    expect(blob).toContain("CLAUDE_CODE_GIT_BASH_PATH");
    expect(blob).toContain("id-token: write");
    expect(blob).toContain("pre-installed");
    expect(blob).toContain("--max-turns");
    expect(blob).toContain("setup-token");
    expect(blob).toContain("_work");
    expect(blob).toMatch(/Shared-profile|~\/\.claude/);
    for (const row of TROUBLESHOOT_ROWS) {
      expect(row.symptom.trim().length).toBeGreaterThan(0);
      expect(row.fix.trim().length).toBeGreaterThan(10);
    }
  });

  it("Failure stage remains a visual ledger pointing at Troubleshoot", () => {
    const html = STAGES.FAILURE.bodyHtml;
    expect(html).toContain("Troubleshoot");
    expect(html).toContain("visual ledger");
    expect(html).toContain("WSL bash stub");
  });
});
