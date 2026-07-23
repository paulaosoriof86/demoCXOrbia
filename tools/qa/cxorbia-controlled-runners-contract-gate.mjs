#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const outDir=path.join(root,'.tmp/cxorbia-controlled-runners-contract-gate');
fs.mkdirSync(outDir,{recursive:true});
const blockers=[],warnings=[];
const add=(list,code,detail='')=>list.push(detail?`${code}:${detail}`:code);
const exists=rel=>fs.existsSync(path.join(root,rel));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const has=(text,pattern,code)=>{if(!pattern.test(text))add(blockers,code);};
const lacks=(text,pattern,code)=>{if(pattern.test(text))add(blockers,code);};

let contract;
try{contract=JSON.parse(read('backend/contracts/cxorbia-controlled-runners-v1.json'));}
catch(error){add(blockers,'contract_unreadable',error.message);}

if(contract){
  if(contract.contractId!=='cxorbia-controlled-runners-v1')add(blockers,'contract_identity_mismatch');
  if(contract.repository!=='paulaosoriof86/demoCXOrbia')add(blockers,'repository_mismatch');
  if(contract.branch!=='docs-tya-v6-v71-audit')add(blockers,'branch_mismatch');
  if(Number(contract.pullRequest)!==7)add(blockers,'pull_request_mismatch');

  const atomic=contract.authorizedRunners?.atomicApply;
  const readonly=contract.authorizedRunners?.readonlyPostGates;
  for(const [name,item] of [['atomic',atomic],['readonly',readonly]]){
    if(!item?.workflow||!exists(item.workflow))add(blockers,`${name}_workflow_missing`,item?.workflow||'undefined');
    if(!item?.script||!exists(item.script))add(blockers,`${name}_script_missing`,item?.script||'undefined');
  }

  const requiredProfiles=['V174_R20_M1_CORTE2A','CORTE3_FINANCIAL_RECONCILIATION_R20'];
  const actualProfiles=Array.isArray(readonly?.profiles)?readonly.profiles:[readonly?.profile].filter(Boolean);
  for(const profile of requiredProfiles)if(!actualProfiles.includes(profile))add(blockers,'readonly_profile_missing',profile);
  if(!exists('tools/qa/tya-corte3-financial-reconciliation-r20-gate.mjs'))add(blockers,'corte3_financial_gate_missing');

  const stable=readonly?.stableVisitIdentity||{};
  const stableFiles=[stable.helper,stable.applyScript,stable.runtimeInventoryFilter,stable.contractGate,stable.payloadGate];
  for(const file of stableFiles)if(!file||!exists(file))add(blockers,'stable_visit_identity_file_missing',file||'undefined');
  if(stable.version!=='tya-stable-visit-id-r20-row-identity-v1')add(blockers,'stable_visit_identity_version_invalid',String(stable.version||''));
  const canonical=['tenantId','projectId','periodKey','country','sourceRow'];
  if(JSON.stringify(stable.canonicalFields||[])!==JSON.stringify(canonical))add(blockers,'stable_visit_identity_fields_invalid');
  for(const profile of requiredProfiles){
    if(!stable.requiredInProfiles?.includes(profile))add(blockers,'stable_visit_identity_profile_missing',profile);
    if(readonly?.profileDefinitions?.[profile]?.stableVisitIdentityRequired!==true)add(blockers,'profile_stable_visit_identity_not_required',profile);
    if(readonly?.profileDefinitions?.[profile]?.runtimeInventoryFilterRequired!==true)add(blockers,'profile_runtime_inventory_filter_not_required',profile);
  }
  const reviewContract=readonly?.profileDefinitions?.CORTE3_FINANCIAL_RECONCILIATION_R20?.reviewContract;
  if(!reviewContract||!exists(reviewContract))add(blockers,'corte3_review_contract_missing',reviewContract||'undefined');

  if(!blockers.length){
    const atomicYml=read(atomic.workflow),readonlyYml=read(readonly.workflow);
    const atomicScript=read(atomic.script),readonlyScript=read(readonly.script);
    const stableHelper=read(stable.helper),stableApply=read(stable.applyScript);
    const runtimeFilter=read(stable.runtimeInventoryFilter),stableContractGate=read(stable.contractGate),payloadGate=read(stable.payloadGate);
    const review=JSON.parse(read(reviewContract));

    has(atomicYml,/^name:\s*CXORBIA_ATOMIC_APPLY_RUNNER\s*$/m,'atomic_name_missing');
    has(atomicYml,/docs-tya-v6-v71-audit/,'atomic_branch_missing');
    has(atomicYml,/\.github\/cxorbia-apply-requests\/request\.json/,'atomic_request_path_missing');
    has(atomicYml,/permissions:[\s\S]*?contents:\s*write[\s\S]*?issues:\s*write[\s\S]*?statuses:\s*write/,'atomic_permissions_invalid');
    has(atomicYml,/cancel-in-progress:\s*false/,'atomic_concurrency_missing');
    has(atomicYml,/cxorbia-source-lock-atomic-apply\.mjs/,'atomic_source_lock_mode_missing');
    lacks(atomicYml,/firebase\s+deploy|gcloud\s+|firestore:|storage:|functions:/i,'atomic_deploy_command_forbidden');
    lacks(atomicYml,/(?:branches|ref):[\s\S]{0,80}\bmain\b/m,'atomic_main_target_forbidden');
    has(atomicScript,/request_commit_scope_exact/,'atomic_request_scope_guard_missing');
    has(atomicScript,/working_tree_delta_exact/,'atomic_delta_guard_missing');
    has(atomicScript,/git_blob_sha_required/,'atomic_blob_guard_missing');
    has(atomicScript,/expectedCurrentSha256/,'atomic_current_hash_guard_missing');
    has(atomicScript,/git['"],\s*\[['"]push['"],\s*['"]origin['"]/,'atomic_push_missing');
    has(atomicScript,/git['"],\s*\[['"]rm['"],\s*['"]--['"],\s*requestPath/,'atomic_request_cleanup_missing');

    has(readonlyYml,/^name:\s*CXORBIA_READONLY_POST_GATES_RUNNER\s*$/m,'readonly_name_missing');
    has(readonlyYml,/docs-tya-v6-v71-audit/,'readonly_branch_missing');
    has(readonlyYml,/\.github\/cxorbia-gate-requests\/request\.json/,'readonly_request_path_missing');
    has(readonlyYml,/permissions:[\s\S]*?contents:\s*read[\s\S]*?issues:\s*write[\s\S]*?statuses:\s*write/,'readonly_permissions_invalid');
    has(readonlyYml,/playwright@1\.55\.0/,'readonly_playwright_pin_missing');
    has(readonlyYml,/playwright install --with-deps chromium/,'readonly_chromium_install_missing');
    has(readonlyYml,/cxorbia\/readonly-post-gates\/overall/,'readonly_status_telemetry_missing');
    lacks(readonlyYml,/contents:\s*write/,'readonly_contents_write_forbidden');
    lacks(readonlyYml,/firebase\s+deploy|gcloud\s+|firestore:|storage:|functions:/i,'readonly_deploy_command_forbidden');
    lacks(readonlyYml,/(?:branches|ref):[\s\S]{0,80}\bmain\b/m,'readonly_main_target_forbidden');

    has(readonlyScript,/GITHUB_HEAD_REF/,'readonly_effective_branch_missing');
    has(readonlyScript,/tya-project-period-kpi-history-gate-r20/,'readonly_r20_gate_missing');
    has(readonlyScript,/tya-corte1-m1-regression-lock/,'readonly_m1_gate_missing');
    has(readonlyScript,/tya-corte2a-shopper-operation-canonical-gate/,'readonly_corte2a_gate_missing');
    has(readonlyScript,/tya-v174-corte2a-empalme-directo-verify/,'readonly_verifier_missing');
    has(readonlyScript,/CORTE3_FINANCIAL_RECONCILIATION_R20/,'readonly_corte3_profile_missing');
    has(readonlyScript,/tya-financial-workbook-live-hr-reconcile-r14c/,'readonly_corte3_reconcile_missing');
    has(readonlyScript,/tya-corte3-financial-reconciliation-r20-gate/,'readonly_corte3_gate_missing');
    has(readonlyScript,/tya-filter-source-safe-to-inventory-r20/,'readonly_runtime_filter_missing');
    has(readonlyScript,/tya-source-safe-stable-visit-payload-r20-gate/,'readonly_stable_payload_gate_missing');
    has(readonlyScript,/tya-stabilize-source-safe-visit-ids-r20/,'readonly_stable_visit_apply_missing');
    has(readonlyScript,/runtimeInventoryStableGates\('tya-v174'\)/,'v174_runtime_stable_identity_missing');
    has(readonlyScript,/runtimeInventoryStableGates\('tya-corte3'\)/,'corte3_runtime_stable_identity_missing');
    has(readonlyScript,/tya-corte3-financial-r20-delta-review-v1/,'corte3_review_contract_not_consumed');
    has(readonlyScript,/repositoryWrites:\s*false/,'readonly_repository_write_guard_missing');
    has(readonlyScript,/dataWrites:\s*false/,'readonly_data_write_guard_missing');
    has(readonlyScript,/production:\s*false/,'readonly_production_guard_missing');

    has(stableHelper,/tenantId='tya'.*projectId='cinepolis'.*periodKey.*country.*sourceRow/s,'stable_helper_canonical_fields_missing');
    lacks(stableHelper,/cinemaId|shopping|quincena|franja/,'stable_helper_mutable_field_dependency_forbidden');
    has(stableApply,/stableVisitIdentityApplied:true/,'stable_apply_marker_missing');
    has(stableApply,/stable_id_collision/,'stable_apply_collision_guard_missing');
    has(runtimeFilter,/buildStableVisitId/,'runtime_filter_stable_helper_missing');
    has(runtimeFilter,/stableVisitIdentityApplied:true/,'runtime_filter_stable_marker_missing');
    has(stableContractGate,/mutable_fields_changed_visit_id/,'stable_contract_mutable_regression_missing');
    has(payloadGate,/visit_id_not_stable/,'stable_payload_validation_missing');

    if(review.contractId!=='tya-corte3-financial-r20-delta-review-v1')add(blockers,'corte3_review_contract_identity_invalid');
    if(review.safeState?.paymentApproval!==false||review.safeState?.paymentsExecuted!==false||review.safeState?.imports!==false||review.safeState?.dataWrites!==false||review.safeState?.production!==false)add(blockers,'corte3_review_contract_unsafe');
    if(!Array.isArray(review.approvedNewExactLinks)||review.approvedNewExactLinks.length!==15)add(blockers,'corte3_approved_exact_count_invalid');
    if(review.retainedForOperationalReview?.lostPriorExactLinks?.length!==2)add(blockers,'corte3_retained_lost_count_invalid');
    if(review.retainedForOperationalReview?.statusChangedButStillReviewRequired?.length!==1)add(blockers,'corte3_retained_status_count_invalid');

    const atomicPolicy=contract.atomicApplyPolicy||{},readonlyPolicy=contract.readonlyGatePolicy||{};
    if(atomicPolicy.directFunctionalTreeMutationOutsideRunner!==false)add(blockers,'direct_tree_mutation_policy_not_closed');
    if(atomicPolicy.sequentialContentsApiFunctionalWrites!==false)add(blockers,'sequential_contents_policy_not_closed');
    if(atomicPolicy.newBranch!==false)add(blockers,'new_branch_policy_not_closed');
    if(atomicPolicy.newPullRequest!==false)add(blockers,'new_pr_policy_not_closed');
    if(atomicPolicy.forcePush!==false)add(blockers,'force_push_policy_not_closed');
    if(readonlyPolicy.repositoryWrites!==false)add(blockers,'readonly_repository_write_policy_not_closed');
    if(readonlyPolicy.dataWrites!==false)add(blockers,'readonly_data_write_policy_not_closed');
    if(readonlyPolicy.deploy!==false)add(blockers,'readonly_deploy_policy_not_closed');
    if(readonlyPolicy.production!==false)add(blockers,'readonly_production_policy_not_closed');
    if(readonlyPolicy.commitStatusTelemetry!==true)add(blockers,'readonly_status_telemetry_not_authorized');
    if(readonly?.statusesPermission!=='write')add(blockers,'readonly_status_permission_contract_missing');

    const exactTargets=['app/core/build-lock.js','app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json'].sort();
    const contractTargets=(atomicPolicy.sourceLockModeExactException||[]).slice().sort();
    if(JSON.stringify(contractTargets)!==JSON.stringify(exactTargets))add(blockers,'source_lock_exception_not_exact',contractTargets.join(','));
  }
}

const report={
  ok:blockers.length===0,
  decision:blockers.length?'HOLD_CXORBIA_CONTROLLED_RUNNERS_CONTRACT':'PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT',
  blockers,warnings,
  safeState:{deploy:false,merge:false,production:false,dataWrites:false,repositoryContentWritesByReadonlyRunner:false,commitStatusTelemetryOnly:true}
};
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),[
  '# CXOrbia controlled runners contract gate','',
  `Decision: **${report.decision}**`,'','## Blockers',
  ...(blockers.length?blockers.map(x=>`- ${x}`):['- none']),'','## Warnings',
  ...(warnings.length?warnings.map(x=>`- ${x}`):['- none'])
].join('\n')+'\n','utf8');
console.log(JSON.stringify(report,null,2));
if(blockers.length)process.exit(1);
