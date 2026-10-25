#!/usr/bin/env node
/**
 * CXOrbia admin configurability contract.
 *
 * Preview-only validator for tenant/project administrability.
 * It does not connect Firestore/Auth/Storage, HR, Make, Gemini, email,
 * WhatsApp, payments, imports, or any production provider.
 */

import { readFile } from 'node:fs/promises';

export const CONTRACT_NAME = 'cxorbia-admin-configurability-contract';
export const CONTRACT_VERSION = '2026-07-08.preview-only';

export const REQUIRED_DOMAINS = Object.freeze([
  'projects',
  'rules',
  'hr_sources',
  'questionnaires',
  'documents',
  'nda_templates',
  'plans',
  'evidence',
  'certifications',
  'academy',
  'notifications',
  'applications',
  'shoppers',
  'visits',
  'reservations',
  'assignments',
  'rescheduling',
  'cancellations',
  'settlements',
  'payments',
  'integrations',
  'make',
  'gemini',
  'imports',
  'reports',
  'roles_permissions',
  'gates_audit',
]);

const ALLOWED_STATUSES = Object.freeze([
  'draft',
  'in_review',
  'human_review_required',
  'approved',
  'active',
  'paused',
  'replaced',
  'archived',
  'published',
  'preview_only',
]);

const BLOCKED_TRUE_FLAGS = Object.freeze([
  'execute',
  'executeNow',
  'writeToDatabase',
  'writeToFirestore',
  'writeToHr',
  'writeToStorage',
  'connectProvider',
  'providerActive',
  'makeActive',
  'geminiActive',
  'authActive',
  'storageActive',
  'importNow',
  'notifyReal',
  'sendRealEmail',
  'sendRealWhatsapp',
  'payNow',
  'publishWithoutHumanReview',
  'overwritePreviousVersion',
  'modifyAcceptedNdaSilently',
  'containsSensitiveRawData',
  'containsDpi',
  'containsBankData',
  'containsSignedNdaFile',
  'containsSecrets',
]);

const SENSITIVE_KEY_PATTERN = /(^|_)(dpi|passport|documentNumber|bank|bankAccount|cuentaBancaria|iban|swift|routing|signedNda|signature|secret|token|apiKey|webhookUrl|password)(_|$)/i;

const NDA_REQUIRED_FIELDS = Object.freeze([
  'templateId',
  'version',
  'effectiveFrom',
  'effectiveTo',
  'status',
  'tenantId',
  'projectId',
  'createdBy',
  'approvedBy',
  'auditRef',
]);

const PLAN_REQUIRED_FIELDS = Object.freeze([
  'planId',
  'planType',
  'version',
  'effectiveFrom',
  'effectiveTo',
  'status',
  'tenantId',
  'projectId',
  'authorizedRoles',
  'historyRef',
  'auditRef',
]);

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isTruthyBlocked(value) {
  return value === true || value === 'true' || value === 'active' || value === 'enabled' || value === 'real';
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
    if (looksSensitive && hasPayloadValue) {
      issues.push(nextPath);
    }
    if (value && typeof value === 'object') collectSensitivePayloadKeys(value, nextPath, issues);
  }
  return issues;
}

function validateTenantProject(module, index, errors) {
  if (!isNonEmptyString(module.tenantId)) errors.push(`modules[${index}] missing tenantId`);
  if (!hasOwn(module, 'projectId')) errors.push(`modules[${index}] missing projectId key`);
  if (hasOwn(module, 'projectId') && module.projectId !== null && !isNonEmptyString(module.projectId)) {
    errors.push(`modules[${index}] projectId must be string or null for tenant-level config`);
  }
}

function validateEditableVersioned(module, index, errors) {
  if (module.editable !== true) errors.push(`modules[${index}] ${module.domain} must be editable from platform by authorized roles`);
  if (module.versioned !== true) errors.push(`modules[${index}] ${module.domain} must be versioned`);
  if (!Array.isArray(module.rolesAllowed) || module.rolesAllowed.length === 0) {
    errors.push(`modules[${index}] ${module.domain} must define rolesAllowed`);
  }
  if (!ALLOWED_STATUSES.includes(module.status)) {
    errors.push(`modules[${index}] ${module.domain} invalid status: ${module.status}`);
  }
  if (!isNonEmptyString(module.auditRef)) errors.push(`modules[${index}] ${module.domain} missing auditRef`);
  if (!module.gate || module.gate.required !== true) errors.push(`modules[${index}] ${module.domain} must require gate`);
  if (module.gate && !isNonEmptyString(module.gate.status)) errors.push(`modules[${index}] ${module.domain} missing gate.status`);
}

