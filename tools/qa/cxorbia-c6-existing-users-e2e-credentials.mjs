import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script=fileURLToPath(new URL('./cxorbia-c6-existing-users-e2e-credentials-v2.mjs',import.meta.url));
const run=spawnSync(process.execPath,[script],{env:process.env,encoding:'utf8'});
if(run.status!==0){
  if(run.stderr) process.stderr.write(run.stderr);
  if(run.stdout) process.stderr.write(run.stdout);
  process.exit(run.status||1);
}
const lines=String(run.stdout||'').trim().split(/\r?\n/).filter(Boolean);
const result=JSON.parse(lines.at(-1)||'{}');
if(result.decision!=='PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION_V2') throw new Error('credential_selector_v2_not_pass');
result.decision='PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION';
console.log(JSON.stringify(result));
