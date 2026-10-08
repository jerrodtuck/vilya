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
    '--tmpfs', '/fixture:rw,exec,nosuid,nodev,size=2g,uid=1000,gid=1000,mode=700',
    '--mount', `type=bind,source=${fixture},target=/seed,readonly`, '--mount', `type=volume,source=${volume},target=/deps,readonly`, '--env', 'HOME=/tmp', '--env', 'CI=1', '--env', 'NEXT_TELEMETRY_DISABLED=1',
    image, 'node', '/opt/evaluation-runner.mjs', JSON.stringify(commands), String(deadline)];
}
let cleanupHeld=false;
const boundedDocker=(args,timeout=5000)=>new Promise(resolve=>{const child=spawn('docker',args,{windowsHide:true,stdio:['ignore','pipe','pipe']});let out='';const timer=setTimeout(()=>{child.kill();resolve({code:null,output:'timeout'});},timeout);child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>out+=b);child.once('error',()=>{clearTimeout(timer);resolve({code:null,output:'unavailable'});});child.once('exit',code=>{clearTimeout(timer);resolve({code,output:out});});});
export async function cleanupSandbox(name){await boundedDocker(['rm','-f',name]);const check=await boundedDocker(['inspect',name]);const absent=check.code===1&&/No such object|No such container/i.test(check.output);if(!absent)cleanupHeld=true;return absent;}
export async function runSandbox(options) {
 if(cleanupHeld)throw Error('Sandbox cleanup unresolved; future dispatch held');
 const holdFile=path.join(fs.realpathSync(options.allowedRoot),'.sandbox-cleanup-hold.json');if(fs.existsSync(holdFile))throw Error('Sandbox cleanup unresolved; durable dispatch hold');
 const args=sandboxArgs(options),remaining=options.deadline-Date.now();if(remaining<=0)return [{passed:false,timedOut:true,code:null,output:'Sandbox deadline'}];
 fs.writeFileSync(holdFile,JSON.stringify({name:options.name,started:Date.now(),status:'pending'}),{flag:'wx'});
 const result=await new Promise(resolve=>{const child=spawn('docker',args,{windowsHide:true,stdio:['ignore','pipe','pipe']});let output='',diagnostics='',timedOut=false,overflow=false,done=false;
 const finish=code=>{if(done)return;done=true;clearTimeout(timer);resolve({code,output,diagnostics,timedOut,overflow});};
 const kill=()=>{child.kill();finish(null);};const timer=setTimeout(()=>{timedOut=true;kill();},remaining);
 child.stdout.on('data',b=>{output+=b;if(Buffer.byteLength(output)>2000000){overflow=true;kill();}});child.stderr.on('data',b=>{diagnostics+=b;if(Buffer.byteLength(diagnostics)>2000000){overflow=true;kill();}});child.once('error',()=>finish(null));child.once('exit',finish);
 });
 if(options.diagnosticFile){const target=path.resolve(options.diagnosticFile);if(!target.startsWith(fs.realpathSync(options.allowedRoot)+path.sep))throw Error('Diagnostics outside evaluator');fs.writeFileSync(target,JSON.stringify(result));}
 const cleanupConfirmed=await cleanupSandbox(options.name);if(!cleanupConfirmed)throw Error('Sandbox cleanup unresolved; future dispatch held');fs.unlinkSync(holdFile);
 if(result.timedOut||result.overflow)return [{passed:false,timedOut:result.timedOut,code:result.code,cleanupConfirmed,output:'Container stopped at resource/deadline bound'}];
 try{const results=JSON.parse(result.output);if(!Array.isArray(results)||!results.length||results.length>options.commands.length||results.some(r=>typeof r.passed!=='boolean'||typeof r.command!=='string')||(result.code!==0&&results.every(r=>r.passed)))throw Error();return results.map(r=>({...r,cleanupConfirmed}));}catch{return [{passed:false,timedOut:false,code:result.code,cleanupConfirmed,output:'Invalid container receipt'}];}
}
export function buildSandboxImage({ repo, seed, runtimeRoot }) {
  if (!/^[a-f0-9]{40}$/.test(seed)) throw Error('Immutable seed required');
  const packageFile = execFileSync('git', ['show', `${seed}:apps/skill-registry/package.json`], { cwd: repo });
  const lockFile = execFileSync('git', ['show', `${seed}:apps/skill-registry/package-lock.json`], { cwd: repo });
  const runner = fs.readFileSync(new URL('./sandbox-runner.mjs', import.meta.url));
  const key = digest(Buffer.concat([packageFile, lockFile, runner, Buffer.from(NODE_IMAGE)]));
  const context = path.join(runtimeRoot, 'images', key);const saved=path.join(context,'image-receipt.json');if(fs.existsSync(saved)){const receipt=JSON.parse(fs.readFileSync(saved));if(receipt.baseImage!==NODE_IMAGE||receipt.lockSha256!==digest(lockFile)||!/^sha256:[a-f0-9]{64}$/.test(receipt.image))throw Error('Image receipt mismatch');docker(['image','inspect',receipt.image]);return {...receipt,seed,cacheKey:key,packageSha256:digest(packageFile),runnerSha256:digest(runner)};}fs.mkdirSync(context, { recursive: true });
  fs.writeFileSync(path.join(context, 'package.json'), packageFile); fs.writeFileSync(path.join(context, 'package-lock.json'), lockFile); fs.writeFileSync(path.join(context, 'runner.mjs'), runner);
  fs.writeFileSync(path.join(context, 'Dockerfile'), `FROM ${NODE_IMAGE}\nRUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*\nWORKDIR /opt/deps\nCOPY package.json package-lock.json ./\nRUN npm ci --no-audit --no-fund\nCOPY runner.mjs /opt/evaluation-runner.mjs\nUSER 1000:1000\n`);
  const tag = `vilya357-deps:${key.slice(0,24)}`;
  docker(['build', '--pull=false', '--tag', tag, context]);
  const image = docker(['image', 'inspect', tag, '--format', '{{.Id}}']).trim();
  if (!/^sha256:[a-f0-9]{64}$/.test(image)) throw Error('Missing pinned image ID');
  const volume = `vilya357-deps-${key}`;
  docker(['run','--rm','--network=none','--read-only','--user=1000:1000','--cap-drop=ALL','--security-opt=no-new-privileges','--mount',`type=volume,source=${volume},target=/opt/deps/node_modules`,image,'node','--version']);
  const version = docker(['run', '--rm', '--network=none', '--read-only', '--user=1000:1000', '--cap-drop=ALL', '--security-opt=no-new-privileges', image, 'node', '--version']).trim();
  const receipt = { schemaVersion: 1, cacheKey:key,packageSha256:digest(packageFile),runnerSha256:digest(runner), seed, baseImage: NODE_IMAGE, image, volume, lockSha256: digest(lockFile), nodeVersion: version,
    preparation: 'trusted manifests only; npm ci network permitted during image build', runtime: 'none; read-only base/deps; nonroot; no host environment/socket; fixture copied into bounded tmpfs' };
  fs.writeFileSync(path.join(context, 'image-receipt.json'), JSON.stringify(receipt, null, 2)); return receipt;
}
