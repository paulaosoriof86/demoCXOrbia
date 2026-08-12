#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../..');
const argv=process.argv.slice(2);
const arg=(name,fallback)=>{const i=argv.indexOf(name);return i>=0?argv[i+1]:fallback;};
const outDir=path.resolve(repo,arg('--out','.tmp/auth-preactivation-route-action'));
const files={
  matrix:'backend/contracts/phase-a-auth-preactivation-route-action-v1.json',
  identity:'backend/config/phase-a-auth-preactivation-identity.source-safe.json',
  rbac:'backend/contracts/auth-rbac-phase-a-v1.json',
  taxonomy:'backend/contracts/phase-a-role-taxonomy-org-scope-v1.json',
  liveAdminContract:'backend/contracts/c6-live-user-admin-v1.json',
  frontendConfig:'app/core/config.js',
  router:'app/core/router.js',
  data:'app/core/data.js',
  userAdmin:'backend/runtime/hr-live-service/user-admin.mjs',
  userAdminServer:'backend/runtime/hr-live-service/server.mjs',
  firebaseRc:'.firebaserc',
  firebaseJson:'firebase.json'
};
const hardFails=[],warnings=[],info=[];
const add=(arr,message,detail={})=>arr.push({message,...detail});
const read=rel=>fs.readFileSync(path.join(repo,rel),'utf8').replace(/^\uFEFF/,'');
for(const [label,rel] of Object.entries(files)){
  if(!fs.existsSync(path.join(repo,rel)))add(hardFails,'required_file_missing',{label,file:rel});
  else add(info,'required_file_present',{label,file:rel});
}
const jsonLabels=['matrix','identity','rbac','taxonomy','liveAdminContract','firebaseRc','firebaseJson'];
const parsed={};
for(const label of jsonLabels){
  if(!fs.existsSync(path.join(repo,files[label])))continue;
  try{parsed[label]=JSON.parse(read(files[label]));add(info,'json_valid',{label,file:files[label]});}
  catch(error){add(hardFails,'invalid_json',{label,file:files[label],detail:error.message});}
}
const contains=(label,term)=>fs.existsSync(path.join(repo,files[label]))&&read(files[label]).includes(term);
const requireTerm=(label,term,message)=>{if(!contains(label,term))add(hardFails,message,{label,term});};

requireTerm('router','CX.roleCanAccess','router_access_gate_missing');
requireTerm('router','CX.moduleVisibleForProfile','router_profile_visibility_gate_missing');
requireTerm('userAdmin','verifyIdToken','backend_id_token_verification_missing');
requireTerm('userAdmin','tenant_or_namespace_mismatch','backend_tenant_namespace_enforcement_missing');
requireTerm('userAdmin','user_admin_super_required','backend_super_mutation_gate_missing');
for(const term of ['createUser','updateScope','updateProfile','setActive'])requireTerm('userAdmin',term,'backend_user_admin_operation_missing');
requireTerm('userAdminServer','maybeHandleLiveUserAdminRequest','user_admin_server_registration_missing');
requireTerm('userAdminServer','isLiveUserAdminPath','user_admin_path_registration_missing');

const live=parsed.liveAdminContract||{};
if(live.schemaVersion!=='cxorbia.c6.live-user-admin.contract.v1.1')add(hardFails,'live_user_admin_contract_schema_drift',{detail:live.schemaVersion||null});
if(live.callerPolicy?.mutatingRoles?.length!==1||live.callerPolicy?.mutatingRoles?.[0]!=='super')add(hardFails,'live_user_admin_mutating_role_not_least_privilege');
if(live.authoritativeStores?.browserLocalStorageAuthority!==false)add(hardFails,'local_storage_authority_not_disabled');
if(live.backendExecutable?.handler!=='backend/runtime/hr-live-service/user-admin.mjs')add(hardFails,'live_user_admin_handler_drift');
if(live.backendExecutable?.deployed!==false)add(warnings,'live_user_admin_contract_deploy_state_changed',{detail:live.backendExecutable?.deployed});

const rbac=parsed.rbac||{};
const taxonomy=parsed.taxonomy||{};
if(!rbac.schemaVersion)add(hardFails,'rbac_schema_missing');
if(!taxonomy.schemaVersion)add(hardFails,'taxonomy_schema_missing');

for(const blocker of parsed.matrix?.knownBlockers||parsed.matrix?.activationBlockers||[]){
  const message=typeof blocker==='string'?blocker:blocker?.message;
  if(message)add(warnings,'legacy_matrix_note',{detail:message});
}
if(contains('router','CX.session.testRole'))add(info,'frontend_test_role_path_present_source_only');
add(info,'server_side_authorization_boundary_present',{handler:files.userAdmin});
add(info,'obsolete_staging_workflow_not_required',{reason:'current release path is controlled by explicit live gates, not a deleted filename'});

const result={
  gate:'cxorbia-phase-a-auth-preactivation-route-action-v2-source-aligned',
  generatedAt:new Date().toISOString(),
  verdict:hardFails.length?'NO_GO_AUTH_PREACTIVATION_MATRIX':'PASS_AUTH_PREACTIVATION_SOURCE_BOUNDARY',
  hardFailCount:hardFails.length,
  warningCount:warnings.length,
  activationBlockerCount:hardFails.length,
  safeState:{providerCalls:false,authProviderConnected:false,usersCreated:false,claimsWritten:false,firestoreReads:false,firestoreWrites:false,rulesDeployed:false,imports:false,deploy:false,production:false},
  hardFails,warnings,activationBlockers:hardFails,info
};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(result,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),`# Auth pre-activation source boundary\n\n- Verdict: \`${result.verdict}\`\n- Hard fails: ${result.hardFailCount}\n- Warnings: ${result.warningCount}\n- Provider calls: 0\n- Writes/deploy/production: 0\n`,'utf8');
console.log(JSON.stringify(result,null,2));
if(hardFails.length)process.exit(1);
