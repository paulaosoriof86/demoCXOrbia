#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const root=path.resolve(__dirname,'..','..');
const fail=m=>{console.error(`STATE_SYNC_GATE_BLOCKED: ${m}`);process.exit(2);};
const ok=(cond,m)=>{if(!cond)fail(m);};
const abs=p=>path.join(root,p);
const exists=p=>fs.existsSync(abs(p));
const readJson=p=>{try{return JSON.parse(fs.readFileSync(abs(p),'utf8'));}catch(e){fail(`json_read:${p}:${e.message}`);}};
const readText=p=>{try{return fs.readFileSync(abs(p),'utf8');}catch(e){fail(`text_read:${p}:${e.message}`);}};
const gitBlobSha=p=>{let b;try{b=fs.readFileSync(abs(p));}catch(e){fail(`blob_read:${p}:${e.message}`);}const h=Buffer.from(`blob ${b.length}\0`,'utf8');return crypto.createHash('sha1').update(Buffer.concat([h,b])).digest('hex');};
const sha256=p=>crypto.createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex');

const EPOCH='CXORBIA-20260829-F10-OP-EVIDENCE-SOURCE-PASS-12';
const MASTER='CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1';
const PHASE='F10_PERMANENT_OPERATING_MODEL';
const STEP='F10_OPERATIONAL_EVIDENCE_SOURCE_REPAIRED_PREDEPLOY_VALIDATION';
const NEXT='F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION';
const INCIDENT='F10-HR-KPI-FRESHNESS-20260829-01';
const INCIDENT_STATUS='OPEN_P1_SOURCE_REPAIRED_PENDING_PREDEPLOY_AND_DEPLOY';
const RELEASE='CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01';
const FROZEN='f9802fdd498934a8e7729fa5c7d18341bec1cd71';
const SOURCE_REPAIR_COMMIT='6392736070dcf34d24f9b27b8bb1d0ecbcf116b0';
const ADAPTER='app/adapters/tya-canonical-state-semantics-v2.js';
const ADAPTER_BLOB='941051c96a26017363acfc72f7e88edbe70c68ba';
const ADAPTER_SHA256='e832759e03238559617b71daa4daa52a00b2c6dbd2d2266e6df0ae391f853b2e';
const PROVIDER_REV='b7bc89176161a8a1b83e3d33098634ae77a5a8bc3f6f44ee7c749e2d11da598d';

const base=readJson('backend/config/cxorbia-phase-a-continuity-lock.json');
const overlay=readJson('backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json');
const incident=readJson('app/docs/evidence/RC15-F10-HR-KPI-FRESHNESS-INCIDENT-20260829-01.json');
const fresh=readJson('app/docs/evidence/RC15-F10-FRESH-HR-SEMANTIC-ADJUDICATION-LATEST.json');
const sourceGate=readJson('app/docs/evidence/RC15-F10-OPERATIONAL-EVIDENCE-SOURCE-GATE-LATEST.json');
const lineage=readJson('app/docs/evidence/RC15-F8-5-CANONICAL-MODULE-LINEAGE-CERTIFICATION-LATEST.json');
const operating=readJson('backend/contracts/cxorbia-f10-permanent-operating-model-v1.json');
const matrix=readJson('backend/config/cxorbia-f10-approved-module-authority-matrix-v1.json');
const request=readJson('.github/cxorbia-gate-requests/request.json');

ok(base.masterPlan?.id===MASTER,'base_master_plan_id');
ok(base.masterPlan?.status==='FROZEN','base_master_plan_not_frozen');
ok(base.masterPlan?.providerMutationAuthorizedNow===false,'base_provider_mutation_must_be_false');

