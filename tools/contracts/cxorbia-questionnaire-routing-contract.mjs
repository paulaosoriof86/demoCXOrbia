#!/usr/bin/env node
/*
  CXOrbia - Questionnaire routing contract validator
  Preview-only contract. No provider calls, no database writes, no imports, no deploy.

  Purpose:
  Validate the shape of questionnaire routing actions before any real backend
  implementation. A project/visit can route to CXOrbia, TyAOnline, an external
  platform, a general opaque reference, or a visit-specific HR reference.
*/

const actions = new Set([
  'preview_project_default',
  'preview_visit_route',
  'request_project_default_change',
  'request_visit_override',
  'request_route_pause',
  'request_route_restore',
  'export_route_report'
]);

const routeTypes = new Set([
  'cxorbia_form',
  'tya_online',
  'external_platform',
  'general_ref',
  'visit_hr_ref'
]);

const roles = new Set([
  'superadmin',
  'admin',
  'ops',
  'academy_admin',
  'technical_reviewer'
]);

const statusByAction = {
  preview_project_default: 'preview_ready',
  preview_visit_route: 'preview_ready',
  request_project_default_change: 'review_required',
  request_visit_override: 'review_required',
  request_route_pause: 'review_required',
  request_route_restore: 'review_required',
  export_route_report: 'report_ready'
};

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasRawUrl(value) {
  return typeof value === 'string' && /https?:\/\//i.test(value);
}

function validate(payload) {
  const errors = [];
  const warnings = [];
  const p = payload && typeof payload === 'object' ? payload : {};

  if (!hasText(p.tenantId)) errors.push('tenantId_required');
  if (!hasText(p.projectId)) errors.push('projectId_required');
  if (!hasText(p.action) || !actions.has(p.action)) errors.push('unsupported_action');
  if (!hasText(p.actorRole) || !roles.has(p.actorRole)) errors.push('unsupported_actor_role');
  if (!hasText(p.auditRef)) errors.push('auditRef_required');

  if (p.action === 'preview_visit_route' || p.action === 'request_visit_override') {
    if (!hasText(p.visitId)) errors.push('visitId_required_for_visit_route');
  }

  if (p.route) {
    if (!routeTypes.has(p.route.type)) errors.push('unsupported_route_type');
    if (p.route.type !== 'cxorbia_form' && !hasText(p.route.routeRef)) {
      errors.push('routeRef_required_for_external_or_hr_route');
    }
    if (hasRawUrl(p.route.routeRef)) {
      errors.push('raw_url_not_allowed_use_opaque_routeRef');
    }
    if (p.route.type === 'visit_hr_ref' && !hasText(p.visitId)) {
      errors.push('visitId_required_for_visit_hr_ref');
    }
    if (p.route.type === 'tya_online') {
      warnings.push('tya_online_is_project_specific_not_global_architecture');
    }
  }

  if (p.action && p.action.startsWith('request_') && !hasText(p.reason)) {
    errors.push('reason_required_for_requested_change');
  }

  if (p.execute === true) {
    errors.push('execute_not_allowed_preview_contract_only');
  }

  return {
    contract: 'cxorbia-questionnaire-routing',
    version: 'phase-a-preview-20260708',
    generatedAt: new Date().toISOString(),
    action: p.action || null,
    tenantId: p.tenantId || null,
    projectId: p.projectId || null,
    visitId: p.visitId || null,
    verdict: errors.length ? 'NO_GO_CONTRACT' : 'GO_PREVIEW_ONLY',
    status: errors.length ? 'blocked_gate' : (statusByAction[p.action] || 'preview_ready'),
    errors,
    warnings,
    safeState: {
      deploy: false,
      production: false,
      providerCalls: false,
      databaseWrites: false,
      imports: false,
      rawUrlsInRepo: false
    }
  };
}

function main() {
  let input = '{}';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(input.trim() || '{}');
    } catch {
      console.log(JSON.stringify({
        contract: 'cxorbia-questionnaire-routing',
        verdict: 'NO_GO_CONTRACT',
        errors: ['invalid_json'],
        safeState: { deploy: false, production: false, providerCalls: false, databaseWrites: false, imports: false }
      }, null, 2));
      process.exitCode = 1;
      return;
    }

    const result = validate(payload);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.errors.length ? 1 : 0;
  });
}

main();
