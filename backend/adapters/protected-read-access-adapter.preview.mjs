// CXOrbia Phase A protected read access adapter preview
// Functional policy engine only. No Firebase imports, no Firestore calls, no Auth calls, no writes.

const DEFAULT_FORBIDDEN_FIELDS = [
  'rawEmail',
  'rawPhone',
  'rawIdentityDocument',
  'rawBankAccount',
  'rawNda',
  'privateSourceUrl',
  'rawWorkbook',
  'paymentReceiptBase64',
  'providerToken',
  'password'
];

function unique(items) {
  return Array.from(new Set((items || []).filter(Boolean)));
}

function hasProject(context, projectId) {
  if (!projectId) return true;
  return Array.isArray(context.projectIds) && context.projectIds.includes(projectId);
}

function hasCountry(context, countryId) {
  if (!countryId) return true;
  return Array.isArray(context.countryIds) && context.countryIds.includes(countryId);
}

function hasForbiddenField(fields = [], forbidden = DEFAULT_FORBIDDEN_FIELDS) {
  return fields.some((field) => forbidden.includes(field));
}

function auditEventFor(context, request, verdict) {
  return {
    actorUserId: context.userId || 'source_safe_user_ref',
    tenantId: context.tenantId,
    role: context.role,
    personaType: context.personaType,
    scope: context.scope,
    entityType: request.resource,
    entityId: request.entityId || request.shopperId || request.liquidationId || request.attemptId || 'source_safe_entity_ref',
    projectId: request.projectId || null,
    countryId: request.countryId || null,
    reason: request.reason || context.reason || 'phase_a_protected_read_policy_check',
    timestamp: new Date().toISOString(),
    source: 'protected-read-access-adapter.preview',
    verdict
  };
}

export function evaluateProtectedReadAccess({ contract, context, request }) {
  const hardFails = [];
  const warnings = [];
  if (!contract || contract.status !== 'draft_safe_not_connected') hardFails.push('contract_not_safe_or_missing');
  if (!context || typeof context !== 'object') hardFails.push('context_missing');
  if (!request || typeof request !== 'object') hardFails.push('request_missing');
  if (hardFails.length) {
    return { allowed: false, verdict: 'DENY_INVALID_INPUT', hardFails, warnings, auditEvent: null };
  }

  for (const key of contract.requiredContextKeys || []) {
    if (context[key] === undefined || context[key] === null || context[key] === '') hardFails.push(`context_key_missing:${key}`);
  }

  const resource = contract.protectedResources?.[request.resource];
  if (!resource) hardFails.push(`resource_unknown:${request.resource}`);

  if (request.operation && request.operation !== 'read') hardFails.push('only_read_supported');
  if (request.writeIntent === true || request.deployIntent === true || request.importIntent === true) hardFails.push('write_deploy_import_intent_blocked');
  if (hasForbiddenField(request.requestedFields || [], contract.forbiddenFields || DEFAULT_FORBIDDEN_FIELDS)) hardFails.push('forbidden_field_requested');

  if (resource) {
    if (!resource.allowedRoles?.includes(context.role)) hardFails.push(`role_not_allowed:${context.role}`);
    if (!resource.allowedPersonas?.includes(context.personaType)) hardFails.push(`persona_not_allowed:${context.personaType}`);
    if (resource.requiresProjectScope && !hasProject(context, request.projectId)) hardFails.push('project_scope_missing');
    if (request.countryId && !hasCountry(context, request.countryId) && ['country', 'tenantProjectOrCountry'].includes(context.scope)) hardFails.push('country_scope_missing');
    if (context.role === 'shopper' || context.personaType === 'shopperEvaluator') {
      if (request.shopperId && context.shopperId !== request.shopperId) hardFails.push('shopper_can_read_only_own_record');
      if (request.resource === 'protectedPaymentBatches') hardFails.push('shopper_cannot_read_payment_batches');
      if (request.resource === 'reviewQueue') hardFails.push('shopper_cannot_read_review_queue');
    }
    if (['clientAdmin', 'clientViewer'].includes(context.role)) {
      hardFails.push('client_roles_blocked_for_protected_operational_data');
    }
  }

  const allowed = hardFails.length === 0;
  const verdict = allowed ? 'ALLOW_PROTECTED_READ_DRY_RUN' : 'DENY_PROTECTED_READ_DRY_RUN';
  return {
    allowed,
    verdict,
    hardFails,
    warnings,
    policy: {
      tenantId: context.tenantId,
      role: context.role,
      personaType: context.personaType,
      scope: context.scope,
      resource: request.resource,
      operation: 'read',
      realBackendConnected: false,
      writesEnabled: false,
      productionEnabled: false
    },
    auditEvent: auditEventFor(context, request, verdict)
  };
}

export function buildProtectedReadPlan({ contract, context, requests }) {
  const results = (requests || []).map((request) => evaluateProtectedReadAccess({ contract, context, request }));
  return {
    generatedAt: new Date().toISOString(),
    safeState: {
      firebaseImported: false,
      firestoreConnected: false,
      authConnected: false,
      frontendConnected: false,
      writesEnabled: false,
      productionEnabled: false
    },
    context: {
      tenantId: context?.tenantId,
      role: context?.role,
      personaType: context?.personaType,
      scope: context?.scope,
      permissionsVersion: context?.permissionsVersion,
      projectIds: unique(context?.projectIds),
      countryIds: unique(context?.countryIds)
    },
    allowedCount: results.filter((r) => r.allowed).length,
    deniedCount: results.filter((r) => !r.allowed).length,
    results
  };
}

export default { evaluateProtectedReadAccess, buildProtectedReadPlan };
