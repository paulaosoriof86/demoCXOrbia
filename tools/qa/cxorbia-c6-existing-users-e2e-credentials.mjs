import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const genericScript=fileURLToPath(new URL('./cxorbia-phase-a-existing-users-e2e-credentials-dynamic.mjs',import.meta.url));
const staffScript=fileURLToPath(new URL('./cxorbia-c6-canonical-staff-admin-e2e-credential.mjs',import.meta.url));
const original=process.env.CXORBIA_CREDENTIAL_ENVELOPE||'backend/private-inbox/corte6-credential-bundle.enc.json';
const privateDir=process.env.PRIVATE_DIR||'.tmp/c6-real-users-e2e-private';
const normalizedEnvelope=path.join(privateDir,'credential-envelope-target-normalized.json');
const exactStaffAction='C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF';
const action=String(process.env.CXORBIA_C6_ACTION||'').trim();
const staffOnly=action===exactStaffAction;
fs.mkdirSync(privateDir,{recursive:true});

let env={...process.env};
let normalizedCreated=false;
if(!staffOnly){
  const envelope=JSON.parse(fs.readFileSync(original,'utf8'));
  if(!envelope.tenantId) envelope.tenantId='tya';
  fs.writeFileSync(normalizedEnvelope,JSON.stringify(envelope)+'\n',{encoding:'utf8',mode:0o600});
  normalizedCreated=true;
  env={...process.env,CXORBIA_CREDENTIAL_ENVELOPE:normalizedEnvelope};
}

const script=staffOnly?staffScript:genericScript;
const run=spawnSync(process.execPath,[script],{env,encoding:'utf8'});
if(normalizedCreated){try{fs.rmSync(normalizedEnvelope,{force:true});}catch{}}
if(run.status!==0){
  if(run.stderr) process.stderr.write(run.stderr);
  if(run.stdout) process.stderr.write(run.stdout);
  process.exit(run.status||1);
}
const lines=String(run.stdout||'').trim().split(/\r?\n/).filter(Boolean);
const result=JSON.parse(lines.at(-1)||'{}');
if(staffOnly){
  if(result.decision!=='PASS_C6_EXISTING_STAFF_ADMIN_E2E_CREDENTIAL_SELECTION_READONLY') throw new Error('credential_selector_staff_admin_not_pass');
  if(result.action!==exactStaffAction||result.authWrites!==0||result.passwordChanges!==0||result.valuesExported!==false) throw new Error('credential_selector_staff_admin_not_safe');
  if(result.shopperSelection!==false||result.clientSelection!==false)throw new Error('credential_selector_staff_admin_scope_exceeded');
  if(result.exactWriteCanonical!==true||result.legacyCredentialBundleUsed!==false||result.canonicalTargetAlias!=='B'||result.staffRole!=='admin')throw new Error('credential_selector_staff_admin_not_exact_write_canonical');
  result.genericShopperClientLogicPreserved=true;
}else{
  if(result.decision!=='PASS_PHASE_A_EXISTING_E2E_CREDENTIAL_SELECTION_DYNAMIC') throw new Error('credential_selector_dynamic_not_pass');
  result.decision='PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION';
  result.frozenVisitCountAssumed=false;
}
console.log(JSON.stringify(result));
