import { expect, it } from 'vitest';
import { PROMPTS as planner } from '../planner/prompts';
import { CODEX_PLANNER } from '../planner/codex-prompts';
import { PROMPTS as architect } from '../architect/prompts';
import { CODEX_ARCHITECT } from '../architect/codex-architect';
import { PROMPTS as orchestrator, PLANNER_ORCH_DOCTRINE } from './prompts';
import { CODEX_PROMPTS } from './codex-prompts';

it('composed TEST entries preserve the shared proof boundary and deliberate host decisions', () => {
  const cards = [
    ...planner.filter(group => group.node === 'PLAN').flatMap(group => group.items).filter(card => card.skill),
    ...CODEX_PLANNER.items,
    ...architect.filter(group => group.node === 'ARCH').flatMap(group => group.items),
    ...CODEX_ARCHITECT.items,
    ...orchestrator.filter(group => ['ORCH', 'FINISH'].includes(group.node)).flatMap(group => group.items),
    ...CODEX_PROMPTS.filter(group => group.node === 'CHIP').flatMap(group => group.items),
  ];
  expect(cards.length).toBeGreaterThan(10);
  for (const card of cards) {
    for (const term of ['proportional TEST proof contract', 'exact disposable target', 'smallest action/readback',
      'Reuse scoped human consent', 'supported tools', 'concrete applicable threat/failure', 'value/cost',
      'credential/native/production/collision limits', 'no restore/cleanup authority', 'Product owners explicitly reconcile running controls',
      'Separate plan/dispatch, executed effects, CLI, GUI and production evidence', 'exact blocker', 'host planning/review exceptions']) {
      expect(card.text, card.label).toContain(term);
    }
  }
  expect(PLANNER_ORCH_DOCTRINE).toContain('Claude #356 permits the orch to fill routine bounded gaps');
  expect(CODEX_PLANNER.items[0].text).toContain('separate Codex Planner');
  expect(CODEX_PLANNER.items[0].text).toContain('optional for concrete unresolved risk');
});
