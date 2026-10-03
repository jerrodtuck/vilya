import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const fixtures: string[] = [];
afterEach(() => {
  vi.unstubAllEnvs(); vi.resetModules();
  for (const dir of fixtures.splice(0)) {
    if (!path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(dir).startsWith("vilya-discovery-")) throw new Error("Unsafe cleanup");
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vilya-discovery-")); fixtures.push(dir);
  const app = path.join(dir, "apps/registry"), source = path.join(dir, "skills"), bundle = path.join(app, "content/skills");
  fs.mkdirSync(path.join(app, "scripts"), { recursive: true });
  fs.copyFileSync(path.resolve("scripts/sync-skills.mjs"), path.join(app, "scripts/sync-skills.mjs"));
  const skillDir = path.join(source, "vl-orch-codex");
  fs.mkdirSync(path.join(skillDir, "agents"), { recursive: true });
  fs.mkdirSync(path.join(skillDir, "references")); fs.mkdirSync(path.join(source, "empty"));
  const raw = "---\r\nname: vl-orch-codex\r\ncodex-support: codex-adapted\r\ncodex-notes: Native tools.\r\ncodex-invocation: $vl-orch-codex\r\ncodex-prerequisites: Board access.\r\n---\r\nExact body.\r\n";
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), raw);
  fs.writeFileSync(path.join(skillDir, "agents/openai.yaml"), "policy:\n  allow_implicit_invocation: false\n");
  fs.writeFileSync(path.join(skillDir, "references/guide.md"), "Supporting reference");
  const run = () => execFileSync(process.execPath, [path.join(app, "scripts/sync-skills.mjs")], { encoding: "utf8", stdio: "pipe" });
  return { dir, app, source, bundle, skillDir, raw, run };
}
describe("skill discovery and bundling", () => {
  it("preserves raw metadata/resources, removes stale bundle entries and supports bundled-only loading", async () => {
    const f = fixture(); f.run();
    const bundled = path.join(f.bundle, "vl-orch-codex");
    expect(fs.readFileSync(path.join(bundled, "SKILL.md"), "utf8")).toBe(f.raw);
    expect(fs.readFileSync(path.join(bundled, "agents/openai.yaml"), "utf8")).toContain("allow_implicit_invocation");
    expect(fs.readFileSync(path.join(bundled, "references/guide.md"), "utf8")).toBe("Supporting reference");
    expect(fs.existsSync(path.join(f.bundle, "empty"))).toBe(false);
    fs.mkdirSync(path.join(f.bundle, "stale")); fs.writeFileSync(path.join(bundled, "stale.txt"), "old");
    f.run();
    expect(fs.existsSync(path.join(f.bundle, "stale"))).toBe(false);
    expect(fs.existsSync(path.join(bundled, "stale.txt"))).toBe(false);
    expect(fs.readFileSync(path.join(f.skillDir, "SKILL.md"), "utf8")).toBe(f.raw);
    fs.renameSync(f.source, path.join(f.dir, "source-away"));
    expect(f.run()).toContain("keeping bundled");
    vi.stubEnv("SKILLS_DIR", f.bundle); vi.resetModules();
    const loader = await import("./load-skills");
    expect(loader.getSkillSlugs()).toEqual(["vl-orch-codex"]);
    expect(loader.getSkillRaw("vl-orch-codex")).toBe(f.raw);
    expect(loader.loadAllSkills()[0].frontmatter["codex-support"]).toBe("codex-adapted");
    expect(loader.loadSkill("missing")).toBeNull();
  });
  it("rejects linked resources before replacing a good bundle or reading foreign files", () => {
    const f = fixture(); f.run();
    const foreign = path.join(f.dir, "foreign"); fs.mkdirSync(foreign); fs.writeFileSync(path.join(foreign, "private"), "preserve");
    fs.symlinkSync(foreign, path.join(f.skillDir, "outside"), process.platform === "win32" ? "junction" : "dir");
    expect(() => f.run()).toThrow();
    expect(fs.existsSync(path.join(f.bundle, "vl-orch-codex/outside"))).toBe(false);
    expect(fs.readFileSync(path.join(f.bundle, "vl-orch-codex/SKILL.md"), "utf8")).toBe(f.raw);
    expect(fs.readFileSync(path.join(foreign, "private"), "utf8")).toBe("preserve");
  });
  it("rejects a redirected bundle without touching its target", () => {
    const f = fixture(); fs.mkdirSync(path.dirname(f.bundle), { recursive: true });
    const foreign = path.join(f.dir, "foreign"); fs.mkdirSync(foreign); fs.writeFileSync(path.join(foreign, "keep"), "safe");
    fs.symlinkSync(foreign, f.bundle, process.platform === "win32" ? "junction" : "dir");
    expect(() => f.run()).toThrow();
    expect(fs.readFileSync(path.join(foreign, "keep"), "utf8")).toBe("safe");
  });
});
