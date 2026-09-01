#!/usr/bin/env node
/*
  CXOrbia TyA - Assignment sync outbox contract
  Synthetic contract only. No Make call, no HR write, no Firestore write.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/tya-assignment-sync-outbox-contract';

const allowedDirections = new Set(['platform_to_hr', 'hr_to_platform']);
const allowedStatus = new Set(['queued_reviewed', 'blocked_conflict', 'blocked_missing_key']);

const events = [
  { eventId: 'evt-platform-001', tenantId: 'tya', projectId: 'cinepolis-gt', visitId: 'visit-001', hrRowId: 'hr-001', shopperId: 'shopper-a', direction: 'platform_to_hr', assignmentSource: 'platform', assignmentSyncStatus: 'queued_reviewed', correlationId: 'corr-001', createdAt: '2026-07-07T00:00:00.000Z' },
  { eventId: 'evt-hr-002', tenantId: 'tya', projectId: 'cinepolis-gt', visitId: 'visit-002', hrRowId: 'hr-002', shopperId: 'shopper-b', direction: 'hr_to_platform', assignmentSource: 'hr', assignmentSyncStatus: 'queued_reviewed', correlationId: 'corr-002', createdAt: '2026-07-07T00:00:00.000Z' },
  { eventId: 'evt-conflict-003', tenantId: 'tya', projectId: 'cinepolis-gt', visitId: 'visit-003', hrRowId: 'hr-003', shopperId: null, direction: 'platform_to_hr', assignmentSource: 'conflict', assignmentSyncStatus: 'blocked_conflict', correlationId: 'corr-003', createdAt: '2026-07-07T00:00:00.000Z' }
];

function stableKey(event) {
  if (!event.tenantId || !event.projectId || (!event.visitId && !event.hrRowId)) return null;
  return [event.tenantId, event.projectId, event.visitId || event.hrRowId].join('::');
}

function validate(event) {
  const errors = [];
  if (!event.eventId) errors.push('missing_eventId');
  if (!event.tenantId) errors.push('missing_tenantId');
  if (!event.projectId) errors.push('missing_projectId');
  if (!event.visitId && !event.hrRowId) errors.push('missing_visitId_or_hrRowId');
  if (!allowedDirections.has(event.direction)) errors.push('invalid_direction');
  if (!allowedStatus.has(event.assignmentSyncStatus)) errors.push('invalid_assignmentSyncStatus');
  if (event.assignmentSyncStatus === 'queued_reviewed' && !event.shopperId) errors.push('missing_shopperId_for_queued_event');
  if (!event.correlationId) errors.push('missing_correlationId');
  if (!event.createdAt) errors.push('missing_createdAt');
  return { eventId: event.eventId || null, stableKey: stableKey(event), ok: errors.length === 0, errors, direction: event.direction, assignmentSyncStatus: event.assignmentSyncStatus };
}

const results = events.map(validate);
const failures = results.filter(r => !r.ok);
const report = {
  gate: 'cxorbia-tya-assignment-sync-outbox-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_CONTRACT_ERRORS' : 'GO_CONTRACT_PREVIEW_ONLY',
  eventCount: events.length,
  failureCount: failures.length,
  results,
  requiredFields: ['eventId', 'tenantId', 'projectId', 'visitId_or_hrRowId', 'direction', 'assignmentSource', 'assignmentSyncStatus', 'correlationId', 'createdAt'],
  safeState: { makeCall: false, hrWrites: false, firestoreWrites: false, imports: false, production: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'assignment-sync-outbox-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia TyA assignment sync outbox contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Events: ${report.eventCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Results', ...results.map(r => `- ${r.eventId}: ${r.ok ? 'ok' : r.errors.join(', ')} / ${r.assignmentSyncStatus}`), '',
  '## Safe state', '- No Make call', '- No HR writes', '- No Firestore writes', '- No imports', '- No production', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'assignment-sync-outbox-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
