#!/usr/bin/env node
/**
 * CXOrbia conflict review queue + import readiness contract.
 *
 * Preview-only validator for conflicts detected between HR, platform state,
 * clean historical import, shoppers, certifications, questionnaire routes,
 * assignments, visits, settlements and payments.
 *
 * It does not connect Firestore/Auth/Storage, HR, Make, Gemini, email,
 * WhatsApp, payments, imports, or any production provider.
 */

import { readFile } from 'node:fs/promises';

export const CONTRACT_NAME = 'cxorbia-conflict-review-import-readiness-contract';
export const CONTRACT_VERSION = '2026-07-08.preview-only';

const ALLOWED_SOURCE_TYPES = Object.freeze([
  'hr_export_clean',
  'hr_preview',
  'platform_preview',
  'manual_clean_csv',
  'controlled_fixture',
  'redacted_reference',
  'synthetic_preview',
]);

const ALLOWED_ENTITY_TYPES = Object.freeze([
  'project',
  'visit',
  'shopper',
  'assignment',
  'certification',
  'settlement',
  'payment',
  'questionnaire_route',
  'document',
  'evidence',
  'application',
]);

const ALLOWED_CONFLICT_TYPES = Object.freeze([
  'duplicate_stable_key',
  'missing_stable_key',
  'hr_platform_mismatch',
  'assignment_source_conflict',
  'shopper_identity_ambiguous',
  'certification_status_conflict',
  'visit_status_conflict',
  'questionnaire_route_conflict',
  'settlement_eligibility_conflict',
  'payment_status_conflict',
  'currency_or_country_conflict',
  'sensitive_data_detected',
  'source_not_clean',
  'requires_manual_mapping',
]);

const ALLOWED_SEVERITIES = Object.freeze(['info', 'warning', 'blocker']);
const ALLOWED_QUEUE_STATUS = Object.freeze(['open', 'in_review', 'resolved', 'rejected', 'archived']);
const ALLOWED_READINESS_STATUS = Object.freeze(['ready_preview', 'needs_review', 'blocked', 'not_applicable']);

const REQUIRED_READINESS_AREAS = Object.freeze([
  'projects',
  'visits',
  'shoppers',
  'assignments',
  'certifications',
  'settlements',
  'payments',
  'questionnaire_routes',
]);

const BLOCKED_TRUE_FLAGS = Object.freeze([
  'execute',
  'executeNow',
  'importNow',
  'writeToDatabase',
  'writeToFirestore',
  'writeToHr',
  'writeToStorage',
  'connectOldDatabase',
  'oldDatabaseDump',
  'notifyReal',
  'sendRealEmail',
  'sendRealWhatsapp',
  'makeActive',
  'geminiActive',
  'payNow',
  'autoMergeConflicts',
  'autoResolveConflicts',
  'dedupeByNameOnly',
  'overwriteWithoutReview',
  'containsSensitiveRawData',
  'containsDpi',
  'containsBankData',
  'containsSignedNdaFile',
  'containsSecrets',
]);

