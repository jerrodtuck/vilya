import { expect, it } from 'vitest';
import { CODEX_PROMPTS } from './codex-prompts';
const labels = ['Codex — Orchestrator', 'Prepare checkout and dispatch', 'Worker entry — include in every brief', 'Follow a running chip', 'Interrupted worker / restart'];
it.each(labels)('%s independently delivers accepted-unit and environment limits', label => {
  const text = CODEX_PROMPTS.flatMap(group => group.items).find(card => card.label === label)!.text;
  for (const term of ['not accepted completion', 'separate review', 'related findings/repairs until acceptance', 'preserving pins and ledger', 'exact head', 'evidence references', 'lock/dependency state', 'specific unresolved question', 'no unrelated assignments', 'new compact self-contained brief', 'Preserve needed environments/ownership', 'only task-owned locks', 'no active/dependent work', 'not chat archival or worktree deletion', 'only exposed lifecycle', 'claim no disposal', 'histories are isolated', 'Idle saved history alone does not prove ongoing charges']) expect(text).toContain(term);
});
it('keeps archival and handoff-specific entries outside this completion amendment', () => {
  const archival = CODEX_PROMPTS.flatMap(group => group.items).find(card => card.label === 'Managed archival after authorized close-out')!.text;
  expect(archival).not.toContain('One worker owns one settled task/slice');
});

import { PROMPTS } from './prompts';
import { CLAUDE_ORCH_PROMPT_LABEL } from './claude-dispatch';
import { CURSOR_ORCH_PROMPT_LABEL } from './cursor-dispatch';
it.each([CLAUDE_ORCH_PROMPT_LABEL, CURSOR_ORCH_PROMPT_LABEL])('%s copied parent delivers acceptance without the optional skill affordance', label => {
  const card = PROMPTS.flatMap(group => group.items).find(item => item.label === label)!;
  expect(card.text.startsWith(label === CLAUDE_ORCH_PROMPT_LABEL ? "You're the orchestrator for this repo" : "You are the orchestrator for this repo")).toBe(true);
  for (const term of ['Read and apply the full shared accepted worker completion contract', 'vl-orch-codex/references/model-routing.md', 'does not import Codex tools or model tiers', 'not accepted completion', 'independent review and amendments', 'related repairs until acceptance with its pin and ledger', 'needed environment/ownership/setup/lock state', 'no unrelated assignments', 'new compact self-contained brief', 'only task-owned locks', 'no active/dependent work', 'actual host lifecycle capabilities', 'claim no disposal']) expect(card.text).toContain(term);
});
