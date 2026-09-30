#!/usr/bin/env node
/**
 * CXOrbia admin configurability expanded synthetic fixture.
 *
 * Preview-only expanded input for validating tenant/project administrability
 * across Phase A domains. No real providers, no real HR, no real Storage,
 * no real Make/Gemini, no payments, no notifications, no imports, no deploy,
 * no production activation and no sensitive payloads.
 */

import {
  REQUIRED_DOMAINS,
  validateAdminConfigurabilityContract,
} from './cxorbia-admin-configurability-contract.mjs';

export const FIXTURE_NAME = 'cxorbia-admin-configurability-expanded-fixture';
export const FIXTURE_VERSION = '2026-07-08.preview-only';

const tenantId = 'tenant_demo';
const projectId = 'project_demo';

const roleMatrix = {
  superadmin: ['approve', 'archive', 'version', 'review_gate'],
  admin: ['create', 'edit', 'request_review', 'preview'],
  ops: ['preview', 'request_review'],
  finance: ['preview', 'request_review'],
  academy_admin: ['create', 'edit', 'duplicate', 'archive', 'version', 'request_review'],
  technical_reviewer: ['review_contract', 'review_gate', 'preview'],
};

function baseModule(domain, extra = {}) {
  const isProviderDomain = ['make', 'gemini', 'integrations'].includes(domain);
  return {
    domain,
    tenantId,
    projectId,
    editable: true,
    versioned: true,
    rolesAllowed: ['superadmin', 'admin'],
    status: 'draft',
    auditRef: `audit://admin-config-expanded/${domain}/preview`,
    gate: {
      required: true,
      status: 'closed',
      reasonRequired: true,
      humanReviewRequired: true,
      productionAllowed: false,
      activationAllowed: false,
    },
    providerState: isProviderDomain ? 'gate_required' : 'preview_only',
    execute: false,
    writeToDatabase: false,
    writeToFirestore: false,
    writeToHr: false,
    writeToStorage: false,
    connectProvider: false,
    providerActive: false,
    notifyReal: false,
    sendRealEmail: false,
    sendRealWhatsapp: false,
    payNow: false,
    importNow: false,
    publishWithoutHumanReview: false,
    overwritePreviousVersion: false,
    modifyAcceptedNdaSilently: false,
    containsSensitiveRawData: false,
    containsDpi: false,
    containsBankData: false,
    containsSignedNdaFile: false,
    containsSecrets: false,
    adminActions: ['create', 'edit', 'archive_or_soft_delete', 'duplicate', 'version', 'request_review'],
    displayCopy: {
      readyState: 'preview_only',
      blockedCopy: 'pendiente gate real y revision humana',
      activeCopyForbidden: true,
    },
    ...extra,
  };
}

