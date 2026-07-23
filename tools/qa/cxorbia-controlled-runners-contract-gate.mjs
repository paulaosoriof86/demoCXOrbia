#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const contractPath = path.join(root, 'backend/contracts/cxorbia-controlled-runners-v1.json');
const outDir = path.join(root, '.tmp/cxorbia-controlled-runners-contract-gate');
fs.mkdirSync(outDir, { recursive: true });

const blockers = [];
const warnings = [];
const add = (arr, code, detail = '') => arr.push(detail ? `${code}:${detail}` : code);
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

let contract = null;
try {
  contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
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
  for (const item of [atomic, readonly]) {
    if (!item?.workflow || !fs.existsSync(path.join(root, item.workflow))) add(blockers, 'workflow_missing', item?.workflow || 'undefined');
    if (!item?.script || !fs.existsSync(path.join(root, item.script))) add(blockers, 'script_missing', item?.script || 'undefined');
  }

  if (!blockers.length) {
    const atomicYml = read(atomic.workflow);
    const readonlyYml = read(readonly.workflow);
    const atomicScript = read(atomic.script);
    const readonlyScript = read(readonly.script);

    const requireText = (text, pattern, code, detail = '') => {
      if (!pattern.test(text)) add(blockers, code, detail);
    };
    const forbidText = (text, pattern, code, detail = '') => {
      if (pattern.test(text)) add(blockers, code, detail);
    };

    requireText(atomicYml, /^name:\s*CXORBIA_ATOMIC_APPLY_RUNNER\s*$/m, 'atomic_name_missing');
    requireText(atomicYml, /branches:\s*\n\s*- docs-tya-v6-v71-audit/m, 'atomic_branch_missing');
    requireText(atomicYml, /\.github\/cxorbia-apply-requests\/request\.json/, 'atomic_request_path_missing');
    requireText(atomicYml, /permissions:\s*\n\s*contents:\s*write\s*\n\s*issues:\s*write/m, 'atomic_permissions_invalid');
    requireText(atomicYml, /cancel-in-progress:\s*false/, 'atomic_concurrency_missing');
    requireText(atomicScript, /request_commit_scope_exact/, 'atomic_request_scope_guard_missing');
    requireText(atomicScript, /working_tree_delta_exact/, 'atomic_delta_guard_missing');
    requireText(atomicScript, /git_blob_sha_required/, 'atomic_blob_guard_missing');
    requireText(atomicScript, /expectedCurrentSha256/, 'atomic_current_hash_guard_missing');
    requireText(atomicScript, /git', \['push', 'origin'/, 'atomic_push_missing');
    requireText(atomicScript, /git', \['rm', '--', requestPath\]/, 'atomic_request_cleanup_missing');

    requireText(readonlyYml, /^name:\s*CXORBIA_READONLY_POST_GATES_RUNNER\s*$/m, 'readonly_name_missing');
    requireText(readonlyYml, /branches:\s*\n\s*- docs-tya-v6-v71-audit/m, 'readonly_branch_missing');
    requireText(readonlyYml, /\.github\/cxorbia-gate-requests\/request\.json/, 'readonly_request_path_missing');
    requireText(readonlyYml, /permissions:\s*\n\s*contents:\s*read\s*\n\s*issues:\s*write\s*\n\s*statuses:\s*write/m, 'readonly_permissions_invalid');
    requireText(readonlyYml, /playwright@1\.55\.0/, 'readonly_playwright_pin_missing');
    requireText(readonlyYml, /playwright install --with-deps chromium/, 'readonly_chromium_install_missing');
    requireText(readonlyYml, /repos\/\$\{owner\}\/\$\{repo\}\/statuses\//, 'readonly_status_telemetry_missing');
    requireText(readonlyYml, /cxorbia\/readonly-post-gates\/overall/, 'readonly_overall_status_context_missing');
    requireText(readonlyScript, /tya-project-period-kpi-history-gate-r20/, 'readonly_r20_gate_missing');
    requireText(readonlyScript, /tya-corte1-m1-regression-lock/, 'readonly_m1_gate_missing');
    requireText(readonlyScript, /tya-corte2a-shopper-operation-canonical-gate/, 'readonly_corte2a_gate_missing');
    requireText(readonlyScript, /repositoryWrites:\s*false/, 'readonly_safe_state_missing');
    requireText(readonlyScript, /GITHUB_HEAD_REF/, 'readonly_effective_branch_missing');

    forbidText(readonlyYml, /contents:\s*write/, 'readonly_contents_write_forbidden');
    forbidText(readonlyYml, /firebase\s+deploy|gcloud\s+|firestore:|storage:|functions:/i, 'readonly_deploy_command_forbidden');
    forbidText(atomicYml, /firebase\s+deploy|gcloud\s+|firestore:|storage:|functions:/i, 'atomic_deploy_command_forbidden');
    forbidText(atomicYml, /branches:\s*\n\s*- main/m, 'main_branch_forbidden');
    forbidText(readonlyYml, /branches:\s*\n\s*- main/m, 'main_branch_forbidden');

    if (contract.atomicApplyPolicy?.directFunctionalTreeMutationOutsideRunner !== false) add(blockers, 'direct_tree_mutation_policy_not_closed');
    if (contract.atomicApplyPolicy?.sequentialContentsApiFunctionalWrites !== false) add(blockers, 'sequential_contents_policy_not_closed');
    if (contract.readonlyGatePolicy?.repositoryWrites !== false) add(blockers, 'readonly_repository_write_policy_not_closed');
    if (contract.readonlyGatePolicy?.commitStatusTelemetry !== true) add(blockers, 'readonly_status_telemetry_not_authorized');
    if (readonly?.statusesPermission !== 'write') add(blockers, 'readonly_status_permission_contract_missing');
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
