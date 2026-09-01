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

const EPOCH='CXORBIA-20260830-F10-OPERATIONAL-AUTHORITY-MULTIPROJECT-SOURCE-AUDIT-16';
const PHASE='F10_PERMANENT_OPERATING_MODEL';
const STEP='F10_OPERATIONAL_AUTHORITY_REPAIR_AND_MULTIPROJECT_SOURCE_GATES';
const NEXT='F10_READONLY_AUTHORITY_GATES__PROJECT_SOURCE_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE';
const INCIDENT='F10-OPERATIONAL-AUTHORITY-AND-PROJECT-SOURCE-20260830-02';
const STATUS='SOURCE_REPAIR_APPLIED_READONLY_GATES_PENDING_CLAUDE_HOLD';
const RELEASE='CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01';
const FROZEN='f9802fdd498934a8e7729fa5c7d18341bec1cd71';
const LIVE_ADAPTER='app/adapters/tya-canonical-state-semantics-v2.js';
const LIVE_ADAPTER_BLOB='941051c96a26017363acfc72f7e88edbe70c68ba';
const LIVE_ADAPTER_SHA256='e832759e03238559617b71daa4daa52a00b2c6dbd2d2266e6df0ae391f853b2e';
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
const projectSource=readJson('backend/contracts/cxorbia-project-source-contract-v1.json');
const onboarding=readJson('backend/config/cxorbia-project-onboarding-readiness-v1.json');
const operationalProviderPolicy=readJson('backend/config/cxorbia-operational-command-provider-policy-v1.json');
const projectProviderPolicy=readJson('backend/config/cxorbia-project-command-provider-policy-v1.json');

/* Effective cursor: current repo workstream, while preserving the already certified live release. */
const e=overlay.effectiveState||{};
ok(e.syncEpoch===EPOCH,'overlay_epoch');
ok(e.phaseA===100&&e.productionRealReadiness===100,'overlay_live_phase_readiness_preserved');
ok(e.currentMasterPhase===PHASE&&e.currentMasterStep===STEP&&e.next===NEXT,'overlay_cursor');
ok(overlay.closedControls?.f8_5==='CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE','overlay_f8_5');
ok(overlay.closedControls?.f9==='POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY','overlay_f9');
ok(overlay.productionState?.releaseId===RELEASE&&overlay.productionState?.functionalSourceSha===FROZEN,'overlay_frozen_release');
ok(overlay.productionState?.f10OperationalEvidenceSourcePatchDeployed===true,'overlay_live_f10_deployed');
ok(overlay.productionState?.sourceSuccessorDeployed===false,'overlay_source_successor_not_deployed');
ok(overlay.productionState?.f10HostingRelease===HOSTING_RELEASE&&overlay.productionState?.f10HostingVersion===HOSTING_VERSION,'overlay_live_hosting');
ok(overlay.activeIncident?.incidentId===INCIDENT&&overlay.activeIncident?.status===STATUS&&overlay.activeIncident?.productP0Proven===false,'overlay_active_incident');
ok(overlay.activeIncident?.newProjectProductionOnboardingAllowed===false,'overlay_new_project_hold');
ok(Array.isArray(overlay.activeIncident?.requiredGates)&&overlay.activeIncident.requiredGates.includes('PROJECT_CREATE_DURABLE_ACK_PASS')&&overlay.activeIncident.requiredGates.includes('PROJECT_UPDATE_DURABLE_ACK_PASS'),'overlay_project_gates');
ok(overlay.liveCertificationPreserved?.runId===LIVE_RUN&&overlay.liveCertificationPreserved?.operationalEvidenceDigestSha256===OP_DIGEST,'overlay_live_cert_preserved');
ok(Array.isArray(overlay.liveCertificationPreserved?.doesNotCertify)&&overlay.liveCertificationPreserved.doesNotCertify.includes('project_create_update_durable_ack'),'overlay_live_cert_scope_honest');

/* Preserve old live deployment/evidence exactly. */
ok(liveOverlay.baseMatrix==='backend/config/cxorbia-f10-approved-module-authority-matrix-v1.json','live_overlay_base_matrix');
ok(liveOverlay.currentDeploymentAuthority?.status==='LIVE_HOSTING_VERIFIED','live_overlay_status');
ok(liveOverlay.currentDeploymentAuthority?.deployRunId===DEPLOY_RUN&&liveOverlay.currentDeploymentAuthority?.artifactId===DEPLOY_ARTIFACT,'live_overlay_deploy_evidence');
ok(liveOverlay.currentDeploymentAuthority?.hostingRelease===HOSTING_RELEASE&&liveOverlay.currentDeploymentAuthority?.hostingVersion===HOSTING_VERSION,'live_overlay_hosting');
ok(liveOverlay.currentDeploymentAuthority?.adapterGitBlob===LIVE_ADAPTER_BLOB&&liveOverlay.currentDeploymentAuthority?.moduleChecks===41&&liveOverlay.currentDeploymentAuthority?.moduleMismatches===0,'live_overlay_lineage');
ok(liveOverlay.liveValidation?.runId===LIVE_RUN&&liveOverlay.liveValidation?.artifactId===LIVE_ARTIFACT,'live_overlay_validation_run');
ok(liveOverlay.liveValidation?.rowDigestMatch===true&&liveOverlay.liveValidation?.summaryCountsMatch===true&&liveOverlay.liveValidation?.operationalEvidenceDigestSha256===OP_DIGEST,'live_overlay_digest');
ok(liveOverlay.liveValidation?.exactRevisionTokenEqualityRequired===false,'live_overlay_revision_semantics');

