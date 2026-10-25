#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const file = process.argv[2]
  ? path.resolve(repo, process.argv[2])
  : path.join(repo, 'app/docs/evidence/R17M-WRITE-PLAN-NO-EXECUTE-LATEST.json');

const plan = JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = message => { throw new Error(message); };

if (plan.schemaVersion !== 'cxorbia.r17m-write-plan-no-execute.v1') fail('schemaVersion mismatch');
if (plan.target?.firebaseProjectId !== 'cxorbia-backend-dev') fail('wrong Firebase target');
if (plan.target?.tenantId !== 'tya' || plan.target?.projectId !== 'cinepolis') fail('wrong tenant/project');
if (plan.strategy?.reuseExistingBackend !== true || plan.strategy?.newFirebaseProject !== false) fail('architecture drift');
if (plan.strategy?.deletePriorTopology !== false) fail('prior topology deletion is forbidden');
if (plan.execution?.executeAllowed !== false) fail('plan must be non-executable');
if ((plan.execution?.authorizedWrites ?? -1) !== 0) fail('writes must be zero');
if ((plan.execution?.authorizedDeletes ?? -1) !== 0) fail('deletes must be zero');
if ((plan.execution?.authorizedDeploys ?? -1) !== 0) fail('deploys must be zero');

const groups = Array.isArray(plan.operationGroups) ? plan.operationGroups : [];
const total = groups.reduce((sum, row) => sum + Number(row.count || 0), 0);
const creates = groups.filter(row => row.r16eAction === 'create').reduce((sum, row) => sum + Number(row.count || 0), 0);
const updates = groups.filter(row => row.r16eAction === 'update').reduce((sum, row) => sum + Number(row.count || 0), 0);
if (total !== plan.r16eClassification?.totalCandidates) fail(`candidate total mismatch ${total}`);
if (creates !== plan.r16eClassification?.create) fail(`create total mismatch ${creates}`);
if (updates !== plan.r16eClassification?.update) fail(`update total mismatch ${updates}`);
if (groups.some(row => row.writeAuthorized !== false)) fail('every group must remain unauthorized');

const shopper = groups.find(row => row.domain === 'shopper');
if (!shopper || shopper.state !== 'HOLD_LEGACY_REFRESH_AND_STABLE_KEY_DIFF') fail('shopper group must remain on legacy/stable-key hold');
if (shopper.nameMatchingForbidden !== true || shopper.automaticMergeForbidden !== true) fail('shopper anti-name-match guards missing');

const liquidations = groups.find(row => row.domain === 'liquidation');
if (!liquidations?.paymentControlOnly || liquidations.paymentsConfirmedOrInferred !== 0) fail('liquidation/payment semantics drift');

const aug = (plan.sourceHolds || []).find(row => row.source === 'AGOSTO 26 HN');
if (!aug || aug.state !== 'HOLD_COUNTRY_TAB_MISMATCH' || aug.materialize !== false || aug.sync !== false) fail('August HN hold missing');

const cleanup = plan.preserveWithoutWrite?.cleanupCandidatesHold || [];
if (cleanup.length !== 2 || cleanup.some(row => row.action !== 'HOLD_NO_DELETE')) fail('cleanup holds drifted');

const safety = plan.safeState || {};
for (const key of ['firestoreWrites','authWrites','storageWrites','hrWrites','deletes','imports','deploys']) {
  if (safety[key] !== 0) fail(`${key} must remain zero`);
}
if (safety.production !== false || safety.merge !== false) fail('production/merge must remain false');

console.log('PASS_R17M_WRITE_PLAN_NO_EXECUTE');
console.log(JSON.stringify({
  totalCandidates: total,
  create: creates,
  update: updates,
  heldShoppers: shopper.count,
  executeAllowed: false,
  nextGate: plan.nextGate
}, null, 2));
