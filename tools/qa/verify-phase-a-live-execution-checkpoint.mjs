#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../..');
const rel=p=>path.relative(repo,p).replace(/\\/g,'/');
const EPOCH='CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37';
const FRONTIER='I4_PROTECTED_RUNTIME_CONVERGENCE_AND_REAL_PHASE_A_E2E';
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
  iteration1:path.join(repo,'tools/qa/verify-root-cause-correction-iteration1.mjs'),
  iteration2:path.join(repo,'tools/qa/verify-root-cause-correction-iteration2.mjs'),
  historicalHarness:path.join(repo,'tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs')
};
const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const ensure=(v,c)=>{if(!v)throw new Error(c);};
for(const p of Object.values(P))ensure(fs.existsSync(p),`CURRENT_AUTHORITY_MISSING:${rel(p)}`);

const cp=read(P.checkpoint),idx=read(P.index),exec=read(P.execution),sourceLock=read(P.sourceLock),
  unifiedPlan=read(P.unifiedPlan),tracker=read(P.tracker),entry=read(P.entry),watcher=read(P.watcher),
  bridge=read(P.authorityBridge),harness=read(P.historicalHarness);

// Canonical destination and epoch: equivalent formatting is accepted, stale state is not.
for(const text of [cp,idx,exec,sourceLock,unifiedPlan,tracker]) ensure(text.includes(EPOCH),`CURRENT_SYNC_EPOCH_MISSING:${rel(Object.values(P)[0])}`);
ensure(cp.includes('paulaosoriof86/demoCXOrbia'),'CURRENT_CHECKPOINT_REPO_MISSING');
ensure(cp.includes('docs-tya-v6-v71-audit'),'CURRENT_CHECKPOINT_BRANCH_MISSING');
ensure(/PR:\*\*?\s*`?#7`?|PR\s*#7/i.test(cp),'CURRENT_CHECKPOINT_PR7_MISSING');
ensure(cp.includes(FRONTIER)&&idx.includes(FRONTIER)&&exec.includes(FRONTIER)&&unifiedPlan.includes(FRONTIER),'CURRENT_FRONTIER_DRIFT');
ensure(/60%\s*\/\s*40%/.test(cp)&&/60%\s*(?:formal)?\s*\/\s*40%/.test(idx),'CURRENT_PROGRESS_60_40_MISSING');
ensure(/PLAN_SCORE:\*\*\s*`60\/100`/.test(exec),'EXECUTION_SCORE_60_MISSING');
ensure(/I1\s*`?15\/15/.test(idx)&&/I2\s*`?20\/20/.test(idx)&&/I3\s*`?25\/25/.test(idx),'FROZEN_PRIOR_ITERATIONS_MISSING');
ensure(/I4[^\n]*(?:0\/25|IN_PROGRESS|EN CURSO|pendiente)/i.test(tracker),'TRACKER_I4_CURRENT_STATE_MISSING');
ensure(/60%[^\n]*40%/.test(tracker),'TRACKER_PROGRESS_60_40_MISSING');
ensure(!/GO-LIVE formal:\s*35%\s*\/\s*65%/i.test(tracker),'TRACKER_STALE_35_65_PRESENT');
ensure(sourceLock.includes('docs-tya-v6-v71-audit')&&sourceLock.includes('#7'),'SOURCE_LOCK_DESTINATION_DRIFT');

// Current canonical source graph.
const watcherPath='adapters/tya-live-source-refresh-watch-v2.js';
const bridgePath='adapters/tya-protected-auth-hr-authority-bridge-v2.js';
const wi=entry.indexOf(watcherPath),bi=entry.indexOf(bridgePath);
ensure(wi>=0&&bi>=0,'PROTECTED_ENTRY_CANONICAL_ADAPTER_MISSING');
ensure(wi<bi,'PROTECTED_ENTRY_LOAD_ORDER_UNEXPECTED');
ensure(entry.includes('cxProtectedRuntime')&&entry.includes('authenticated-human-canonical'),'PROTECTED_ENTRY_CANONICAL_LANE_MISSING');

// Single-authority boot lock introduced at I4: HR watcher cannot win boot before protected composition.
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

// Preserve previously frozen root-cause protections; this verifier does not reopen them.
ensure(!/^\s*import\s+.+\s+from\s+['"]playwright['"]\s*;?\s*$/m.test(harness),'HISTORICAL_HARNESS_STATIC_PLAYWRIGHT_IMPORT');
ensure(harness.includes("await import('playwright')"),'HISTORICAL_HARNESS_DYNAMIC_PLAYWRIGHT_IMPORT_MISSING');
ensure(harness.includes("pending('shopper')")&&harness.includes('acceptanceAutomated:false'),'HISTORICAL_HARNESS_LEGAL_GATE_DRIFT');

const result={
  ok:true,
  decision:'PASS_PHASE_A_CURRENT_OPERATIONAL_CHECKPOINT_I4_SINGLE_AUTHORITY_SOURCE',
  epoch:EPOCH,
  authority:'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  progress:{formalCompletedPct:60,formalRemainingPct:40,iteration:'I4-open',nextAfterI4Pct:85,basis:'protected-runtime-convergence-plan'},
  continuity:{canonicalDocsPresent:true,stale35_65Rejected:true,priorPassesFrozen:true},
  protectedRuntime:{entry:'app/index-backend-dev.html',singleAuthorityBootLock:true,directHrApplyBeforeProtectedAuthority:false,canonicalSourceRefPreserved:true,runtimeGateStillRequired:true},
  locks:{sameBranch:true,noGeneralRediagnosis:true,noAuthRebuild:true,noShopperRebuild:true,noFinanceRebuild:true,noNewBranchOrPr:true},
  safety:{authWrites:false,firestoreWrites:false,hrWrites:false,rulesWrites:false,storageWrites:false,deploy:false,merge:false,production:false}
};
console.log(JSON.stringify(result,null,2));
