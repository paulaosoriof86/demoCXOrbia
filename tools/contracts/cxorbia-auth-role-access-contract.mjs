#!/usr/bin/env node
/*
  CXOrbia - Auth role access contract
  Synthetic validation only. No deploy, no provider calls, no Auth writes, no imports.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-auth-role-access-contract';

const roles = ['superadmin', 'admin', 'ops', 'finance', 'academy_admin', 'shopper', 'client', 'technical_reviewer'];
const permissions = ['tenant.manage', 'project.manage', 'visit.read', 'visit.write', 'assignment.review', 'application.review', 'shopper.read', 'settlement.read', 'settlement.review', 'academy.read', 'academy.write', 'integration.review', 'audit.read'];

const rolePermissions = {
  superadmin: permissions,
  admin: ['project.manage', 'visit.read', 'visit.write', 'assignment.review', 'application.review', 'shopper.read', 'settlement.read', 'academy.read', 'integration.review', 'audit.read'],
  ops: ['visit.read', 'visit.write', 'assignment.review', 'application.review', 'shopper.read', 'academy.read'],
  finance: ['settlement.read', 'settlement.review', 'audit.read'],
  academy_admin: ['academy.read', 'academy.write', 'audit.read'],
  shopper: ['visit.read', 'application.review', 'settlement.read', 'academy.read'],
  client: ['visit.read', 'academy.read'],
  technical_reviewer: ['integration.review', 'audit.read']
};

const routePolicies = [
  { route: 'dashboard', allowedRoles: ['superadmin', 'admin', 'ops', 'client'] },
  { route: 'projects', allowedRoles: ['superadmin', 'admin'] },
  { route: 'visits', allowedRoles: ['superadmin', 'admin', 'ops', 'client'] },
  { route: 'applications', allowedRoles: ['superadmin', 'admin', 'ops', 'shopper'] },
  { route: 'settlements', allowedRoles: ['superadmin', 'admin', 'finance', 'shopper'] },
  { route: 'academy', allowedRoles: ['superadmin', 'admin', 'ops', 'finance', 'academy_admin', 'shopper', 'client', 'technical_reviewer'] },
  { route: 'integrations', allowedRoles: ['superadmin', 'admin', 'technical_reviewer'] },
  { route: 'audit', allowedRoles: ['superadmin', 'admin', 'finance', 'academy_admin', 'technical_reviewer'] }
];

function validateRolePermissionMap() {
  const errors = [];
  for (const role of roles) {
    if (!Array.isArray(rolePermissions[role])) errors.push(`missing_role_${role}`);
    for (const permission of rolePermissions[role] || []) {
      if (!permissions.includes(permission)) errors.push(`invalid_permission_${role}_${permission}`);
    }
  }
  return errors;
}

function validateRoutePolicy(policy) {
  const errors = [];
  if (!policy.route) errors.push('missing_route');
  if (!Array.isArray(policy.allowedRoles) || policy.allowedRoles.length === 0) errors.push('missing_allowedRoles');
  for (const role of policy.allowedRoles || []) {
    if (!roles.includes(role)) errors.push(`invalid_role_${role}`);
  }
  return { route: policy.route, ok: errors.length === 0, errors, allowedRoles: policy.allowedRoles || [] };
}

const mapErrors = validateRolePermissionMap();
const routeResults = routePolicies.map(validateRoutePolicy);
const failures = routeResults.filter(r => !r.ok);
const report = {
  gate: 'cxorbia-auth-role-access-contract',
  generatedAt: new Date().toISOString(),
  verdict: mapErrors.length || failures.length ? 'NO_GO_AUTH_ROLE_ACCESS_CONTRACT' : 'GO_AUTH_ROLE_ACCESS_PREVIEW_ONLY',
  roleCount: roles.length,
  permissionCount: permissions.length,
  routePolicyCount: routePolicies.length,
  mapErrors,
  routeResults,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, authWrites: false, providerCalls: false, dbWrites: false, imports: false, production: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-auth-role-access-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia Auth role access contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Roles: ${report.roleCount}`,
  `Permissions: ${report.permissionCount}`,
  `Route policies: ${report.routePolicyCount}`, '',
  '## Routes',
  ...routeResults.map(r => `- ${r.route}: ${r.allowedRoles.join(', ')} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No Auth writes', '- No provider calls', '- No DB writes', '- No imports', '- No production', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-auth-role-access-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = mapErrors.length || failures.length ? 1 : 0;