const SENSITIVE_KEY_PATTERN = /(^|_)(dpi|passport|documentNumber|bank|bankAccount|cuentaBancaria|iban|swift|routing|signedNda|signature|secret|token|apiKey|webhookUrl|password|rawEmail|rawPhone|attachment|base64)(_|$)/i;

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isTruthyBlocked(value) {
  return value === true || value === 'true' || value === 'active' || value === 'enabled' || value === 'real';
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function collectBlockedFlags(node, path = '$', issues = []) {
  if (!node || typeof node !== 'object') return issues;
  for (const [key, value] of Object.entries(node)) {
    const nextPath = `${path}.${key}`;
    if (BLOCKED_TRUE_FLAGS.includes(key) && isTruthyBlocked(value)) {
      issues.push(`${nextPath}=${JSON.stringify(value)}`);
    }
    if (value && typeof value === 'object') collectBlockedFlags(value, nextPath, issues);
  }
  return issues;
}

function collectSensitivePayloadKeys(node, path = '$', issues = []) {
  if (!node || typeof node !== 'object') return issues;
  for (const [key, value] of Object.entries(node)) {
    const nextPath = `${path}.${key}`;
    const looksSensitive = SENSITIVE_KEY_PATTERN.test(key);
    const hasPayloadValue = value !== false && value !== null && value !== undefined && value !== '';
    if (looksSensitive && hasPayloadValue) issues.push(nextPath);
    if (value && typeof value === 'object') collectSensitivePayloadKeys(value, nextPath, issues);
  }
  return issues;
}

function ignoredSensitivePolicyPath(path) {
  return /\.sensitivePolicy$|\.sensitiveDataPolicy$|\.redactionPolicy$|\.allowedSensitiveKeys$|\.blockedSensitiveKeys$|\.sensitiveFieldsExcluded$|\.containsSensitiveRawData$|\.containsDpi$|\.containsBankData$|\.containsSignedNdaFile$|\.containsSecrets$/i.test(path);
}

function validateStableKeys(record, index, errors, prefix = 'conflicts') {
  const stableKey = record.stableKey || {};
  const tenantId = record.tenantId || stableKey.tenantId;
  const projectId = hasOwn(record, 'projectId') ? record.projectId : stableKey.projectId;
  if (!isNonEmptyString(tenantId)) errors.push(`${prefix}[${index}] missing tenantId/stableKey.tenantId`);
  if (!hasOwn(record, 'projectId') && !hasOwn(stableKey, 'projectId')) errors.push(`${prefix}[${index}] missing projectId key`);
  if (projectId !== null && !isNonEmptyString(projectId)) errors.push(`${prefix}[${index}] projectId must be string or null`);
  if (!isNonEmptyString(stableKey.entityId) && !isNonEmptyString(record.entityId)) {
    errors.push(`${prefix}[${index}] missing entityId/stableKey.entityId`);
  }
}

function validateSourceRefs(sourceRefs, index, errors) {
  const refs = asArray(sourceRefs);
  if (refs.length === 0) {
    errors.push(`conflicts[${index}] missing sourceRefs`);
    return;
  }
  refs.forEach((ref, refIndex) => {
    if (!ref || typeof ref !== 'object') {
      errors.push(`conflicts[${index}].sourceRefs[${refIndex}] must be an object`);
      return;
    }
    if (!ALLOWED_SOURCE_TYPES.includes(ref.sourceType)) {
      errors.push(`conflicts[${index}].sourceRefs[${refIndex}] invalid sourceType: ${ref.sourceType}`);
    }
    if (!isNonEmptyString(ref.refId)) {
      errors.push(`conflicts[${index}].sourceRefs[${refIndex}] missing opaque refId`);
    }
    if (ref.rawUrl || ref.rawRow || ref.rawPayload || ref.sampleRow) {
      errors.push(`conflicts[${index}].sourceRefs[${refIndex}] must not include rawUrl/rawRow/rawPayload/sampleRow`);
    }
  });
}

function validateConflict(conflict, index, errors, warnings) {
  if (!conflict || typeof conflict !== 'object') {
    errors.push(`conflicts[${index}] must be an object`);
    return;
  }
  if (!isNonEmptyString(conflict.conflictId)) errors.push(`conflicts[${index}] missing conflictId`);
  if (!ALLOWED_ENTITY_TYPES.includes(conflict.entityType)) errors.push(`conflicts[${index}] invalid entityType: ${conflict.entityType}`);
  if (!ALLOWED_CONFLICT_TYPES.includes(conflict.conflictType)) errors.push(`conflicts[${index}] invalid conflictType: ${conflict.conflictType}`);
  if (!ALLOWED_SEVERITIES.includes(conflict.severity)) errors.push(`conflicts[${index}] invalid severity: ${conflict.severity}`);
  if (!ALLOWED_QUEUE_STATUS.includes(conflict.queueStatus)) errors.push(`conflicts[${index}] invalid queueStatus: ${conflict.queueStatus}`);
  validateStableKeys(conflict, index, errors);
  validateSourceRefs(conflict.sourceRefs, index, errors);
  if (!isNonEmptyString(conflict.auditRef)) errors.push(`conflicts[${index}] missing auditRef`);
  if (conflict.requiresHumanReview !== true) errors.push(`conflicts[${index}] must require human review`);
  if (conflict.severity === 'blocker' && conflict.blockImport !== true) {
    errors.push(`conflicts[${index}] blocker severity must set blockImport=true`);
  }
  if (conflict.resolution && conflict.resolution.status === 'resolved') {
    if (!isNonEmptyString(conflict.resolution.resolvedBy)) errors.push(`conflicts[${index}] resolved conflict missing resolvedBy`);
    if (!isNonEmptyString(conflict.resolution.reason)) errors.push(`conflicts[${index}] resolved conflict missing reason`);
    if (conflict.resolution.applyNow === true) errors.push(`conflicts[${index}] resolution must not applyNow in preview-only mode`);
  }
  if (conflict.conflictType === 'shopper_identity_ambiguous' && conflict.visualDedupe === true) {
    errors.push(`conflicts[${index}] shopper identity cannot be resolved by visual dedupe`);
  }
  if (conflict.suggestedAction && conflict.suggestedAction === 'auto_merge') {
    errors.push(`conflicts[${index}] auto_merge suggestedAction is not allowed`);
  }
  if (!conflict.displayState) warnings.push(`conflicts[${index}] should expose displayState for UI queue`);
}

function validateReadinessArea(area, index, errors) {
  if (!area || typeof area !== 'object') {
    errors.push(`readiness.areas[${index}] must be an object`);
    return;
  }
  if (!REQUIRED_READINESS_AREAS.includes(area.area)) errors.push(`readiness.areas[${index}] invalid area: ${area.area}`);
  if (!ALLOWED_READINESS_STATUS.includes(area.status)) errors.push(`readiness.areas[${index}] invalid status: ${area.status}`);
  if (typeof area.cleanCount !== 'number' || area.cleanCount < 0) errors.push(`readiness.areas[${index}] cleanCount must be non-negative number`);
  if (typeof area.rejectedCount !== 'number' || area.rejectedCount < 0) errors.push(`readiness.areas[${index}] rejectedCount must be non-negative number`);
  if (typeof area.conflictCount !== 'number' || area.conflictCount < 0) errors.push(`readiness.areas[${index}] conflictCount must be non-negative number`);
  if (!isNonEmptyString(area.auditRef)) errors.push(`readiness.areas[${index}] missing auditRef`);
  if (area.status === 'ready_preview' && area.conflictCount > 0) {
    errors.push(`readiness.areas[${index}] cannot be ready_preview with unresolved conflicts`);
  }
}

export function validateConflictReviewImportReadiness(manifest = {}) {
  const errors = [];
  const warnings = [];
  const hardBlocks = [];

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return {
      contractName: CONTRACT_NAME,
      contractVersion: CONTRACT_VERSION,
      ok: false,
      hardBlocks: ['manifest must be an object'],
      errors,
      warnings,
      classification: classification(),
    };
  }

  if (manifest.mode !== 'preview_only') errors.push('manifest.mode must be preview_only');
  if (manifest.sourceSafe !== true) errors.push('manifest.sourceSafe must be true');
  if (manifest.isSyntheticOrSanitized !== true) errors.push('manifest.isSyntheticOrSanitized must be true');
  if (!isNonEmptyString(manifest.tenantId)) errors.push('manifest missing tenantId');
  if (!hasOwn(manifest, 'projectId')) errors.push('manifest missing projectId key');

  hardBlocks.push(...collectBlockedFlags(manifest));

  const sensitiveKeys = collectSensitivePayloadKeys(manifest).filter((path) => !ignoredSensitivePolicyPath(path));
  if (sensitiveKeys.length) {
    hardBlocks.push(`sensitive payload-like keys found: ${sensitiveKeys.join(', ')}`);
  }

  const conflicts = asArray(manifest.conflicts || manifest.queue);
  conflicts.forEach((conflict, index) => validateConflict(conflict, index, errors, warnings));

  const readiness = manifest.readiness || {};
  if (!readiness || typeof readiness !== 'object' || Array.isArray(readiness)) {
    errors.push('readiness must be an object');
  } else {
    if (!isNonEmptyString(readiness.readinessId)) errors.push('readiness missing readinessId');
    if (!ALLOWED_READINESS_STATUS.includes(readiness.overallStatus)) errors.push(`readiness invalid overallStatus: ${readiness.overallStatus}`);
    if (!isNonEmptyString(readiness.auditRef)) errors.push('readiness missing auditRef');
    if (readiness.importGate !== 'closed') errors.push('readiness.importGate must remain closed');
    if (readiness.humanApprovalRequired !== true) errors.push('readiness.humanApprovalRequired must be true');
    const areas = asArray(readiness.areas);
    if (areas.length === 0) errors.push('readiness.areas required');
    const seen = new Set();
    areas.forEach((area, index) => {
      validateReadinessArea(area, index, errors);
      if (area && area.area) seen.add(area.area);
    });
    for (const required of REQUIRED_READINESS_AREAS) {
      if (!seen.has(required)) errors.push(`readiness missing required area: ${required}`);
    }
    const hasBlocker = conflicts.some((item) => item && item.severity === 'blocker' && item.queueStatus !== 'resolved');
    if (hasBlocker && readiness.overallStatus !== 'blocked') {
      errors.push('readiness.overallStatus must be blocked while unresolved blocker conflicts exist');
    }
  }

  const ok = errors.length === 0 && hardBlocks.length === 0;
  return {
    contractName: CONTRACT_NAME,
    contractVersion: CONTRACT_VERSION,
    ok,
    hardBlocks,
    errors,
    warnings,
    conflictCount: conflicts.length,
    readinessAreas: asArray(readiness.areas).map((area) => area.area).filter(Boolean),
    classification: classification(),
    safeState: {
      runtime: 'not_connected',
      databaseWrites: false,
      hrWrites: false,
      storageWrites: false,
      realNotifications: false,
      payments: false,
      imports: false,
      make: false,
      gemini: false,
      conflictResolutionApplies: false,
    },
  };
}

