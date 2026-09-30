/*
  CXOrbia - HR/platform bidirectional assignment sync adapter preview
  Status: source_ready_provider_writes_blocked

  Pure planning only. It never calls HR, Make, Firestore, Auth or frontend.
  Stable identity matching is mandatory; names are never used for deduplication.
*/
import { buildOutboxRecord } from './make-outbox-adapter.preview.mjs';

export const HR_BIDIRECTIONAL_SYNC_STATUS = Object.freeze({
  connectedToFrontend: false,
  makeProviderConnected: false,
  hrWritesEnabled: false,
  platformWritesEnabled: false,
  sourceOnly: true,
  safeForRepo: true
});

export const ASSIGNMENT_SOURCES = Object.freeze(['platform', 'hr']);
export const SYNC_STATUSES = Object.freeze(['pending_hr', 'pending_platform', 'synced', 'conflict', 'legacy_observed']);
export const CONFLICT_CODES = Object.freeze([
  'scope_mismatch',
  'stable_identity_missing',
  'stable_identity_mismatch',
  'shopper_mismatch',
  'hr_reflection_missing',
  'shopper_missing_in_platform'
]);

const str = value => String(value == null ? '' : value).trim();
const sanitize = value => str(value).replace(/[^a-zA-Z0-9._:-]/g, '_');
const visitIdOf = value => str(value?.visitId || value?.id);
const hrRowIdOf = value => str(value?.hrRowId);
const shopperIdOf = value => str(value?.shopperId);
const sourceOf = (value, observedSource) => {
  const explicit = str(value?.assignmentSource).toLowerCase();
  return ASSIGNMENT_SOURCES.includes(explicit) ? explicit : observedSource;
};
const statusOf = (value, observedSource) => {
  const explicit = str(value?.assignmentSyncStatus).toLowerCase();
  if (SYNC_STATUSES.includes(explicit)) return explicit;
  if (explicit === 'pending') return sourceOf(value, observedSource) === 'platform' ? 'pending_hr' : 'pending_platform';
  if (shopperIdOf(value)) return 'legacy_observed';
  return null;
};

export function normalizeAssignment(value = {}, observedSource) {
  if (!ASSIGNMENT_SOURCES.includes(observedSource)) throw new Error('observedSource must be platform or hr');
  return {
    tenantId: str(value.tenantId),
    projectId: str(value.projectId),
    visitId: visitIdOf(value),
    hrRowId: hrRowIdOf(value),
    shopperId: shopperIdOf(value),
    assignmentSource: sourceOf(value, observedSource),
    assignmentSyncStatus: statusOf(value, observedSource),
    lastSyncedAt: value.lastSyncedAt || null,
    version: value.version ?? value.updatedAt ?? value.sourceRevision ?? null,
    observedSource
  };
}

export function stableAssignmentKey(value = {}) {
  const observed = value.observedSource || (value.assignmentSource === 'hr' ? 'hr' : 'platform');
  const n = value.observedSource ? value : normalizeAssignment(value, observed);
  if (!n.tenantId || !n.projectId || !n.visitId || !n.hrRowId) return null;
  return [n.tenantId, n.projectId, n.visitId, n.hrRowId].map(sanitize).join('::');
}

function conflict(code, platform, hr, details = {}) {
  return {
    decision: 'review_conflict',
    conflict: true,
    conflictCode: code,
    humanReviewRequired: true,
    automaticOverwrite: false,
    dedupeByName: false,
    platform,
    hr,
    actions: [],
    ...details
  };
}

function scopesCompatible(platform, hr) {
  return platform.tenantId === hr.tenantId && platform.projectId === hr.projectId;
}

function identitiesReady(platform, hr) {
  return Boolean(platform.tenantId && platform.projectId && platform.visitId && platform.hrRowId && hr.tenantId && hr.projectId && hr.visitId && hr.hrRowId);
}

function identitiesEqual(platform, hr) {
  return platform.visitId === hr.visitId && platform.hrRowId === hr.hrRowId;
}

function syncMarker(platform, hr, now) {
  return {
    type: 'platform.sync.confirm',
    tenantId: platform.tenantId,
    projectId: platform.projectId,
    visitId: platform.visitId,
    hrRowId: platform.hrRowId,
    shopperId: platform.shopperId || hr.shopperId,
    assignmentSource: platform.assignmentSource,
    assignmentSyncStatus: 'synced',
    lastSyncedAt: now,
    expectedVersion: platform.version,
    providerWriteRequired: true
  };
}

