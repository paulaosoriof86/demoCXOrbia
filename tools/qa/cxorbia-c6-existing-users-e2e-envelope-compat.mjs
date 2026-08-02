import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const source=process.env.CXORBIA_CREDENTIAL_ENVELOPE||'backend/private-inbox/corte6-credential-bundle.enc.json';
if(!fs.existsSync(source))throw new Error('CREDENTIAL_ENVELOPE_MISSING');
const envelope=JSON.parse(fs.readFileSync(source,'utf8'));
if(envelope.targetProjectId!=='cxorbia-backend-dev')throw new Error('ENVELOPE_TARGET_PROJECT_MISMATCH');
if(envelope.tenantId&&envelope.tenantId!=='tya')throw new Error('ENVELOPE_TENANT_MISMATCH');
envelope.tenantId='tya';
const dir=process.env.CXORBIA_PRIVATE_COMPAT_DIR||fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-c6-envelope-'));
fs.mkdirSync(dir,{recursive:true,mode:0o700});
const compat=path.join(dir,'corte6-credential-bundle.compat.enc.json');
fs.writeFileSync(compat,JSON.stringify(envelope),{encoding:'utf8',mode:0o600});
const result=spawnSync(process.execPath,['tools/qa/cxorbia-c6-existing-users-e2e-credentials-v6.mjs'],{
  stdio:'inherit',
  env:{...process.env,CXORBIA_CREDENTIAL_ENVELOPE:compat}
});
try{fs.rmSync(compat,{force:true});}catch{}
if(result.error)throw result.error;
process.exit(result.status??1);
