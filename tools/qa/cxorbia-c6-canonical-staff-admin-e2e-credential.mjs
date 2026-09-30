#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {loadStaffPrivateExecutionHandoff} from '../../backend/runtime/private-handoff/c6-staff-private-execution-handoff.mjs';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId='tya';
const canonicalProjectId='cinepolis';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const outPath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-users-e2e-private/private-e2e.json';
const exactAction='C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF';
const action=String(process.env.CXORBIA_C6_ACTION||'').trim();
const TARGET_ALIAS='B';
const TARGET_ROLE='admin';

const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const norm=v=>String(v??'').trim().toLowerCase();

function stageFail(message){
  const safe=String(message||'unknown').replace(/[^A-Z0-9_:-]/gi,'_').slice(0,180);
  if(process.env.OUT_DIR){
    try{
      fs.mkdirSync(process.env.OUT_DIR,{recursive:true});
      fs.writeFileSync(path.join(process.env.OUT_DIR,'stage'),'select_exact_write_canonical_staff_admin__'+safe+'\n','utf8');
    }catch{}
  }
  throw new Error(safe);
}

if(action!==exactAction)stageFail('STAFF_ACTION_NOT_EXACT');
if(!credentialPath||!fs.existsSync(credentialPath))stageFail('SERVICE_ACCOUNT_PATH_MISSING');
const serviceAccount=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(serviceAccount.project_id!==expectedProject||typeof serviceAccount.private_key!=='string')stageFail('WRONG_SERVICE_ACCOUNT');

let handoff;
let passwordBuffer;
try{
  handoff=loadStaffPrivateExecutionHandoff({credentialPath});
  const login=norm(handoff.getVisibleLogin(TARGET_ALIAS));
  ensure(login,'PRIVATE_HANDOFF_LOGIN_MISSING_B');

  const ikm=Buffer.from(serviceAccount.private_key,'utf8');
  const salt=crypto.createHash('sha256').update(`cxorbia-c6-staff-v2-credential-salt\0${tenantId}\0${TARGET_ALIAS}\0${login}`,'utf8').digest();
  try{
    passwordBuffer=Buffer.from(crypto.hkdfSync(
      'sha256',
      ikm,
      salt,
      Buffer.from(`cxorbia-c6-staff-v2-private-handoff-ephemeral-password\0${TARGET_ALIAS}`,'utf8'),
      24
    ));
  }finally{
    ikm.fill(0);
    salt.fill(0);
  }
  const password=passwordBuffer.toString('base64url');
  ensure(password.length>=12,'PRIVATE_HANDOFF_CREDENTIAL_DERIVATION_B');
  ensure(password!==login,'PRIVATE_RUNTIME_CREDENTIAL_EQUALS_LOGIN_B');

  fs.mkdirSync(path.dirname(outPath),{recursive:true});
  fs.writeFileSync(outPath,JSON.stringify({
    schemaVersion:'cxorbia.c6.e2e-private-credentials.staff-admin-canonical-exact-write.v1',
    staff:{login,password,namespace:'staff',role:TARGET_ROLE,canonicalTargetAlias:TARGET_ALIAS}
  },null,2)+'\n',{encoding:'utf8',mode:0o600});

  console.log(JSON.stringify({
    decision:'PASS_C6_EXISTING_STAFF_ADMIN_E2E_CREDENTIAL_SELECTION_READONLY',
    action:exactAction,
    staffRole:TARGET_ROLE,
    canonicalTargetAlias:TARGET_ALIAS,
    credentialSource:'C6_STAFF_EXACT_WRITE_V2_PRIVATE_HANDOFF_DERIVED',
    tenantId,
    projectId:canonicalProjectId,
    exactWriteCanonical:true,
    legacyCredentialBundleUsed:false,
    authWrites:0,
    passwordChanges:0,
    valuesExported:false,
    hrReads:0,
    firestoreReads:0,
    shopperSelection:false,
    clientSelection:false
  }));
}catch(error){
  stageFail(error?.message||error);
}finally{
  try{passwordBuffer?.fill(0);}catch{}
  try{handoff?.dispose?.();}catch{}
}
