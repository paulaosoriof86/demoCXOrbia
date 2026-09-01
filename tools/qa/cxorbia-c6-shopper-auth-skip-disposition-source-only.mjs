#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const sourcePlanPath = process.argv[2];
const configPath = process.argv[3] || 'backend/config/corte6-shopper-auth-skip13-disposition-v1.json';
const outputPlanPath = process.argv[4] || '';

const fail = message => { throw new Error(message); };
const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const sha256 = value => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

if (!sourcePlanPath) fail('source_plan_path_required');
for (const path of [sourcePlanPath, configPath]) if (!fs.existsSync(path)) fail(`missing_file:${path}`);

const sourcePlan = readJson(sourcePlanPath);
const config = readJson(configPath);

if (config.schemaVersion !== 'cxorbia.c6.shopper-auth-disposition.v1') fail('bad_config_schema');
if (config.policy !== 'SKIP_AUTH_REPAIR_PRESERVE_HISTORY') fail('bad_policy');
if (config.primaryOverride !== 'PRESERVE_NO_AUTH') fail('bad_primary_override');
if (!Array.isArray(config.profileFingerprints) || config.profileFingerprints.length !== 13) fail('bad_profile_fingerprint_count');
if (new Set(config.profileFingerprints).size !== 13) fail('duplicate_profile_fingerprint');
if (!Array.isArray(sourcePlan) || sourcePlan.length !== 340) fail('bad_source_plan_rows');

const sourceDigest = sha256(JSON.stringify(sourcePlan));
if (sourceDigest !== config.sourcePlanDigest) fail(`source_plan_digest_mismatch:${sourceDigest}`);

const authorized = new Set(config.profileFingerprints);
const sourceHolds = sourcePlan.filter(row => row?.primary === 'HOLD').map(row => row.profileFp);
if (sourceHolds.length !== 13 || sourceHolds.some(fp => !authorized.has(fp)) || [...authorized].some(fp => !sourceHolds.includes(fp))) {
  fail('authorized_disposition_set_does_not_exactly_match_source_holds');
}

const adjustedPlan = sourcePlan.map(row => {
  const next = structuredClone(row);
  if (!authorized.has(next.profileFp)) {
    next.disposition = null;
    return next;
  }
  next.originalPrimary = next.primary;
  next.originalHoldPreconditions = Array.isArray(next.preconditions) ? [...next.preconditions] : [];
  next.primary = 'PRESERVE_NO_AUTH';
  next.changes = { email: false, password: false, claims: false };
  next.disposition = {
    code: 'SKIP_AUTH_REPAIR_BY_OWNER',
    authorizationId: config.authorizationId,
    authorizedBy: config.authorizedBy,
    authorizedAt: config.authorizedAt,
    skipFromAuthRepair: true,
    doNotCreateAuth: true,
    doNotUpdateAuth: true,
    doNotDeleteHistoricalProfile: true,
    preserveHistory: true,
    preserveVisits: true,
    preserveCertifications: true,
    preserveLiquidations: true,
    futureManualReactivationAllowed: true,
    existingProviderAccountsUntouchedInThisSourceOnlyBlock: true
  };
  next.preconditions = [
    'owner_authorized_skip_auth_repair',
    'preserve_historical_profile',
    'no_auth_write_in_source_only_block'
  ];
  next.rollback = 'none';
  return next;
});

const byFp = new Map();
const counts = { CREATE_AUTH: 0, UPDATE_AUTH: 0, NO_OP: 0, HOLD: 0, PRESERVE_NO_AUTH: 0 };
const subchangeCounts = { email: 0, password: 0, claims: 0 };
for (const row of adjustedPlan) {
  if (!row || typeof row.profileFp !== 'string' || byFp.has(row.profileFp)) fail('invalid_or_duplicate_adjusted_row');
  byFp.set(row.profileFp, row);
  if (!(row.primary in counts)) fail(`unknown_primary:${row.primary}`);
  counts[row.primary]++;
  for (const key of Object.keys(subchangeCounts)) if (row.changes?.[key]) subchangeCounts[key]++;
}
if (byFp.size !== 340) fail('adjusted_plan_unique_rows_mismatch');
for (const [key, expected] of Object.entries(config.expectedOutputOperationCounts || {})) {
  if (counts[key] !== expected) fail(`operation_count_mismatch:${key}:${counts[key]}`);
}
const adjustedDigest = sha256(JSON.stringify(adjustedPlan));
if (adjustedDigest !== config.expectedOutputPlanDigest) fail(`output_plan_digest_mismatch:${adjustedDigest}`);

for (const [key, value] of Object.entries(config.safety || {})) {
  if (typeof value === 'number' && value !== 0) fail(`unsafe_numeric_scope:${key}`);
  if (typeof value === 'boolean' && value !== false) fail(`unsafe_boolean_scope:${key}`);
}

if (outputPlanPath) fs.writeFileSync(outputPlanPath, JSON.stringify(adjustedPlan, null, 2) + '\n', 'utf8');

console.log(JSON.stringify({
  decision: 'PASS_C6_SKIP13_AUTH_DISPOSITION_SOURCE_ONLY',
  sourcePlanDigest: sourceDigest,
  outputPlanDigest: adjustedDigest,
  rows: adjustedPlan.length,
  uniqueRows: byFp.size,
  disposed: authorized.size,
  operationCounts: counts,
  subchangeCounts,
  identityHoldsRemaining: counts.HOLD,
  outputWritten: Boolean(outputPlanPath),
  providerReads: 0,
  providerWrites: 0,
  authWrites: 0,
  firestoreWrites: 0,
  deploys: 0,
  production: false
}));
