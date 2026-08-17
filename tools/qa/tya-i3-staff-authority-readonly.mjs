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

fs.mkdirSync(outDir,{recursive:true});
fs.mkdirSync(reportDir,{recursive:true});
let request=null,runtime=null;
const checks=[],blockers=[];
const pass=(code,detail='')=>checks.push(detail?`${code}:${detail}`:code);
const fail=(code,detail='')=>blockers.push(detail?`${code}:${detail}`:code);

function finalize(status){
  const report={
    schemaVersion:'cxorbia.i3.staff-authority-readonly.v1',runner:'CXORBIA_READONLY_POST_GATES_RUNNER',generatedAt:new Date().toISOString(),
    status,repository:process.env.GITHUB_REPOSITORY||null,branch:process.env.GITHUB_REF_NAME||null,requestPath,
    requestId:request?.requestId||null,requestCommitSha:git(['rev-parse','HEAD']),targetHeadSha:request?.targetHeadSha||null,profile,
    checks,blockers,commands:['Staff-only canonical Admin browser read; no Shopper credential selection'],
    summary:{
      i3_4:runtime?.i3?.i3_4||null,
      i3_5:runtime?.i3?.i3_5||null,
      i3_6:runtime?.i3?.i3_6||null,
      i3_7:runtime?.i3?.i3_7||null,
      staffRuntimeDecision:runtime?.staffRuntimeDecision||null,
      safety:runtime?.safety||safeState
    },
    safeState:{...safeState}
  };
  fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n','utf8');
  fs.writeFileSync(reportMd,[
    '# CXOrbia I3 Staff authority read-only',
    '',`- Status: \`${status}\``,`- Request: \`${report.requestId||'n/a'}\``,`- Target HEAD: \`${report.targetHeadSha||'n/a'}\``,
    '', '## I3.4', '```json',JSON.stringify(report.summary.i3_4,null,2),'```',
    '', '## I3.5', '```json',JSON.stringify(report.summary.i3_5,null,2),'```',
    '', '## I3.6', '```json',JSON.stringify(report.summary.i3_6,null,2),'```',
    '', '## I3.7', '```json',JSON.stringify(report.summary.i3_7,null,2),'```',
    '', '## Blockers',...(blockers.length?blockers.map(x=>`- ${x}`):['- none'])
  ].join('\n')+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(runtime||report.summary,null,2)+'\n','utf8');
  return status==='PASS_READONLY_POST_GATES'?0:2;
}

try{
  request=readJson(requestPath);
  const parent=git(['rev-parse','HEAD^']);
  if(request.schemaVersion!=='cxorbia.readonly-post-gates-request.v1')fail('REQUEST_SCHEMA');else pass('REQUEST_SCHEMA');
  if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit'||Number(request.pullRequest)!==7)fail('REQUEST_TARGET');else pass('REQUEST_TARGET');
  if(request.enabled!==true||request.consumed!==false||request.allowedExecutions!==1)fail('REQUEST_SINGLE_USE');else pass('REQUEST_SINGLE_USE');
  if(request.profile!==profile||!Array.isArray(request.allowedProfiles)||!request.allowedProfiles.includes(profile))fail('PROFILE_EXACT');else pass('PROFILE_EXACT');
  if(request.targetHeadSha!==parent)fail('TARGET_HEAD_EXACT',`${request.targetHeadSha||'null'}!=${parent}`);else pass('TARGET_HEAD_EXACT',parent);
  if(request.repositoryWrites!==false||request.dataWrites!==false||request.deploy!==false||request.merge!==false||request.production!==false)fail('WRITE_DEPLOY_SCOPE');else pass('WRITE_DEPLOY_SCOPE');
  for(const [k,v] of Object.entries(safeState))if(request.safeState?.[k]!==v)fail('SAFE_STATE_'+k);
  if(blockers.length)process.exitCode=finalize('HOLD_READONLY_POST_GATES');
  else{
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
            schemaVersion:'cxorbia.i3.staff-authority-readonly.result.v1',generatedAt:new Date().toISOString(),staffRuntimeDecision:ev.decision,
            i3:{i3_4:i34,i3_5:i35,i3_6:i36,i3_7:i37},
            safety:{historicalShopperAccess:0,shopperCredentialSelection:0,userCreates:0,userUpdates:0,passwordChanges:0,passwordResets:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,deploys:0,merge:false,production:false,credentialsExposed:false,tokensExposed:false}
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
