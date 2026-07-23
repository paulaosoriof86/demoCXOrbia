#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const outDir=path.join(root,'.tmp/cxorbia-controlled-runners-contract-gate');
fs.mkdirSync(outDir,{recursive:true});
const blockers=[],warnings=[];
const add=(list,code,detail='')=>list.push(detail?`${code}:${detail}`:code);
const exists=rel=>Boolean(rel)&&fs.existsSync(path.join(root,rel));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const requireFile=(rel,code)=>{if(!exists(rel))add(blockers,code,rel||'undefined');};
const has=(text,pattern,code)=>{if(!pattern.test(text))add(blockers,code);};
const lacks=(text,pattern,code)=>{if(pattern.test(text))add(blockers,code);};

let contract=null;
try{contract=JSON.parse(read('backend/contracts/cxorbia-controlled-runners-v1.json'));}
catch(error){add(blockers,'contract_unreadable',error.message);}

if(contract){
  if(contract.contractId!=='cxorbia-controlled-runners-v1')add(blockers,'contract_identity_mismatch');
  if(contract.repository!=='paulaosoriof86/demoCXOrbia')add(blockers,'repository_mismatch');
  if(contract.branch!=='docs-tya-v6-v71-audit')add(blockers,'branch_mismatch');
  if(Number(contract.pullRequest)!==7)add(blockers,'pull_request_mismatch');

  const atomic=contract.authorizedRunners?.atomicApply||{};
  const readonly=contract.authorizedRunners?.readonlyPostGates||{};
  for(const [name,item] of [['atomic',atomic],['readonly',readonly]]){
    requireFile(item.workflow,`${name}_workflow_missing`);
    requireFile(item.script,`${name}_script_missing`);
  }

  const profiles=['V174_R20_M1_CORTE2A','CORTE3_FINANCIAL_RECONCILIATION_R20'];
  const actual=Array.isArray(readonly.profiles)?readonly.profiles:[readonly.profile].filter(Boolean);
  for(const profile of profiles){
    if(!actual.includes(profile))add(blockers,'readonly_profile_missing',profile);
    if(readonly.profileDefinitions?.[profile]?.stableVisitIdentityRequired!==true)add(blockers,'stable_identity_not_required',profile);
    if(readonly.profileDefinitions?.[profile]?.runtimeInventoryFilterRequired!==true)add(blockers,'runtime_filter_not_required',profile);
  }

  const stable=readonly.stableVisitIdentity||{};
  for(const [key,code] of [
    ['helper','stable_helper_missing'],
    ['applyScript','stable_apply_missing'],
    ['runtimeInventoryFilter','runtime_inventory_filter_missing'],
    ['contractGate','stable_contract_gate_missing'],
    ['payloadGate','stable_payload_gate_missing']
  ])requireFile(stable[key],code);
  if(stable.version!=='tya-stable-visit-id-r20-row-identity-v1')add(blockers,'stable_identity_version_invalid');
  const canonical=['tenantId','projectId','periodKey','country','sourceRow'];
  if(JSON.stringify(stable.canonicalFields||[])!==JSON.stringify(canonical))add(blockers,'stable_identity_fields_invalid');

  const c3=readonly.profileDefinitions?.CORTE3_FINANCIAL_RECONCILIATION_R20||{};
  requireFile(c3.reviewContract,'corte3_review_contract_missing');
  requireFile('tools/qa/tya-corte3-financial-reconciliation-r20-gate.mjs','corte3_financial_gate_missing');
  requireFile('tools/release/tya-v174-r20-source-lock-proposal.mjs','source_lock_proposal_missing');
  requireFile('tools/release/tya-v174-proposed-source-lock-verify.mjs','proposed_source_lock_verify_missing');

  if(!blockers.length){
    const atomicYml=read(atomic.workflow),atomicScript=read(atomic.script);
    const readonlyYml=read(readonly.workflow),readonlyScript=read(readonly.script);
    const helper=read(stable.helper),apply=read(stable.applyScript),filter=read(stable.runtimeInventoryFilter);
    const stableGate=read(stable.contractGate),payloadGate=read(stable.payloadGate);
    const proposedVerify=read('tools/release/tya-v174-proposed-source-lock-verify.mjs');
    const review=JSON.parse(read(c3.reviewContract));

    has(atomicYml,/^name:\s*CXORBIA_ATOMIC_APPLY_RUNNER\s*$/m,'atomic_name_missing');
    has(atomicYml,/permissions:[\s\S]*?contents:\s*write[\s\S]*?issues:\s*write[\s\S]*?statuses:\s*write/,'atomic_permissions_invalid');
    lacks(atomicYml,/firebase\s+deploy|gcloud\s+|firestore:|storage:|functions:/i,'atomic_deploy_forbidden');
    lacks(atomicYml,/(?:branches|ref):[\s\S]{0,80}\bmain\b/m,'atomic_main_forbidden');
    has(atomicScript,/request_commit_scope_exact/,'atomic_scope_guard_missing');
    has(atomicScript,/working_tree_delta_exact/,'atomic_delta_guard_missing');
    has(atomicScript,/expectedCurrentSha256/,'atomic_hash_guard_missing');
    has(atomicScript,/git['"],\s*\[['"]push['"],\s*['"]origin['"]/,'atomic_push_missing');

    has(readonlyYml,/^name:\s*CXORBIA_READONLY_POST_GATES_RUNNER\s*$/m,'readonly_name_missing');
    has(readonlyYml,/permissions:[\s\S]*?contents:\s*read[\s\S]*?issues:\s*write[\s\S]*?statuses:\s*write/,'readonly_permissions_invalid');
    has(readonlyYml,/playwright@1\.55\.0/,'playwright_pin_missing');
    lacks(readonlyYml,/contents:\s*write/,'readonly_contents_write_forbidden');
    lacks(readonlyYml,/firebase\s+deploy|gcloud\s+|firestore:|storage:|functions:/i,'readonly_deploy_forbidden');
    lacks(readonlyYml,/(?:branches|ref):[\s\S]{0,80}\bmain\b/m,'readonly_main_forbidden');

    for(const [pattern,code] of [
      [/runtimeInventoryStableGates\('tya-v174'\)/,'v174_runtime_stable_missing'],
      [/runtimeInventoryStableGates\('tya-corte3'\)/,'corte3_runtime_stable_missing'],
      [/tya-v174-r20-source-lock-proposal/,'post_build_source_lock_proposal_not_called'],
      [/tya-v174-proposed-source-lock-verify/,'proposed_source_lock_verify_not_called'],
      [/tya-corte3-financial-r20-delta-review-v1/,'corte3_review_not_consumed'],
      [/repositoryWrites:\s*false/,'readonly_repo_write_guard_missing'],
      [/dataWrites:\s*false/,'readonly_data_write_guard_missing'],
      [/production:\s*false/,'readonly_production_guard_missing']
    ])has(readonlyScript,pattern,code);

    has(proposedVerify,/tya-v174-corte2a-empalme-directo-verify\.mjs/,'proposed_verify_does_not_delegate_canonical_verifier');
    has(proposedVerify,/restore\(\)/,'proposed_verify_restore_missing');
    lacks(proposedVerify,/git\s+commit|git\s+push|firebase\s+deploy/i,'proposed_verify_write_forbidden');

    has(helper,/tenantId='tya'.*projectId='cinepolis'.*periodKey.*country.*sourceRow/s,'stable_helper_fields_missing');
    lacks(helper,/cinemaId|shopping|quincena|franja/,'stable_helper_mutable_dependency_forbidden');
    has(apply,/stableVisitIdentityApplied:true/,'stable_apply_marker_missing');
    has(filter,/buildStableVisitId/,'runtime_filter_helper_missing');
    has(filter,/stableVisitIdentityApplied:true/,'runtime_filter_marker_missing');
    has(stableGate,/mutable_fields_changed_visit_id/,'stable_mutable_regression_gate_missing');
    has(payloadGate,/visit_id_not_stable/,'stable_payload_gate_missing_validation');

    if(review.contractId!=='tya-corte3-financial-r20-delta-review-v1')add(blockers,'review_contract_identity_invalid');
    if(review.safeState?.paymentApproval!==false||review.safeState?.paymentsExecuted!==false||review.safeState?.imports!==false||review.safeState?.dataWrites!==false||review.safeState?.production!==false)add(blockers,'review_contract_unsafe');
    if(review.approvedNewExactLinks?.length!==15)add(blockers,'approved_exact_count_invalid');
    if(review.retainedForOperationalReview?.lostPriorExactLinks?.length!==2)add(blockers,'retained_lost_count_invalid');
    if(review.retainedForOperationalReview?.statusChangedButStillReviewRequired?.length!==1)add(blockers,'retained_status_count_invalid');

    const ap=contract.atomicApplyPolicy||{},rp=contract.readonlyGatePolicy||{};
    for(const [value,code] of [
      [ap.directFunctionalTreeMutationOutsideRunner,'direct_tree_policy_open'],
      [ap.sequentialContentsApiFunctionalWrites,'sequential_contents_policy_open'],
      [ap.newBranch,'new_branch_policy_open'],
      [ap.newPullRequest,'new_pr_policy_open'],
      [ap.forcePush,'force_push_policy_open'],
      [rp.repositoryWrites,'readonly_repo_write_policy_open'],
      [rp.dataWrites,'readonly_data_write_policy_open'],
      [rp.deploy,'readonly_deploy_policy_open'],
      [rp.production,'readonly_production_policy_open']
    ])if(value!==false)add(blockers,code);
  }
}

const report={ok:blockers.length===0,decision:blockers.length?'HOLD_CXORBIA_CONTROLLED_RUNNERS_CONTRACT':'PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT',blockers,warnings,safeState:{deploy:false,merge:false,production:false,dataWrites:false,repositoryContentWritesByReadonlyRunner:false,commitStatusTelemetryOnly:true}};
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),['# CXOrbia controlled runners contract gate','',`Decision: **${report.decision}**`,'','## Blockers',...(blockers.length?blockers.map(x=>`- ${x}`):['- none']),'','## Warnings',...(warnings.length?warnings.map(x=>`- ${x}`):['- none'])].join('\n')+'\n','utf8');
console.log(JSON.stringify(report,null,2));
if(blockers.length)process.exit(1);
