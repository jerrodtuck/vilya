import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadNightShiftTemplate } from "./load-night-shift-template";

const dirs: string[] = [];

afterEach(() => {
  for (const d of dirs.splice(0)) {
    fs.rmSync(d, { recursive: true, force: true });
  }
});

describe("loadNightShiftTemplate", () => {
  it("loads bundled content/night-shift.yml", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "nsw-"));
    dirs.push(cwd);
    const contentDir = path.join(cwd, "content");
    fs.mkdirSync(contentDir);
    fs.writeFileSync(
      path.join(contentDir, "night-shift.yml"),
      "name: night-shift\n__REPO_FULL__\n",
      "utf8"
    );
    const body = loadNightShiftTemplate(cwd, {});
    expect(body).toContain("__REPO_FULL__");
  });
});