function validateNdaTemplate(module, index, errors, warnings) {
  const fields = module.fields || module.template || module.config || {};
  for (const field of NDA_REQUIRED_FIELDS) {
    if (!hasOwn(fields, field) && !hasOwn(module, field)) {
      errors.push(`modules[${index}] nda_templates missing ${field}`);
    }
  }
  const effectiveTo = hasOwn(fields, 'effectiveTo') ? fields.effectiveTo : module.effectiveTo;
  if (effectiveTo === undefined) errors.push(`modules[${index}] nda_templates effectiveTo key must exist, use null if open-ended`);
  if (!module.reacceptancePolicy) errors.push(`modules[${index}] nda_templates missing reacceptancePolicy`);
  if (!module.acceptanceImmutability || module.acceptanceImmutability !== 'do_not_modify_existing_acceptance') {
    errors.push(`modules[${index}] nda_templates must protect existing accepted/signed acceptances`);
  }
  if (module.signedNdaFile || fields.signedNdaFile) {
    errors.push(`modules[${index}] nda_templates must not include signed NDA files in repo payload`);
  }
  if (module.uiStates && !['pending', 'accepted', 'expired_version', 'requires_reacceptance', 'blocked_by_gate'].every((state) => module.uiStates.includes(state))) {
    warnings.push(`modules[${index}] nda_templates should expose pending/accepted/expired_version/requires_reacceptance/blocked_by_gate`);
  }
}

function validatePlan(module, index, errors) {
  const fields = module.fields || module.plan || module.config || {};
  for (const field of PLAN_REQUIRED_FIELDS) {
    if (!hasOwn(fields, field) && !hasOwn(module, field)) {
      errors.push(`modules[${index}] plans missing ${field}`);
    }
  }
  const planType = fields.planType || module.planType;
  const validTypes = ['operational', 'project', 'certification', 'payments', 'evidence', 'automations', 'academy'];
  if (!validTypes.includes(planType)) {
    errors.push(`modules[${index}] plans invalid planType: ${planType}`);
  }
  const planStatuses = ['draft', 'in_review', 'approved', 'active', 'paused', 'replaced', 'archived'];
  const status = fields.status || module.status;
  if (!planStatuses.includes(status)) {
    errors.push(`modules[${index}] plans invalid lifecycle status: ${status}`);
  }
}

export function validateAdminConfigurabilityContract(manifest = {}) {
  const errors = [];
  const warnings = [];
  const hardBlocks = [];

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return {
      contractName: CONTRACT_NAME,
      contractVersion: CONTRACT_VERSION,
      ok: false,
      hardBlocks: ['manifest must be an object'],
      errors: [],
      warnings: [],
      domains: [],
      classification: classification(),
    };
  }

  if (manifest.mode !== 'preview_only') {
    errors.push('manifest.mode must be preview_only');
  }

  if (!isNonEmptyString(manifest.tenantId)) errors.push('manifest missing tenantId');
  if (!hasOwn(manifest, 'projectId')) errors.push('manifest missing projectId key');

  hardBlocks.push(...collectBlockedFlags(manifest));

  const sensitiveKeys = collectSensitivePayloadKeys(manifest).filter((path) => {
    return !/\.sensitivePolicy$|\.sensitiveDataPolicy$|\.redactionPolicy$|\.allowedSensitiveKeys$|\.blockedSensitiveKeys$/i.test(path);
  });
  if (sensitiveKeys.length) {
    hardBlocks.push(`sensitive payload-like keys found: ${sensitiveKeys.join(', ')}`);
  }

  const modules = asArray(manifest.modules || manifest.configurability || manifest.domains);
  if (modules.length === 0) errors.push('manifest must include modules/configurability/domains');

  const configuredDomains = new Set();
  modules.forEach((module, index) => {
    if (!module || typeof module !== 'object') {
      errors.push(`modules[${index}] must be an object`);
      return;
    }
    const domain = module.domain;
    if (!REQUIRED_DOMAINS.includes(domain)) {
      errors.push(`modules[${index}] invalid or missing domain: ${domain}`);
      return;
    }
    configuredDomains.add(domain);
    validateTenantProject(module, index, errors);
    validateEditableVersioned(module, index, errors);

    if (domain === 'nda_templates') validateNdaTemplate(module, index, errors, warnings);
    if (domain === 'plans') validatePlan(module, index, errors);

    if (['make', 'gemini', 'integrations'].includes(domain)) {
      if (!['disabled', 'prepared', 'gate_required', 'preview_only'].includes(module.providerState)) {
        errors.push(`modules[${index}] ${domain} providerState must be disabled/prepared/gate_required/preview_only`);
      }
    }

    if (domain === 'academy' && module.humanReviewRequired !== true) {
      errors.push('academy configurability must require human review before publishing generated content');
    }
  });

  for (const required of REQUIRED_DOMAINS) {
    if (!configuredDomains.has(required)) errors.push(`missing required configurable domain: ${required}`);
  }

  const ok = errors.length === 0 && hardBlocks.length === 0;
  return {
    contractName: CONTRACT_NAME,
    contractVersion: CONTRACT_VERSION,
    ok,
    hardBlocks,
    errors,
    warnings,
    domains: Array.from(configuredDomains).sort(),
    requiredDomains: REQUIRED_DOMAINS,
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
    },
  };
}