ok(evidence.decision==='PASS_F10_LIVE_ROW_CONTENT_EQUIVALENCE_AND_MECHANISM_SYNC','terminal_live_evidence_decision');
ok(evidence.deploy?.runId===DEPLOY_RUN&&evidence.deploy?.artifactId===DEPLOY_ARTIFACT,'terminal_live_deploy');
ok(evidence.liveValidation?.runId===LIVE_RUN&&evidence.liveValidation?.artifactId===LIVE_ARTIFACT,'terminal_live_run');
ok(evidence.liveValidation?.rowDigestMatch===true&&evidence.liveValidation?.summaryCountsMatch===true&&evidence.liveValidation?.operationalEvidenceDigestSha256===OP_DIGEST,'terminal_live_digest');
ok(evidence.liveValidation?.providerRevision!==evidence.liveValidation?.browserRevision,'terminal_distinct_refresh_tokens_expected');
ok(evidence.liveValidation?.exactRevisionTokenEqualityRequired===false,'terminal_revision_policy');
ok(evidence.safety?.deploysThisSync===0&&evidence.safety?.providerWrites===0&&evidence.safety?.businessDataWrites===0,'terminal_live_safety');

ok(policy.contractId==='cxorbia-f10-live-content-certification-policy-v1','live_policy_id');
ok(policy.crossRefreshRevisionTokenEqualityRequired===false&&policy.rowLevelOperationalDigestRequired===true&&policy.oneShotRequestMustEndDisabledConsumed===true,'live_policy_semantics');
ok(policy.continuityValidation?.invokedByControlledRunner===true,'live_policy_continuity_wiring');
ok(request.enabled===false&&request.consumed===true,'live_request_terminalized');
ok(request.executionsConsumed===1&&request.completedRunId===LIVE_RUN&&request.completedArtifactId===LIVE_ARTIFACT,'live_request_consumption_evidence');
ok(request.replayAllowed===false&&request.automaticRetryAllowed===false,'live_request_retry_guard');
ok(gitBlob(LIVE_ADAPTER)===LIVE_ADAPTER_BLOB,'live_adapter_blob');
ok(sha256(LIVE_ADAPTER)===LIVE_ADAPTER_SHA256,'live_adapter_sha256');

ok(matrix.matrixId==='CXORBIA-F10-APPROVED-MODULE-AUTHORITY-20260829-02','matrix_id');
ok(matrix.frozenFunctionalSourceSha===FROZEN&&matrix.releaseId===RELEASE,'matrix_release');
let moduleChecks=0;
for(const list of [matrix.phaseAApprovedLoadedModules||[],matrix.loadedFrozenSupportModulesWithoutIndividualPhaseACriticalAuthorityClaim||[],matrix.postPhaseALoadedNotCertifiedAsPhaseAAuthority||[]]){
  for(const item of list){ok(gitBlob(item.path)===item.expectedGitBlob,`module_blob:${item.path}`);moduleChecks++;}
}
ok(moduleChecks===41,'matrix_module_check_count');
const successor=(matrix.f10AuthorizedSuccessorBridgeFiles||[])[0];
ok(successor?.path===LIVE_ADAPTER&&successor?.expectedCurrentGitBlob===LIVE_ADAPTER_BLOB,'matrix_live_successor_preserved');

/* New reusable authority/source successor must exist but remain fail-closed. */
const authorityAdapter=readText('app/adapters/tya-phase-a-operational-sync-v1.js');
ok(authorityAdapter.includes("syntheticHrApplications:false"),'authority_synthetic_apps_forbidden');
ok(authorityAdapter.includes("uiSuccessRequiresProviderAck:true"),'authority_ack_required');
ok(authorityAdapter.includes("dedupeByName:false"),'authority_name_dedupe_forbidden');
ok(authorityAdapter.includes("d.createApplication=createApplication")&&authorityAdapter.includes("d.updateApplicationStatus=updateApplicationStatus")&&authorityAdapter.includes("d.assignVisitDurable=assignVisit"),'authority_command_facade');
ok(authorityAdapter.includes("source:'direct_hr_operational_evidence'"),'authority_period_stats_direct_evidence');

