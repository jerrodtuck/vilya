// Trusted image entrypoint: no model-generated source executes in the host controller.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const commands = JSON.parse(process.argv[2]); const deadline = Number(process.argv[3]); const results = [];
try {
  fs.cpSync('/seed', '/fixture', { recursive: true, dereference: false });
  fs.symlinkSync('../../node_modules', '/fixture/apps/skill-registry/node_modules', 'dir');
  process.chdir('/fixture/apps/skill-registry');
  for (const args of commands) {
    const started = Date.now(); const remaining = deadline - started;
    if (remaining <= 0) { results.push({ command: 'deadline', passed: false, timedOut: true, code: null, output: '' }); break; }
    try {
      const output = execFileSync(process.execPath, args, { cwd: process.cwd(), encoding: 'utf8', timeout: remaining, maxBuffer: 1_000_000, stdio: ['ignore','pipe','pipe'] });
      results.push({ command: `node ${args[0]}`, passed: true, timedOut: false, code: 0, started, ended: Date.now(), output: output.slice(-24000) });
    } catch (error) {
      results.push({ command: `node ${args[0]}`, passed: false, timedOut: error.code === 'ETIMEDOUT', code: error.status ?? null, started, ended: Date.now(), output: `${error.stdout ?? ''}\n${error.stderr ?? ''}`.slice(-24000) }); break;
    }
  }
} catch { results.push({ command: 'sandbox-setup', passed: false, timedOut: false, code: null, output: 'Isolated workspace setup failed' }); }
process.stdout.write(JSON.stringify(results));
process.exitCode = results.length === commands.length && results.every(result => result.passed) ? 0 : 1;
