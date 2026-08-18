#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const ROOT=process.cwd();
const requestPath=process.argv[2]||'.github/cxorbia-gate-requests/request.json';
const profile='I3_STAFF_RUNTIME_AUTHORITY_READONLY';
const expectedAction='C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF';
const runtimeRoot=process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app';
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/i3-staff-authority-private/private-e2e.json';
const outDir='.tmp/i3-staff-authority-readonly';
const runtimeFile=path.join(outDir,'staff-runtime.json');
const rulesFile=path.join(outDir,'firestore-rules-deploy.json');
const reportDir='.tmp/cxorbia-readonly-post-gates-runner';
const reportFile=path.join(reportDir,'report.json');
const reportMd=path.join(reportDir,'report.md');
const frozenShopper='app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json';
const frozenShopperSource='e4d6de3e97745dfa777c9c585d75c72de61d3d17';
const targetLiveShopperId='shp-57d2e3769946';
const targetCanonicalShopperId='TYA_GT_0C0BA8856E';
const safeState={repositoryWrites:false,dataWrites:false,deploy:false,merge:false,production:false,imports:false,payments:false,make:false,gemini:false,firestoreWrites:false,authWrites:false,storageWrites:false,hrWrites:false};

const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const run=(cmd,args,opts={})=>spawnSync(cmd,args,{cwd:ROOT,encoding:'utf8',env:{...process.env,...(opts.env||{})},maxBuffer:30*1024*1024});
const git=args=>{const r=run('git',args);if(r.status!==0)throw new Error('GIT_'+args.join('_')+'_'+String(r.stderr||r.stdout||'').slice(0,240));return String(r.stdout||'').trim();};
const unique=a=>[...new Set(a)];
const gitHasObject=spec=>run('git',['cat-file','-e',spec]).status===0;
function ensureFrozenSource(sha){
  if(gitHasObject(`${sha}^{commit}`))return;
  const fetched=run('git',['fetch','--no-tags','--depth=1','origin',sha]);
  if(fetched.status!==0)throw new Error('FROZEN_SOURCE_FETCH_FAILED_'+String(fetched.stderr||fetched.stdout||'').replace(/[^A-Za-z0-9_.:/=-]+/g,'_').slice(0,240));
  if(!gitHasObject(`${sha}^{commit}`))throw new Error('FROZEN_SOURCE_NOT_RESOLVABLE_AFTER_FETCH');
}

fs.mkdirSync(outDir,{recursive:true});
fs.mkdirSync(reportDir,{recursive:true});
let request=null,runtime=null,rules=null;
const checks=[],blockers=[];
const pass=(code,detail='')=>checks.push(detail?`${code}:${detail}`:code);
const fail=(code,detail='')=>blockers.push(detail?`${code}:${detail}`:code);

function finalize(status){
  const i311c=Boolean(request?.i3_11c?.authorized===true);
  const report={
    schemaVersion:'cxorbia.i3.staff-authority-readonly.v1',runner:'CXORBIA_READONLY_POST_GATES_RUNNER',generatedAt:new Date().toISOString(),
    status,repository:process.env.GITHUB_REPOSITORY||null,branch:process.env.GITHUB_REF_NAME||null,eventName:process.env.GITHUB_EVENT_NAME||null,requestPath,
    requestId:request?.requestId||null,requestCommitSha:git(['rev-parse','HEAD']),targetHeadSha:request?.targetHeadSha||null,profile,
    i3_11c:i311c?{authorized:true,rules,staffReadonlyExecuted:runtime?.staffReadonlyExecuted===true}:null,
    checks,blockers,commands:i311c
      ? ['One authorized Firestore Rules DEV deploy maximum with exact readback','One Staff-only canonical Admin browser read on push event only; no Shopper credential selection']
      : ['Staff-only canonical Admin browser read; no Shopper credential selection'],
    summary:{
      i3_4:runtime?.i3?.i3_4||null,
      i3_5:runtime?.i3?.i3_5||null,
      i3_6:runtime?.i3?.i3_6||null,
      i3_7:runtime?.i3?.i3_7||null,
      staffRuntimeDecision:runtime?.staffRuntimeDecision||null,
      safety:runtime?.safety||safeState
    },
    safeState:{...safeState,firestoreRulesAuthorized:i311c}
  };
  fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n','utf8');
  fs.writeFileSync(reportMd,[
    '# CXOrbia I3 Staff authority read-only',
    '',`- Status: \`${status}\``,`- Request: \`${report.requestId||'n/a'}\``,`- Target HEAD: \`${report.targetHeadSha||'n/a'}\``,`- Event: \`${report.eventName||'n/a'}\``,
    ...(i311c?['', '## I3.11C Firestore Rules', '```json',JSON.stringify(report.i3_11c,null,2),'```']:[]),
    '', '## I3.4', '```json',JSON.stringify(report.summary.i3_4,null,2),'```',
    '', '## I3.5', '```json',JSON.stringify(report.summary.i3_5,null,2),'```',
    '', '## I3.6', '```json',JSON.stringify(report.summary.i3_6,null,2),'```',
    '', '## I3.7', '```json',JSON.stringify(report.summary.i3_7,null,2),'```',
    '', '## Blockers',...(blockers.length?blockers.map(x=>`- ${x}`):['- none'])
  ].join('\n')+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(runtime||report.summary,null,2)+'\n','utf8');
  return status==='PASS_READONLY_POST_GATES'?0:2;
}

