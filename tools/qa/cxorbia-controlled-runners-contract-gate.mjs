#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outDir = path.join(root, '.tmp/cxorbia-controlled-runners-contract-gate');
fs.mkdirSync(outDir, { recursive: true });

const blockers = [];
const warnings = [];
const add = (list, code, detail = '') => list.push(detail ? `${code}:${detail}` : code);
const exists = rel => fs.existsSync(path.join(root, rel));
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const has = (text, pattern, code) => { if (!pattern.test(text)) add(blockers, code); };
const lacks = (text, pattern, code) => { if (pattern.test(text)) add(blockers, code); };

let contract;
try {
  contract = JSON.parse(read('backend/contracts/cxorbia-controlled-runners-v1.json'));
} catch (error) {
  add(blockers, 'contract_unreadable', error.message);
}

if (contract) {
  if (contract.contractId !== 'cxorbia-controlled-runners-v1') add(blockers, 'contract_identity_mismatch');
  if (contract.repository !== 'paulaosoriof86/demoCXOrbia') add(blockers, 'repository_mismatch');
  if (contract.branch !== 'docs-tya-v6-v71-audit') add(blockers, 'branch_mismatch');
  if (Number(contract.pullRequest) !== 7) add(blockers, 'pull_request_mismatch');

  const atomic = contract.authorizedRunners?.atomicApply;
  const readonly = contract.authorizedRunners?.readonlyPostGates;
  for (const [name, item] of [['atomic', atomic], ['readonly', readonly]]) {
    if (!item?.workflow || !exists(item.workflow)) add(blockers, `${name}_workflow_missing`, item?.workflow || 'undefined');
    if (!item?.script || !exists(item.script)) add(blockers, `${name}_script_missing`, item?.script || 'undefined');
  }

  const requiredReadonlyProfiles = ['V174_R20_M1_CORTE2A', 'CORTE3_FINANCIAL_RECONCILIATION_R20'];
  const actualProfiles = Array.isArray(readonly?.profiles) ? readonly.profiles : [readonly?.profile].filter(Boolean);
  for (const profile of requiredReadonlyProfiles) if (!actualProfiles.includes(profile)) add(blockers, 'readonly_profile_missing', profile);
  if (!exists('tools/qa/tya-corte3-financial-reconciliation-r20-gate.mjs')) add(blockers, 'corte3_financial_gate_missing');

  const stableIdentity=readonly?.stableVisitIdentity||{};
  const stableFiles=[stableIdentity.helper,stableIdentity.applyScript,stableIdentity.gate];
  for(const file of stableFiles){
    if(!file||!exists(file))add(blockers,'stable_visit_identity_file_missing',file||'undefined');
  }
  if(stableIdentity.version!=='tya-stable-visit-id-r20-row-identity-v1')add(blockers,'stable_visit_identity_version_invalid',String(stableIdentity.version||''));
  const canonicalFields=['tenantId','projectId','periodKey','country','sourceRow'];
  if(JSON.stringify(stableIdentity.canonicalFields||[])!==JSON.stringify(canonicalFields))add(blockers,'stable_visit_identity_fields_invalid');
  for(const profile of requiredReadonlyProfiles){
    if(!stableIdentity.requiredInProfiles?.includes(profile))add(blockers,'stable_visit_identity_profile_missing',profile);
    if(readonly?.profileDefinitions?.[profile]?.stableVisitIdentityRequired!==true)add(blockers,'profile_stable_visit_identity_not_required',profile);
  }

  if (!blockers.length) {
    const atomicYml = read(atomic.workflow);
    const readonlyYml = read(readonly.workflow);
    const atomicScript = read(atomic.script);
    const readonlyScript = read(readonly.script);
    const stableHelper=read(stableIdentity.helper);
    const stableApply=read(stableIdentity.applyScript);
    const stableGate=read(stableIdentity.gate);

    has(atomicYml, /^name:\s*CXORBIA_ATOMIC_APPLY_RUNNER\s*$/m, 'atomic_name_missing');
    has(atomicYml, /docs-tya-v6-v71-audit/, 'atomic_branch_missing');
    has(atomicYml, /\.github\/cxorbia-apply-requests\/request\.json/, 'atomic_request_path_missing');
    has(atomicYml, /permissions:[\s\S]*?contents:\s*write[\s\S]*?issues:\s*write[\s\S]*?statuses:\s*write/, 'atomic_permissions_invalid');
    has(atomicYml, /cancel-in-progress:\s*false/, 'atomic_concurrency_missing');
    has(atomicYml, /cxorbia-source-lock-atomic-apply\.mjs/, 'atomic_source_lock_mode_missing');
    lacks(atomicYml, /firebase\s+deploy|gcloud\s+|firestore:|storage:|functions:/i, 'atomic_deploy_command_forbidden');
    lacks(atomicYml, /(?:branches|ref):[\s\S]{0,80}\bmain\b/m, 'atomic_main_target_forbidden');

    has(atomicScript, /request_commit_scope_exact/, 'atomic_request_scope_guard_missing');
    has(atomicScript, /working_tree_delta_exact/, 'atomic_delta_guard_missing');
    has(atomicScript, /git_blob_sha_required/, 'atomic_blob_guard_missing');
    has(atomicScript, /expectedCurrentSha256/, 'atomic_current_hash_guard_missing');
    has(atomicScript, /git['"],\s*\[['"]push['"],\s*['"]origin['"]/, 'atomic_push_missing');
    has(atomicScript, /git['"],\s*\[['"]rm['"],\s*['"]--['"],\s*requestPath/, 'atomic_request_cleanup_missing');

    has(readonlyYml, /^name:\s*CXORBIA_READONLY_POST_GATES_RUNNER\s*$/m, 'readonly_name_missing');
    has(readonlyYml, /docs-tya-v6-v71-audit/, 'readonly_branch_missing');
    has(readonlyYml, /\.github\/cxorbia-gate-requests\/request\.json/, 'readonly_request_path_missing');
    has(readonlyYml, /permissions:[\s\S]*?contents:\s*read[\s\S]*?issues:\s*write[\s\S]*?statuses:\s*write/, 'readonly_permissions_invalid');
    has(readonlyYml, /playwright@1\.55\.0/, 'readonly_playwright_pin_missing');
    has(readonlyYml, /playwright install --with-deps chromium/, 'readonly_chromium_install_missing');
    has(readonlyYml, /cxorbia\/readonly-post-gates\/overall/, 'readonly_status_telemetry_missing');
    lacks(readonlyYml, /contents:\s*write/, 'readonly_contents_write_forbidden');
    lacks(readonlyYml, /firebase\s+deploy|gcloud\s+|firestore:|storage:|functions:/i, 'readonly_deploy_command_forbidden');
    lacks(readonlyYml, /(?:branches|ref):[\s\S]{0,80}\bmain\b/m, 'readonly_main_target_forbidden');

    has(readonlyScript, /GITHUB_HEAD_REF/, 'readonly_effective_branch_missing');
    has(readonlyScript, /tya-project-period-kpi-history-gate-r20/, 'readonly_r20_gate_missing');
    has(readonlyScript, /tya-corte1-m1-regression-lock/, 'readonly_m1_gate_missing');
    has(readonlyScript, /tya-corte2a-shopper-operation-canonical-gate/, 'readonly_corte2a_gate_missing');
    has(readonlyScript, /tya-v174-corte2a-empalme-directo-verify/, 'readonly_verifier_missing');
    has(readonlyScript, /CORTE3_FINANCIAL_RECONCILIATION_R20/, 'readonly_corte3_profile_missing');
    has(readonlyScript, /tya-financial-workbook-live-hr-reconcile-r14c/, 'readonly_corte3_reconcile_missing');
    has(readonlyScript, /tya-corte3-financial-reconciliation-r20-gate/, 'readonly_corte3_gate_missing');
    has(readonlyScript, /tya-stabilize-source-safe-visit-ids-r20/, 'readonly_stable_visit_apply_missing');
    has(readonlyScript, /tya-stable-visit-id-r20-gate/, 'readonly_stable_visit_gate_missing');
    has(readonlyScript, /stableVisitIdentityGates\('tya-v174'\)/, 'v174_stable_visit_identity_missing');
    has(readonlyScript, /stableVisitIdentityGates\('tya-corte3'\)/, 'corte3_stable_visit_identity_missing');
    has(readonlyScript, /repositoryWrites:\s*false/, 'readonly_repository_write_guard_missing');
    has(readonlyScript, /dataWrites:\s*false/, 'readonly_data_write_guard_missing');
    has(readonlyScript, /production:\s*false/, 'readonly_production_guard_missing');

    has(stableHelper,/tenantId='tya'.*projectId='cinepolis'.*periodKey.*country.*sourceRow/s,'stable_helper_canonical_fields_missing');
    lacks(stableHelper,/cinemaId|shopping|quincena|franja/,'stable_helper_mutable_field_dependency_forbidden');
    has(stableApply,/stableVisitIdentityApplied:true/,'stable_apply_marker_missing');
    has(stableApply,/stable_id_collision/,'stable_apply_collision_guard_missing');
    has(stableApply,/hr_row_identity_mismatch/,'stable_apply_hr_row_guard_missing');
    has(stableGate,/mutable_fields_changed_visit_id/,'stable_gate_mutable_regression_missing');

    const atomicPolicy = contract.atomicApplyPolicy || {};
    const readonlyPolicy = contract.readonlyGatePolicy || {};
    if (atomicPolicy.directFunctionalTreeMutationOutsideRunner !== false) add(blockers, 'direct_tree_mutation_policy_not_closed');
    if (atomicPolicy.sequentialContentsApiFunctionalWrites !== false) add(blockers, 'sequential_contents_policy_not_closed');
    if (atomicPolicy.newBranch !== false) add(blockers, 'new_branch_policy_not_closed');
    if (atomicPolicy.newPullRequest !== false) add(blockers, 'new_pr_policy_not_closed');
    if (atomicPolicy.forcePush !== false) add(blockers, 'force_push_policy_not_closed');
    if (readonlyPolicy.repositoryWrites !== false) add(blockers, 'readonly_repository_write_policy_not_closed');
    if (readonlyPolicy.dataWrites !== false) add(blockers, 'readonly_data_write_policy_not_closed');
    if (readonlyPolicy.deploy !== false) add(blockers, 'readonly_deploy_policy_not_closed');
    if (readonlyPolicy.production !== false) add(blockers, 'readonly_production_policy_not_closed');
    if (readonlyPolicy.commitStatusTelemetry !== true) add(blockers, 'readonly_status_telemetry_not_authorized');
    if (readonly?.statusesPermission !== 'write') add(blockers, 'readonly_status_permission_contract_missing');

    const exactSourceLockTargets = [
      'app/core/build-lock.js',
      'app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json'
    ].sort();
    const contractTargets = (atomicPolicy.sourceLockModeExactException || []).slice().sort();
    if (JSON.stringify(contractTargets) !== JSON.stringify(exactSourceLockTargets)) {
      add(blockers, 'source_lock_exception_not_exact', contractTargets.join(','));
    }
  }
}

const report = {
  ok: blockers.length === 0,
  decision: blockers.length ? 'HOLD_CXORBIA_CONTROLLED_RUNNERS_CONTRACT' : 'PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT',
  blockers,
  warnings,
  safeState: {
    deploy: false,
    merge: false,
    production: false,
    dataWrites: false,
    repositoryContentWritesByReadonlyRunner: false,
    commitStatusTelemetryOnly: true
  }
};

fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(outDir, 'report.md'), [
  '# CXOrbia controlled runners contract gate',
  '',
  `Decision: **${report.decision}**`,
  '',
  '## Blockers',
  ...(blockers.length ? blockers.map(x => `- ${x}`) : ['- none']),
  '',
  '## Warnings',
  ...(warnings.length ? warnings.map(x => `- ${x}`) : ['- none'])
].join('\n') + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
if (blockers.length) process.exit(1);