const operationalProvider=readText('backend/runtime/cxorbia-operational-command-provider-v1.mjs');
ok(operationalProvider.includes("'application.create'")&&operationalProvider.includes("'application.status.update'")&&operationalProvider.includes("'visit.assign'")&&operationalProvider.includes("'visit.sync.confirm'"),'operational_provider_commands');
ok(operationalProvider.includes('providerAck:true')&&operationalProvider.includes('successUiAllowed:true'),'operational_provider_ack');
ok(operationalProvider.includes('review_no_silent_overwrite'),'operational_provider_conflict_policy');
ok(operationalProviderPolicy.schemaVersion==='cxorbia.operational.provider-policy.v1'&&operationalProviderPolicy.enabled===false,'operational_provider_policy_disabled');
ok(operationalProviderPolicy.hrWrites===false&&operationalProviderPolicy.makeCalls===false&&operationalProviderPolicy.geminiCalls===false&&operationalProviderPolicy.paymentWrites===false,'operational_provider_external_side_effects_off');

ok(projectSource.schemaVersion==='cxorbia.project-operational-source.v1','project_source_contract_schema');
ok(projectSource.principles?.projectChoosesOperationalSource===true&&projectSource.principles?.sourceMayBeInternalOrExternal===true,'project_source_per_project_internal_external');
ok(projectSource.principles?.cinépolisIsNotGlobalLogic===true,'project_source_cinepolis_not_global');
ok(projectSource.projectSource?.questionnaire?.independentFromOperationalSource===true,'project_source_questionnaire_independent');
ok((projectSource.projectSource?.mode||[]).includes('internal')&&(projectSource.projectSource?.mode||[]).includes('external'),'project_source_modes');
ok((projectSource.projectSource?.providerType||[]).includes('google_sheets')&&(projectSource.projectSource?.providerType||[]).includes('internal_firestore')&&(projectSource.projectSource?.providerType||[]).includes('custom_adapter'),'project_source_provider_types');
ok(projectSource.projectSource?.mapping?.mappingRefRequired===true&&projectSource.projectSource?.providerRef?.mustBeIndirectReference===true,'project_source_mapping_binding');
ok(projectSource.projectSource?.providerRef?.rawCredentialForbidden===true,'project_source_secrets_forbidden');

const sourceResolver=readText('app/adapters/cxorbia-project-operational-source-v1.js');
ok(sourceResolver.includes("mode:'internal'")&&sourceResolver.includes("mode:'external'"),'project_source_resolver_modes');
ok(sourceResolver.includes('PROJECT_SOURCE_PROVIDER_BINDING_REQUIRED')&&sourceResolver.includes('PROJECT_SOURCE_MAPPING_REQUIRED'),'project_source_resolver_external_requirements');
ok(sourceResolver.includes('PROJECT_SOURCE_RAW_URL_FORBIDDEN_USE_BINDING_REF')&&sourceResolver.includes('PROJECT_SOURCE_RAW_CREDENTIAL_FORBIDDEN'),'project_source_resolver_secret_guards');
ok(sourceResolver.includes('projectScoped:true')&&sourceResolver.includes('dedupeByName:false'),'project_source_resolver_scope');

const projectProvider=readText('backend/runtime/cxorbia-project-command-provider-v1.mjs');
ok(projectProvider.includes("'project.create'")&&projectProvider.includes("'project.update'"),'project_provider_commands');
ok(projectProvider.includes('canonicalProjectId')&&projectProvider.includes('PROJECT_EXPECTED_VERSION_CONFLICT'),'project_provider_identity_version');
ok(projectProvider.includes('PROJECT_CONFIG_SECRET_FORBIDDEN')&&projectProvider.includes('providerAck:true'),'project_provider_secret_ack');
ok(projectProviderPolicy.schemaVersion==='cxorbia.project-command-provider-policy.v1'&&projectProviderPolicy.enabled===false,'project_provider_policy_disabled');
ok(projectProviderPolicy.externalProviderWrites===false&&projectProviderPolicy.hrWrites===false&&projectProviderPolicy.makeCalls===false&&projectProviderPolicy.geminiCalls===false&&projectProviderPolicy.paymentWrites===false,'project_provider_external_side_effects_off');

