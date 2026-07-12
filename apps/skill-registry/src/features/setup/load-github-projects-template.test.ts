import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadGithubProjectsTemplate } from "./load-github-projects-template";

const tmpDirs: string[] = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function makeTempApp(withBundled: boolean): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gp-template-"));
  tmpDirs.push(dir);
  if (withBundled) {
    const contentDir = path.join(dir, "content");
    fs.mkdirSync(contentDir, { recursive: true });
    fs.writeFileSync(
      path.join(contentDir, "GITHUB-PROJECTS.md"),
      "# bundled template\n",
      "utf8"
    );
  }
  return dir;
}

describe("loadGithubProjectsTemplate", () => {
  it("loads the deploy-safe content/GITHUB-PROJECTS.md without env or monorepo paths", () => {
    const cwd = makeTempApp(true);
    const body = loadGithubProjectsTemplate(cwd, {});
    expect(body).toBe("# bundled template\n");
  });

  it("returns null when no candidate exists", () => {
    const cwd = makeTempApp(false);
    expect(loadGithubProjectsTemplate(cwd, {})).toBeNull();
  });

  it("lets GITHUB_PROJECTS_TEMPLATE override the bundled copy", () => {
    const cwd = makeTempApp(true);
    const override = path.join(cwd, "override.md");
    fs.writeFileSync(override, "# from env\n", "utf8");
    const body = loadGithubProjectsTemplate(cwd, {
      GITHUB_PROJECTS_TEMPLATE: "override.md",
    });
    expect(body).toBe("# from env\n");
  });

  it("falls through to the bundled copy when the env path is missing", () => {
    const cwd = makeTempApp(true);
    const body = loadGithubProjectsTemplate(cwd, {
      GITHUB_PROJECTS_TEMPLATE: "does-not-exist.md",
    });
    expect(body).toBe("# bundled template\n");
  });

  it("ships a real bundled template next to the app (regression for Railway)", () => {
    const bundled = path.join(process.cwd(), "content", "GITHUB-PROJECTS.md");
    expect(fs.existsSync(bundled)).toBe(true);
    const body = loadGithubProjectsTemplate(process.cwd(), {});
    expect(body).toContain("## Repo config");
    expect(body).toContain("## Model (same everywhere)");
  });
});
