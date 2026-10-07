import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
export const NODE_IMAGE = 'node@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392';
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const docker = args => execFileSync('docker', args, { encoding: 'utf8', windowsHide: true, maxBuffer: 2_000_000, timeout: 600_000 });
export function containedFixture(allowedRoot, root) {
  const allowed = fs.realpathSync(allowedRoot); const resolved = path.resolve(root);
  if (!resolved.startsWith(allowed + path.sep) || resolved === allowed || /[,\r\n]/.test(resolved)) throw Error('Fixture mount outside evaluator root');
  let current = allowed;
  for (const part of path.relative(allowed, resolved).split(path.sep)) {
    current = path.join(current, part); if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error('Symlink mount escape');
  }
  const scan = directory => { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink() || fs.lstatSync(file).isSymbolicLink()) throw Error('Fixture contains a link');
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.env') || entry.name === 'settings.local.json') throw Error('Fixture contains dependencies, history or private configuration');
    if (entry.isDirectory()) scan(file);
  } };
  scan(resolved); return resolved;
}
export function sandboxArgs({ allowedRoot, root, image, volume, commands, deadline, name }) {
  const fixture = containedFixture(allowedRoot, root);
  if (!/^vilya357-deps-[a-f0-9]{64}$/.test(volume) || !/^sha256:[a-f0-9]{64}$/.test(image) || !/^vilya357-[a-z0-9-]+$/.test(name) || !Number.isSafeInteger(deadline) ||
      !Array.isArray(commands) || !commands.length || commands.length > 16 || commands.some(args => !Array.isArray(args) || args.some(arg => typeof arg !== 'string' || arg.length > 200_000))) throw Error('Invalid sandbox control');
  return ['run', '--rm', '--init', '--pull=never', '--name', name, '--network=none', '--read-only', '--user=1000:1000',
    '--cap-drop=ALL', '--security-opt=no-new-privileges', '--pids-limit=256', '--memory=4g', '--cpus=2',
    '--tmpfs', '/tmp:rw,noexec,nosuid,nodev,size=256m,uid=1000,gid=1000,mode=1777',
    '--tmpfs', '/fixture:rw,nosuid,nodev,size=2g,uid=1000,gid=1000,mode=700',
    '--mount', `type=bind,source=${fixture},target=/seed,readonly`, '--mount', `type=volume,source=${volume},target=/fixture/node_modules,readonly`, '--env', 'HOME=/tmp', '--env', 'CI=1', '--env', 'NEXT_TELEMETRY_DISABLED=1',
    image, 'node', '/opt/evaluation-runner.mjs', JSON.stringify(commands), String(deadline)];
}
export function runSandbox(options) {
  const args = sandboxArgs(options); const remaining = options.deadline - Date.now();
  if (remaining <= 0) return Promise.resolve([{ passed: false, timedOut: true, code: null, output: 'Sandbox deadline' }]);
  return new Promise(resolve => {
    const child = spawn('docker', args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '', diagnostics = '', timedOut = false, overflow = false;
    const kill = () => { child.kill(); const cleanup = spawn('docker',['rm','-f',options.name],{windowsHide:true,stdio:'ignore'});const cleanupTimer=setTimeout(()=>cleanup.kill(),5000);cleanup.once('exit',()=>clearTimeout(cleanupTimer));cleanup.once('error',()=>clearTimeout(cleanupTimer)); };
    const timer = setTimeout(() => { timedOut = true; kill(); }, remaining);
    child.stdout.on('data', bytes => { output += bytes.toString(); if (Buffer.byteLength(output) > 2_000_000) { overflow = true; kill(); } });
    child.stderr.on('data', bytes => { diagnostics += bytes.toString(); if (Buffer.byteLength(diagnostics) > 2_000_000) { overflow = true; kill(); } });
    child.once('error', () => { clearTimeout(timer); resolve([{ passed: false, timedOut, code: null, output: 'Docker unavailable' }]); });
    child.once('exit', code => {
      clearTimeout(timer);
      if (timedOut || overflow) return resolve([{ passed: false, timedOut, code, output: 'Container stopped at resource/deadline bound' }]);
      try {
        const results = JSON.parse(output);
        if (!Array.isArray(results) || !results.length || results.length > options.commands.length || results.some(result => typeof result.passed !== 'boolean' || typeof result.command !== 'string')) throw Error('Bad sandbox receipt');
        if (code !== 0 && results.every(result => result.passed)) throw Error('Bad sandbox exit');
        resolve(results);
      } catch { resolve([{ passed: false, timedOut: false, code, output: diagnostics.slice(-8000) || 'Invalid container receipt' }]); }
    });
  });
}
export function buildSandboxImage({ repo, seed, runtimeRoot }) {
  if (!/^[a-f0-9]{40}$/.test(seed)) throw Error('Immutable seed required');
  const packageFile = execFileSync('git', ['show', `${seed}:apps/skill-registry/package.json`], { cwd: repo });
  const lockFile = execFileSync('git', ['show', `${seed}:apps/skill-registry/package-lock.json`], { cwd: repo });
  const runner = fs.readFileSync(new URL('./sandbox-runner.mjs', import.meta.url));
  const key = digest(Buffer.concat([packageFile, lockFile, runner, Buffer.from(NODE_IMAGE)]));
  const context = path.join(runtimeRoot, 'images', key); fs.mkdirSync(context, { recursive: true });
  fs.writeFileSync(path.join(context, 'package.json'), packageFile); fs.writeFileSync(path.join(context, 'package-lock.json'), lockFile); fs.writeFileSync(path.join(context, 'runner.mjs'), runner);
  fs.writeFileSync(path.join(context, 'Dockerfile'), `FROM ${NODE_IMAGE}\nRUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*\nWORKDIR /opt/deps\nCOPY package.json package-lock.json ./\nRUN npm ci --no-audit --no-fund\nCOPY runner.mjs /opt/evaluation-runner.mjs\nUSER 1000:1000\n`);
  const tag = `vilya357-deps:${key.slice(0,24)}`;
  docker(['build', '--pull=false', '--tag', tag, context]);
  const image = docker(['image', 'inspect', tag, '--format', '{{.Id}}']).trim();
  if (!/^sha256:[a-f0-9]{64}$/.test(image)) throw Error('Missing pinned image ID');
  const volume = `vilya357-deps-${key}`;
  docker(['run','--rm','--network=none','--read-only','--user=1000:1000','--cap-drop=ALL','--security-opt=no-new-privileges','--mount',`type=volume,source=${volume},target=/opt/deps/node_modules`,image,'node','--version']);
  const version = docker(['run', '--rm', '--network=none', '--read-only', '--user=1000:1000', '--cap-drop=ALL', '--security-opt=no-new-privileges', image, 'node', '--version']).trim();
  const receipt = { schemaVersion: 1, seed, baseImage: NODE_IMAGE, image, volume, lockSha256: digest(lockFile), nodeVersion: version,
    preparation: 'trusted manifests only; npm ci network permitted during image build', runtime: 'none; read-only base/deps; nonroot; no host environment/socket; fixture copied into bounded tmpfs' };
  fs.writeFileSync(path.join(context, 'image-receipt.json'), JSON.stringify(receipt, null, 2)); return receipt;
}
