import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

// This is Vilya's bounded path policy, not a function-level test selector.
const started = performance.now();
const [base, head, mode = 'pull_request'] = process.argv.slice(2);
function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
}
try {
  if (!['pull_request', 'push'].includes(mode)) throw new Error('Expected pull_request or push mode');
  for (const [name, sha] of [['base', base], ['head', head]]) {
    if (!/^[a-f0-9]{40}$/.test(sha ?? '')) throw new Error(`Missing or malformed ${name} SHA`);
    if (git('rev-parse', '--verify', `${sha}^{commit}`).trim() !== sha) {
      throw new Error(`Unavailable ${name} commit`);
    }
  }
  // NUL records retain spaces, newlines, renames and deletions without shell parsing.
  const fields = git('diff', '--name-status', '-z', '-M', base, head, '--').split('\0');
  fields.pop();
  const paths = [];
  for (let i = 0; i < fields.length;) {
    const status = fields[i++];
    paths.push(fields[i++]);
    if (/^[RC]/.test(status)) paths.push(fields[i++]);
  }
  const selected = { lint: false, registry: false, skills: false, tooling: false };
  const reasons = [];
  const unverified = [];
  function all(reason) {
    for (const key of Object.keys(selected)) selected[key] = true;
    reasons.push(reason);
  }
  if (mode === 'push') all('default-branch regression');
  for (const file of paths) {
    if (file.startsWith('scripts/evaluation/') || file.startsWith('scripts/tests/')) {
      unverified.push(`Owner-specific campaign verification required: ${file}; historical suites need exact private-origin artifacts and are excluded from these CI gates`);
    }
    if (file.startsWith('apps/skill-registry/content/') || file.startsWith('skills/') ||
        file === 'docs/project-tracking/GITHUB-PROJECTS.md' || file.startsWith('docs/project-tracking/templates/')) {
      selected.skills = selected.registry = true;
      reasons.push(`shared delivery and registry consumers: ${file}`);
    } else if (file.startsWith('apps/skill-registry/')) {
      selected.lint = selected.registry = true;
      if (file.startsWith('apps/skill-registry/scripts/')) selected.skills = true;
      reasons.push(`registry code/config/dependencies: ${file}`);
    } else if ((file.startsWith('docs/') && /\.md$/.test(file)) || ['README.md', 'CHANGELOG.md', 'LICENSE'].includes(file)) {
      reasons.push(`documentation: whitespace; no generated consumer: ${file}`);
    } else {
      all(`unknown/shared tooling impact; broaden: ${file}`);
    }
  }
  if (!paths.length) reasons.push('no changed paths; whitespace check still runs');
  const result = { base, head, mode, paths, ...selected, reasons, unverified, elapsedMs: Math.round(performance.now() - started) };
  console.log(JSON.stringify(result, null, 2));
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(selected).map(([key, value]) => `${key}=${value}\n`).join(''));
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    // JSON escaping keeps filenames from creating Markdown directives or output records.
    const summary = JSON.stringify(result, null, 2).replaceAll('<', '\\u003c').replaceAll('`', '\\u0060');
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Selected checks\n\n\x60\x60\x60json\n${summary}\n\x60\x60\x60\n`);
  }
} catch (error) {
  console.error(`Selection failed visibly: ${error.message}`);
  process.exitCode = 1;
}