const e=overlay.effectiveState||{};
ok(e.syncEpoch===EPOCH,`overlay_epoch:${e.syncEpoch||'missing'}`);
ok(e.masterPlanId===MASTER,'overlay_master_plan_id');
ok(e.masterPlanStatus==='FROZEN','overlay_master_plan_not_frozen');
ok(e.currentMasterPhase===PHASE,`overlay_phase:${e.currentMasterPhase||'missing'}`);
ok(e.currentMasterStep===STEP,`overlay_step:${e.currentMasterStep||'missing'}`);
ok(e.next===NEXT,`overlay_next:${e.next||'missing'}`);
ok(e.phaseA===100,'overlay_phaseA');
ok(e.productionRealReadiness===100,'overlay_readiness');
ok(overlay.closedControls?.f8_5==='CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE','overlay_f8_5');
ok(overlay.closedControls?.f9==='POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY','overlay_f9');
ok(overlay.productionState?.releaseId===RELEASE,'overlay_release_id');
ok(overlay.productionState?.functionalSourceSha===FROZEN,'overlay_frozen_source');
ok(overlay.productionState?.approvedModuleLineagePreserved===true,'overlay_lineage_not_preserved');
ok(overlay.productionState?.f10OperationalEvidenceSourcePatchDeployed===false,'overlay_must_not_claim_f10_deployed');
ok(overlay.activeIncident?.incidentId===INCIDENT,'overlay_incident_id');
ok(overlay.activeIncident?.status===INCIDENT_STATUS,'overlay_incident_status');
ok(overlay.activeIncident?.productP0Proven===false,'overlay_incident_product_p0');
ok(overlay.activeIncident?.sourceRepair?.commit===SOURCE_REPAIR_COMMIT,'overlay_source_repair_commit');
ok(overlay.activeIncident?.sourceRepair?.blob===ADAPTER_BLOB,'overlay_source_repair_blob');
ok(String(overlay.activeIncident?.freshnessCertification||'').includes(PROVIDER_REV),'overlay_fresh_revision_missing');

ok(incident.incidentId===INCIDENT,'incident_id');
ok(incident.status===INCIDENT_STATUS,'incident_status');
ok(incident.productP0Proven===false,'incident_product_p0');
ok(incident.sourceRepair?.functionalCommit===SOURCE_REPAIR_COMMIT,'incident_source_repair_commit');
ok(incident.sourceRepair?.gitBlob===ADAPTER_BLOB,'incident_source_repair_blob');
ok(incident.sourceRepair?.deployed===false,'incident_must_not_claim_deployed');
ok(incident.independentFreshProviderReconciliation?.revision===PROVIDER_REV,'incident_fresh_revision');
ok(incident.rootCauseAdjudication?.some(x=>x.code==='BACKWARD_LIFECYCLE_PROMOTION_USED_AS_VISIBLE_OPERATIONAL_EVIDENCE'&&x.status==='CONFIRMED_ROOT_CAUSE'),'incident_root_cause_not_adjudicated');

ok(fresh.run?.freshGateDecision==='PASS_F10_FRESH_HR_ROW_LEVEL_RECONCILIATION','fresh_gate_decision');
ok(fresh.provider?.revision===PROVIDER_REV,'fresh_revision');
ok(fresh.provider?.cacheOrigin==='runtime_refresh','fresh_cache_origin');
ok(fresh.provider?.visitCount===660,'fresh_visit_count');
ok(fresh.provider?.duplicateRowKeys===0,'fresh_duplicate_row_keys');
ok(fresh.rootCauseAdjudication?.semanticPromotionRoot,'fresh_semantic_root_missing');
ok(fresh.requiredFix?.readModel,'fresh_required_fix_missing');

