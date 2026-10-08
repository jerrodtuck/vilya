import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {BudgetLedger} from './ledger.mjs';
import {apiConfig} from './money.mjs';
import {amendContinuationActivation,CONTINUATION_PATHS,AMENDMENT_PATHS} from './continuation.mjs';
import {safeFile} from './paths.mjs';

export function publish(args){const values={};for(let i=0;i<args.length;i++){const name=args[i];if(name==='--live'){if(values[name])throw Error('Duplicate amendment option');values[name]=true;continue;}if(!['--workflow-protocol','--reviewed-head','--reviews'].includes(name)||!args[i+1]||values[name])throw Error('Invalid amendment option');values[name]=args[++i];}if(values['--live']!==true||values['--workflow-protocol']!=='2'||path.resolve(values['--reviews']??'')!==path.resolve(AMENDMENT_PATHS.reviews))throw Error('Explicit fixed amendment publication required');safeFile(CONTINUATION_PATHS.workspace,path.basename(AMENDMENT_PATHS.reviews));if(fs.statSync(AMENDMENT_PATHS.reviews).size>16000)throw Error('Amendment review metadata bound');const reviews=JSON.parse(fs.readFileSync(AMENDMENT_PATHS.reviews,'utf8'));return amendContinuationActivation(new BudgetLedger(CONTINUATION_PATHS.ledger,apiConfig()),{live:true,workflowProtocolVersion:2,reviewedHead:values['--reviewed-head'],reviews});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(publish(process.argv.slice(2))));}catch(error){console.error(error.message);process.exitCode=1;}}
