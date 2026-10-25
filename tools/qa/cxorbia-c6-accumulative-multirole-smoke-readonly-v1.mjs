#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const projectId = process.env.CXORBIA_FIREBASE_PROJECT || 'cxorbia-backend-dev';
const tenantId = process.env.CXORBIA_TENANT_ID || 'tya';
const targetProjectId = process.env.CXORBIA_PROJECT_ID || 'cinepolis';
const expectedAuthUsers = Number(process.env.CXORBIA_EXPECTED_AUTH_USERS || 228);
const matrixPath = process.env.CXORBIA_SMOKE_MATRIX || 'backend/config/c6-accumulative-multirole-smoke-matrix-v1.json';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const ADMIN_ROLES = new Set(['super','admin','ops','coordinador']);
const CLIENT_ROLES = new Set(['cliente','client']);
const ALLOWED_ROLES = new Set([...ADMIN_ROLES, ...CLIENT_ROLES, 'shopper']);

const norm = value => String(value ?? '').trim().toLowerCase();
const list = value => Array.isArray(value)
  ? value.map(norm).filter(Boolean)
  : (typeof value === 'string' ? value.split(',').map(norm).filter(Boolean) : []);
const ensure = (value, code) => { if (!value) throw new Error(code); };
const sha256 = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const safeError = error => {
  const raw = String(error?.message || error || 'UNKNOWN');
  return {
    code: (raw.split(':')[0] || 'UNKNOWN').replace(/[^A-Za-z0-9_.-]+/g, '_').slice(0, 120),
    fingerprint: sha256(raw).slice(0, 24)
  };
};

function collectSourceCorpus(root) {
  const parts = [];
  const walk = current => {
    if (!fs.existsSync(current)) return;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) walk(path.join(current, entry));
      return;
    }
    if (!/\.(js|mjs|html|css|json)$/i.test(current)) return;
    const rel = current.replaceAll('\\','/');
    parts.push(rel.toLowerCase());
    try { parts.push(fs.readFileSync(current, 'utf8').toLowerCase()); } catch {}
  };
  walk(root);
  return parts.join('\n');
}

function validateStaticSurfaces(matrix) {
  ensure(matrix?.schemaVersion === 'cxorbia.c6.accumulative-multirole-smoke-matrix.v1', 'SMOKE_MATRIX_SCHEMA_DRIFT');
  ensure(matrix?.firebaseProjectId === projectId, 'SMOKE_MATRIX_PROJECT_DRIFT');
  ensure(Array.isArray(matrix?.personas) && matrix.personas.length === 3, 'SMOKE_MATRIX_PERSONAS_DRIFT');
  const corpus = [
    collectSourceCorpus('app/modules'),
    collectSourceCorpus('app/core'),
    collectSourceCorpus('app/app.js'),
    collectSourceCorpus('app/index.html')
  ].join('\n');
  const personas = {};
  let required = 0;
  let found = 0;
  for (const persona of matrix.personas) {
    const modules = Array.isArray(persona.modules) ? persona.modules.map(norm).filter(Boolean) : [];
    const present = [];
    const missing = [];
    for (const moduleName of modules) {
      required += 1;
      if (corpus.includes(moduleName)) { found += 1; present.push(moduleName); }
      else missing.push(moduleName);
    }
    personas[persona.persona] = { required: modules.length, present: present.length, missing };
  }
  ensure(found === required, 'PHASE_A_SURFACE_SOURCE_MISSING');
  return { pass: true, required, present: found, personas };
}

function tenantAllowed(claims, role) {
  return role === 'super' || norm(claims?.tenantId) === tenantId || list(claims?.tenants).includes(tenantId);
}

function namespaceCompatible(claims, role) {
  const actual = norm(claims?.authNamespace);
  if (!actual) return true;
  return actual === (role === 'shopper' ? 'shopper' : 'staff');
}

async function listAllUsers(auth) {
  const users = [];
  let pageToken;
  let providerReads = 0;
  do {
    const page = await auth.listUsers(1000, pageToken);
    providerReads += 1;
    users.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);
  return { users, providerReads };
}

