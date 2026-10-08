import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {safeFile} from './paths.mjs';
import {POST_UNKNOWN_PATHS,publishPostUnknownRecovery} from './post-unknown-recovery.mjs';

export function publish(args){const v={};for(let i=0;i<args.length;i++){const name=args[i];if(name==='--live'){if(v[name])throw Error('Duplicate recovery option');v[name]=true;continue;}if(!['--workflow-protocol','--reviewed-head','--reviews'].includes(name)||!args[i+1]||v[name])throw Error('Invalid recovery option');v[name]=args[++i];}if(v['--live']!==true||v['--workflow-protocol']!=='2'||path.resolve(v['--reviews']??'')!==path.resolve(POST_UNKNOWN_PATHS.reviews))throw Error('Explicit fixed recovery publication required');safeFile(POST_UNKNOWN_PATHS.workspace,path.basename(POST_UNKNOWN_PATHS.reviews));if(fs.statSync(POST_UNKNOWN_PATHS.reviews).size>16000)throw Error('Recovery review metadata bound');return publishPostUnknownRecovery({live:true,workflowProtocolVersion:2,reviewedHead:v['--reviewed-head'],reviews:JSON.parse(fs.readFileSync(POST_UNKNOWN_PATHS.reviews,'utf8'))});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(publish(process.argv.slice(2))));}catch{console.error('Post-unknown recovery held; preserve all evidence');process.exitCode=1;}}
