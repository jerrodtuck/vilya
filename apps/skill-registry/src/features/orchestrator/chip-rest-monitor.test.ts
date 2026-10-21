// #237 / #270 / #384: REST-only active watches use durable revision/ACK state.
// Cursor shells are mortal — re-arm without drain thrash.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readChipSkill(): string {
  const bundled = path.resolve(
    process.cwd(),
    "content/skills/vl-chip/SKILL.md",
  );
  const monorepo = path.resolve(process.cwd(), "../../skills/vl-chip/SKILL.md");
  const skillPath = fs.existsSync(bundled) ? bundled : monorepo;
  return fs.readFileSync(skillPath, "utf8");
}

describe("/vl-chip REST monitor (#237)", () => {
  it("bans GraphQL polling and prescribes active cadence with durable revision dedup", () => {
    const skill = readChipSkill();
    expect(skill).toContain("REST-only hot path");
    expect(skill).toContain("pulls?head={owner}:{branch}&state=open");
    expect(skill).toContain("issues/{n}/comments?since={iso}");
    expect(skill).toContain("120-second checks for relevant active/expected handoffs");
    expect(skill).toContain("board-intake.md");
    expect(skill).toContain("Persist pending, emitted and consumed separately");
    expect(skill).toContain("edited comments and parked answers");
    expect(skill).toContain("Never re-announce a standing PR or unchanged decision gate");
    expect(skill).toContain("gh pr list");
    expect(skill).toMatch(/Never\*\* shell `gh pr list`/);
    expect(skill).toContain("gh project item-list");
    expect(skill).toContain("notify_on_output");
    expect(skill).toContain("Monitor tool");
    // No leftover ~90s cadence in the recipe.
    expect(skill).not.toMatch(/~every 90s|poll ~every 90s|comments ~90s/);
  });

  it("Cursor row teaches mortal shells + re-arm without every-drain thrash (#270)", () => {
    const skill = readChipSkill();
    expect(skill).toContain("mortal");
    expect(skill).toContain("arm → assume mortal → re-arm");
    expect(skill).toContain("arm-once-and-forget");
    expect(skill).toContain("#267");
    expect(skill).toContain("process-lifetime parity");
  });
});
