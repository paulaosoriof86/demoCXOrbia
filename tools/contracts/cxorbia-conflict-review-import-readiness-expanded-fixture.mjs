#!/usr/bin/env node
/**
 * CXOrbia conflict review + import readiness expanded synthetic fixture.
 *
 * Preview-only expanded input for validating conflict review/import readiness
 * without real HR, real platform payloads, raw sensitive data, provider calls,
 * writes, payments, notifications, imports, deploy or production activation.
 */

import { validateConflictReviewImportReadiness } from './cxorbia-conflict-review-import-readiness-contract.mjs';

export const FIXTURE_NAME = 'cxorbia-conflict-review-import-readiness-expanded-fixture';
export const FIXTURE_VERSION = '2026-07-08.preview-only';

const tenantId = 'tenant_demo';
const projectId = 'project_demo';

function readinessArea(area, status, cleanCount, rejectedCount, conflictCount) {
  return {
    area,
    status,
    cleanCount,
    rejectedCount,
    conflictCount,
    auditRef: `audit://readiness-expanded/${area}/preview`,
  };
}

export function expandedConflictReviewImportReadinessManifest() {
  return {
    mode: 'preview_only',
    sourceSafe: true,
    isSyntheticOrSanitized: true,
    tenantId,
    projectId,
    execute: false,
    executeNow: false,
    importNow: false,
    writeToDatabase: false,
    writeToFirestore: false,
    writeToHr: false,
    writeToStorage: false,
    connectOldDatabase: false,
    oldDatabaseDump: false,
    notifyReal: false,
    sendRealEmail: false,
    sendRealWhatsapp: false,
    makeActive: false,
    geminiActive: false,
    payNow: false,
    autoMergeConflicts: false,
    autoResolveConflicts: false,
    dedupeByNameOnly: false,
    overwriteWithoutReview: false,
    containsSensitiveRawData: false,
    containsDpi: false,
    containsBankData: false,
    containsSignedNdaFile: false,
    containsSecrets: false,
    sensitiveDataPolicy: {
      sensitiveFieldsExcluded: true,
      sourceRefsAreOpaque: true,
      noRawRows: true,
      noAttachments: true,
      noTokens: true,
    },
    conflicts: [
      {
        conflictId: 'conflict_demo_assignment_source_001',
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
          { sourceType: 'hr_preview', refId: 'opaque_hr_assignment_ref_demo_001' },
          { sourceType: 'platform_preview', refId: 'opaque_platform_assignment_ref_demo_001' },
        ],
        displayState: 'blocked_until_review',
        requiresHumanReview: true,
        blockImport: true,
        auditRef: 'audit://conflict-expanded/assignment_source_001',
      },
      {
        conflictId: 'conflict_demo_shopper_identity_001',
        entityType: 'shopper',
        conflictType: 'shopper_identity_ambiguous',
        severity: 'warning',
        queueStatus: 'in_review',
        tenantId,
        projectId,
        stableKey: {
          tenantId,
          projectId,
          entityId: 'shopper_ref_demo_ambiguous',
          shopperId: 'shopper_ref_demo_ambiguous',
        },
        sourceRefs: [
          { sourceType: 'hr_export_clean', refId: 'opaque_hr_shopper_ref_demo_001' },
          { sourceType: 'manual_clean_csv', refId: 'opaque_manual_shopper_ref_demo_001' },
        ],
        displayState: 'needs_identity_review',
        requiresHumanReview: true,
        blockImport: false,
        visualDedupe: false,
        suggestedAction: 'manual_review',
        auditRef: 'audit://conflict-expanded/shopper_identity_001',
      },
      {
        conflictId: 'conflict_demo_payment_status_001',
        entityType: 'payment',
        conflictType: 'payment_status_conflict',
        severity: 'warning',
        queueStatus: 'open',
        tenantId,
        projectId,
        stableKey: {
          tenantId,
          projectId,
          entityId: 'payment_item_demo_001',
          visitId: 'visit_demo_002',
          shopperId: 'shopper_ref_demo_b',
        },
        sourceRefs: [
          { sourceType: 'platform_preview', refId: 'opaque_platform_payment_ref_demo_001' },
          { sourceType: 'redacted_reference', refId: 'opaque_finance_review_ref_demo_001' },
        ],
        displayState: 'payment_pending_review',
        requiresHumanReview: true,
        blockImport: false,
        auditRef: 'audit://conflict-expanded/payment_status_001',
      },
    ],
    readiness: {
      readinessId: 'readiness_expanded_demo_001',
      overallStatus: 'blocked',
      importGate: 'closed',
      humanApprovalRequired: true,
      auditRef: 'audit://readiness-expanded/demo_001',
      areas: [
        readinessArea('projects', 'ready_preview', 1, 0, 0),
        readinessArea('visits', 'needs_review', 2, 0, 1),
        readinessArea('shoppers', 'needs_review', 1, 0, 1),
        readinessArea('assignments', 'blocked', 0, 0, 1),
        readinessArea('certifications', 'ready_preview', 1, 0, 0),
        readinessArea('settlements', 'ready_preview', 1, 0, 0),
        readinessArea('payments', 'needs_review', 1, 0, 1),
        readinessArea('questionnaire_routes', 'ready_preview', 1, 0, 0),
      ],
    },
  };
}

export function runExpandedConflictReviewImportReadinessFixture() {
  const manifest = expandedConflictReviewImportReadinessManifest();
  const validation = validateConflictReviewImportReadiness(manifest);
  return {
    fixture: FIXTURE_NAME,
    version: FIXTURE_VERSION,
    mode: 'preview_only',
    sourceSafe: true,
    isSyntheticOrSanitized: true,
    manifest,
    validation,
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
      deploy: false,
      production: false,
    },
    classification: {
      reusableCxorbia: [
        'expanded synthetic conflict/readiness input for any tenant/project',
        'safe conflict queue states before real imports',
        'stable-key review without visual dedupe',
      ],
      exclusivoCliente: [
        'TyA Phase A scenarios can be represented without real HR rows or sensitive payloads',
      ],
      claudePrototipo: [
        'show multiple conflict severities and readiness areas honestly',
        'show blocked imports while blockers remain unresolved',
      ],
      academia: [
        'teach assignment conflicts, shopper identity ambiguity and payment status review',
      ],
      sinImpactoClaude: [
        'fixture has no UI mutation and no provider calls',
      ],
    },
  };
}

function main() {
  const report = runExpandedConflictReviewImportReadinessFixture();
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.validation?.ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
