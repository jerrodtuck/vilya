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
