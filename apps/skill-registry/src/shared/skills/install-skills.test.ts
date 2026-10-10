import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const fixtures: string[] = [];
afterEach(() => {
  for (const dir of fixtures.splice(0)) {
    if (!path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(dir).startsWith("vilya-install-")) throw new Error("Unsafe fixture cleanup");
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
function fixture(shell: "ps1" | "sh") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vilya-install-")); fixtures.push(dir);
  const repo = path.join(dir, "repo with spaces");
  const user = path.join(dir, "fixture user");
  const source = path.join(repo, "skills", "example");
  fs.mkdirSync(source, { recursive: true }); fs.mkdirSync(path.join(repo, "scripts"));
  fs.mkdirSync(path.join(repo, "skills", "not-a-skill"));
  fs.mkdirSync(user);
  fs.writeFileSync(path.join(source, "SKILL.md"), "original");
  const script = path.join(repo, "scripts", "install-skills." + shell);
  let body = fs.readFileSync(path.resolve("../../scripts/install-skills." + shell), "utf8");
  // Inject a fake home into the disposable script, never mutate PowerShell's HOME variable.
  if (shell === "ps1") body = body.replaceAll("Join-Path $HOME", "Join-Path '" + user.replaceAll("'", "''") + "'");
  fs.writeFileSync(script, body);
  const run = (args: string[] = [], env: NodeJS.ProcessEnv = {}) => execFileSync(shell === "ps1" ? "pwsh" : "bash",
    shell === "ps1" ? ["-NoProfile", "-File", script, ...args] : [script.replaceAll("\\", "/"), ...args],
    { encoding: "utf8", env: { ...process.env, HOME: user.replaceAll("\\", "/"), INSTALL_SKILLS_TARGET: "", ...env }, timeout: 30000, stdio: "pipe" });
  return { dir, repo, user, source, run };
}
for (const shell of ["ps1", "sh"] as const) {
  // Native Bash symlinks require Linux/macOS or Windows Developer Mode. Windows is covered by junction tests.
  describe.runIf(shell === "ps1" ? process.platform === "win32" : process.platform !== "win32")("installer " + shell, () => {
    const flag = (name: "codex" | "cursor" | "target") => shell === "ps1"
      ? ({ codex: "-IncludeCodex", cursor: "-IncludeCursor", target: "-TargetRoot" })[name]
      : ({ codex: "--include-codex", cursor: "--include-cursor", target: "--target-root" })[name];
    it.each([[], ["codex"], ["cursor"], ["codex", "cursor"]] as const)("resolves opt-in roots %j in a disposable home", (...flags) => {
      const f = fixture(shell);
      f.run(flags.map((x) => flag(x)));
      expect(fs.realpathSync(path.join(f.user, ".claude/skills/example"))).toBe(fs.realpathSync(f.source));
      expect(fs.existsSync(path.join(f.user, ".agents/skills/example"))).toBe(flags.includes("codex"));
      expect(fs.existsSync(path.join(f.user, ".cursor/skills/example"))).toBe(flags.includes("cursor"));
      expect(fs.existsSync(path.join(f.user, ".claude/skills/not-a-skill"))).toBe(false);
    }, 30000);
    it("adds a new complete companion on rerun without touching the real home", () => {
      const f = fixture(shell);
      f.run([flag("codex")]);
      const companion = path.join(f.repo, "skills", "vl-present");
      fs.mkdirSync(path.join(companion, "references"), { recursive: true });
      fs.writeFileSync(path.join(companion, "SKILL.md"), "companion");
      fs.writeFileSync(path.join(companion, "references", "examples.md"), "complete resource");
      expect(fs.existsSync(path.join(f.user, ".agents/skills/vl-present"))).toBe(false);
      f.run([flag("codex")]);
      for (const hostRoot of [".claude/skills", ".agents/skills"]) {
        const linked = path.join(f.user, hostRoot, "vl-present");
        expect(fs.realpathSync(linked)).toBe(fs.realpathSync(companion));
        expect(fs.readFileSync(path.join(linked, "references/examples.md"), "utf8")).toBe("complete resource");
      }
      fs.writeFileSync(path.join(companion, "references/examples.md"), "reviewed update");
      expect(fs.readFileSync(path.join(f.user, ".agents/skills/vl-present/references/examples.md"), "utf8")).toBe("reviewed update");
    }, 30000);
    it("discovers the complete general Python skill for Claude and Codex without registration", () => {
      const f = fixture(shell);
      const canonical = path.resolve("../../skills/vl-crucible-python");
      const source = path.join(f.repo, "skills/vl-crucible-python");
      fs.cpSync(canonical, source, { recursive: true });
      f.run([flag("codex")]);
      for (const hostRoot of [".claude/skills", ".agents/skills"]) {
        const linked = path.join(f.user, hostRoot, "vl-crucible-python");
        expect(fs.realpathSync(linked)).toBe(fs.realpathSync(source));
        expect(fs.readFileSync(path.join(linked, "SKILL.md"))).toEqual(fs.readFileSync(path.join(canonical, "SKILL.md")));
      }
    }, 30000);
    it("refuses source overlap even through an ancestor directory alias", () => {
      const f = fixture(shell);
      expect(() => f.run([flag("target"), path.join(f.repo, "skills")])).toThrow();
      const alias = path.join(f.dir, "repo alias");
      fs.symlinkSync(f.repo, alias, process.platform === "win32" ? "junction" : "dir");
      expect(() => f.run([flag("target"), path.join(alias, "skills")])).toThrow();
      expect(fs.readFileSync(path.join(f.source, "SKILL.md"), "utf8")).toBe("original");
    }, 30000);
    it("preserves foreign entries and targets through migration, repeat installs, and dangling links", () => {
      const f = fixture(shell), target = path.join(f.dir, "target with spaces");
      const foreign = path.join(f.dir, "foreign"); fs.mkdirSync(foreign); fs.writeFileSync(path.join(foreign, "keep"), "safe");
      fs.mkdirSync(path.join(target, "example"), { recursive: true });
      fs.writeFileSync(path.join(target, "example", "old-copy"), "old");
      fs.writeFileSync(path.join(target, "unrelated.txt"), "safe");
      fs.mkdirSync(path.join(target, "unrelated-directory"));
      fs.symlinkSync(foreign, path.join(target, "unrelated-link"), process.platform === "win32" ? "junction" : "dir");
      const args = [flag("target"), target, flag("codex"), flag("cursor")];
      expect(f.run(args)).toContain("1 migrated");
      expect(f.run(args)).toContain("1 skipped");
      expect(fs.lstatSync(path.join(target, "example")).isSymbolicLink()).toBe(true);
      expect(fs.realpathSync(path.join(target, "example"))).toBe(fs.realpathSync(f.source));
      fs.writeFileSync(path.join(f.source, "SKILL.md"), "updated");
      expect(fs.readFileSync(path.join(target, "example", "SKILL.md"), "utf8")).toBe("updated");
      fs.unlinkSync(path.join(target, "example"));
      fs.symlinkSync(foreign, path.join(target, "example"), process.platform === "win32" ? "junction" : "dir");
      expect(f.run(args)).toContain("replaced link");
      expect(fs.readFileSync(path.join(foreign, "keep"), "utf8")).toBe("safe");
      fs.unlinkSync(path.join(target, "example"));
      fs.symlinkSync(path.join(f.dir, "missing"), path.join(target, "example"), process.platform === "win32" ? "junction" : "dir");
      expect(f.run(args)).toContain("replaced link");
      expect(fs.readFileSync(path.join(target, "unrelated.txt"), "utf8")).toBe("safe");
      expect(fs.existsSync(path.join(target, "unrelated-directory"))).toBe(true);
      expect(fs.realpathSync(path.join(target, "unrelated-link"))).toBe(fs.realpathSync(foreign));
      expect(fs.readdirSync(f.user)).toEqual([]);
    }, 30000);
  });
}
it.skipIf(process.platform === "win32")("Bash explicit CLI target overrides environment, which overrides include roots", () => {
  const f = fixture("sh"), envRoot = path.join(f.dir, "env target"), cliRoot = path.join(f.dir, "cli target");
  f.run(["--include-codex"], { INSTALL_SKILLS_TARGET: envRoot });
  expect(fs.existsSync(path.join(envRoot, "example"))).toBe(true);
  f.run(["--target-root", cliRoot, "--include-codex"], { INSTALL_SKILLS_TARGET: path.join(f.dir, "unused") });
  expect(fs.existsSync(path.join(cliRoot, "example"))).toBe(true);
  expect(fs.existsSync(path.join(f.dir, "unused"))).toBe(false);
  expect(fs.readdirSync(f.user)).toEqual([]);
}, 30000);