export function planAssignmentSync({ platformVisit = {}, hrVisit = {}, knownPlatformShopperIds = null, now = new Date().toISOString() } = {}) {
  const platform = normalizeAssignment(platformVisit, 'platform');
  const hr = normalizeAssignment(hrVisit, 'hr');

  if (!scopesCompatible(platform, hr)) return conflict('scope_mismatch', platform, hr);
  if (!identitiesReady(platform, hr)) return conflict('stable_identity_missing', platform, hr);
  if (!identitiesEqual(platform, hr)) return conflict('stable_identity_mismatch', platform, hr);

  const platformShopper = platform.shopperId;
  const hrShopper = hr.shopperId;

  if (platformShopper && hrShopper && platformShopper !== hrShopper) {
    return conflict('shopper_mismatch', platform, hr);
  }

  if (platformShopper && !hrShopper) {
    if (platform.assignmentSource === 'hr') return conflict('hr_reflection_missing', platform, hr);
    return {
      decision: 'platform_to_hr_pending',
      conflict: false,
      dedupeByName: false,
      automaticOverwrite: false,
      platform,
      hr,
      actions: [{
        type: 'hr.assignment.write',
        tenantId: platform.tenantId,
        projectId: platform.projectId,
        visitId: platform.visitId,
        hrRowId: platform.hrRowId,
        shopperId: platformShopper,
        assignmentSource: 'platform',
        assignmentSyncStatus: 'pending_hr',
        lastSyncedAt: platform.lastSyncedAt,
        providerDispatchRequired: true,
        hrWriteRequired: true,
        makeCallRequired: true
      }]
    };
  }

  if (!platformShopper && hrShopper) {
    const known = knownPlatformShopperIds instanceof Set ? knownPlatformShopperIds :
      Array.isArray(knownPlatformShopperIds) ? new Set(knownPlatformShopperIds.map(str)) : null;
    if (!known || !known.has(hrShopper)) return conflict('shopper_missing_in_platform', platform, hr);
    return {
      decision: 'hr_to_platform_pending',
      conflict: false,
      dedupeByName: false,
      automaticOverwrite: false,
      platform,
      hr,
      actions: [{
        type: 'platform.assignment.reflect',
        commandType: 'visit.assign',
        tenantId: hr.tenantId,
        projectId: hr.projectId,
        visitId: hr.visitId,
        hrRowId: hr.hrRowId,
        shopperId: hrShopper,
        assignmentSource: 'hr',
        assignmentSyncStatus: 'pending_platform',
        removeFromAvailable: true,
        expectedVersion: platform.version,
        providerWriteRequired: true
      }]
    };
  }

  if (platformShopper && hrShopper && platformShopper === hrShopper) {
    if (platform.assignmentSyncStatus === 'synced' && platform.lastSyncedAt) {
      return { decision: 'already_synced_noop', conflict: false, dedupeByName: false, automaticOverwrite: false, platform, hr, actions: [] };
    }
    if (platform.assignmentSource === 'platform') {
      return { decision: 'hr_reflection_confirmed', conflict: false, dedupeByName: false, automaticOverwrite: false, platform, hr, actions: [syncMarker(platform, hr, now)] };
    }
    return { decision: 'hr_assignment_already_reflected_noop', conflict: false, dedupeByName: false, automaticOverwrite: false, platform, hr, actions: [] };
  }

  return { decision: 'both_unassigned_noop', conflict: false, dedupeByName: false, automaticOverwrite: false, platform, hr, actions: [] };
}

export function buildPlatformToHrOutbox(scope = {}, plan = {}, options = {}) {
  if (plan.decision !== 'platform_to_hr_pending' || !Array.isArray(plan.actions) || plan.actions[0]?.type !== 'hr.assignment.write') {
    const err = new Error('Plan is not a platform-to-HR pending assignment.');
    err.code = 'HR_SYNC_PLAN_NOT_DISPATCHABLE';
    throw err;
  }
  const action = plan.actions[0];
  const key = [action.tenantId, action.projectId, action.visitId, action.hrRowId, action.shopperId].map(sanitize).join('::');
  return buildOutboxRecord(scope, {
    messageId: `hrsync_${sanitize(key)}`,
    channel: 'hrSync',
    messageType: 'assignment.sync.platform_to_hr',
    entityType: 'visit',
    entityId: action.visitId,
    recipientRef: `hrRow:${action.hrRowId}`,
    auditRef: options.auditRef || `sync:${key}`,
    dedupeKey: key,
    status: 'prepared_pending_gate',
    gateStatus: 'blocked_missing_gate',
    source: 'platform',
    reason: 'assignment_sync_platform_to_hr',
    payload: {
      tenantId: action.tenantId,
      projectId: action.projectId,
      visitId: action.visitId,
      hrRowId: action.hrRowId,
      shopperId: action.shopperId,
      assignmentSource: 'platform',
      assignmentSyncStatus: 'pending_hr',
      lastSyncedAt: action.lastSyncedAt
    }
  });
}

export default Object.freeze({ normalizeAssignment, stableAssignmentKey, planAssignmentSync, buildPlatformToHrOutbox });