function moduleForDomain(domain) {
  if (domain === 'projects') {
    return baseModule(domain, {
      configPreview: {
        country: 'GT',
        currency: 'GTQ',
        hrSourceRef: 'ref://hr-source/project-demo',
        questionnaireSource: 'project_configurable',
        paymentRulesRef: 'ref://rules/payments-demo',
      },
    });
  }

  if (domain === 'rules') {
    return baseModule(domain, {
      lifecycleStates: ['draft', 'in_review', 'approved', 'active', 'replaced', 'archived'],
      ruleFamilies: ['scheduling', 'rescheduling', 'cancellations', 'payments', 'certifications', 'evidence', 'questionnaire_routing'],
      changeControl: {
        reasonRequired: true,
        diffRequired: true,
        effectiveDateRequired: true,
        humanReviewRequired: true,
        publishWithoutHumanReview: false,
      },
    });
  }

  if (domain === 'hr_sources') {
    return baseModule(domain, {
      sourcePolicy: {
        sourceRefType: 'opaque_reference_only',
        realConnectionAllowed: false,
        writeBackAllowed: false,
        stableKeys: ['tenantId', 'projectId', 'visitId', 'hrRowId', 'assignmentSource', 'assignmentSyncStatus'],
      },
    });
  }

  if (domain === 'questionnaires') {
    return baseModule(domain, {
      routeTypes: ['cxorbia', 'tyaonline', 'external_platform', 'general_link_ref', 'visit_hr_ref'],
      routeStateCopy: 'ruta preparada, no enviada',
      externalUrlPolicy: 'opaque_reference_only',
    });
  }

  if (domain === 'documents') {
    return baseModule(domain, {
      storagePolicy: {
        storageState: 'prepared_gate_closed',
        rawAttachmentsAllowed: false,
        privateLinksAllowed: false,
        evidenceRefsOnly: true,
      },
    });
  }

  if (domain === 'nda_templates') {
    return baseModule(domain, {
      acceptanceImmutability: 'do_not_modify_existing_acceptance',
      reacceptancePolicy: { triggerOnVersionChange: true, gateRequired: true, notifyReal: false },
      uiStates: ['pending', 'accepted', 'expired_version', 'requires_reacceptance', 'blocked_by_gate'],
      fields: {
        templateId: 'nda_tpl_demo_expanded',
        version: 'v2-preview',
        effectiveFrom: '2026-07-08',
        effectiveTo: null,
        status: 'draft',
        tenantId,
        projectId,
        createdBy: 'role:admin',
        approvedBy: 'role:superadmin',
        auditRef: 'audit://admin-config-expanded/nda/v2-preview',
      },
      adminActions: ['create_template', 'edit_template', 'archive_template', 'duplicate_template', 'version_template', 'request_reacceptance_preview'],
    });
  }

  if (domain === 'plans') {
    return baseModule(domain, {
      fields: {
        planId: 'plan_demo_expanded_operational',
        planType: 'operational',
        version: 'v1-preview',
        effectiveFrom: '2026-07-08',
        effectiveTo: null,
        status: 'draft',
        tenantId,
        projectId,
        authorizedRoles: ['superadmin', 'admin'],
        historyRef: 'history://plans/expanded-operational',
        auditRef: 'audit://admin-config-expanded/plans/operational-v1-preview',
      },
      planCatalogPreview: ['operational', 'project', 'certification', 'payments', 'evidence', 'automations', 'academy'],
      activationPolicy: {
        humanReviewRequired: true,
        replaceRequiresReason: true,
        overwritePreviousVersion: false,
      },
    });
  }

  if (domain === 'evidence') {
    return baseModule(domain, {
      evidenceTypes: ['photo', 'video', 'audio', 'receipt', 'document_ref'],
      storageState: 'pending_gate',
      reviewStates: ['required', 'prepared', 'pending_real_upload', 'pending_review', 'accepted_preview', 'rejected_requires_reason'],
    });
  }

  if (domain === 'certifications') {
    return baseModule(domain, {
      carryoverPolicy: 'preserve_already_presented_certifications',
      aiQuestionBankState: 'gemini_prepared_gate_closed',
      approvalPolicy: 'human_review_required',
    });
  }

  if (domain === 'academy') {
    return baseModule(domain, {
      rolesAllowed: ['superadmin', 'admin', 'academy_admin'],
      humanReviewRequired: true,
      contentObjects: ['courses', 'lessons', 'manuals', 'learning_routes', 'glossary', 'faq', 'checklists', 'resources', 'commercial_modules'],
      adminActions: ['create', 'edit', 'archive_or_soft_delete', 'duplicate', 'version', 'assign_role', 'assign_project', 'request_review', 'publish_preview_only'],
      lifecycleStates: ['draft', 'in_review', 'published', 'archived'],
      aiPolicy: {
        createWithAiAllowedInPreview: true,
        publishWithoutHumanReview: false,
        reviewBeforePublish: true,
      },
      auditChecklist: ['reason_required_for_archive', 'do_not_delete_completed_courses', 'preserve_certification_history', 'document_changes_by_module'],
    });
  }

  if (domain === 'notifications') {
    return baseModule(domain, {
      channels: ['in_app_preview', 'email_prepared', 'whatsapp_prepared'],
      outboxState: 'prepared_not_sent',
      realSendGate: 'closed',
    });
  }

  if (domain === 'applications') {
    return baseModule(domain, {
      states: ['submitted', 'in_review', 'approved_preview', 'rejected_requires_reason', 'assignment_pending_gate'],
      sourceRefs: 'opaque_refs_only',
    });
  }

  if (domain === 'shoppers') {
    return baseModule(domain, {
      identityPolicy: {
        noVisualDedupe: true,
        stableKeysRequired: true,
        sensitiveFieldsHidden: true,
        ambiguousIdentityRequiresReview: true,
      },
    });
  }

  if (domain === 'visits') {
    return baseModule(domain, {
      lifecycleStates: ['available', 'reserved_preview', 'assigned_preview', 'scheduled', 'performed', 'questionnaire_completed', 'submitted_reviewed'],
      stableKeys: ['tenantId', 'projectId', 'visitId', 'hrRowId'],
    });
  }

  if (domain === 'reservations') {
    return baseModule(domain, {
      schedulingPolicy: {
        franjaRequired: true,
        quincenaRequired: true,
        rangeValidationRequired: true,
        reprogramRequiresReason: true,
      },
    });
  }

  if (domain === 'assignments') {
    return baseModule(domain, {
      syncPolicy: {
        assignmentSourceRequired: true,
        assignmentSyncStatusRequired: true,
        conflictReviewRequired: true,
        noSilentOverwrite: true,
      },
    });
  }

  if (domain === 'rescheduling') {
    return baseModule(domain, {
      reasonRequired: true,
      reviewerRoles: ['admin', 'ops'],
      notifyReal: false,
      stateCopy: 'reprogramacion preparada, notificacion real pendiente gate',
    });
  }

  if (domain === 'cancellations') {
    return baseModule(domain, {
      reasonRequired: true,
      preserveAuditTrail: true,
      releaseVisitPolicy: 'review_before_release',
    });
  }

  if (domain === 'settlements') {
    return baseModule(domain, {
      eligibilityStates: ['not_eligible', 'eligible_preview', 'in_review', 'prepared', 'blocked_missing_input', 'conflict_requires_review'],
      requiresSubmitReviewed: true,
      paymentNotImplied: true,
    });
  }

  if (domain === 'payments') {
    return baseModule(domain, {
      paymentStates: ['pending_real_payment', 'prepared', 'in_review', 'blocked_missing_input', 'confirmed_by_review'],
      batchPolicy: {
        lotesConfigurables: true,
        movementItemsLinked: true,
        noProviderPayment: true,
      },
    });
  }

  if (domain === 'integrations') {
    return baseModule(domain, {
      providerState: 'gate_required',
      providers: ['hr_ref', 'storage_ref', 'mailbox_ref', 'make_ref', 'gemini_ref'],
      activationPolicy: 'future_approval_required',
    });
  }

  if (domain === 'make') {
    return baseModule(domain, {
      providerState: 'gate_required',
      flowTypes: ['platform_to_hr_preview', 'hr_to_platform_preview', 'notifications_preview'],
      webhookPolicy: 'no_webhook_payloads_in_repo',
    });
  }

  if (domain === 'gemini') {
    return baseModule(domain, {
      providerState: 'gate_required',
      useCases: ['question_bank_preview', 'certification_feedback_preview', 'academy_content_draft_preview'],
      approvalPolicy: 'human_review_before_publish',
    });
  }

  if (domain === 'imports') {
    return baseModule(domain, {
      importPolicy: {
        sourceTypes: ['controlled_fixture', 'redacted_reference', 'manual_clean_csv_preview'],
        importGate: 'closed',
        conflictReviewRequired: true,
        realImportAllowed: false,
      },
    });
  }

  if (domain === 'reports') {
    return baseModule(domain, {
      reportTypes: ['readiness_dashboard', 'conflict_queue', 'settlement_preview', 'phase_a_go_nogo', 'academy_admin_audit'],
      exportPolicy: 'source_safe_only',
    });
  }

  if (domain === 'roles_permissions') {
    return baseModule(domain, {
      roleMatrix,
      leastPrivilege: true,
      permissionChangesRequireReview: true,
    });
  }

  if (domain === 'gates_audit') {
    return baseModule(domain, {
      gateTypes: ['preview_only', 'human_review', 'provider_activation', 'production_cutover', 'import_real', 'payment_real'],
      auditRefsRequired: true,
      reasonRequired: true,
      noSilentActivation: true,
    });
  }

  return baseModule(domain);
}

