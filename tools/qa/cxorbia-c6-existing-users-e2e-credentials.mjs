import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script=fileURLToPath(new URL('./cxorbia-c6-existing-users-e2e-credentials-v3.mjs',import.meta.url));
const original=process.env.CXORBIA_CREDENTIAL_ENVELOPE||'backend/private-inbox/corte6-credential-bundle.enc.json';
const privateDir=process.env.PRIVATE_DIR||'.tmp/c6-real-users-e2e-private';
const normalizedEnvelope=path.join(privateDir,'credential-envelope-target-normalized.json');
fs.mkdirSync(privateDir,{recursive:true});
const envelope=JSON.parse(fs.readFileSync(original,'utf8'));
if(!envelope.tenantId) envelope.tenantId='tya';
fs.writeFileSync(normalizedEnvelope,JSON.stringify(envelope)+'\n',{encoding:'utf8',mode:0o600});
const env={...process.env,CXORBIA_CREDENTIAL_ENVELOPE:normalizedEnvelope};
const run=spawnSync(process.execPath,[script],{env,encoding:'utf8'});
try{fs.rmSync(normalizedEnvelope,{force:true});}catch{}
if(run.status!==0){
  if(run.stderr) process.stderr.write(run.stderr);
  if(run.stdout) process.stderr.write(run.stdout);
  process.exit(run.status||1);
}
const lines=String(run.stdout||'').trim().split(/\r?\n/).filter(Boolean);
const result=JSON.parse(lines.at(-1)||'{}');
if(result.decision!=='PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION_V3') throw new Error('credential_selector_v3_not_pass');
result.decision='PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION';
console.log(JSON.stringify(result));
