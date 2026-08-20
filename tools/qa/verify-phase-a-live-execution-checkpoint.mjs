#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../..');
const read=p=>fs.readFileSync(path.join(repo,p),'utf8').replace(/^\uFEFF/,'');
const json=p=>JSON.parse(read(p));
const ensure=(v,c)=>{if(!v)throw new Error(c);};
const lock=json('backend/config/cxorbia-phase-a-continuity-lock.json');
const g2=json('backend/config/cxorbia-g2-live-in-platform-acceptance-plan.json');
const docs={
  checkpoint:'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  index:'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  execution:'app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md',
  sourceLock:'app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md',
  unifiedPlan:'app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md',
  tracker:'app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md'
};
ensure(lock.repository==='paulaosoriof86/demoCXOrbia','CURRENT_REPOSITORY_DRIFT');
ensure(lock.branch==='docs-tya-v6-v71-audit'&&Number(lock.pullRequest)===7,'CURRENT_LANE_DRIFT');
ensure(lock.functionalSourceLock==='f9802fdd498934a8e7729fa5c7d18341bec1cd71','FUNCTIONAL_SOURCE_DRIFT');
ensure(lock.currentIteration==='I5-G2','CURRENT_ITERATION_NOT_G2');
ensure(Number(lock.formalProgress?.completed)===98&&Number(lock.formalProgress?.pending)===2,'CURRENT_PROGRESS_NOT_98_2');
ensure(lock.formalProgress?.productionIsAuthorized===true&&lock.formalProgress?.productionCutoverExecuted===true,'PRODUCTION_CUTOVER_STATE_DRIFT');
ensure(lock.productionState?.active===true&&lock.productionState?.productionUrl==='https://cxorbia-backend-dev.web.app','PRODUCTION_TARGET_DRIFT');
ensure(lock.productionState?.providerRedeployExecuted===false&&lock.productionState?.rebuildExecuted===false&&lock.productionState?.businessDataWritesAuthorized===false,'PRODUCTION_SAFETY_DRIFT');
for(const [name,p] of Object.entries(docs)){
  const text=read(p);
  ensure(text.includes(lock.syncEpoch),`CURRENT_SYNC_EPOCH_MISSING:${name}`);
  ensure(text.includes(lock.planId),`CURRENT_PLAN_ID_MISSING:${name}`);
  ensure(text.includes(lock.currentIteration),`CURRENT_ITERATION_MISSING:${name}`);
}
ensure(g2.planId===lock.planId&&g2.syncEpoch===lock.syncEpoch&&g2.iteration==='I5-G2','G2_PLAN_IDENTITY_DRIFT');
ensure(g2.productionUrl===lock.productionState.productionUrl,'G2_PRODUCTION_URL_DRIFT');
ensure(g2.subgates?.['I5-G2-A']?.sameProductionUrlOnly===true,'G2_A_SAME_PLATFORM_REQUIRED');
ensure(g2.subgates?.['I5-G2-B']?.sameProductionUrlOnly===true&&g2.subgates?.['I5-G2-B']?.alternatePlatformAllowed===false&&g2.subgates?.['I5-G2-B']?.humanVisibleToPaula===true,'G2_B_LIVE_PLATFORM_CONTRACT_DRIFT');
ensure(g2.subgates?.['I5-G2-B']?.cleanupRequired===true&&g2.subgates?.['I5-G2-B']?.postCleanupReadbackRequired===true,'G2_B_CLEANUP_CONTRACT_DRIFT');
ensure(g2.currentAuthorizationBoundary?.businessDataWrites===false&&g2.currentAuthorizationBoundary?.externalHrWrites===false&&g2.currentAuthorizationBoundary?.realPayments===false,'G2_B_WRITE_BOUNDARY_DRIFT');
ensure(lock.hardStops?.allowFinal100BeforeLiveInPlatformSyntheticAcceptance===false,'FINAL_100_ACCEPTANCE_GUARD_MISSING');
const out=execFileSync(process.execPath,['tools/continuity/validate-cxorbia-phase-a-continuity-lock.js'],{cwd:repo,encoding:'utf8'});
ensure(out.includes('CONTINUITY_LOCK_PASS'),'CONTINUITY_LOCK_NOT_PASS');
console.log(JSON.stringify({
  ok:true,
  decision:'PASS_PHASE_A_CURRENT_OPERATIONAL_CHECKPOINT_CANONICAL_DYNAMIC',
  syncEpoch:lock.syncEpoch,
  planId:lock.planId,
  currentIteration:lock.currentIteration,
  progress:{completed:98,pending:2},
  production:{active:true,url:lock.productionState.productionUrl,sameArtifact:true,providerRedeploy:false,rebuild:false,businessDataWritesAuthorized:false},
  g2:{technicalReadOnlyStatus:g2.subgates['I5-G2-A'].status,liveSyntheticStatus:g2.subgates['I5-G2-B'].status,samePlatformOnly:true,humanVisibleToPaula:true,cleanupRequired:true},
  continuityValidator:'CONTINUITY_LOCK_PASS',
  safety:{providerWrites:false,businessDataWrites:false,externalHrWrites:false,authWrites:false,paymentWrites:false,deploy:false,rebuild:false,merge:false}
},null,2));
