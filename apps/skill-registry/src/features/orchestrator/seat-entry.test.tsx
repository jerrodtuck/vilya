import {describe,expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {CODEX_PROMPTS} from "./codex-prompts";
import {PROMPTS as ORCH} from "./prompts";
import {PROMPTS as ARCH} from "../architect/prompts";
import {PROMPTS as PLAN} from "../planner/prompts";
import {CODEX_ARCHITECT,CodexArchitect} from "../architect/codex-architect";
import {CodexOrchestration} from "./codex-orchestration";
const cards=[...ORCH,...ARCH,...PLAN,...CODEX_PROMPTS,CODEX_ARCHITECT].flatMap(g=>g.items);
const entries=cards.filter(c=>/Orchestrator|Product Architect|Planner \(Fable\)|standing orders|worker kickoff|Worker entry|Interrupted worker/i.test(c.label));
describe('copied seat reminder delivery',()=>{
 it('covers each applicable exported seat and worker entry',()=>{
  expect(entries).toHaveLength(10);
  for(const card of entries){expect(card.text,card.label).toContain('vl-orch-codex/references/seat-entry.md');expect(card.text,card.label).toMatch(/first seating|first entry/i);expect(card.text,card.label).toContain('reseating');expect(card.text,card.label).toMatch(/override/i);expect(card.text,card.label).toMatch(/resumed.*pin/);expect(card.text,card.label).toContain('parent');}
 });
 it('teaches one-time setup and preserved pins on both actual Codex seat pages',()=>{
  for(const html of [renderToStaticMarkup(<CodexArchitect/>),renderToStaticMarkup(<CodexOrchestration/>)]){expect(html).toContain('first seating');expect(html).toContain('model controls');expect(html).toContain('unknown settings');expect(html).toContain('Same-seat resumes do not repeat');}
 });
});
