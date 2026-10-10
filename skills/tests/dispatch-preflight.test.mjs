import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, symlinkSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { requireOpen, readIssue, referencesIssue, checkBase } from "../vl-chip/scripts/dispatch-preflight.mjs";

const repo = "owner/target";
const valid = { number: 69, state: "OPEN", url: "https://github.com/owner/target/issues/69", projectItems: [] };
for (const state of ["OPEN", "open", "Open"]) test(`CLI/REST case ${state}`, () => {
  assert.equal(requireOpen({ ...valid, state }, repo, 69).state, state);
  assert.equal(requireOpen({ ...valid, url: undefined, html_url: valid.url, state }, repo, 69).state, state);
});
for (const state of ["CLOSED", "closed", "UNKNOWN", undefined, null, {}, "OPEN "]) test(`fail closed state ${JSON.stringify(state)}`, () => {
  assert.throws(() => requireOpen({ ...valid, state }, repo, 69));
});
for (const change of [{ number: 690 }, { number: "69" }, { url: "https://github.com/other/target/issues/69" }, { url: "https://github.com/owner/target/issues/690" }, { url: null }, { pull_request: {} }, { url: "https://github.com/owner/target/issues/69?x=1" }]) test(`wrong identity ${JSON.stringify(change)}`, () => {
  assert.throws(() => requireOpen({ ...valid, ...change }, repo, 69));
});
test("single issue read carries existing board and brief fields; failures stop", () => {
  let calls=0;
  const issue = readIssue(repo, 69, ".", (command, args) => {
    calls++;
    assert.equal(command, "gh");
    assert.equal(args.at(-1), "body,comments,labels,projectItems,state,number,url");
    return JSON.stringify(valid);
  });
  assert.equal(calls, 1);
  assert.deepEqual(issue.projectItems, []);
  for (const read of [() => { throw Error("auth/network failure"); }, () => "malformed", () => JSON.stringify({ ...valid, state: "CLOSED" })]) {
    let mutated=false;
    assert.throws(() => { readIssue(repo, 69, ".", read); mutated=true; });
    assert.equal(mutated, false);
  }
});
for (const text of ["Fix #69", "body\nCloses owner/target#69", "Refs https://github.com/owner/target/issues/69", "(https://github.com/owner/target/issues/69#issuecomment-1).", "OWNER/TARGET#69"]) test(`exact reference ${text}`, () => assert.equal(referencesIssue(text, repo, 69), true));
for (const text of ["#690", "#169", "#69abc", "other/target#69", "target#69", "owner/else#69", "https://github.com/other/target/issues/69", "https://example.com/path#69", "https://github.com/owner/target/pull/69", "https://github.com/owner/target/issues/690", "https://github.com/other/target/issues/1#69", "https://github.com/owner/target/issues/69suffix"]) test(`unrelated reference ${text}`, () => assert.equal(referencesIssue(text, repo, 69), false));

test("real Git equality, full-message hit, divergence, bounds and resumed worker commits", () => {
  const cwd=mkdtempSync(join(tmpdir(), "vilya-preflight-"));
  const git=(...args)=>execFileSync("git", args, {cwd, encoding:"utf8", stdio:["ignore","pipe","pipe"]}).trim();
  try {
    git("init"); git("config","user.email","test@example.invalid"); git("config","user.name","Preflight Test");
    const commit=message=>{git("commit","--allow-empty","-m",message);return git("rev-parse","HEAD")};
    const base=commit("base");
    assert.equal(checkBase(repo,69,base,base,cwd).relation,"equal");
    const start=commit("unrelated #690 and other/target#69");
    assert.equal(checkBase(repo,69,base,start,cwd).reviewed,1);
    commit("worker implementation #69");
    assert.equal(checkBase(repo,69,base,start,cwd).reviewed,1, "resumed HEAD must not contaminate original-start range");
    const hit=commit("summary without number\n\nCloses owner/target#69");
    assert.throws(()=>checkBase(repo,69,base,hit,cwd), /possible duplicate/);
    git("checkout","--detach",base);
    const divergent=commit("other line");
    assert.throws(()=>checkBase(repo,69,start,divergent,cwd), /not an ancestor/);
    assert.throws(()=>checkBase(repo,69,"0".repeat(40),start,cwd), /read failed/);
    assert.throws(()=>checkBase(repo,69,base,"HEAD",cwd), /full brief/);
    for(let i=0;i<256;i++)commit(`unrelated ${i}`);
    assert.throws(()=>checkBase(repo,69,base,git("rev-parse","HEAD"),cwd), /exceeds 256/);
    const shallow=join(cwd,".git","shallow");writeFileSync(shallow,base+"\n");
    assert.throws(()=>checkBase(repo,69,base,base,cwd), /Incomplete history/);
  } finally { rmSync(cwd,{recursive:true,force:true}); }
});