ok(sourceGate.decision==='PASS_F10_SOURCE_PATCH_AND_APPROVED_MODULE_LINEAGE_INTACT__PREDEPLOY_HOLD','source_gate_decision');
ok(sourceGate.sourcePatch?.functionalCommitSha===SOURCE_REPAIR_COMMIT,'source_gate_commit');
ok(sourceGate.sourcePatch?.gitBlobSha===ADAPTER_BLOB,'source_gate_blob');
ok(sourceGate.sourcePatch?.sha256===ADAPTER_SHA256,'source_gate_sha256');
ok(sourceGate.sourcePatch?.moduleFilesChanged===0,'source_gate_module_drift');
ok(sourceGate.sourcePatch?.coreFilesChanged===0,'source_gate_core_drift');
ok(sourceGate.sourcePatch?.entrypointChanged===false,'source_gate_entrypoint_drift');
ok(sourceGate.sourcePatch?.appJsChanged===false,'source_gate_appjs_drift');
ok(sourceGate.atomicApply?.runId===33283725070,'source_gate_atomic_run');
ok(sourceGate.atomicApply?.runnerStatus==='APPLIED_AND_VERIFIED','source_gate_atomic_status');
ok(sourceGate.semanticExecutableGate?.decision==='PASS_F10_OPERATIONAL_EVIDENCE_SEMANTICS','source_gate_semantic_gate');
ok(sourceGate.hostingState?.newF10AdapterDeployed===false,'source_gate_must_not_claim_deployed');
ok(sourceGate.remainingGate==='PREDEPLOY_EXACT_SOURCE_BROWSER_AND_SAME_REVISION_KPI_GATE','source_gate_remaining_gate');

ok(gitBlobSha(ADAPTER)===ADAPTER_BLOB,`adapter_blob_drift:${gitBlobSha(ADAPTER)}`);
ok(sha256(ADAPTER)===ADAPTER_SHA256,`adapter_sha256_drift:${sha256(ADAPTER)}`);

ok(lineage.verdict==='PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE','lineage_verdict');
ok(lineage.frozenRelease?.releaseId===RELEASE,'lineage_release');
ok(lineage.frozenRelease?.functionalSourceSha===FROZEN,'lineage_frozen_source');
ok(lineage.hostingParity?.liveEqualsFrozenFunctionalSource===true,'lineage_hosting_frozen_parity');

ok(operating.phase==='F10_PERMANENT_OPERATING_MODEL','operating_phase');
ok(operating.status==='ACTIVE','operating_status');
ok(operating.phaseA===100,'operating_phaseA');
ok(operating.productionReadiness===100,'operating_readiness');
ok(operating.safeState?.providerWrites===0&&operating.safeState?.businessDataWrites===0&&operating.safeState?.authWrites===0&&operating.safeState?.hrWrites===0&&operating.safeState?.paymentWrites===0,'operating_safe_state');

ok(matrix.matrixId==='CXORBIA-F10-APPROVED-MODULE-AUTHORITY-20260829-02','matrix_id');
ok(matrix.frozenFunctionalSourceSha===FROZEN,'matrix_frozen_source');
ok(matrix.releaseId===RELEASE,'matrix_release');
ok(matrix.currentSourceComparison?.functionalHeadVerified===SOURCE_REPAIR_COMMIT,'matrix_source_successor');
ok(matrix.currentSourceComparison?.appModulesChangedAfterFreeze===0,'matrix_module_drift');
ok(matrix.currentSourceComparison?.appCoreChangedAfterFreeze===0,'matrix_core_drift');
ok(matrix.currentSourceComparison?.appJsChangedAfterFreeze===0,'matrix_appjs_drift');
ok(matrix.currentSourceComparison?.entrypointChangedAfterFreeze===0,'matrix_entrypoint_drift');