async function main() {
  const report = {
    schemaVersion: 'cxorbia.c6.accumulative-multirole-smoke-readonly.v1',
    generatedAt: new Date().toISOString(),
    projectId,
    tenantId,
    targetProjectId,
    expectedAuthUsers,
    decision: 'STOP_RETRY_C6_ACCUMULATIVE_MULTIROLE_SMOKE_READONLY',
    auth: {
      population: 0,
      enabled: 0,
      disabled: 0,
      providerReads: 0,
      duplicateProviderEmails: 0,
      unknownEnabledRoles: 0
    },
    roleSurfaces: {
      adminOperaciones: { enabled: 0, tenantAllowed: 0, namespaceCompatible: 0 },
      shopper: { enabled: 0, tenantAllowed: 0, projectScoped: 0, targetScoped: 0, shopperScopePresent: 0, namespaceCompatible: 0, duplicateShopperScopes: 0 },
      cliente: { enabled: 0, tenantAllowed: 0, projectScoped: 0, targetScoped: 0, namespaceCompatible: 0 }
    },
    phaseASurfaces: null,
    browserOnlyChecksDeferredToHumanValidation: [
      'login succeeds with canonical form',
      'three reloads',
      'new browser tab',
      'same sourceRevision across data-bearing modules',
      'visual absence of technical notes',
      'UTF-8 visual mojibake inspection'
    ],
    safety: {
      providerReads: 0,
      providerWrites: 0,
      authWrites: 0,
      iamWrites: 0,
      firestoreWrites: 0,
      hrWrites: 0,
      rulesWrites: 0,
      storageWrites: 0,
      cloudBuild: 0,
      cloudRun: 0,
      hosting: 0,
      make: 0,
      gemini: 0,
      payments: 0,
      merge: false,
      production: false,
      rawUidExported: false,
      rawEmailExported: false,
      rawShopperIdExported: false,
      rawClaimsExported: false,
      rawCredentialExported: false
    }
  };

  try {
    ensure(fs.existsSync(matrixPath), 'SMOKE_MATRIX_MISSING');
    const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
    report.phaseASurfaces = validateStaticSurfaces(matrix);

    if (process.argv.includes('--source-self-test')) {
      report.decision = 'PASS_C6_ACCUMULATIVE_MULTIROLE_SMOKE_SOURCE_SELFTEST';
      process.stdout.write(JSON.stringify(report) + '\n');
      return;
    }

    ensure(credentialPath && fs.existsSync(credentialPath), 'SMOKE_EPHEMERAL_CREDENTIAL_MISSING');
    const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
    ensure(sa?.type === 'service_account' && sa?.project_id === projectId && sa?.client_email && sa?.private_key, 'SMOKE_EPHEMERAL_CREDENTIAL_INVALID');

    if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa), projectId });
    const { users, providerReads } = await listAllUsers(admin.auth());
    report.auth.population = users.length;
    report.auth.providerReads = providerReads;
    report.safety.providerReads = providerReads;
    report.auth.enabled = users.filter(user => !user.disabled).length;
    report.auth.disabled = users.filter(user => user.disabled).length;
    ensure(users.length === expectedAuthUsers, `AUTH_POPULATION_${users.length}`);
    ensure(providerReads === 1, `AUTH_LIST_PROVIDER_READS_${providerReads}`);

    const emailCounts = new Map();
    const shopperScopeCounts = new Map();
    const invalid = [];

    for (const user of users) {
      const email = norm(user.email);
      if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
      if (user.disabled) continue;
      const claims = user.customClaims || {};
      const role = norm(claims.role);
      if (!ALLOWED_ROLES.has(role)) {
        report.auth.unknownEnabledRoles += 1;
        invalid.push('UNKNOWN_ENABLED_ROLE');
        continue;
      }
      const projects = Array.from(new Set(list(claims.projectIds)));
      const tenantOk = tenantAllowed(claims, role);
      const namespaceOk = namespaceCompatible(claims, role);

      if (ADMIN_ROLES.has(role)) {
        report.roleSurfaces.adminOperaciones.enabled += 1;
        if (tenantOk) report.roleSurfaces.adminOperaciones.tenantAllowed += 1;
        if (namespaceOk) report.roleSurfaces.adminOperaciones.namespaceCompatible += 1;
        if (!tenantOk) invalid.push('ADMIN_TENANT_SCOPE');
        if (!namespaceOk) invalid.push('ADMIN_NAMESPACE_SCOPE');
      } else if (role === 'shopper') {
        report.roleSurfaces.shopper.enabled += 1;
        if (tenantOk) report.roleSurfaces.shopper.tenantAllowed += 1;
        if (projects.length > 0) report.roleSurfaces.shopper.projectScoped += 1;
        if (tenantOk && projects.includes(targetProjectId)) report.roleSurfaces.shopper.targetScoped += 1;
        const shopperId = String(claims.shopperId || '').trim();
        if (shopperId) {
          report.roleSurfaces.shopper.shopperScopePresent += 1;
          const shopperFp = sha256(shopperId);
          shopperScopeCounts.set(shopperFp, (shopperScopeCounts.get(shopperFp) || 0) + 1);
        }
        if (namespaceOk) report.roleSurfaces.shopper.namespaceCompatible += 1;
        if (!tenantOk) invalid.push('SHOPPER_TENANT_SCOPE');
        if (!projects.length) invalid.push('SHOPPER_PROJECT_SCOPE');
        if (!shopperId) invalid.push('SHOPPER_ID_SCOPE');
        if (!namespaceOk) invalid.push('SHOPPER_NAMESPACE_SCOPE');
      } else if (CLIENT_ROLES.has(role)) {
        report.roleSurfaces.cliente.enabled += 1;
        if (tenantOk) report.roleSurfaces.cliente.tenantAllowed += 1;
        if (projects.length > 0) report.roleSurfaces.cliente.projectScoped += 1;
        if (tenantOk && projects.includes(targetProjectId)) report.roleSurfaces.cliente.targetScoped += 1;
        if (namespaceOk) report.roleSurfaces.cliente.namespaceCompatible += 1;
        if (!tenantOk) invalid.push('CLIENT_TENANT_SCOPE');
        if (!projects.length) invalid.push('CLIENT_PROJECT_SCOPE');
        if (!namespaceOk) invalid.push('CLIENT_NAMESPACE_SCOPE');
      }
    }

    report.auth.duplicateProviderEmails = [...emailCounts.values()].filter(count => count > 1).length;
    report.roleSurfaces.shopper.duplicateShopperScopes = [...shopperScopeCounts.values()].filter(count => count > 1).length;

    ensure(report.auth.duplicateProviderEmails === 0, 'DUPLICATE_PROVIDER_EMAILS');
    ensure(report.auth.unknownEnabledRoles === 0, 'UNKNOWN_ENABLED_ROLES');
    ensure(report.roleSurfaces.adminOperaciones.enabled > 0, 'ADMIN_OPERACIONES_SURFACE_MISSING');
    ensure(report.roleSurfaces.adminOperaciones.tenantAllowed === report.roleSurfaces.adminOperaciones.enabled, 'ADMIN_OPERACIONES_TENANT_ISOLATION');
    ensure(report.roleSurfaces.adminOperaciones.namespaceCompatible === report.roleSurfaces.adminOperaciones.enabled, 'ADMIN_OPERACIONES_NAMESPACE_ISOLATION');
    ensure(report.roleSurfaces.shopper.enabled > 0, 'SHOPPER_SURFACE_MISSING');
    ensure(report.roleSurfaces.shopper.tenantAllowed === report.roleSurfaces.shopper.enabled, 'SHOPPER_TENANT_ISOLATION');
    ensure(report.roleSurfaces.shopper.projectScoped === report.roleSurfaces.shopper.enabled, 'SHOPPER_PROJECT_ISOLATION');
    ensure(report.roleSurfaces.shopper.shopperScopePresent === report.roleSurfaces.shopper.enabled, 'SHOPPER_ID_ISOLATION');
    ensure(report.roleSurfaces.shopper.namespaceCompatible === report.roleSurfaces.shopper.enabled, 'SHOPPER_NAMESPACE_ISOLATION');
    ensure(report.roleSurfaces.shopper.targetScoped > 0, 'SHOPPER_TARGET_PROJECT_SURFACE_MISSING');
    ensure(report.roleSurfaces.shopper.duplicateShopperScopes === 0, 'DUPLICATE_ENABLED_SHOPPER_SCOPE');
    ensure(report.roleSurfaces.cliente.enabled > 0, 'CLIENT_SURFACE_MISSING');
    ensure(report.roleSurfaces.cliente.tenantAllowed === report.roleSurfaces.cliente.enabled, 'CLIENT_TENANT_ISOLATION');
    ensure(report.roleSurfaces.cliente.projectScoped === report.roleSurfaces.cliente.enabled, 'CLIENT_PROJECT_ISOLATION');
    ensure(report.roleSurfaces.cliente.namespaceCompatible === report.roleSurfaces.cliente.enabled, 'CLIENT_NAMESPACE_ISOLATION');
    ensure(report.roleSurfaces.cliente.targetScoped > 0, 'CLIENT_TARGET_PROJECT_SURFACE_MISSING');
    ensure(invalid.length === 0, `ROLE_SCOPE_INVALID_${invalid.length}`);

    report.decision = 'PASS_ACCUMULATIVE_MULTIROLE_SMOKE';
    process.stdout.write(JSON.stringify(report) + '\n');
  } catch (error) {
    report.error = safeError(error);
    process.stdout.write(JSON.stringify(report) + '\n');
    process.exitCode = 2;
  }
}

await main();