export function classification() {
  return {
    reusableCxorbia: [
      'tenant/project configurability',
      'versioned templates and plans',
      'roles, auditRef, gates and human review',
      'provider-disabled default for Make/Gemini/imports/payments',
    ],
    exclusivoCliente: [
      'TyA/Cinepolis values only appear as manifest data outside this contract',
    ],
    claudePrototipo: [
      'show admin screens for configurable domains',
      'show NDA and plan lifecycle states',
      'show preview/pending gate copy instead of executed copy',
    ],
    academia: [
      'explain template vs version vs acceptance/reacceptance',
      'explain plan statuses and gate flow by role',
      'explain that prepared/in review does not mean executed',
    ],
    sinImpactoClaude: [
      'validator has no runtime provider calls and no UI changes',
    ],
  };
}

export function sampleManifest() {
  const tenantId = 'tenant_demo';
  const projectId = 'project_demo';
  const base = (domain) => ({
    domain,
    tenantId,
    projectId,
    editable: true,
    versioned: true,
    rolesAllowed: ['superadmin', 'admin'],
    status: 'draft',
    auditRef: `audit://${domain}/preview`,
    gate: { required: true, status: 'closed' },
    providerState: ['make', 'gemini', 'integrations'].includes(domain) ? 'gate_required' : 'preview_only',
  });
  return {
    mode: 'preview_only',
    tenantId,
    projectId,
    modules: REQUIRED_DOMAINS.map((domain) => {
      const module = base(domain);
      if (domain === 'nda_templates') {
        Object.assign(module, {
          acceptanceImmutability: 'do_not_modify_existing_acceptance',
          reacceptancePolicy: { triggerOnVersionChange: true, gateRequired: true },
          uiStates: ['pending', 'accepted', 'expired_version', 'requires_reacceptance', 'blocked_by_gate'],
          fields: {
            templateId: 'nda_tpl_demo',
            version: 'v1',
            effectiveFrom: '2026-07-08',
            effectiveTo: null,
            status: 'draft',
            tenantId,
            projectId,
            createdBy: 'role:admin',
            approvedBy: 'role:superadmin',
            auditRef: 'audit://nda_tpl_demo/v1',
          },
        });
      }
      if (domain === 'plans') {
        Object.assign(module, {
          fields: {
            planId: 'plan_demo',
            planType: 'operational',
            version: 'v1',
            effectiveFrom: '2026-07-08',
            effectiveTo: null,
            status: 'draft',
            tenantId,
            projectId,
            authorizedRoles: ['superadmin', 'admin'],
            historyRef: 'history://plan_demo',
            auditRef: 'audit://plan_demo/v1',
          },
        });
      }
      if (domain === 'academy') {
        module.humanReviewRequired = true;
      }
      return module;
    }),
  };
}

async function main() {
  const file = process.argv[2];
  const manifest = file ? JSON.parse(await readFile(file, 'utf8')) : sampleManifest();
  const report = validateAdminConfigurabilityContract(manifest);
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
