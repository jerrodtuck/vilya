// #207: night-shift operator/page copy must teach Planner eligibility labels.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { STAGES } from "./data";

function collectStrings(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(collectStrings).join("\n");
  if (value && typeof value === "object") {
    return Object.values(value).map(collectStrings).join("\n");
  }
  return "";
}

describe("night-shift Planner eligibility labels (#207)", () => {
  it("retires auto:ready from stage copy", () => {
    const corpus = collectStrings(STAGES);
    expect(corpus).not.toContain("auto:ready");
    expect(corpus).toContain("night-shift:ready");
    expect(corpus).toContain("plan:ready");
  });

  it("retires auto:ready from operator-band and view sources", () => {
    const root = join(process.cwd(), "src/features/night-shift");
    for (const file of ["operator-bands.tsx", "night-shift-view.tsx"]) {
      const source = readFileSync(join(root, file), "utf8");
      expect(source, file).not.toContain("auto:ready");
      expect(source, file).toContain("night-shift:ready");
      expect(source, file).toContain("plan:ready");
    }
  });
});
