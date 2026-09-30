#!/usr/bin/env node
/*
  CXOrbia TyA - Assignment sync conflict preview
  Safe validator with synthetic fixtures only.
  No HR writes, no Firestore writes, no imports, no provider calls.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/tya-assignment-sync-conflict-preview';

const fixtures = [
  { id: 'case_platform_to_hr', tenantId: 'tya', projectId: 'cinepolis-gt', visitId: 'visit-001', hrRowId: 'hr-001', platformShopperId: 'shopper-a', hrShopperId: null, platformStatus: 'assigned', hrStatus: 'available', assignmentSource: 'platform' },
  { id: 'case_hr_to_platform', tenantId: 'tya', projectId: 'cinepolis-gt', visitId: 'visit-002', hrRowId: 'hr-002', platformShopperId: null, hrShopperId: 'shopper-b', platformStatus: 'available', hrStatus: 'assigned', assignmentSource: 'hr' },
  { id: 'case_already_synced', tenantId: 'tya', projectId: 'cinepolis-gt', visitId: 'visit-003', hrRowId: 'hr-003', platformShopperId: 'shopper-c', hrShopperId: 'shopper-c', platformStatus: 'assigned', hrStatus: 'assigned', assignmentSource: 'both' },
  { id: 'case_conflict', tenantId: 'tya', projectId: 'cinepolis-gt', visitId: 'visit-004', hrRowId: 'hr-004', platformShopperId: 'shopper-d', hrShopperId: 'shopper-e', platformStatus: 'assigned', hrStatus: 'assigned', assignmentSource: 'conflict' },
  { id: 'case_missing_key', tenantId: 'tya', projectId: 'cinepolis-gt', visitId: null, hrRowId: null, platformShopperId: 'shopper-f', hrShopperId: null, platformStatus: 'assigned', hrStatus: 'available', assignmentSource: 'platform' }
];

function stableKey(row) {
  if (!row.tenantId || !row.projectId || (!row.visitId && !row.hrRowId)) return null;
  return [row.tenantId, row.projectId, row.visitId || row.hrRowId].join('::');
}

function classify(row) {
  const key = stableKey(row);
  if (!key) return { id: row.id, key: null, decision: 'missing_stable_key', action: 'block_review', reason: 'tenantId_projectId_visitId_or_hrRowId_required' };

  const platformAssigned = row.platformStatus === 'assigned' && !!row.platformShopperId;
  const hrAssigned = row.hrStatus === 'assigned' && !!row.hrShopperId;

  if (platformAssigned && !hrAssigned) return { id: row.id, key, decision: 'platform_to_hr', action: 'sync_preview_only', shopperId: row.platformShopperId };
  if (!platformAssigned && hrAssigned) return { id: row.id, key, decision: 'hr_to_platform', action: 'sync_preview_only', shopperId: row.hrShopperId };
  if (platformAssigned && hrAssigned && row.platformShopperId === row.hrShopperId) return { id: row.id, key, decision: 'already_synced_noop', action: 'noop', shopperId: row.platformShopperId };
  if (platformAssigned && hrAssigned && row.platformShopperId !== row.hrShopperId) return { id: row.id, key, decision: 'conflict_review_required', action: 'human_review', platformShopperId: row.platformShopperId, hrShopperId: row.hrShopperId };

  return { id: row.id, key, decision: 'available_noop', action: 'noop' };
}

const decisions = fixtures.map(classify);
const summary = decisions.reduce((acc, item) => {
  acc[item.decision] = (acc[item.decision] || 0) + 1;
  return acc;
}, {});
const hardFails = decisions.filter(x => x.decision === 'missing_stable_key').length;
const reviewRequired = decisions.filter(x => x.decision === 'conflict_review_required').length;
const report = {
  gate: 'cxorbia-tya-assignment-sync-conflict-preview',
  generatedAt: new Date().toISOString(),
  verdict: hardFails ? 'NO_GO_MISSING_STABLE_KEYS' : 'GO_PREVIEW_ONLY',
  summary,
  reviewRequired,
  hardFails,
  decisions,
  stableKeysRequired: ['tenantId', 'projectId', 'visitId_or_hrRowId', 'shopperId_when_assigned', 'assignmentSource', 'assignmentSyncStatus', 'lastSyncedAt'],
  safeState: { hrWrites: false, firestoreWrites: false, imports: false, providers: false, production: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'assignment-sync-conflict-preview.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia TyA assignment sync conflict preview', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Review required: ${reviewRequired}`,
  `Hard fails: ${hardFails}`, '',
  '## Summary', ...Object.entries(summary).map(([k,v]) => `- ${k}: ${v}`), '',
  '## Decisions', ...decisions.map(x => `- ${x.id}: ${x.decision} / ${x.action}`), '',
  '## Safe state', '- No HR writes', '- No Firestore writes', '- No imports', '- No providers', '- No production', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'assignment-sync-conflict-preview.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails ? 1 : 0;
