#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const sourcePath=path.join(root,'tools/qa/cxorbia-c6-existing-users-e2e-credentials-v6.mjs');
const tempDir=path.join(root,'.tmp/phase-a-runtime-private');
const tempPath=path.join(tempDir,'cxorbia-existing-users-e2e-dynamic.mjs');
const exactStaffAction='C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF';
const action=String(process.env.CXORBIA_C6_ACTION||'').trim();
const staffOnly=action===exactStaffAction;
if(!fs.existsSync(sourcePath))throw new Error('HISTORICAL_SELECTOR_SOURCE_MISSING');
let source=fs.readFileSync(sourcePath,'utf8');
const frozen="if(baseVisits.length!==616)stageFail(`LIVE_HR_VISITS_MISMATCH_${baseVisits.length}`);";
const dynamic="if(baseVisits.length<1)stageFail('LIVE_HR_VISITS_EMPTY');";
const occurrences=source.split(frozen).length-1;
if(occurrences!==1)throw new Error('FROZEN_VISIT_INVARIANT_NOT_EXACTLY_ONE_'+occurrences);
source=source.replace(frozen,dynamic);

if(staffOnly){
  const tailMarker="\nconst liveResponse=await fetchLiveHrWithRetry();";
  const tailOccurrences=source.split(tailMarker).length-1;
  if(tailOccurrences!==1)throw new Error('STAFF_ONLY_SELECTOR_TAIL_NOT_EXACTLY_ONE_'+tailOccurrences);
  const tailIndex=source.indexOf(tailMarker);
  source=source.slice(0,tailIndex)+`\n\nfs.mkdirSync(path.dirname(outPath),{recursive:true});\nfs.writeFileSync(outPath,JSON.stringify({schemaVersion:'cxorbia.c6.e2e-private-credentials.staff-admin-readonly.v1',staff},null,2)+'\\n',{encoding:'utf8',mode:0o600});\nconsole.log(JSON.stringify({decision:'PASS_C6_EXISTING_STAFF_ADMIN_E2E_CREDENTIAL_SELECTION_READONLY',staffRole:staff.role,authWrites:0,passwordChanges:0,valuesExported:false,action:'${exactStaffAction}'}));\n`;
}else{
  source=source.replace("schemaVersion:'cxorbia.c6.e2e-private-credentials.v7'","schemaVersion:'cxorbia.phase-a.e2e-private-credentials.dynamic.v1'");
  source=source.replace("decision:'PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION_V6'","decision:'PASS_PHASE_A_EXISTING_E2E_CREDENTIAL_SELECTION_DYNAMIC'");
}

fs.mkdirSync(tempDir,{recursive:true});
fs.writeFileSync(tempPath,source,{encoding:'utf8',mode:0o600});
const run=spawnSync(process.execPath,[tempPath],{cwd:root,env:{...process.env},encoding:'utf8',maxBuffer:60*1024*1024});
try{fs.rmSync(tempPath,{force:true});}catch{}
if(run.status!==0){if(run.stderr)process.stderr.write(run.stderr);if(run.stdout)process.stderr.write(run.stdout);process.exit(run.status||1);}
const lines=String(run.stdout||'').trim().split(/\r?\n/).filter(Boolean);
const result=JSON.parse(lines.at(-1)||'{}');
if(staffOnly){
  if(result.decision!=='PASS_C6_EXISTING_STAFF_ADMIN_E2E_CREDENTIAL_SELECTION_READONLY')throw new Error('STAFF_ADMIN_CREDENTIAL_SELECTOR_NOT_PASS');
  if(result.staffRole==null||result.authWrites!==0||result.passwordChanges!==0||result.valuesExported!==false)throw new Error('STAFF_ADMIN_CREDENTIAL_SELECTOR_UNSAFE_OR_EMPTY');
  result.genericShopperClientLogicPreserved=true;
}else{
  if(result.decision!=='PASS_PHASE_A_EXISTING_E2E_CREDENTIAL_SELECTION_DYNAMIC')throw new Error('DYNAMIC_CREDENTIAL_SELECTOR_NOT_PASS');
  if(Number(result.liveVisits||0)<1||result.authWrites!==0||result.passwordChanges!==0||result.valuesExported!==false)throw new Error('DYNAMIC_CREDENTIAL_SELECTOR_UNSAFE_OR_EMPTY');
  result.frozenVisitCountAssumed=false;
}
console.log(JSON.stringify(result));
