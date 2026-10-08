// Trusted image entrypoint: no model-generated source executes in the host controller.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const commands = JSON.parse(process.argv[2]); const deadline = Number(process.argv[3]); const results = [];
try {
  fs.cpSync('/seed', '/fixture', { recursive: true, dereference: false });
  const deps='/fixture/apps/skill-registry/node_modules';
  fs.cpSync('/deps',deps,{recursive:true,dereference:false,verbatimSymlinks:true});
  let dependencyBytes=0;const scan=directory=>{for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=directory+'/'+entry.name;if(entry.isSymbolicLink()){const resolved=fs.realpathSync(file);if(!resolved.startsWith(deps+'/'))throw Error('Dependency link escape');}else if(entry.isDirectory())scan(file);else dependencyBytes+=fs.statSync(file).size;}};scan(deps);
  const metrics=()=>({dependencyBytes,tmpfsUsedBytes:Number(execFileSync('df',['-B1','--output=used','/fixture'],{encoding:'utf8'}).trim().split('\n').at(-1)),memoryPeakBytes:Number(fs.readFileSync('/sys/fs/cgroup/memory.peak','utf8'))});
  process.chdir('/fixture/apps/skill-registry');
  for (const args of commands) {
    const started = Date.now(); const remaining = deadline - started;
    if (remaining <= 0) { results.push({ command: 'deadline', passed: false, timedOut: true, code: null, output: '' }); break; }
    try {
      const output = execFileSync(process.execPath, args, { cwd: process.cwd(), encoding: 'utf8', timeout: remaining, maxBuffer: 1_000_000, stdio: ['ignore','pipe','pipe'] });
      results.push({ command: `node ${args[0]}`, passed: true, timedOut: false, code: 0, started, ended: Date.now(), resources: metrics(), output: output.slice(-24000) });
    } catch (error) {
      results.push({ command: `node ${args[0]}`, passed: false, timedOut: error.code === 'ETIMEDOUT', code: error.status ?? null, started, ended: Date.now(), output: `${error.stdout ?? ''}\n${error.stderr ?? ''}`.slice(-24000) }); break;
    }
  }
} catch { results.push({ command: 'sandbox-setup', passed: false, timedOut: false, code: null, output: 'Isolated workspace setup failed' }); }
process.stdout.write(JSON.stringify(results));
process.exitCode = results.length === commands.length && results.every(result => result.passed) ? 0 : 1;
