import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { validateSnapshot } from './snapshot.mjs';
export async function loadSnapshot() {
  try {
    const content = await readFile(path.join(process.cwd(), '.evaluation', 'results.json'), 'utf8');
    return { status: 'ready' as const, snapshot: validateSnapshot(JSON.parse(content)) };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return { status: 'missing' as const, snapshot: null };
    return { status: 'invalid' as const, snapshot: null };
  }
}