ok(onboarding.schemaVersion==='cxorbia.project-onboarding-readiness.v1','onboarding_schema');
ok(onboarding.stateSyncEpoch===EPOCH&&onboarding.status==='HOLD_NEW_PROJECT_PRODUCTION_ONBOARDING','onboarding_epoch_hold');
ok(onboarding.currentLiveReleaseAffected===false&&onboarding.newProjectProductionAllowed===false&&onboarding.sourceSuccessorDeployed===false,'onboarding_safe_state');
for(const gate of ['PROJECT_CONFIG_SCHEMA_PASS','PROJECT_SOURCE_RESOLVER_PASS','PROJECT_CREATE_DURABLE_ACK_PASS','PROJECT_UPDATE_DURABLE_ACK_PASS','PROJECT_ISOLATION_PASS','PROJECT_INTERNAL_SOURCE_PASS','PROJECT_EXTERNAL_SOURCE_PASS','PROJECT_AI_NO_FALSE_SUCCESS_PASS','PROJECT_DOCUMENTATION_SYNC_PASS'])ok((onboarding.blockingGates||[]).includes(gate),`onboarding_gate:${gate}`);

/* Proactively ensure the machine-readable HOLD still corresponds to actual unpatched frontend owners. */
const wizard=readText('app/modules/proyecto-wizard.js');
const projectsUi=readText('app/modules/proyectos.js');
ok(wizard.includes('data.addProject(cfg)'),'onboarding_blocker_create_local_first_still_present');
ok(wizard.includes("ronda:'JUN 26'")&&wizard.includes("quincenas:['Quincena 1','Quincena 2']"),'onboarding_blocker_route_hardcodes_present');
ok(wizard.includes("IA extrajo escenarios, restricción y base de conocimiento (demo)"),'onboarding_blocker_fake_ai_present');
ok(projectsUi.includes('data._saveCustomProjects&&data._saveCustomProjects()'),'onboarding_blocker_update_local_first_still_present');
ok(projectsUi.includes('cada quincena debe cubrirse la mitad de las visitas del mes'),'onboarding_blocker_false_5050_present');
const tyaBridge=readText('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
ok(tyaBridge.includes("'/api/tya/cinepolis/hr-live'")&&tyaBridge.includes("ctx.tenantId==='tya'")&&tyaBridge.includes("includes('cinepolis')"),'tya_cinepolis_bridge_explicitly_client_specific');

const liveGate=readText('tools/qa/tya-f10-live-admin-fresh-content-gate.mjs');
ok(liveGate.includes('rowLevelOperationalDigestRequired:true'),'live_gate_row_digest_required');
ok(liveGate.includes('Object.entries(expectedCountries)'),'live_gate_country_key_value_compare');
ok(!liveGate.includes("JSON.stringify(actual.summary?.byCountry||{})!==JSON.stringify(providerOperationalSummary.byCountry)"),'live_gate_order_sensitive_compare_removed');
const controlled=readText('tools/qa/cxorbia-controlled-runners-contract-gate.mjs');
ok(controlled.includes('validate-cxorbia-state-sync.js'),'controlled_runner_continuity_wired');

const docs=[
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md',
  'app/docs/CAMBIOS-BACKEND.md',
  'app/docs/RESUMEN-PARA-CLAUDE.md',
  'app/docs/PENDIENTES-PROTOTIPO.md',
  'CAMBIOS-BACKEND.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md'
];
for(const p of docs){const t=readText(p);ok(t.includes(EPOCH),`doc_epoch:${p}`);ok(t.includes(NEXT),`doc_next:${p}`);}
const index=readText('app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md');
ok(index.includes('Cada proyecto elige su fuente operacional')&&index.includes('sourceSuccessorDeployed')===false,'index_project_source_rule');
const checkpoint=readText('app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md');
ok(checkpoint.includes('Cada proyecto debe poder elegir Hoja de Ruta interna o externa'),'checkpoint_project_source_rule');
const sourceLock=readText('app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md');
ok(sourceLock.includes('Cada proyecto elige su propia fuente operacional'),'source_lock_project_source_rule');
ok(sourceLock.includes('Source successor de rama — NO desplegado'),'source_lock_live_vs_source_split');

console.log('STATE_SYNC_GATE_PASS');
console.log(`syncEpoch=${EPOCH}`);
console.log(`phase=${PHASE}`);
console.log(`step=${STEP}`);
console.log(`incident=${INCIDENT}:${STATUS}`);
console.log(`liveF10DeployRun=${DEPLOY_RUN}`);
console.log(`liveF10ReadKpiRun=${LIVE_RUN}`);
console.log(`operationalEvidenceDigestSha256=${OP_DIGEST}`);
console.log(`moduleBlobChecks=${moduleChecks}`);
console.log('liveModuleLineage=EXACT_PRESERVED');
console.log('sourceSuccessor=SOURCE_ONLY_NOT_DEPLOYED');
console.log('projectOperationalSource=PER_PROJECT_INTERNAL_OR_EXTERNAL');
console.log('projectQuestionnaireSource=INDEPENDENT');
console.log('newProjectProductionOnboarding=HOLD_PENDING_GATES');
console.log('operationalProviderPolicy=DISABLED');
console.log('projectProviderPolicy=DISABLED');
console.log(`next=${NEXT}`);