function validateI311cRequest(parent){
  const c=request?.i3_11c||{};
  if(c.authorized!==true)fail('I3_11C_AUTHORIZATION_MISSING');else pass('I3_11C_AUTHORIZATION_PRESENT');
  if(c.authorizationId!=='PAULA_CURRENT_CONVERSATION_I3_11C_20260818_1051')fail('I3_11C_AUTHORIZATION_ID');else pass('I3_11C_AUTHORIZATION_ID');
  if(c.firebaseProjectId!=='cxorbia-backend-dev'||c.rulesSourcePath!=='firestore.rules')fail('I3_11C_RULES_TARGET');else pass('I3_11C_RULES_TARGET');
  if(Number(c.maxRulesDeploys)!==1||Number(c.staffReadonlyExecutions)!==1||c.noAutomaticRetry!==true||c.executeOnlyOnEvent!=='push')fail('I3_11C_ONE_SHOT_SCOPE');else pass('I3_11C_ONE_SHOT_SCOPE');
  const zeroKeys=['hostingDeploys','cloudRunDeploys','authClaimWrites','authUserCreates','authUserUpdates','authUserDeletes','passwordChanges','passwordResets','firestoreDataWrites','hrWrites','storageWrites','makeWrites','geminiCalls','paymentWrites','historicalShopperAccess'];
  for(const k of zeroKeys)if(Number(c[k]||0)!==0)fail('I3_11C_FORBIDDEN_'+k);
  if(c.merge!==false||c.production!==false||c.reuseFrozenI3_9!==true||c.reuseFrozenI3_10!==true)fail('I3_11C_FREEZE_SCOPE');
  const changed=git(['diff','--name-only','HEAD^','HEAD']).split(/\r?\n/).filter(Boolean);
  if(changed.length!==1||changed[0]!==requestPath)fail('I3_11C_REQUEST_ONLY_COMMIT',changed.join(','));else pass('I3_11C_REQUEST_ONLY_COMMIT');
  const beforeBlob=git(['rev-parse',`${parent}:firestore.rules`]);
  const nowBlob=git(['rev-parse','HEAD:firestore.rules']);
  if(!/^[a-f0-9]{40}$/.test(String(c.expectedRulesBlobSha||''))||beforeBlob!==c.expectedRulesBlobSha||nowBlob!==c.expectedRulesBlobSha)fail('I3_11C_RULES_BLOB_LOCK',`${beforeBlob}:${nowBlob}`);else pass('I3_11C_RULES_BLOB_LOCK',beforeBlob);
}

