#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : fallback;
};
const mode = arg('--mode', 'preflight');
const planPath = arg('--plan') ? path.resolve(repo, arg('--plan')) : null;
const attestationPath = arg('--attestation') ? path.resolve(repo, arg('--attestation')) : null;
const outPath = path.resolve(repo, arg('--out', '.tmp/firestore-materialization-executor/report.json'));
const contractPath = path.resolve(repo, arg('--contract', 'backend/contracts/phase-a-firestore-materialization-executor-v1.json'));
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const report = {
  schemaVersion: '1.0.0',
  mode,
  target: null,
  planId: null,
  planSha256: null,
  operationPathsSha256: null,
  checks: [],
  blockers: [],
  warnings: [],
  execution: { attempted: false, committedBatches: 0, createdDocuments: 0 },
  writes: false,
  imported: false,
  production: false
};
const check = (name, condition, detail = null) => {
  report.checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) report.blockers.push(name + (detail ? `:${detail}` : ''));
};
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
let contract = null, plan = null, attestation = null;
try { contract = readJson(contractPath); } catch (error) { report.blockers.push(`contract_unreadable:${error.message}`); }
if (!planPath) report.blockers.push('plan_required');
else {
  try { plan = readJson(planPath); } catch (error) { report.blockers.push(`plan_unreadable:${error.message}`); }
}
if (!attestationPath) report.blockers.push('attestation_required');
else {
  try { attestation = readJson(attestationPath); } catch (error) { report.blockers.push(`attestation_unreadable:${error.message}`); }
}
if (plan && contract) {
  report.planId = plan.planId || null;
  report.planSha256 = plan.planSha256 || null;
  const operations = Array.isArray(plan.operations) ? plan.operations : [];
  const paths = operations.map(item => item.documentPath);
  report.operationPathsSha256 = sha256(Buffer.from(paths.join('\n')));
  check('plan_mode_dry_run', plan.mode === 'dry_run');
  check('plan_writes_false', plan.writes === false && plan.safeState?.writes === false);
  check('plan_imported_false', plan.imported === false && plan.safeState?.imported === false);
  check('plan_production_false', plan.production === false && plan.safeState?.production === false);
  check('operations_present', operations.length > 0, String(operations.length));
  check('operations_create_only', operations.every(item => item.operation === 'create'));
  check('preconditions_exists_false', operations.every(item => item.precondition?.exists === false));
  check('paths_unique', new Set(paths).size === paths.length);
  check('batch_limit', (plan.batches || []).every(batch => batch.operationCount <= contract.writeRules.maxOperationsPerBatch));
}
if (attestation && contract) {
  report.target = attestation.targetType || null;
  for (const field of contract.requiredAttestation) check(`attestation_${field}`, attestation[field] !== undefined && attestation[field] !== null && attestation[field] !== '');
  check('target_allowed', contract.allowedTargets.includes(attestation.targetType));
  check('clean_state_attested', attestation.cleanState === true);
  check('attestation_not_expired', Number.isFinite(Date.parse(attestation.expiresAt)) && Date.parse(attestation.expiresAt) > Date.now());
  if (plan) {
    check('attestation_plan_id_matches', attestation.allowedPlanId === plan.planId);
    check('attestation_plan_sha_matches', attestation.allowedPlanSha256 === plan.planSha256);
  }
}
if (!['preflight', 'execute'].includes(mode)) report.blockers.push('mode_invalid');
if (mode === 'execute') {
  report.execution.attempted = true;
  check('execute_writes_authorized', attestation?.writesAuthorized === true);
  check('execute_target_emulator_only_v1', attestation?.targetType === 'emulator');
  check('execute_emulator_host_present', Boolean(process.env.FIRESTORE_EMULATOR_HOST));
  check('execute_project_matches', Boolean(attestation?.targetProjectId) && process.env.GCLOUD_PROJECT === attestation?.targetProjectId);
  check('execute_allow_flag', process.env.CXORBIA_ALLOW_EMULATOR_WRITES === 'true');
  check('execute_approval_matches', process.env.CXORBIA_FIRESTORE_EXECUTION_APPROVAL === `${plan?.planId}:${plan?.planSha256}`);
}
report.blockers = [...new Set(report.blockers)];
if (mode === 'execute' && report.blockers.length === 0) {
  const { initializeApp, getApps } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const app = getApps()[0] || initializeApp({ projectId: attestation.targetProjectId });
  const db = getFirestore(app);
  const operations = plan.operations;
  const existing = [];
  for (let start = 0; start < operations.length; start += 200) {
    const refs = operations.slice(start, start + 200).map(item => db.doc(item.documentPath));
    const snapshots = await db.getAll(...refs);
    snapshots.forEach((snapshot, index) => { if (snapshot.exists) existing.push(operations[start + index].documentPath); });
  }
  if (existing.length) report.blockers.push(`target_not_empty_for_plan:${existing.length}`);
  if (report.blockers.length === 0) {
    for (const plannedBatch of plan.batches) {
      const operationById = new Map(operations.map(item => [item.operationId, item]));
      const batch = db.batch();
      for (const operationId of plannedBatch.operationIds) {
        const operation = operationById.get(operationId);
        if (!operation) throw new Error(`operation_missing:${operationId}`);
        batch.create(db.doc(operation.documentPath), operation.data);
      }
      await batch.commit();
      report.execution.committedBatches += 1;
      report.execution.createdDocuments += plannedBatch.operationIds.length;
    }
    report.writes = true;
  }
}
report.ok = report.blockers.length === 0;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, stableJson(report), 'utf8');
console.log(stableJson(report));
if (!report.ok) process.exit(2);
