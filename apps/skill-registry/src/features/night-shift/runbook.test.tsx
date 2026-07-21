// #200: Runbook owns before/after sleep; OUTPUTS stays artifacts-only.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Runbook } from "./runbook";

describe("night-shift Runbook (#200)", () => {
  it("covers before sleep and after sleep in one card", () => {
    const html = renderToStaticMarkup(<Runbook />);
    expect(html).toContain("Runbook");
    expect(html).toContain("Before sleep");
    expect(html).toContain("After sleep");
    expect(html).toContain("plan:ready");
    expect(html).toContain("night-shift:ready");
    expect(html).toContain("/vl-merge-pr");
    expect(html).toContain("chain-promote");
    expect(html).toContain("/vl-prune");
    expect(html).toContain("ns-runbook");
  });
});
