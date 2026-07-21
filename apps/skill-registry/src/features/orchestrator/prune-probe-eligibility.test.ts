// #287: gated Cursor probe eligibility for /vl-prune — not arbitrary BoN pools.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  branchLooksLikeProbe,
  folderLooksLikeProbe,
  isCursorProbeCandidate,
  isUnderCursorRepoWorktrees,
} from "./prune-probe-eligibility";

function readPruneSkill(): string {
  const bundled = path.resolve(
    process.cwd(),
    "content/skills/vl-prune/SKILL.md",
  );
  const monorepo = path.resolve(
    process.cwd(),
    "../../skills/vl-prune/SKILL.md",
  );
  const skillPath = fs.existsSync(bundled) ? bundled : monorepo;
  return fs.readFileSync(skillPath, "utf8");
}

describe("prune probe eligibility (#287)", () => {
  it("recognizes cursor worktrees root under repo (Win + POSIX)", () => {
    expect(
      isUnderCursorRepoWorktrees(
        "C:\\Users\\me\\.cursor\\worktrees\\vilya\\bon-probe-x",
        "vilya",
      ),
    ).toBe(true);
    expect(
      isUnderCursorRepoWorktrees(
        "/home/me/.cursor/worktrees/vilya/model-switch-probe-y",
        "vilya",
      ),
    ).toBe(true);
    expect(
      isUnderCursorRepoWorktrees(
        "C:\\Users\\me\\.cursor\\worktrees\\other\\bon-probe-x",
        "vilya",
      ),
    ).toBe(false);
    expect(
      isUnderCursorRepoWorktrees(
        "C:\\Users\\me\\repo\\vilya\\.claude\\worktrees\\slug",
        "vilya",
      ),
    ).toBe(false);
  });

  it("matches probe folder globs without taking every BoN name", () => {
    expect(folderLooksLikeProbe("bon-probe-isolation")).toBe(true);
    expect(folderLooksLikeProbe("model-switch-probe-grok")).toBe(true);
    expect(folderLooksLikeProbe("287-probe-leftover")).toBe(true);
    expect(folderLooksLikeProbe("42-feat-slug")).toBe(false);
    expect(folderLooksLikeProbe("best-of-n-runner-abc")).toBe(false);
    expect(folderLooksLikeProbe("probe")).toBe(false);
  });

  it("matches probe/* branches only", () => {
    expect(branchLooksLikeProbe("probe/bon-isolation")).toBe(true);
    expect(branchLooksLikeProbe("refs/heads/probe/x")).toBe(true);
    expect(branchLooksLikeProbe("feat/287-prune-probes")).toBe(false);
    expect(branchLooksLikeProbe("probe")).toBe(false);
  });

  it("requires cursor root AND (folder OR branch) — skips arbitrary pools", () => {
    const cursorProbeFolder = {
      path: "C:\\Users\\me\\.cursor\\worktrees\\vilya\\bon-probe-x",
      repo: "vilya",
    };
    expect(isCursorProbeCandidate(cursorProbeFolder)).toBe(true);

    const cursorProbeBranch = {
      path: "C:\\Users\\me\\.cursor\\worktrees\\vilya\\random-pool-name",
      repo: "vilya",
      branch: "probe/leftover",
    };
    expect(isCursorProbeCandidate(cursorProbeBranch)).toBe(true);

    const arbitraryBon = {
      path: "C:\\Users\\me\\.cursor\\worktrees\\vilya\\best-of-n-runner-abc",
      repo: "vilya",
      branch: "feat/1-something",
    };
    expect(isCursorProbeCandidate(arbitraryBon)).toBe(false);

    const claudeTree = {
      path: "C:\\Users\\me\\repo\\vilya\\.claude\\worktrees\\bon-probe-x",
      repo: "vilya",
      branch: "probe/x",
    };
    expect(isCursorProbeCandidate(claudeTree)).toBe(false);
  });

  it("skill teaches eligible (probe) + carve-out honesty", () => {
    const skill = readPruneSkill();
    expect(skill).toContain("eligible (probe)");
    expect(skill).toContain("### 3a. Gated Cursor probes (#287)");
    expect(skill).toContain("isCursorProbeCandidate");
    expect(skill).toContain("**Do not** prune arbitrary Best-of-N");
    expect(skill).toContain("*-probe-*");
    expect(skill).toContain("probe/*");
    expect(skill).toContain("**arbitrary** Cursor Parallel / Best-of-N pools");
  });
});
