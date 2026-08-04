#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';

const requestPath=process.argv[2]||'backend/config/corte6-client-auth-materialization-request.json';
const root=process.cwd();
const out=process.env.OUT||'.tmp/c6-client-access-repair';
const privateSnapshot=process.env.PRIVATE_SNAPSHOT||'.tmp/c6-client-access-private/private-snapshot.json';
const privateE2E=process.env.PRIVATE_E2E||'.tmp/c6-client-access-private/private-e2e.json';
const rootUrl=process.env.ROOT_URL||'https://cxorbia-backend-dev.web.app';
const expectedProject=process.env.GCP_PROJECT_ID||'cxorbia-backend-dev';
const stagePath=path.join(out,'stage');
const resultPath=path.join(out,'result.json');
const privateDir=path.dirname(privateSnapshot);
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(privateDir,{recursive:true});

const safeState={authUserCreates:0,passwordChanges:0,passwordResets:0,firestoreBusinessWrites:0,hrWrites:0,rulesDeploys:0,storageWrites:0,hostingDeploys:0,cloudRunDeploys:0,makeWrites:0,geminiCalls:0,paymentsWrites:0,credentialsExposed:false,tokensExposed:false,merge:false,production:false};
let applyCompleted=false;
const writeStage=s=>fs.writeFileSync(stagePath,s+'\n','utf8');
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const outputFile=name=>path.join(out,name);
function fail(code,detail=''){throw new Error(detail?`${code}:${detail}`:code);}
function run(label,script,args=[],extraEnv={},stdoutFile=null){
  writeStage(label);
  const env={...process.env,CXORBIA_EXPECTED_PROJECT:expectedProject,CXORBIA_DEV_ROOT_URL:rootUrl,CXORBIA_CLIENT_AUTH_PRIVATE_SNAPSHOT:privateSnapshot,CXORBIA_E2E_PRIVATE_CREDENTIALS:privateE2E,...extraEnv};
  const r=spawnSync(process.execPath,[script,...args],{cwd:root,env,encoding:'utf8',maxBuffer:80*1024*1024});
  if(stdoutFile)fs.writeFileSync(stdoutFile,String(r.stdout||''),'utf8');
  if(r.status!==0)fail('COMMAND_FAILED',`${label}:${String(r.stderr||r.stdout||'').replace(/[^\x20-\x7E\n]/g,'').slice(0,1800)}`);
  return String(r.stdout||'').trim();
}
function runJson(label,script,args,extraEnv,file){
  run(label,script,args,extraEnv,file);
  return readJson(file);
}
function assert(ok,code){if(!ok)fail(code);}
function validateRequest(r){
  assert(r.schemaVersion==='cxorbia.c6.client-access-repair-runtime-request.v2','REQUEST_SCHEMA');
  assert(r.enabled===true&&r.consumed===false,'REQUEST_STATE');
  assert(r.repository==='paulaosoriof86/demoCXOrbia'&&r.branch==='docs-tya-v6-v71-audit'&&r.pullRequest===7&&r.environment==='DEV','REQUEST_TARGET');
  const parent=execFileSync('git',['rev-parse','HEAD^'],{encoding:'utf8'}).trim();
  assert(r.targetHeadSha===parent,'TARGET_HEAD_MISMATCH');
  assert(r.targetProjectId===expectedProject&&r.tenantId==='tya'&&r.projectId==='cinepolis','PROVIDER_SCOPE');
  assert(r.claims?.role==='cliente'&&r.claims?.authNamespace==='staff'&&r.claims?.tenantId==='tya'&&JSON.stringify(r.claims?.projectIds)==='["cinepolis"]','CLAIMS_SCOPE');
  assert(r.membershipPath==='tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1','MEMBERSHIP_SCOPE');
  assert(r.maxUserCreates===0&&r.maxPasswordChanges===0&&r.maxPasswordResets===0&&r.maxClaimsWrites===1&&r.maxMembershipWrites===1,'WRITE_BOUNDS');
  assert(r.uniqueExactTargetRequired===true&&r.snapshotRequired===true&&r.idempotencyRequired===true&&r.readbackRequired===true&&r.rollbackRequired===true&&r.fullRuntimeRequired===true,'GATES_REQUIRED');
  assert(r.passwordExposureAllowed===false&&r.repositorySecretStorageAllowed===false&&r.evidenceSecretStorageAllowed===false,'SECRET_POLICY');
  for(const k of ['firestoreBusinessWrites','hrWrites','rulesDeploys','storageWrites','hostingDeploys','cloudRunDeploys','makeWrites','geminiCalls','paymentsWrites'])assert(Number(r[k]||0)===0,'UNSAFE_SCOPE_'+k);
  assert(r.merge===false&&r.production===false,'UNSAFE_RELEASE_SCOPE');
  const hold=readJson('app/docs/evidence/CORTE6-EXISTING-CLIENT-CREDENTIAL-SELECTION-LATEST.json');
  assert(hold.decision==='HOLD_C6_EXISTING_CLIENT_CREDENTIAL_NOT_FOUND'&&hold.reason==='HOLD_CLIENT_R4_A3_C0_H0_S0','PRIOR_HOLD_NOT_CURRENT');
  const prior=readJson('app/docs/evidence/CORTE6-CLIENT-AUTH-MATERIALIZATION-LATEST.json');
  assert(prior.decision==='PASS_C6_CLIENT_AUTH_MATERIALIZED_AND_RUNTIME_VALIDATED','PRIOR_CANONICAL_CLIENT_EVIDENCE_MISSING');
}
function publicFailure(error,rollback,failedStage){
  return {schemaVersion:'cxorbia.c6.client-access-repair-runtime-failure.v2',generatedAt:new Date().toISOString(),decision:rollback?.restoredPreState===true?'FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK':'P0_C6_CLIENT_ACCESS_ROLLBACK_FAILED',failedStage:failedStage||'unknown',errorCode:String(error?.message||error).replace(/[^A-Z0-9_:.\/-]/gi,'_').slice(0,500),rollback,...safeState};
}

