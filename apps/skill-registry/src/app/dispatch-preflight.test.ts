import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PROMPTS } from "../features/orchestrator/prompts";
import { CODEX_PROMPTS } from "../features/orchestrator/codex-prompts";

const root = resolve(process.cwd(), "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
describe("fresh dispatch and recovery teaching", () => {
  it("executable new-issue recipe checks state and identity before board mutation", () => {
    const source=read("skills/vl-start-feature/SKILL.md");
    const section=source.slice(source.indexOf("## 1. Get the issue"), source.indexOf("## 2. Set up"));
    const create=section.indexOf("url=$(gh issue create");
    const state=section.indexOf("state_identity=$(gh issue view");
    const guard=section.indexOf('[ "$state_identity" = "$expected_identity" ] ||');
    const add=section.indexOf("gh project item-add");
    expect(create).toBeGreaterThan(0);
    expect(state).toBeGreaterThan(create);
    expect(guard).toBeGreaterThan(state);
    expect(add).toBeGreaterThan(guard);
    expect(section.slice(guard,add)).toContain("exit 1");
    expect(section).toContain("--json state,number,url");
    expect(section).toContain("ascii_upcase");
    expect(section).toContain('"$issue_number" "$expected_url"');
  });
  it("ships identical helper bytes and declares the manifest-only download limitation", () => {
    expect(read("apps/skill-registry/content/skills/vl-chip/scripts/dispatch-preflight.mjs")).toBe(read("skills/vl-chip/scripts/dispatch-preflight.mjs"));
    const skill=read("skills/vl-chip/SKILL.md");
    expect(skill).toContain("complete vl-chip folder");
    expect(skill).toContain("raw SKILL.md download is manifest-only");
    expect(skill).toContain("target product repository cwd");
  });
  it.each(["vl-chip", "vl-orch-claude", "vl-orch-cursor", "vl-orch-codex", "vl-start-feature", "vl-cursor-handoff", "vl-night-shift"])("%s carries pre-mutation fail-closed checks", seat => {
    const text=read(`skills/${seat}/SKILL.md`);
    expect(text).toMatch(/OPEN/);
    expect(text).toMatch(/checkout creation|creating a checkout/);
    expect(text).toMatch(/wrong identity|wrong-identity/);
    expect(text).toMatch(/network failure/);
    expect(text).toMatch(/original.start/);
    expect(text).toMatch(/resume/);
    expect(text).toMatch(/do not auto-reopen/i);
    if(seat==="vl-chip") expect(text.indexOf("## Fresh issue-state gate")).toBeLessThan(text.indexOf("## Codex desktop dispatch"));
    if(seat==="vl-start-feature") expect(text.indexOf("## Dispatch preflight")).toBeLessThan(text.indexOf("## Codex desktop path"));
  });
  it("standalone host and worker cards carry the gate when copied alone", () => {
    const items=[...PROMPTS,...CODEX_PROMPTS].flatMap(group=>group.items);
    const entries=items.filter(item => item.text.startsWith("You're the orchestrator") || item.text.startsWith("You are the orchestrator") || item.text.startsWith("You are the Codex desktop orchestrator") || item.text.startsWith("You're the implementer") || item.text.startsWith("Implement #<N> only") || item.label==="Prepare checkout and dispatch" || item.label==="Interrupted worker / restart");
    expect(entries).toHaveLength(8);
    for(const item of entries){
      expect(item.text).toContain("including managed create_worktree");
      expect(item.text).toContain("wrong identity, auth or network failure");
      expect(item.text).toContain("not a later worker HEAD");
    }
  });
  it("unattended baked prompt keeps the OPEN check before the execution reminder", () => {
    const text=read("docs/project-tracking/templates/night-shift.yml");
    expect(text).toContain("checkout creation or spawn");
    expect(text).toContain("identity and OPEN read");
    expect(text).toContain("never replace original-start with HEAD");
  });
});
