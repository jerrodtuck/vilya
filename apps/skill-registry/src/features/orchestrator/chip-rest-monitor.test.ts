// #237: /chip monitor recipe is REST-only, ≥120s, with dedup — never gh pr list.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readChipSkill(): string {
  const bundled = path.resolve(
    process.cwd(),
    "content/skills/vilya-chip/SKILL.md",
  );
  const monorepo = path.resolve(process.cwd(), "../../skills/vilya-chip/SKILL.md");
  const skillPath = fs.existsSync(bundled) ? bundled : monorepo;
  return fs.readFileSync(skillPath, "utf8");
}

describe("/chip REST monitor (#237)", () => {
  it("bans gh pr list and prescribes REST pulls + comments with ≥120s dedup", () => {
    const skill = readChipSkill();
    expect(skill).toContain("REST-only hot path");
    expect(skill).toContain("pulls?head={owner}:{branch}&state=open");
    expect(skill).toContain("issues/{n}/comments?since={iso}");
    expect(skill).toMatch(/≥120s|>=120s/);
    expect(skill).toContain("Dedup guard");
    expect(skill).toContain("last_pr_number");
    expect(skill).toContain("last_comment_id");
    expect(skill).toContain("wake sentinel");
    expect(skill).toContain("re-announce a standing open PR every tick");
    expect(skill).toContain("gh pr list");
    expect(skill).toMatch(/Never\*\* shell `gh pr list`/);
    expect(skill).toContain("gh project item-list");
    expect(skill).toContain("notify_on_output");
    expect(skill).toContain("Monitor tool");
    // No leftover ~90s cadence in the recipe.
    expect(skill).not.toMatch(/~every 90s|poll ~every 90s|comments ~90s/);
  });
});