export function expandedAdminConfigurabilityManifest() {
  return {
    mode: 'preview_only',
    tenantId,
    projectId,
    execute: false,
    executeNow: false,
    writeToDatabase: false,
    writeToFirestore: false,
    writeToHr: false,
    writeToStorage: false,
    connectProvider: false,
    providerActive: false,
    makeActive: false,
    geminiActive: false,
    authActive: false,
    storageActive: false,
    importNow: false,
    notifyReal: false,
    sendRealEmail: false,
    sendRealWhatsapp: false,
    payNow: false,
    publishWithoutHumanReview: false,
    overwritePreviousVersion: false,
    modifyAcceptedNdaSilently: false,
    containsSensitiveRawData: false,
    containsDpi: false,
    containsBankData: false,
    containsSignedNdaFile: false,
    containsSecrets: false,
    redactionPolicy: {
      sourceRefsAreOpaque: true,
      noRawRows: true,
      noRawAttachments: true,
      noSecrets: true,
      noPaymentProviderPayloads: true,
    },
    modules: REQUIRED_DOMAINS.map(moduleForDomain),
  };
}

export function runExpandedAdminConfigurabilityFixture() {
  const manifest = expandedAdminConfigurabilityManifest();
  const validation = validateAdminConfigurabilityContract(manifest);
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
        'expanded tenant/project administrability across all required domains',
        'role-based admin actions with gates and audit refs',
        'academy administration pattern with archive/duplicate/version states',
      ],
      exclusivoCliente: [
        'TyA Phase A values can be represented as project config without real sources or sensitive payloads',
      ],
      claudePrototipo: [
        'admin UI must expose configurable domains, honest gates and audit-required actions',
        'Academia UI must expose archive/delete control, duplicate, version, state and review actions',
      ],
      academia: [
        'teach tenant/project configurability by domain',
        'teach academy administration and human review before publish',
        'teach NDA/plan lifecycle and no silent overwrite',
      ],
      sinImpactoClaude: [
        'fixture has no UI mutation and no provider calls',
      ],
    },
  };
}

function main() {
  const report = runExpandedAdminConfigurabilityFixture();
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.validation?.ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