try{
  writeStage('validate_request');
  const request=readJson(requestPath);validateRequest(request);
  const scripts=['tools/qa/cxorbia-c6-client-auth-materialization.mjs','tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs','tools/qa/cxorbia-c6-existing-client-e2e-credential.mjs','tools/qa/tya-live-hr-dynamic-authority-gate.mjs','tools/qa/tya-c6-remote-parity-gate.mjs','tools/qa/tya-c6-unified-human-auth-browser-smoke.mjs','tools/qa/tya-c6-client-auth-browser-smoke.mjs','tools/qa/tya-phase-a-remote-domain-dynamic-wrapper.mjs'];
  for(const s of scripts){assert(fs.existsSync(s),'SCRIPT_MISSING_'+s);const c=spawnSync(process.execPath,['--check',s],{encoding:'utf8'});assert(c.status===0,'SCRIPT_SYNTAX_'+s);}

  const snapshot=runJson('snapshot_client_access','tools/qa/cxorbia-c6-client-auth-materialization.mjs',['--mode=snapshot'],{},outputFile('snapshot.source-safe.json'));
  assert(snapshot.decision==='PASS_C6_CLIENT_AUTH_MEMBERSHIP_PREWRITE_SNAPSHOT'&&snapshot.targetUnique===true&&snapshot.passwordSignIn===true,'SNAPSHOT_NOT_PASS');
  assert(snapshot.authWrites===0&&snapshot.membershipWrites===0&&snapshot.authUserCreates===0,'SNAPSHOT_UNSAFE');

  const apply=runJson('apply_client_access','tools/qa/cxorbia-c6-client-auth-materialization.mjs',['--mode=apply'],{},outputFile('apply.source-safe.json'));
  applyCompleted=true;
  assert(['PASS_C6_CLIENT_AUTH_MEMBERSHIP_REPAIRED','PASS_C6_CLIENT_AUTH_MEMBERSHIP_IDEMPOTENT_NOOP'].includes(apply.decision),'APPLY_DECISION');
  assert(Number(apply.authWrites||0)<=1&&Number(apply.membershipWrites||0)<=1&&Number(apply.authUserCreates||0)===0&&apply.passwordSignIn===true,'APPLY_BOUNDS');

  const idempotency=runJson('prove_idempotency','tools/qa/cxorbia-c6-client-auth-materialization.mjs',['--mode=apply'],{},outputFile('idempotency.source-safe.json'));
  assert(idempotency.decision==='PASS_C6_CLIENT_AUTH_MEMBERSHIP_IDEMPOTENT_NOOP'&&idempotency.authWrites===0&&idempotency.membershipWrites===0,'IDEMPOTENCY_NOT_PASS');

  const readback=runJson('readback_client_access','tools/qa/cxorbia-c6-client-auth-materialization.mjs',['--mode=readback'],{},outputFile('readback.source-safe.json'));
  assert(readback.decision==='PASS_C6_CLIENT_AUTH_MEMBERSHIP_READBACK'&&readback.target?.claimsExact===true&&readback.membership?.membershipExact===true&&readback.passwordSignIn===true,'READBACK_NOT_PASS');

  const staffShopper=runJson('select_staff_shopper','tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs',[],{PRIVATE_DIR:privateDir,OUT_DIR:out},outputFile('credential-selection-staff-shopper.source-safe.json'));
  assert(staffShopper.decision==='PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION'&&staffShopper.authWrites===0&&staffShopper.passwordChanges===0&&staffShopper.valuesExported===false,'STAFF_SHOPPER_SELECTION');
  const clientSelection=runJson('select_canonical_client','tools/qa/cxorbia-c6-existing-client-e2e-credential.mjs',[],{},outputFile('credential-selection-client.source-safe.json'));
  assert(clientSelection.decision==='PASS_C6_EXISTING_CANONICAL_CLIENT_CREDENTIAL_SELECTION'&&clientSelection.claimsValid===true&&clientSelection.membershipValid===true,'CLIENT_SELECTION');
  const privateBundle=readJson(privateE2E);
  assert(privateBundle?.staff?.login&&privateBundle?.staff?.password&&privateBundle?.shopper?.login&&privateBundle?.shopper?.password&&privateBundle?.client?.login&&privateBundle?.client?.password,'PRIVATE_BUNDLE_INCOMPLETE');

  run('runtime_live_authority','tools/qa/tya-live-hr-dynamic-authority-gate.mjs',[rootUrl],{CXORBIA_LIVE_AUTHORITY_OUTPUT:outputFile('live-hr-authority.source-safe.json')},outputFile('live-authority.log'));
  const liveJson=readJson(outputFile('live-hr-authority.source-safe.json'));
  assert(liveJson.decision==='PASS_TYA_LIVE_HR_DYNAMIC_AUTHORITY'&&liveJson.frozenVisitCountAssumed===false&&liveJson.frozenLatestPeriodAssumed===false,'LIVE_AUTHORITY');

  run('runtime_remote_parity','tools/qa/tya-c6-remote-parity-gate.mjs',[rootUrl],{CXORBIA_REMOTE_PARITY_OUTPUT:outputFile('remote-parity.source-safe.json'),CXORBIA_REMOTE_PARITY_ATTEMPTS:'3',CXORBIA_REMOTE_PARITY_WAIT_MS:'3000'},outputFile('remote-parity.log'));
  const parity=readJson(outputFile('remote-parity.source-safe.json'));
  assert(parity.decision==='PASS_C6_HOSTING_DEV_REMOTE_PARITY_AND_LIVE_HR'&&parity.allCriticalAssetsMatch===true&&parity.liveEndpoint?.ok===true,'REMOTE_PARITY');

  run('runtime_staff_shopper','tools/qa/tya-c6-unified-human-auth-browser-smoke.mjs',[rootUrl],{CXORBIA_HUMAN_GATE_OUTPUT:outputFile('human-auth.source-safe.json')},outputFile('human-auth.log'));
  const human=readJson(outputFile('human-auth.source-safe.json'));
  assert(human.decision==='PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_SHOPPER_RUNTIME_CLIENT_ROUTE_READY'&&human.staff?.reloadsStable===true&&human.staff?.newTabStable===true&&human.shopper?.reloadsStable===true&&human.shopper?.newTabStable===true,'STAFF_SHOPPER_RUNTIME');

  run('runtime_client','tools/qa/tya-c6-client-auth-browser-smoke.mjs',[rootUrl],{CXORBIA_CLIENT_GATE_OUTPUT:outputFile('client-runtime.source-safe.json')},outputFile('client-runtime.log'));
  const client=readJson(outputFile('client-runtime.source-safe.json'));
  assert(client.decision==='PASS_C6_CLIENT_AUTH_EXISTING_CREDENTIAL_RUNTIME'&&client.authenticated===true&&client.reloadsStable===true&&client.newTabStable===true,'CLIENT_RUNTIME');

  run('runtime_domain_finance_portals_reservations','tools/qa/tya-phase-a-remote-domain-dynamic-wrapper.mjs',[rootUrl],{CXORBIA_REMOTE_SEMANTIC_OUTPUT:outputFile('domain-runtime.source-safe.json')},outputFile('domain-runtime.log'));
  const domain=readJson(outputFile('domain-runtime.source-safe.json'));
  assert(domain.decision==='PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC'&&domain.client?.authenticated===true&&domain.shopper?.authenticated===true,'DOMAIN_RUNTIME');
  assert(domain.finance?.model==='delegado'&&Number(domain.finance?.royaltyPct||0)===0&&domain.finance?.valuesInvented===false,'FINANCE_RUNTIME');
  assert(domain.reservations?.browserLocalStorageAsSource===false&&domain.reservations?.mutationsEnabled===false,'RESERVATIONS_RUNTIME');

  assert(Number(human.staff?.visits||0)===Number(liveJson.visits)&&Number(client.visits||0)===Number(liveJson.visits)&&Number(domain.source?.visits||0)===Number(liveJson.visits),'VISIT_PARITY');
  assert(human.staff?.latestPeriod===liveJson.latestPeriod&&client.latestPeriod===liveJson.latestPeriod&&domain.source?.latestPeriod===liveJson.latestPeriod,'LATEST_PERIOD_PARITY');

  const rollbackProof=runJson('rollback_dry_run','tools/qa/cxorbia-c6-client-auth-materialization.mjs',['--mode=rollback-dry-run'],{},outputFile('rollback-proof.source-safe.json'));
  assert(rollbackProof.decision==='PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT_DRY_RUN'&&rollbackProof.canRollbackExactly===true,'ROLLBACK_PROOF');

  const evidence={schemaVersion:'cxorbia.c6.client-access-repair-runtime-evidence.v2',generatedAt:new Date().toISOString(),decision:'PASS_C6_CLIENT_ACCESS_AND_PHASE_A_RUNTIME',authorizationId:'C6_CLIENT_ACCESS_REPAIR_RUNTIME_20260804',
    diagnosis:{targetUnique:snapshot.targetUnique,claimsExactBefore:snapshot.target?.claimsExact===true,membershipExactBefore:snapshot.membership?.membershipExact===true,potentialClientIdentityCount:snapshot.potentialClientIdentityCount},
    repair:{decision:apply.decision,authWrites:Number(apply.authWrites||0),claimsWrites:Number(apply.claimsWrites||0),membershipWrites:Number(apply.membershipWrites||0),userCreates:0,passwordChanges:0,passwordResets:0,idempotency:idempotency.decision,readback:readback.decision},
    runtime:{liveAuthority:liveJson,remoteParity:{decision:parity.decision,assets:parity.files?.length||0,liveHrOk:parity.liveEndpoint?.ok===true},staff:human.staff,shopper:human.shopper,client,domain:{decision:domain.decision,source:domain.source,finance:domain.finance,reservations:domain.reservations,client:domain.client,shopper:domain.shopper}},rollbackProof,
    safety:{...safeState,authWrites:Number(apply.authWrites||0),membershipWrites:Number(apply.membershipWrites||0)}};
  fs.writeFileSync(resultPath,JSON.stringify(evidence,null,2)+'\n','utf8');
  console.log(JSON.stringify({decision:evidence.decision,resultPath,authWrites:evidence.repair.authWrites,membershipWrites:evidence.repair.membershipWrites,liveVisits:liveJson.visits,latestPeriod:liveJson.latestPeriod}));
}catch(error){
  const failedStageBeforeRollback=fs.existsSync(stagePath)?fs.readFileSync(stagePath,'utf8').trim():'unknown';
  let rollback={decision:'PASS_C6_CLIENT_ACCESS_ROLLBACK_NOT_REQUIRED',restoredPreState:true,authWrites:0,membershipWrites:0};
  if(applyCompleted&&fs.existsSync(privateSnapshot)){
    try{
      const file=outputFile('rollback-after-failure.source-safe.json');
      rollback=runJson('rollback_after_failure','tools/qa/cxorbia-c6-client-auth-materialization.mjs',['--mode=rollback'],{},file);
    }catch(rollbackError){rollback={decision:'P0_C6_CLIENT_ACCESS_ROLLBACK_FAILED',restoredPreState:false,errorCode:String(rollbackError?.message||rollbackError).slice(0,300)};}
  }
  const failure=publicFailure(error,rollback,failedStageBeforeRollback);
  fs.writeFileSync(resultPath,JSON.stringify(failure,null,2)+'\n','utf8');
  console.error(JSON.stringify({decision:failure.decision,failedStage:failure.failedStage,errorCode:failure.errorCode}));
  process.exitCode=1;
}
