#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../..');
const rel=p=>path.relative(repo,p).replace(/\\/g,'/');
const EPOCH='CXORBIA-20260819-I4-PROTECTED-RUNTIME-CLOSED-38';
const FRONTIER='I5_PREPRODUCTION_AND_GO_LIVE';
const I5_SUBSTATES=['I5_1_PREPRODUCTION_READINESS_AND_UAT_PLAN_READONLY','I5_1_READINESS_PASS_PENDING_PREPROD_AUTH'];
const FUNCTIONAL_SOURCE='f9802fdd498934a8e7729fa5c7d18341bec1cd71';
const P={
  checkpoint:path.join(repo,'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md'),
  index:path.join(repo,'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md'),
  execution:path.join(repo,'app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md'),
  sourceLock:path.join(repo,'app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md'),
  unifiedPlan:path.join(repo,'app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md'),
  tracker:path.join(repo,'app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md'),
  entry:path.join(repo,'app/index-backend-dev.html'),
  watcher:path.join(repo,'app/adapters/tya-live-source-refresh-watch-v2.js'),
  authorityBridge:path.join(repo,'app/adapters/tya-protected-auth-hr-authority-bridge-v2.js'),
  historicalHarness:path.join(repo,'tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs'),
  staffRequest:path.join(repo,'.github/cxorbia-gate-requests/request.json'),
  hostingRequest:path.join(repo,'backend/config/i3-11-identity-link-runtime-bridge-rules-hosting-dev.json')
};
const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const ensure=(v,c)=>{if(!v)throw new Error(c);};
for(const p of Object.values(P))ensure(fs.existsSync(p),`CURRENT_AUTHORITY_MISSING:${rel(p)}`);

const cp=read(P.checkpoint),idx=read(P.index),exec=read(P.execution),sourceLock=read(P.sourceLock),
  unifiedPlan=read(P.unifiedPlan),tracker=read(P.tracker),entry=read(P.entry),watcher=read(P.watcher),
  bridge=read(P.authorityBridge),harness=read(P.historicalHarness),
  staffRequest=JSON.parse(read(P.staffRequest)),hostingRequest=JSON.parse(read(P.hostingRequest));

// Canonical destination and epoch. Stale 60/40 I4-open state must now fail closed.
for(const [name,text] of Object.entries({checkpoint:cp,index:idx,execution:exec,sourceLock,unifiedPlan,tracker}))
  ensure(text.includes(EPOCH),`CURRENT_SYNC_EPOCH_MISSING:${name}`);