const sets=[
  ['phaseAApprovedLoadedModules',matrix.phaseAApprovedLoadedModules||[],'expectedGitBlob'],
  ['loadedFrozenSupportModulesWithoutIndividualPhaseACriticalAuthorityClaim',matrix.loadedFrozenSupportModulesWithoutIndividualPhaseACriticalAuthorityClaim||[],'expectedGitBlob'],
  ['postPhaseALoadedNotCertifiedAsPhaseAAuthority',matrix.postPhaseALoadedNotCertifiedAsPhaseAAuthority||[],'expectedGitBlob']
];
let moduleBlobChecks=0;
for(const [name,items,key] of sets){ok(items.length>0,`matrix_empty:${name}`);for(const item of items){const expected=item[key];ok(/^[0-9a-f]{40}$/.test(expected||''),`matrix_bad_blob:${item.path}`);const actual=gitBlobSha(item.path);ok(actual===expected,`module_blob_drift:${item.path}:expected=${expected}:actual=${actual}`);moduleBlobChecks++;}}
const successors=matrix.f10AuthorizedSuccessorBridgeFiles||[];
ok(successors.length===1,'f10_successor_count');
ok(successors[0].path===ADAPTER,'f10_successor_path');
ok(successors[0].expectedCurrentGitBlob===ADAPTER_BLOB,'f10_successor_blob');
ok(successors[0].sourceCommit===SOURCE_REPAIR_COMMIT,'f10_successor_commit');
ok(successors[0].deployStatus==='SOURCE_ONLY_NOT_DEPLOYED','f10_successor_deploy_status');

const canonicalDocs=[
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md'
];
for(const p of canonicalDocs){const t=readText(p);for(const marker of [EPOCH,INCIDENT,NEXT])ok(t.includes(marker),`canonical_cursor_drift:${p}:${marker}`);ok(t.includes(SOURCE_REPAIR_COMMIT),`canonical_source_repair_missing:${p}`);}

const addenda=[
  'app/docs/CAMBIOS-BACKEND-F10-OP-EVIDENCE-20260829.md',
  'app/docs/RESUMEN-PARA-CLAUDE-F10-OP-EVIDENCE-20260829.md',
  'app/docs/PENDIENTES-PROTOTIPO-F10-OP-EVIDENCE-20260829.md'
];
for(const p of addenda){ok(exists(p),`missing_f10_addendum:${p}`);const t=readText(p);ok(t.includes(EPOCH),`addendum_epoch:${p}`);ok(t.includes(NEXT),`addendum_next:${p}`);ok(t.includes(SOURCE_REPAIR_COMMIT),`addendum_source_repair:${p}`);}

const rootMirrors=['CAMBIOS-BACKEND.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md'];
for(const p of rootMirrors){const t=readText(p);ok(t.includes(EPOCH),`root_mirror_epoch:${p}`);ok(t.includes(NEXT),`root_mirror_next:${p}`);ok(t.includes(SOURCE_REPAIR_COMMIT),`root_mirror_source_repair:${p}`);ok(!t.includes('F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE'),`root_mirror_stale_next:${p}`);}

ok(request.enabled===false,'stale_gate_request_must_be_disabled');
ok(request.status==='CANCELLED_SUPERSEDED_BY_F10_SOURCE_REPAIR','stale_gate_request_status');
ok(request.completedFreshEvidenceRunId===33281688280,'stale_gate_request_fresh_run');
ok(request.completedSourceRepairRunId===33283725070,'stale_gate_request_repair_run');
ok(request.replayAllowed===false&&request.automaticRetryAllowed===false,'stale_gate_request_retry_guard');

console.log('STATE_SYNC_GATE_PASS');
console.log(`syncEpoch=${EPOCH}`);
console.log(`phase=${PHASE}`);
console.log(`step=${STEP}`);
console.log(`incident=${INCIDENT}:${INCIDENT_STATUS}`);
console.log(`release=${RELEASE}`);
console.log(`sourceRepair=${SOURCE_REPAIR_COMMIT}`);
console.log(`adapterBlob=${ADAPTER_BLOB}`);
console.log(`providerRevision=${PROVIDER_REV}`);
console.log(`moduleBlobChecks=${moduleBlobChecks}`);
console.log('moduleLineage=EXACT_PRESERVED');
console.log('rootMirrors=CURRENT_POINTERS');
console.log('staleGateRequest=DISABLED');
console.log(`next=${NEXT}`);
