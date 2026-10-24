// #395: Docker hygiene — chip labels, shared images, close-out and prune cleanup.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  classifyDockerItem,
  composeProjectName,
  parseDockerLabels,
  type DockerPruneTarget,
} from "./prune-docker-eligibility";

function readSkill(slug: string): string {
  const bundled = path.resolve(process.cwd(), `content/skills/${slug}/SKILL.md`);
  const monorepo = path.resolve(process.cwd(), `../../skills/${slug}/SKILL.md`);
  return fs.readFileSync(fs.existsSync(bundled) ? bundled : monorepo, "utf8");
}

const target: DockerPruneTarget = {
  repo: "explainreel",
  worktreeFolder: "blissful-tereshkova-fc6c3f",
  branch: "claude/blissful-tereshkova-fc6c3f",
  otherFolders: ["explainreel", "eager-hopper-1a2b3c"],
};

describe("prune docker eligibility (#395)", () => {
  it("normalizes folders like Compose's default project name", () => {
    expect(composeProjectName("Blissful-Tereshkova-FC6C3F")).toBe("blissful-tereshkova-fc6c3f");
    expect(composeProjectName("_123-feat.slug")).toBe("123-featslug");
  });

  it("parses the {{.Labels}} format", () => {
    expect(parseDockerLabels("project=explainreel,chip=claude/x,com.docker.compose.project=x")).toEqual({
      project: "explainreel",
      chip: "claude/x",
      "com.docker.compose.project": "x",
    });
    expect(parseDockerLabels("")).toEqual({});
  });

  it("removes items carrying this chip's label (branch or folder)", () => {
    const labels = { project: "explainreel", chip: "claude/blissful-tereshkova-fc6c3f" };
    expect(classifyDockerItem({ kind: "volume", name: "anything", labels }, target)).toBe(
      "eligible (chip label)",
    );
    expect(
      classifyDockerItem(
        { kind: "image", name: "x:1", labels: { chip: "blissful-tereshkova-fc6c3f" } },
        target,
      ),
    ).toBe("eligible (chip label)");
    expect(
      classifyDockerItem(
        { kind: "volume", name: "blissful-tereshkova-fc6c3f_venv", labels: { chip: "claude/other" } },
        target,
      ),
    ).toBe("not ours");
  });

  it("finds orphaned per-worktree Compose names", () => {
    expect(classifyDockerItem({ kind: "image", name: "blissful-tereshkova-fc6c3f-dev:latest" }, target)).toBe(
      "eligible (orphan)",
    );
    expect(classifyDockerItem({ kind: "volume", name: "blissful-tereshkova-fc6c3f_venv" }, target)).toBe(
      "eligible (orphan)",
    );
    expect(
      classifyDockerItem(
        {
          kind: "volume",
          name: "blissful-tereshkova-fc6c3f_node_modules",
          labels: { "com.docker.compose.project": "blissful-tereshkova-fc6c3f" },
        },
        target,
      ),
    ).toBe("eligible (orphan)");
    // Wrong separator per kind, or a bare prefix, is not a Compose name.
    expect(classifyDockerItem({ kind: "volume", name: "blissful-tereshkova-fc6c3f-dev" }, target)).toBe("not ours");
    expect(classifyDockerItem({ kind: "image", name: "blissful-tereshkova-fc6c3f" }, target)).toBe("not ours");
  });

  it("never claims the shared image, a longer sibling folder or a foreign Compose project", () => {
    expect(
      classifyDockerItem(
        { kind: "image", name: "explainreel-dev:3f9a", labels: { project: "explainreel", shared: "true" } },
        target,
      ),
    ).toBe("not ours");
    const short: DockerPruneTarget = { repo: "r", worktreeFolder: "foo", otherFolders: ["foo-bar"] };
    expect(classifyDockerItem({ kind: "volume", name: "foo-bar_venv" }, short)).toBe("not ours");
    expect(classifyDockerItem({ kind: "image", name: "foo-bar-dev" }, short)).toBe("not ours");
    expect(classifyDockerItem({ kind: "image", name: "foo-dev" }, short)).toBe("eligible (orphan)");
    expect(
      classifyDockerItem(
        { kind: "volume", name: "foo_cache", labels: { "com.docker.compose.project": "main" } },
        short,
      ),
    ).toBe("not ours");
  });

  it("skips another project's items, shared caches and running containers", () => {
    expect(
      classifyDockerItem(
        { kind: "volume", name: "blissful-tereshkova-fc6c3f_venv", labels: { project: "anduin" } },
        target,
      ),
    ).toBe("skip (other project)");
    expect(
      classifyDockerItem(
        {
          kind: "volume",
          name: "blissful-tereshkova-fc6c3f_uv",
          labels: { project: "explainreel", shared: "true" },
        },
        target,
      ),
    ).toBe("skip (shared)");
    expect(
      classifyDockerItem(
        { kind: "container", name: "blissful-tereshkova-fc6c3f-dev-run-1a2b", running: true },
        target,
      ),
    ).toBe("skip (running)");
    expect(
      classifyDockerItem({ kind: "container", name: "blissful-tereshkova-fc6c3f-dev-run-1a2b" }, target),
    ).toBe("eligible (orphan)");
  });

  it("skills teach labels, close-out cleanup, prune rows and vhdx compaction", () => {
    const chip = readSkill("vl-chip");
    expect(chip).toContain("## 2e. Docker hygiene");
    expect(chip).toContain("`project=<repo-short>` and `chip=<branch>`");
    expect(chip).toContain("docker run --rm");
    expect(chip).toContain("Never run another chip's scripts or containers.");
    expect(chip).toContain("`/vl-finish-feature` §7a");

    const finish = readSkill("vl-finish-feature");
    expect(finish).toContain("## 7a. Docker close-out");
    expect(finish).toContain('label=chip=<branch>');
    expect(finish).toContain("Report what was removed");

    const prune = readSkill("vl-prune");
    expect(prune).toContain("### 3b. Docker items of an eligible worktree (#395)");
    expect(prune).toContain("classifyDockerItem");
    expect(prune).toContain("`skip (running)`");
    expect(prune).toContain("docker_data.vhdx");
    expect(prune).toContain("Optimize-VHD");
    expect(prune).toContain("wsl --shutdown");
  });
});
