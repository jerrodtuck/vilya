import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PROMPTS } from "../features/orchestrator/prompts";
import { CODEX_PROMPTS } from "../features/orchestrator/codex-prompts";

const root = resolve(process.cwd(), "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
describe("fresh dispatch and recovery teaching", () => {
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