ensure(cp.includes('paulaosoriof86/demoCXOrbia'),'CURRENT_CHECKPOINT_REPO_MISSING');
ensure(cp.includes('docs-tya-v6-v71-audit'),'CURRENT_CHECKPOINT_BRANCH_MISSING');
ensure(/PR:\*\*?\s*`?#7`?|PR\s*#7/i.test(cp),'CURRENT_CHECKPOINT_PR7_MISSING');
for(const [name,text] of Object.entries({checkpoint:cp,index:idx,execution:exec,unifiedPlan}))
  ensure(text.includes(FRONTIER),`CURRENT_FRONTIER_DRIFT:${name}`);
const activeSubstate=I5_SUBSTATES.find(s=>exec.includes(s)&&cp.includes(s)&&idx.includes(s));
ensure(activeSubstate,'CURRENT_I5_SUBSTATE_DRIFT');
ensure(/85%\s*\/\s*15%/.test(cp)&&/85%[^\n]*15%/.test(idx),'CURRENT_PROGRESS_85_15_MISSING');
ensure(/PLAN_SCORE:\*\*\s*`85\/100`/.test(exec),'EXECUTION_SCORE_85_MISSING');
ensure(/I1\s*`?15\/15/.test(idx)&&/I2\s*`?20\/20/.test(idx)&&/I3\s*`?25\/25/.test(idx)&&/I4\s*`?25\/25/.test(idx),'FROZEN_I1_I4_MISSING');
ensure(/I4[^\n]*(?:PASS|25\/25|FROZEN)/i.test(tracker),'TRACKER_I4_FROZEN_STATE_MISSING');
ensure(/85%[^\n]*15%/.test(tracker),'TRACKER_PROGRESS_85_15_MISSING');
ensure(!/60%\s*\/\s*40%/.test(cp),'CHECKPOINT_STALE_60_40_PRESENT');
ensure(sourceLock.includes('docs-tya-v6-v71-audit')&&sourceLock.includes('#7')&&sourceLock.includes(FUNCTIONAL_SOURCE),'SOURCE_LOCK_DESTINATION_OR_FUNCTIONAL_SOURCE_DRIFT');

// Same protected functional graph remains mandatory through I5 readiness.
const watcherPath='adapters/tya-live-source-refresh-watch-v2.js';
const bridgePath='adapters/tya-protected-auth-hr-authority-bridge-v2.js';
const wi=entry.indexOf(watcherPath),bi=entry.indexOf(bridgePath);
ensure(wi>=0&&bi>=0,'PROTECTED_ENTRY_CANONICAL_ADAPTER_MISSING');
ensure(wi<bi,'PROTECTED_ENTRY_LOAD_ORDER_UNEXPECTED');
ensure(entry.includes('cxProtectedRuntime')&&entry.includes('authenticated-human-canonical'),'PROTECTED_ENTRY_CANONICAL_LANE_MISSING');
for(const marker of [
  'canonicalProtectedAuthorityReady',
  'CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true',
  'canonical_protected_authority_required',
  'CX_TYA_LIVE_SOURCE_AUTHORITY_LOCK',
  'blockedDirectApply:true',
  "cx:protected-auth-hr-authority-ready",
  "CX.dataSource.mode=(authenticatedHumanRuntime||technicalAuthE2E)?'connected':'source_safe_preview'"
]) ensure(watcher.includes(marker),`SINGLE_AUTHORITY_WATCHER_MARKER_MISSING:${marker}`);
ensure(watcher.includes("sourceRef==='hr-live-all-periods+firestore-authenticated-exact-overlay'"),'CANONICAL_SOURCE_REF_PRESERVATION_MISSING');
ensure(bridge.includes("CX.data.sourceMode='tya_hr_live_all_periods_plus_firestore_exact_overlay_dev'"),'PROTECTED_BRIDGE_CANONICAL_MODE_MISSING');
ensure(bridge.includes("CX.dataSource.sourceRef='hr-live-all-periods+firestore-authenticated-exact-overlay'"),'PROTECTED_BRIDGE_CANONICAL_SOURCE_REF_MISSING');
ensure(bridge.includes("new CustomEvent('cx:protected-auth-hr-authority-ready'"),'PROTECTED_BRIDGE_READY_EVENT_MISSING');
ensure(bridge.includes('providerWrites:0')&&bridge.includes('production:false'),'PROTECTED_BRIDGE_SAFETY_DRIFT');

// Previously frozen protections remain source-verifiable but are not rerun.
ensure(!/^\s*import\s+.+\s+from\s+['"]playwright['"]\s*;?\s*$/m.test(harness),'HISTORICAL_HARNESS_STATIC_PLAYWRIGHT_IMPORT');
ensure(harness.includes("await import('playwright')"),'HISTORICAL_HARNESS_DYNAMIC_PLAYWRIGHT_IMPORT_MISSING');
ensure(harness.includes("pending('shopper')")&&harness.includes('acceptanceAutomated:false'),'HISTORICAL_HARNESS_LEGAL_GATE_DRIFT');

// One-shot I4 requests must remain consumed/disabled. Their success is evidence, not an invitation to rerun.
for(const [name,r] of Object.entries({staffRequest,hostingRequest})){
  ensure(r.enabled===false&&r.consumed===true,`I4_ONESHOT_NOT_CONSUMED:${name}`);
  ensure(r.merge===false&&r.production===false,`I4_ONESHOT_UNSAFE_STATE:${name}`);
}
ensure(Number(hostingRequest.actualHostingDeploys)===1,'I4_HOSTING_DEPLOY_COUNT_DRIFT');
ensure(Number(staffRequest.evidence?.providerWrites||0)===0&&Number(staffRequest.evidence?.firestoreWrites||0)===0,'I4_STAFF_REQUEST_WRITE_EVIDENCE_DRIFT');

// I5 preproduction static secret gate. It scans runtime/config/contracts only and rejects concrete credential signatures.
const scanRoots=['app','backend/config','backend/contracts'].map(p=>path.join(repo,p));
const allowedExt=/\.(?:js|mjs|cjs|json|html|css|txt)$/i;
const skipDirs=new Set(['docs','node_modules','.tmp','tmp']);
const secretPatterns=[
  ['private_key_pem',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['google_api_key',/AIza[0-9A-Za-z_-]{35}/],
  ['github_pat',/gh[pousr]_[A-Za-z0-9]{30,}/],
  ['openai_style_key',/sk-[A-Za-z0-9_-]{20,}/],
  ['slack_token',/xox[baprs]-[A-Za-z0-9-]{20,}/]
];
const secretFindings=[];
const walk=dir=>{
  if(!fs.existsSync(dir))return;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(ent.isDirectory()&&skipDirs.has(ent.name))continue;
    const full=path.join(dir,ent.name);
    if(ent.isDirectory()){walk(full);continue;}
    if(!allowedExt.test(ent.name))continue;
    const text=read(full);
    for(const [code,re] of secretPatterns)if(re.test(text))secretFindings.push({file:rel(full),code});
  }
};
for(const root of scanRoots)walk(root);
ensure(secretFindings.length===0,`I5_STATIC_SECRET_SCAN_FAIL:${JSON.stringify(secretFindings)}`);

const result={
  ok:true,
  decision:'PASS_PHASE_A_CURRENT_OPERATIONAL_CHECKPOINT_I4_CLOSED_I5_READINESS',
  epoch:EPOCH,
  authority:'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  progress:{formalCompletedPct:85,formalRemainingPct:15,iteration:'I5-open',basis:'i4-protected-runtime-closed'},
  continuity:{canonicalDocsPresent:true,stale60_40Rejected:true,i1ThroughI4Frozen:true,functionalSource:FUNCTIONAL_SOURCE},
  protectedRuntime:{entry:'app/index-backend-dev.html',singleAuthorityBootLock:true,directHrApplyBeforeProtectedAuthority:false,canonicalSourceRefPreserved:true},
  oneShotGates:{staffConsumed:true,hostingConsumed:true,hostingDeploys:1,automaticRerunAllowed:false},
  preproductionSafety:{activeSubstate,staticSecretScan:'PASS',scanRoots:['app','backend/config','backend/contracts'],secretFindings:0},
  locks:{sameBranch:true,noGeneralRediagnosis:true,noAuthRebuild:true,noShopperRebuild:true,noFinanceRebuild:true,noNewBranchOrPr:true},
  safety:{authWrites:false,firestoreWrites:false,hrWrites:false,rulesWrites:false,storageWrites:false,deploy:false,merge:false,production:false}
};
console.log(JSON.stringify(result,null,2));