export function classification() {
  return {
    reusableCxorbia: [
      'source-safe conflict review queue',
      'import readiness report by area',
      'stable-key dedupe and human review',
      'blocked imports until conflicts are resolved',
    ],
    exclusivoCliente: [
      'TyA/Cinepolis source names are manifest data only, not hardcoded logic',
    ],
    claudePrototipo: [
      'show conflict queue with severity, source refs, stable keys and review reason',
      'show import readiness preview without saying imported',
      'show blocked/needs review/ready preview by entity area',
    ],
    academia: [
      'explain clean export vs preview vs real import',
      'explain stable keys and why visual dedupe is prohibited',
      'explain conflicts, blocker severity and human review',
    ],
    sinImpactoClaude: [
      'validator has no runtime provider calls and no UI changes',
    ],
  };
}

export function sampleManifest() {
  const tenantId = 'tenant_demo';
  const projectId = 'project_demo';
  const areas = REQUIRED_READINESS_AREAS.map((area) => ({
    area,
    status: area === 'assignments' ? 'blocked' : 'ready_preview',
    cleanCount: area === 'assignments' ? 0 : 1,
    rejectedCount: 0,
    conflictCount: area === 'assignments' ? 1 : 0,
    auditRef: `audit://readiness/${area}/preview`,
  }));
  return {
    mode: 'preview_only',
    sourceSafe: true,
    isSyntheticOrSanitized: true,
    tenantId,
    projectId,
    conflicts: [
      {
        conflictId: 'conflict_demo_assignment_001',
        entityType: 'assignment',
        conflictType: 'assignment_source_conflict',
        severity: 'blocker',
        queueStatus: 'open',
        tenantId,
        projectId,
        stableKey: {
          tenantId,
          projectId,
          entityId: 'visit_demo_001',
          visitId: 'visit_demo_001',
          hrRowId: 'hr_row_demo_001',
          shopperId: 'shopper_ref_demo_a',
        },
        sourceRefs: [
          { sourceType: 'hr_preview', refId: 'opaque_hr_ref_demo_001' },
          { sourceType: 'platform_preview', refId: 'opaque_platform_ref_demo_001' },
        ],
        displayState: 'blocked_until_review',
        requiresHumanReview: true,
        blockImport: true,
        auditRef: 'audit://conflict/conflict_demo_assignment_001',
      },
    ],
    readiness: {
      readinessId: 'readiness_demo_001',
      overallStatus: 'blocked',
      importGate: 'closed',
      humanApprovalRequired: true,
      auditRef: 'audit://readiness/demo_001',
      areas,
    },
  };
}

async function main() {
  const file = process.argv[2];
  const manifest = file ? JSON.parse(await readFile(file, 'utf8')) : sampleManifest();
  const report = validateConflictReviewImportReadiness(manifest);
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
