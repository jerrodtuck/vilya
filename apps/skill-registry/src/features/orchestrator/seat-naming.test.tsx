import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CodexOrchestration } from "./codex-orchestration";
import { CODEX_PROMPTS } from "./codex-prompts";
import { PROMPTS as HOST_PROMPTS } from "./prompts";
import { CODEX_ARCHITECT } from "../architect/codex-architect";
import { PROMPTS as ARCH_PROMPTS } from "../architect/prompts";

describe("recognizable names instruction delivery", () => {
  it("renders title transfer and ownership/archive boundaries", () => {
    const html=renderToStaticMarkup(<CodexOrchestration />);
    for(const fact of ["source ID/title", "intended successor title", "before canonical naming", "Ownership conflicts stop", "Rename only verified source/successor IDs", "exact manual fallback", "Titles grant no ownership or archival authority", "source unarchived"])
      expect(html).toContain(fact);
  });
  it("copied Codex seat/worker entries preserve scope and exact-ID fallback",()=>{
    const entries=[CODEX_ARCHITECT,...CODEX_PROMPTS.filter(group=>["ORCH","CHIP","RECOVER"].includes(group.node))].flatMap(group=>group.items);
    expect(entries.length).toBeGreaterThan(2);
    for(const item of entries)for(const fact of ["vl-handoff/references/seat-naming.md", "explicit human titles", "exact-ID rename", "before canonical naming", "source unarchived", "no bulk rename"])
      expect(item.text,item.label).toContain(fact);
  });
  it("affected Claude/Cursor standing and worker copies load the shared contract",()=>{
    const entries=[...HOST_PROMPTS,...ARCH_PROMPTS].flatMap(group=>group.items).filter(item=>/first seating\/reseating/.test(item.text));
    expect(entries.length).toBe(5);
    for(const item of entries)for(const fact of ["vl-handoff/references/seat-naming.md", "explicit human title preferences", "exact manual fallback", "before canonical naming", "sources unarchived"])
      expect(item.text,item.label).toContain(fact);
    expect(HOST_PROMPTS.flatMap(group=>group.items).map(item=>item.text).join("\n")).not.toContain("title exactly <issue#>-<slug>");
  });
});
