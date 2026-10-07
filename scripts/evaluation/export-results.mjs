import { mkdir, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { validateSnapshot } from '../../apps/skill-registry/src/features/evaluation/snapshot.mjs';
export { validateSnapshot };
export const SNAPSHOT_PATH = fileURLToPath(new URL('../../apps/skill-registry/.evaluation/results.json', import.meta.url));
/** Input must be the controller's normalized DTO, never a ledger or session. */
export async function exportSnapshot(candidate) {
  const snapshot = validateSnapshot(candidate);
  const directory = fileURLToPath(new URL('../../apps/skill-registry/.evaluation/', import.meta.url));
  await mkdir(directory, { recursive: true });
  const temporary = `${SNAPSHOT_PATH}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  await rename(temporary, SNAPSHOT_PATH);
  return { path: SNAPSHOT_PATH, runCount: snapshot.runs.length };
}
