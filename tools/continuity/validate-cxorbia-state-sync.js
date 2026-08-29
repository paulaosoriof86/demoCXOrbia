#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const root=path.resolve(__dirname,'..','..');
const fail=m=>{console.error(`STATE_SYNC_GATE_BLOCKED: ${m}`);process.exit(2);};
const ok=(cond,m)=>{if(!cond)fail(m);};
const readJson=p=>{try{return JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));}catch(e){fail(`json_read:${p}:${e.message}`);}};
const readText=p=>{try{return fs.readFileSync(path.join(root,p),'utf8');}catch(e){fail(`text_read:${p}:${e.message}`);}};
const gitBlobSha=p=>{
  let b;try{b=fs.readFileSync(path.join(root,p));}catch(e){fail(`blob_read:${p}:${e.message}`);}
  const h=Buffer.from(`blob ${b.length}\0`,'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([h,b])).digest('hex');
};

const EXPECTED_EPOCH='CXORBIA-20260829-F10-HR-KPI-P1-CONTROL-PLANE-SYNC-11';
const EXPECTED_MASTER='CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1';
const EXPECTED_PHASE='F10_PERMANENT_OPERATING_MODEL';
const EXPECTED_STEP='F10_HR_KPI_FRESHNESS_AND_CONTROL_PLANE_RECONCILIATION';
const EXPECTED_NEXT='F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE';
const EXPECTED_INCIDENT='F10-HR-KPI-FRESHNESS-20260829-01';
const EXPECTED_INCIDENT_STATUS='OPEN_P1_PRODUCT_READ_MODEL_AND_QA_MECHANISM';
const EXPECTED_RELEASE='CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01';
const EXPECTED_FUNCTIONAL='f9802fdd498934a8e7729fa5c7d18341bec1cd71';

const base=readJson('backend/config/cxorbia-phase-a-continuity-lock.json');
const overlay=readJson('backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json');
const incident=readJson('app/docs/evidence/RC15-F10-HR-KPI-FRESHNESS-INCIDENT-20260829-01.json');
const lineage=readJson('app/docs/evidence/RC15-F8-5-CANONICAL-MODULE-LINEAGE-CERTIFICATION-LATEST.json');
const operating=readJson('backend/contracts/cxorbia-f10-permanent-operating-model-v1.json');
const matrix=readJson('backend/config/cxorbia-f10-approved-module-authority-matrix-v1.json');

ok(base.masterPlan?.id===EXPECTED_MASTER,'base_master_plan_id');
ok(base.masterPlan?.status==='FROZEN','base_master_plan_not_frozen');
ok(base.masterPlan?.providerMutationAuthorizedNow===false,'base_provider_mutation_must_be_false');

const e=overlay.effectiveState||{};
ok(e.syncEpoch===EXPECTED_EPOCH,`overlay_epoch:${e.syncEpoch||'missing'}`);
ok(e.masterPlanId===EXPECTED_MASTER,'overlay_master_plan_id');
ok(e.masterPlanStatus==='FROZEN','overlay_master_plan_not_frozen');
ok(e.currentMasterPhase===EXPECTED_PHASE,`overlay_phase:${e.currentMasterPhase||'missing'}`);
ok(e.currentMasterStep===EXPECTED_STEP,`overlay_step:${e.currentMasterStep||'missing'}`);
ok(e.next===EXPECTED_NEXT,`overlay_next:${e.next||'missing'}`);
ok(e.phaseA===100,'overlay_phaseA');
ok(e.productionRealReadiness===100,'overlay_readiness');
ok(overlay.closedControls?.f8_5==='CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE','overlay_f8_5');
ok(overlay.closedControls?.f9==='POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY','overlay_f9');

ok(overlay.productionState?.releaseId===EXPECTED_RELEASE,'overlay_release_id');
ok(overlay.productionState?.functionalSourceSha===EXPECTED_FUNCTIONAL,'overlay_functional_source');
ok(overlay.productionState?.phaseAReleaseFrozen===true,'overlay_release_not_frozen');
ok(overlay.productionState?.approvedModuleLineagePreserved===true,'overlay_lineage_not_preserved');

ok(overlay.activeIncident?.incidentId===EXPECTED_INCIDENT,'overlay_incident_id');
ok(overlay.activeIncident?.status===EXPECTED_INCIDENT_STATUS,'overlay_incident_status');
ok(overlay.activeIncident?.severity==='P1','overlay_incident_severity');
ok(overlay.activeIncident?.productP0Proven===false,'overlay_incident_must_not_be_product_p0');
ok(overlay.activeIncident?.freshnessCertification==='NOT_YET_PROVEN_INDEPENDENTLY','overlay_freshness_overclaim');

ok(incident.incidentId===EXPECTED_INCIDENT,'incident_id');
ok(incident.status===EXPECTED_INCIDENT_STATUS,'incident_status');
ok(incident.productP0Proven===false,'incident_product_p0');
ok(incident.releaseHistoryReopened===false,'incident_reopened_release_history');
ok(incident.priorRun?.freshnessVerdict==='DEMOTED_TO_INTERNAL_SNAPSHOT_SELF_CONSISTENCY_ONLY','incident_prior_run_freshness_scope');

ok(lineage.verdict==='PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE','lineage_verdict');
ok(lineage.productP0Proven===false,'lineage_product_p0');
ok(lineage.frozenRelease?.releaseId===EXPECTED_RELEASE,'lineage_release');
ok(lineage.frozenRelease?.functionalSourceSha===EXPECTED_FUNCTIONAL,'lineage_functional_source');
for(const [k,v] of Object.entries(lineage.canonicalFreezeComparison?.loadedFrontendChangesAfterFreeze||{}))ok(v===0,`frontend_drift_after_freeze:${k}:${v}`);
ok(lineage.hostingParity?.liveEqualsFrozenFunctionalSource===true,'hosting_not_equal_frozen_functional');
ok(lineage.hostingParity?.liveEqualsFrozenRuntimeSource===true,'hosting_not_equal_frozen_runtime');

ok(operating.phase==='F10_PERMANENT_OPERATING_MODEL','operating_phase');
ok(operating.status==='ACTIVE','operating_status');
ok(operating.phaseA===100,'operating_phaseA');
ok(operating.productionReadiness===100,'operating_readiness');
ok(operating.release?.releaseId===EXPECTED_RELEASE,'operating_release');
ok(operating.safeState?.providerWrites===0,'operating_provider_writes');
ok(operating.safeState?.businessDataWrites===0,'operating_business_writes');
ok(operating.safeState?.authWrites===0,'operating_auth_writes');
ok(operating.safeState?.hrWrites===0,'operating_hr_writes');
ok(operating.safeState?.paymentWrites===0,'operating_payment_writes');

ok(matrix.matrixId==='CXORBIA-F10-APPROVED-MODULE-AUTHORITY-20260829-01','module_matrix_id');
ok(matrix.frozenFunctionalSourceSha===EXPECTED_FUNCTIONAL,'module_matrix_functional_source');
ok(matrix.releaseId===EXPECTED_RELEASE,'module_matrix_release');
ok(matrix.currentSourceComparison?.appModulesChangedAfterFreeze===0,'module_matrix_declared_modules_drift');
ok(matrix.currentSourceComparison?.appCoreChangedAfterFreeze===0,'module_matrix_declared_core_drift');
const moduleSets=[
  ['phaseAApprovedLoadedModules',matrix.phaseAApprovedLoadedModules||[],'expectedGitBlob'],
  ['loadedFrozenSupportModulesWithoutIndividualPhaseACriticalAuthorityClaim',matrix.loadedFrozenSupportModulesWithoutIndividualPhaseACriticalAuthorityClaim||[],'expectedGitBlob'],
  ['postPhaseALoadedNotCertifiedAsPhaseAAuthority',matrix.postPhaseALoadedNotCertifiedAsPhaseAAuthority||[],'expectedGitBlob'],
  ['f10OpenBridgeFiles',matrix.f10OpenBridgeFiles||[],'expectedFrozenAndCurrentGitBlob']
];
let moduleBlobChecks=0;
for(const [setName,items,key] of moduleSets){
  ok(items.length>0,`module_matrix_empty_set:${setName}`);
  for(const item of items){
    const expected=item[key];
    ok(typeof expected==='string'&&/^[0-9a-f]{40}$/.test(expected),`module_matrix_bad_expected_blob:${item.path}`);
    const actual=gitBlobSha(item.path);
    ok(actual===expected,`module_blob_drift:${item.path}:expected=${expected}:actual=${actual}`);
    moduleBlobChecks++;
  }
}

const canonicalDocs=[
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md',
  'app/docs/CAMBIOS-BACKEND.md',
  'app/docs/RESUMEN-PARA-CLAUDE.md',
  'app/docs/PENDIENTES-PROTOTIPO.md'
];
for(const pth of canonicalDocs){
  const t=readText(pth);
  for(const marker of [EXPECTED_EPOCH,EXPECTED_INCIDENT,EXPECTED_NEXT])ok(t.includes(marker),`canonical_mirror_drift:${pth}:${marker}`);
}

const mirrors=[
  ['app/docs/CAMBIOS-BACKEND.md','CAMBIOS-BACKEND.md'],
  ['app/docs/RESUMEN-PARA-CLAUDE.md','RESUMEN-PARA-CLAUDE.md'],
  ['app/docs/PENDIENTES-PROTOTIPO.md','PENDIENTES-PROTOTIPO.md']
];
for(const [canonical,mirror] of mirrors)ok(readText(canonical)===readText(mirror),`root_mirror_not_exact:${mirror}`);

const execution=readText('app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md');
ok(execution.includes('**currentMasterPhase:** `F10_PERMANENT_OPERATING_MODEL`'),'execution_not_f10');
ok(execution.includes('**incidentStatus:** `OPEN_P1_PRODUCT_READ_MODEL_AND_QA_MECHANISM`'),'execution_incident_missing');

console.log('STATE_SYNC_GATE_PASS');
console.log(`syncEpoch=${EXPECTED_EPOCH}`);
console.log(`phase=${EXPECTED_PHASE}`);
console.log(`step=${EXPECTED_STEP}`);
console.log(`incident=${EXPECTED_INCIDENT}:${EXPECTED_INCIDENT_STATUS}`);
console.log(`release=${EXPECTED_RELEASE}`);
console.log(`moduleBlobChecks=${moduleBlobChecks}`);
console.log('moduleLineage=F8_5_PASS_EXACT_MATRIX_BLOBS');
console.log('rootMirrors=EXACT');
console.log(`next=${EXPECTED_NEXT}`);