test("CLI failure exits nonzero before emitting an accepted issue", () => {
  const result=spawnSync(process.execPath,[new URL("../vl-chip/scripts/dispatch-preflight.mjs",import.meta.url).pathname.replace(/^\/(\w:)/,"$1"),"issue","bad-repo","69"],{encoding:"utf8"});
  assert.equal(result.status,1);assert.equal(result.stdout,"");assert.match(result.stderr,/STOP/);
});

test("direct and linked-folder CLI execute identically and imports remain safe", () => {
  const cwd = mkdtempSync(join(tmpdir(), "vilya-linked-preflight-"));
  const skill = fileURLToPath(new URL("../vl-chip/", import.meta.url));
  const linkedSkill = join(cwd, "installed-vl-chip");
  const direct = join(skill, "scripts", "dispatch-preflight.mjs");
  const linked = join(linkedSkill, "scripts", "dispatch-preflight.mjs");
  const git = (...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const invoke = (script, args) => spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8", windowsHide: true });
  try {
    // Junctions need no Windows symlink privilege; other hosts exercise a directory symlink.
    symlinkSync(skill, linkedSkill, process.platform === "win32" ? "junction" : "dir");
    assert.equal(realpathSync(linked), realpathSync(direct));
    git("init");
    git("-c", "user.name=Preflight Test", "-c", "user.email=test@example.invalid", "commit", "--allow-empty", "-m", "base");
    const base = git("rev-parse", "HEAD");
    const args = ["base", repo, "69", base, base];
    const expected = { relation: "equal", base, originalStart: base, reviewed: 0 };
    const directResult = invoke(direct, args);
    const linkedResult = invoke(linked, args);
    for (const result of [directResult, linkedResult]) {
      assert.equal(result.error, undefined);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      assert.deepEqual(JSON.parse(result.stdout), expected);
    }
    assert.equal(linkedResult.stdout, directResult.stdout);
    for (const invalid of [[], ["unknown"], ["issue"], ["issue", "bad-repo", "69"],
      ["issue", repo, "69", "extra"], ["base", repo, "69", base],
      ["base", repo, "69", base, base, "extra"], ["base", repo, "69", "HEAD", base]]) {
      for (const script of [direct, linked]) {
        const result = invoke(script, invalid);
        assert.equal(result.error, undefined);
        assert.equal(result.status, 1);
        assert.equal(result.stdout, "");
        assert.match(result.stderr, /^STOP: /);
      }
    }
    // A real runner argv must not trigger the imported module's CLI guard.
    const runner = join(cwd, "import-runner.mjs");
    for (const script of [direct, linked]) {
      writeFileSync(runner, `import { requireOpen, checkBase, referencesIssue, readIssue } from ${JSON.stringify(pathToFileURL(script).href)};
import assert from "node:assert/strict";
const issue = ${JSON.stringify(valid)};
assert.equal(requireOpen(issue, ${JSON.stringify(repo)}, 69), issue);
assert.equal(checkBase(${JSON.stringify(repo)}, 69, ${JSON.stringify(base)}, ${JSON.stringify(base)}).relation, "equal");
assert.equal(referencesIssue("Fix #69", ${JSON.stringify(repo)}, 69), true);
assert.deepEqual(readIssue(${JSON.stringify(repo)}, 69, ".", () => JSON.stringify(issue)), issue);
`);
      const result = invoke(runner, ["unknown"]);
      assert.equal(result.error, undefined);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout, "");
      assert.equal(result.stderr, "");
    }
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
