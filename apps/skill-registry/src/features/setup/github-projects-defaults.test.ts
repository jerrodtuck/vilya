import { describe, expect, it } from "vitest";
import { emptyConfig, mergeConfig } from "./github-projects-config";
import {
  presetForStack,
  suggestionFor,
  usualFill,
  USUAL_STATUS_OPTIONS,
} from "./github-projects-defaults";

describe("usualFill", () => {
  it("fills standard Status option ids when missing", () => {
    const filled = mergeConfig(emptyConfig(), usualFill(emptyConfig()));
    expect(filled.statusOptions).toEqual(USUAL_STATUS_OPTIONS);
  });

  it("keeps Status ids from the paste", () => {
    const parsed = mergeConfig(emptyConfig(), {
      statusOptions: {
        todo: "custom",
        inProgress: "",
        blocked: "",
        verifying: "",
        done: "",
      },
    });
    const filled = mergeConfig(parsed, usualFill(parsed));
    expect(filled.statusOptions.todo).toBe("custom");
    expect(filled.statusOptions.inProgress).toBe(
      USUAL_STATUS_OPTIONS.inProgress
    );
  });

  it("derives crucible from stack", () => {
    const parsed = mergeConfig(emptyConfig(), { stack: "blazor" });
    const filled = mergeConfig(parsed, usualFill(parsed));
    expect(filled.crucibleVariant).toBe("crucible-blazor");
  });
});

describe("suggestionFor", () => {
  it("suggests stack-derived test command and usual Type line", () => {
    const cfg = mergeConfig(emptyConfig(), { stack: "nextjs" });
    expect(suggestionFor("testCommand", cfg)).toBe(
      "npm test && npm run build"
    );
    expect(suggestionFor("typeFieldLine", cfg)).toContain("Roadmap c3d24af8");
    expect(presetForStack("wpf-blazor-hybrid")?.crucibleVariant).toBe(
      "crucible-blazor"
    );
  });
});