function executeI311cRules(){
  const c=request.i3_11c;
  if(process.env.GITHUB_RUN_ATTEMPT&&String(process.env.GITHUB_RUN_ATTEMPT)!=='1')throw new Error('I3_11C_RETRY_FORBIDDEN');
  if(!process.env.GOOGLE_APPLICATION_CREDENTIALS||!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS))throw new Error('I3_11C_SERVICE_ACCOUNT_MISSING');
  const install=run('npm',['install','--no-save','--ignore-scripts','--package-lock=false','firebase-admin@13.4.0']);
  if(install.status!==0)throw new Error('I3_11C_FIREBASE_ADMIN_INSTALL_FAILED_'+String(install.stderr||install.stdout||'').slice(0,240));
  const syntax=run('node',['--check','tools/release/cxorbia-corte6-firestore-rules-deploy.mjs']);
  if(syntax.status!==0)throw new Error('I3_11C_RULES_SCRIPT_SYNTAX');
  const baseEnv={
    CXORBIA_EXPECTED_PROJECT:c.firebaseProjectId,
    CXORBIA_RULES_SOURCE:c.rulesSourcePath,
    CXORBIA_RULES_DEPLOY_REPORT:rulesFile
  };
  const dry=run('node',['tools/release/cxorbia-corte6-firestore-rules-deploy.mjs'],{env:{...baseEnv,CXORBIA_EXECUTE_FIRESTORE_RULES:'false'}});
  if(dry.status!==0||!fs.existsSync(rulesFile))throw new Error('I3_11C_RULES_DRYRUN_FAILED_'+String(dry.stderr||dry.stdout||'').slice(0,320));
  const dryReport=readJson(rulesFile);
  if(!['DRY_RUN_READY_DIRECT_RULES_API','DRY_RUN_ALREADY_CURRENT'].includes(dryReport.decision)||dryReport.projectId!==c.firebaseProjectId||dryReport.sourceSha256==null)throw new Error('I3_11C_RULES_DRYRUN_NOT_READY_'+String(dryReport.decision||'missing'));
  pass('I3_11C_RULES_DRYRUN',dryReport.decision);
  const exec=run('node',['tools/release/cxorbia-corte6-firestore-rules-deploy.mjs'],{env:{...baseEnv,CXORBIA_EXECUTE_FIRESTORE_RULES:'true'}});
  if(exec.status!==0||!fs.existsSync(rulesFile))throw new Error('I3_11C_RULES_EXECUTION_FAILED_'+String(exec.stderr||exec.stdout||'').slice(0,320));
  const r=readJson(rulesFile);
  if(!['PASS_DIRECT_FIRESTORE_RULES_DEPLOY_VERIFIED','PASS_ALREADY_CURRENT_NO_RULES_WRITE'].includes(r.decision)||r.verified!==true||r.projectId!==c.firebaseProjectId||r.after?.sourceSha256!==r.sourceSha256)throw new Error('I3_11C_RULES_READBACK_NOT_VERIFIED_'+String(r.decision||'missing'));
  if(Number(r.safety?.authWrites||0)!==0||Number(r.safety?.firestoreDataWrites||0)!==0||Number(r.safety?.storageWrites||0)!==0||Number(r.safety?.hostingDeploys||0)!==0||r.safety?.production!==false||r.safety?.merge!==false)throw new Error('I3_11C_RULES_SAFETY_SCOPE_EXCEEDED');
  const logicalDeploys=r.decision==='PASS_DIRECT_FIRESTORE_RULES_DEPLOY_VERIFIED'?1:0;
  if(logicalDeploys>1||Number(r.providerWrites||0)>2)throw new Error('I3_11C_RULES_WRITE_BUDGET_EXCEEDED');
  rules={decision:r.decision,projectId:r.projectId,releaseName:r.releaseName,sourceSha256:r.sourceSha256,before:r.before,after:r.after,verified:true,logicalDeploys,providerWrites:Number(r.providerWrites||0),alreadyCurrent:r.alreadyCurrent===true};
  pass('I3_11C_RULES_READBACK_VERIFIED',r.decision);
}

