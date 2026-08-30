#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const root=path.resolve(__dirname,'..','..');
const fail=m=>{console.error(`STATE_SYNC_GATE_BLOCKED: ${m}`);process.exit(2);};
const ok=(v,m)=>{if(!v)fail(m);};
const abs=p=>path.join(root,p);
const readJson=p=>{try{return JSON.parse(fs.readFileSync(abs(p),'utf8').replace(/^\uFEFF/,''));}catch(e){fail(`json:${p}:${e.message}`);}};
const readText=p=>{try{return fs.readFileSync(abs(p),'utf8');}catch(e){fail(`text:${p}:${e.message}`);}};
const gitBlob=p=>{const b=fs.readFileSync(abs(p));return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');};
const sha256=p=>crypto.createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex');

const EPOCH='CXORBIA-20260830-F10-LIVE-ROW-CONTENT-PASS-MECHANISM-SYNC-14';
const PHASE='F10_PERMANENT_OPERATING_MODEL';
const STEP='F10_LIVE_ROW_CONTENT_EQUIVALENCE_PASS_MECHANISM_SYNCHRONIZED';
const NEXT='F10_OWNER_VISUAL_ACCEPTANCE_THEN_CLOSE_INCIDENT_OR_OPEN_FOCAL_VISUAL_DEFECT';
const INCIDENT='F10-HR-KPI-FRESHNESS-20260829-01';
const STATUS='TECHNICAL_PASS_PENDING_OWNER_VISUAL_ACCEPTANCE';
const RELEASE='CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01';
const FROZEN='f9802fdd498934a8e7729fa5c7d18341bec1cd71';
const ADAPTER='app/adapters/tya-canonical-state-semantics-v2.js';
const ADAPTER_BLOB='941051c96a26017363acfc72f7e88edbe70c68ba';
const ADAPTER_SHA256='e832759e03238559617b71daa4daa52a00b2c6dbd2d2266e6df0ae391f853b2e';
const DEPLOY_RUN=33289344796;
const DEPLOY_ARTIFACT=9725498210;
const HOSTING_RELEASE='sites/cxorbia-backend-dev/releases/1788058988151000';
const HOSTING_VERSION='sites/cxorbia-backend-dev/versions/958ed37dde65d592';
const LIVE_RUN=33297814889;
const LIVE_ARTIFACT=9727971958;
const OP_DIGEST='a5a6d0bc1ed109e1c4088d09553e49c860f6d390d187859175c1fd2d19741bb0';

const overlay=readJson('backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json');
const matrix=readJson('backend/config/cxorbia-f10-approved-module-authority-matrix-v1.json');
const liveOverlay=readJson('backend/config/cxorbia-f10-approved-module-authority-live-overlay-v1.json');
const evidence=readJson('app/docs/evidence/RC15-F10-LIVE-CONTENT-EQUIVALENCE-MECHANISM-SYNC-LATEST.json');
const policy=readJson('backend/contracts/cxorbia-f10-live-content-certification-policy-v1.json');
const request=readJson('.github/cxorbia-gate-requests/request.json');

const e=overlay.effectiveState||{};
ok(e.syncEpoch===EPOCH,'overlay_epoch');
ok(e.phaseA===100&&e.productionRealReadiness===100,'overlay_phase_readiness');
ok(e.currentMasterPhase===PHASE&&e.currentMasterStep===STEP&&e.next===NEXT,'overlay_cursor');
ok(overlay.closedControls?.f8_5==='CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE','overlay_f8_5');
ok(overlay.closedControls?.f9==='POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY','overlay_f9');
ok(overlay.productionState?.releaseId===RELEASE&&overlay.productionState?.functionalSourceSha===FROZEN,'overlay_frozen_release');
ok(overlay.productionState?.f10OperationalEvidenceSourcePatchDeployed===true,'overlay_f10_deployed');
ok(overlay.productionState?.f10HostingRelease===HOSTING_RELEASE&&overlay.productionState?.f10HostingVersion===HOSTING_VERSION,'overlay_f10_hosting');
ok(overlay.activeIncident?.incidentId===INCIDENT&&overlay.activeIncident?.status===STATUS&&overlay.activeIncident?.productP0Proven===false,'overlay_incident');
ok(overlay.activeIncident?.technicalValidation?.runId===LIVE_RUN&&overlay.activeIncident?.technicalValidation?.operationalEvidenceDigestSha256===OP_DIGEST,'overlay_live_validation');

ok(liveOverlay.baseMatrix==='backend/config/cxorbia-f10-approved-module-authority-matrix-v1.json','live_overlay_base_matrix');
ok(liveOverlay.currentDeploymentAuthority?.status==='LIVE_HOSTING_VERIFIED','live_overlay_status');
ok(liveOverlay.currentDeploymentAuthority?.deployRunId===DEPLOY_RUN&&liveOverlay.currentDeploymentAuthority?.artifactId===DEPLOY_ARTIFACT,'live_overlay_deploy_evidence');
ok(liveOverlay.currentDeploymentAuthority?.hostingRelease===HOSTING_RELEASE&&liveOverlay.currentDeploymentAuthority?.hostingVersion===HOSTING_VERSION,'live_overlay_hosting');
ok(liveOverlay.currentDeploymentAuthority?.adapterGitBlob===ADAPTER_BLOB&&liveOverlay.currentDeploymentAuthority?.moduleChecks===41&&liveOverlay.currentDeploymentAuthority?.moduleMismatches===0,'live_overlay_lineage');
ok(liveOverlay.liveValidation?.runId===LIVE_RUN&&liveOverlay.liveValidation?.artifactId===LIVE_ARTIFACT,'live_overlay_validation_run');
ok(liveOverlay.liveValidation?.rowDigestMatch===true&&liveOverlay.liveValidation?.summaryCountsMatch===true&&liveOverlay.liveValidation?.operationalEvidenceDigestSha256===OP_DIGEST,'live_overlay_digest');
ok(liveOverlay.liveValidation?.exactRevisionTokenEqualityRequired===false,'live_overlay_revision_semantics');

ok(evidence.decision==='PASS_F10_LIVE_ROW_CONTENT_EQUIVALENCE_AND_MECHANISM_SYNC','terminal_evidence_decision');
ok(evidence.deploy?.runId===DEPLOY_RUN&&evidence.deploy?.artifactId===DEPLOY_ARTIFACT,'terminal_deploy');
ok(evidence.liveValidation?.runId===LIVE_RUN&&evidence.liveValidation?.artifactId===LIVE_ARTIFACT,'terminal_live_run');
ok(evidence.liveValidation?.rowDigestMatch===true&&evidence.liveValidation?.summaryCountsMatch===true&&evidence.liveValidation?.operationalEvidenceDigestSha256===OP_DIGEST,'terminal_digest');
ok(evidence.liveValidation?.providerRevision!==evidence.liveValidation?.browserRevision,'terminal_distinct_refresh_tokens_expected');
ok(evidence.liveValidation?.exactRevisionTokenEqualityRequired===false,'terminal_revision_policy');
ok(evidence.safety?.deploysThisSync===0&&evidence.safety?.providerWrites===0&&evidence.safety?.businessDataWrites===0,'terminal_safety');

ok(policy.contractId==='cxorbia-f10-live-content-certification-policy-v1','policy_id');
ok(policy.crossRefreshRevisionTokenEqualityRequired===false&&policy.rowLevelOperationalDigestRequired===true&&policy.oneShotRequestMustEndDisabledConsumed===true,'policy_semantics');
ok(policy.continuityValidation?.invokedByControlledRunner===true,'policy_continuity_wiring');

ok(request.enabled===false&&request.consumed===true,'request_terminalized');
ok(request.executionsConsumed===1&&request.completedRunId===LIVE_RUN&&request.completedArtifactId===LIVE_ARTIFACT,'request_consumption_evidence');
ok(request.completedDecision==='PASS_F10_LIVE_ADMIN_FRESH_CONTENT_EQUIVALENCE','request_terminal_decision');
ok(request.replayAllowed===false&&request.automaticRetryAllowed===false,'request_retry_guard');

ok(gitBlob(ADAPTER)===ADAPTER_BLOB,'adapter_blob');
ok(sha256(ADAPTER)===ADAPTER_SHA256,'adapter_sha256');
ok(matrix.matrixId==='CXORBIA-F10-APPROVED-MODULE-AUTHORITY-20260829-02','matrix_id');
ok(matrix.frozenFunctionalSourceSha===FROZEN&&matrix.releaseId===RELEASE,'matrix_release');
let moduleChecks=0;
for(const list of [matrix.phaseAApprovedLoadedModules||[],matrix.loadedFrozenSupportModulesWithoutIndividualPhaseACriticalAuthorityClaim||[],matrix.postPhaseALoadedNotCertifiedAsPhaseAAuthority||[]]){
  for(const item of list){ok(gitBlob(item.path)===item.expectedGitBlob,`module_blob:${item.path}`);moduleChecks++;}
}
ok(moduleChecks===41,'matrix_module_check_count');
const successor=(matrix.f10AuthorizedSuccessorBridgeFiles||[])[0];
ok(successor?.path===ADAPTER&&successor?.expectedCurrentGitBlob===ADAPTER_BLOB,'matrix_successor');

const liveGate=readText('tools/qa/tya-f10-live-admin-fresh-content-gate.mjs');
ok(liveGate.includes('rowLevelOperationalDigestRequired:true'),'live_gate_row_digest_required');
ok(liveGate.includes('Object.entries(expectedCountries)'),'live_gate_country_key_value_compare');
ok(!liveGate.includes("JSON.stringify(actual.summary?.byCountry||{})!==JSON.stringify(providerOperationalSummary.byCountry)"),'live_gate_order_sensitive_compare_removed');
const runtimeRunner=readText('tools/release/cxorbia-phase-a-runtime-multirole-runner.mjs');
ok(runtimeRunner.includes("diagnosticMode==='F10_LIVE_ADMIN_FRESH_CONTENT_EQUIVALENCE'"),'runtime_f10_mode');
ok(runtimeRunner.includes("exactRevisionTokenEqualityRequired===false"),'runtime_revision_semantics');
const deployWorkflow=readText('.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml');
ok(deployWorkflow.includes('fresh HR content equivalence'),'deploy_workflow_fresh_content_gate');
ok(!deployWorkflow.includes('browser_revision_mismatch'),'deploy_workflow_old_revision_equality_removed');
const controlled=readText('tools/qa/cxorbia-controlled-runners-contract-gate.mjs');
ok(controlled.includes('validate-cxorbia-state-sync.js'),'controlled_runner_continuity_wired');

const docs=['app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md','app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md','app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md','app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md','app/docs/CAMBIOS-BACKEND.md','app/docs/RESUMEN-PARA-CLAUDE.md','app/docs/PENDIENTES-PROTOTIPO.md','CAMBIOS-BACKEND.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md'];
const stale=['F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION','SOURCE_ONLY_NOT_DEPLOYED','El patch F10 todavía **no está desplegado**'];
for(const p of docs){const t=readText(p);ok(t.includes(EPOCH),`doc_epoch:${p}`);ok(t.includes(NEXT),`doc_next:${p}`);for(const s of stale)ok(!t.includes(s),`doc_stale:${p}:${s}`);}

console.log('STATE_SYNC_GATE_PASS');
console.log(`syncEpoch=${EPOCH}`);
console.log(`phase=${PHASE}`);
console.log(`step=${STEP}`);
console.log(`incident=${INCIDENT}:${STATUS}`);
console.log(`f10DeployRun=${DEPLOY_RUN}`);
console.log(`f10LiveRun=${LIVE_RUN}`);
console.log(`operationalEvidenceDigestSha256=${OP_DIGEST}`);
console.log(`moduleBlobChecks=${moduleChecks}`);
console.log('moduleLineage=EXACT_PRESERVED');
console.log('crossRefreshRevisionToken=TRACEABILITY_NOT_CONTENT_IDENTITY');
console.log('oneShotRequest=DISABLED_CONSUMED');
console.log(`next=${NEXT}`);