try{
  request=readJson(requestPath);
  const parent=git(['rev-parse','HEAD^']);
  const i311c=Boolean(request?.i3_11c?.authorized===true);
  if(request.schemaVersion!=='cxorbia.readonly-post-gates-request.v1')fail('REQUEST_SCHEMA');else pass('REQUEST_SCHEMA');
  if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit'||Number(request.pullRequest)!==7)fail('REQUEST_TARGET');else pass('REQUEST_TARGET');
  if(request.enabled!==true||request.consumed!==false||request.allowedExecutions!==1)fail('REQUEST_SINGLE_USE');else pass('REQUEST_SINGLE_USE');
  if(request.profile!==profile||!Array.isArray(request.allowedProfiles)||!request.allowedProfiles.includes(profile))fail('PROFILE_EXACT');else pass('PROFILE_EXACT');
  if(request.targetHeadSha!==parent)fail('TARGET_HEAD_EXACT',`${request.targetHeadSha||'null'}!=${parent}`);else pass('TARGET_HEAD_EXACT',parent);
  if(request.repositoryWrites!==false||request.dataWrites!==false||request.deploy!==false||request.merge!==false||request.production!==false)fail('WRITE_DEPLOY_SCOPE');else pass('WRITE_DEPLOY_SCOPE');
  for(const [k,v] of Object.entries(safeState))if(request.safeState?.[k]!==v)fail('SAFE_STATE_'+k);
  if(i311c)validateI311cRequest(parent);

  if(blockers.length)process.exitCode=finalize('HOLD_READONLY_POST_GATES');
  else if(i311c&&String(process.env.GITHUB_EVENT_NAME||'')!=='push'){
    pass('I3_11C_NON_PUSH_DUPLICATE_EVENT_SKIPPED',String(process.env.GITHUB_EVENT_NAME||'unknown'));
    runtime={schemaVersion:'cxorbia.i3.staff-authority-readonly.result.v1',generatedAt:new Date().toISOString(),staffReadonlyExecuted:false,i3:{},safety:{historicalShopperAccess:0,shopperCredentialSelection:0,userCreates:0,userUpdates:0,passwordChanges:0,passwordResets:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,hostingDeploys:0,cloudRunDeploys:0,merge:false,production:false,credentialsExposed:false,tokensExposed:false}};
    process.exitCode=finalize('PASS_READONLY_POST_GATES');
  }else{
    if(i311c)executeI311cRules();
    if(!fs.existsSync(privatePath)){fail('PRIVATE_STAFF_CREDENTIAL_MISSING');process.exitCode=finalize('HOLD_READONLY_POST_GATES');}
    else{
      const bundle=readJson(privatePath);
      if(!bundle?.staff?.login||!bundle?.staff?.password||bundle?.shopper||bundle?.client){fail('PRIVATE_STAFF_ONLY_SCOPE');process.exitCode=finalize('HOLD_READONLY_POST_GATES');}
      else{
        pass('PRIVATE_STAFF_ONLY_SCOPE');
        const smoke=run('node',['tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs',runtimeRoot],{env:{
          CXORBIA_C6_ACTION:expectedAction,
          CXORBIA_I3_EXTENDED_READONLY:'1',
          CXORBIA_I3_TARGET_LIVE_SHOPPER_ID:targetLiveShopperId,
          CXORBIA_I3_TARGET_CANONICAL_SHOPPER_ID:targetCanonicalShopperId,
          CXORBIA_E2E_PRIVATE_CREDENTIALS:privatePath,
          CXORBIA_HUMAN_GATE_OUTPUT:runtimeFile
        }});
        if(!fs.existsSync(runtimeFile)){fail('STAFF_RUNTIME_EVIDENCE_MISSING',String(smoke.stderr||smoke.stdout||'').slice(0,500));process.exitCode=finalize('HOLD_READONLY_POST_GATES');}
        else{
          const ev=readJson(runtimeFile);
          if(smoke.status!==0||ev.decision!=='PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY')fail('STAFF_RUNTIME_BASE',ev.decision||String(smoke.stderr||'').slice(0,200));else pass('STAFF_RUNTIME_BASE');
          const staff=ev.staff||{},ext=staff.extendedI3||{},post=ext.postulationAuthority||{},ident=ext.identity||{},legal=ext.legal||{};
          const i34={
            decision:'PASS_I3_4_POSTULATION_VS_HR_ASSIGNMENT_AUTHORITY_RUNTIME_READONLY',
            postulationAuthorityReady:post.ready===true,
            platformPosts:Number(post.platformPosts??-1),
            hrAssignments:Number(post.hrAssignments??-1),
            authorityPlatformPosts:Number(post.authorityPlatformPosts??-1),
            authorityHrAssignments:Number(post.authorityHrAssignments??-1),
            hrAssignmentsArePostulations:post.hrAssignmentsArePostulations===true,
            syntheticHrPostsInPlatform:Number(post.syntheticHrPostsInPlatform??-1),
            stableAcrossReloadsAndNewTab:post.stableAcrossReloadsAndNewTab===true
          };
          const i34ok=i34.postulationAuthorityReady&&i34.platformPosts===i34.authorityPlatformPosts&&i34.hrAssignments===i34.authorityHrAssignments&&i34.hrAssignments>=0&&i34.hrAssignmentsArePostulations===false&&i34.syntheticHrPostsInPlatform===0&&i34.stableAcrossReloadsAndNewTab;
          if(!i34ok){i34.decision='FAIL_I3_4_POSTULATION_AUTHORITY';fail('I3_4_POSTULATION_AUTHORITY');}else pass('I3_4_POSTULATION_AUTHORITY');

          const i35={
            decision:'PASS_I3_5_EXACT_AUGUST_CROSSWALK_RUNTIME_READONLY',
            exactIdentityContractPresent:ident.contractPresent===true,
            identityMapSize:Number(ident.mapSize||0),
            identityReviewCount:Number(ident.reviewCount||0),
            identityReviewReasons:Array.isArray(ident.reviewReasons)?unique(ident.reviewReasons):[],
            targetLiveShopperId:ident.targetLiveShopperId||targetLiveShopperId,
            targetCanonicalShopperId:ident.targetCanonicalShopperId||targetCanonicalShopperId,
            targetCanonicalActual:ident.targetCanonicalActual||null,
            targetCanonicalVisitsAugust:Number(ident.targetCanonicalVisitsAugust||0),
            targetLiveResidualVisitsAugust:Number(ident.targetLiveResidualVisitsAugust||0),
            stableAcrossReloadsAndNewTab:ident.targetStableAcrossReloadsAndNewTab===true,
            fuzzyMatching:false
          };
          const i35ok=i35.exactIdentityContractPresent&&i35.targetCanonicalActual===targetCanonicalShopperId&&i35.targetCanonicalVisitsAugust>=2&&i35.targetLiveResidualVisitsAugust===0&&i35.stableAcrossReloadsAndNewTab;
          if(!i35ok){i35.decision='FAIL_I3_5_EXACT_AUGUST_CROSSWALK';fail('I3_5_EXACT_AUGUST_CROSSWALK');}else pass('I3_5_EXACT_AUGUST_CROSSWALK');

          const frozen=readJson(frozenShopper);
          ensureFrozenSource(frozenShopperSource);
          const portalNow=git(['rev-parse',`HEAD:${'app/adapters/tya-canonical-shopper-portal-v2.js'}`]);
          const portalFrozen=git(['rev-parse',`${frozenShopperSource}:${'app/adapters/tya-canonical-shopper-portal-v2.js'}`]);
          const membershipNow=git(['rev-parse',`HEAD:${'app/adapters/cxorbia-shopper-membership-wiring-v1.js'}`]);
          const membershipFrozen=git(['rev-parse',`${frozenShopperSource}:${'app/adapters/cxorbia-shopper-membership-wiring-v1.js'}`]);
          const i36={
            decision:'PASS_I3_6_HISTORICAL_SHOPPER_PROFILE_HISTORY_REUSE_NO_REPROCESS',
            frozenDecision:frozen.decision,
            exact:frozen.identity?.exact===true,
            profile:frozen.identity?.profile===true,
            membership:frozen.identity?.membership===true,
            crosswalk:frozen.identity?.crosswalk===true,
            history:frozen.identity?.history===true,
            historyE2E:frozen.identity?.historyE2E===true,
            fuzzyMatching:frozen.safety?.fuzzyMatching===true,
            portalBlobUnchanged:portalNow===portalFrozen,
            membershipBlobUnchanged:membershipNow===membershipFrozen,
            historicalShopperAccessThisRun:0,
            passwordResetsThisRun:0
          };
          const i36ok=i36.frozenDecision==='PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY'&&i36.exact&&i36.profile&&i36.membership&&i36.crosswalk&&i36.history&&i36.historyE2E&&!i36.fuzzyMatching&&i36.portalBlobUnchanged&&i36.membershipBlobUnchanged;
          if(!i36ok){i36.decision='FAIL_I3_6_FROZEN_EVIDENCE_OR_SOURCE_DRIFT';fail('I3_6_HISTORICAL_REUSE');}else pass('I3_6_HISTORICAL_REUSE');

          const i37={
            decision:'PASS_I3_7_DURABLE_LEGAL_RECEIPT_RUNTIME_READONLY',
            legalLoaded:staff.legalRuntimePresent===true,
            providerAuthority:staff.legalProviderAuthority===true,
            pending:staff.legalPending===true,
            contentId:legal.contentId||null,
            legalVersion:legal.version||null,
            contentDigest:legal.digest||null,
            bridgeAccepted:legal.bridgeAccepted===true,
            bridgePending:legal.bridgePending===true,
            bridgeReasons:Array.isArray(legal.bridgeReasons)?legal.bridgeReasons:[],
            snapshotAuthority:legal.snapshotAuthority||null,
            snapshotReady:legal.snapshotReady===true,
            snapshotSubjectExact:legal.snapshotSubjectExact===true,
            snapshotAmbiguous:legal.snapshotAmbiguous===true,
            receiptStatus:legal.receiptStatus||null,
            receiptMethod:legal.receiptMethod||null,
            receiptSubjectExact:legal.receiptSubjectExact===true,
            receiptAcceptedAtPresent:legal.receiptAcceptedAtPresent===true,
            receiptMatchesCurrent:legal.receiptMatchesCurrent===true,
            receiptMatchesActor:legal.receiptMatchesActor===true,
            stableAcrossReloadsAndNewTab:legal.stableAcrossReloadsAndNewTab===true,
            automaticAcceptance:false
          };
          const digestOk=/^[a-f0-9]{64}$/i.test(String(i37.contentDigest||''));
          const i37ok=i37.legalLoaded&&i37.providerAuthority&&i37.pending===false&&Boolean(i37.contentId)&&Boolean(i37.legalVersion)&&digestOk&&i37.bridgeAccepted&&i37.bridgePending===false&&i37.bridgeReasons.length===0&&i37.snapshotAuthority==='provider'&&i37.snapshotReady&&i37.snapshotSubjectExact&&!i37.snapshotAmbiguous&&i37.receiptStatus==='accepted'&&i37.receiptMethod==='human_ui'&&i37.receiptSubjectExact&&i37.receiptAcceptedAtPresent&&i37.receiptMatchesCurrent&&i37.receiptMatchesActor&&i37.stableAcrossReloadsAndNewTab;
          if(!i37ok){i37.decision='FAIL_I3_7_DURABLE_LEGAL_RECEIPT';fail('I3_7_DURABLE_LEGAL_RECEIPT');}else pass('I3_7_DURABLE_LEGAL_RECEIPT');

          runtime={
            schemaVersion:'cxorbia.i3.staff-authority-readonly.result.v1',generatedAt:new Date().toISOString(),staffReadonlyExecuted:true,staffRuntimeDecision:ev.decision,
            i3:{i3_4:i34,i3_5:i35,i3_6:i36,i3_7:i37},
            safety:{historicalShopperAccess:0,shopperCredentialSelection:0,userCreates:0,userUpdates:0,passwordChanges:0,passwordResets:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:Number(rules?.providerWrites||0),firestoreRulesDeploys:Number(rules?.logicalDeploys||0),storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,hostingDeploys:0,cloudRunDeploys:0,merge:false,production:false,credentialsExposed:false,tokensExposed:false}
          };
          const status=blockers.length?'HOLD_READONLY_POST_GATES':'PASS_READONLY_POST_GATES';
          process.exitCode=finalize(status);
        }
      }
    }
  }
}catch(error){
  fail('RUNNER_EXCEPTION',String(error?.message||error).replace(/[^A-Za-z0-9_.:/=-]+/g,'_').slice(0,500));
  process.exitCode=finalize('HOLD_READONLY_POST_GATES');
}
