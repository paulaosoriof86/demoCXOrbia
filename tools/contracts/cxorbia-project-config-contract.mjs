#!/usr/bin/env node
/*
  CXOrbia - reusable tenant/project configuration contract
  Synthetic validation only. No deploy, no providers, no DB writes, no imports.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-project-config-contract';

const allowedQuestionnaireModes = new Set(['cxorbia', 'external_general_link', 'external_visit_link', 'third_party_platform', 'disabled']);
const allowedSourceTypes = new Set(['hr_sheet', 'google_sheet', 'csv_import', 'api_external', 'manual_platform', 'mixed']);
const allowedGateStates = new Set(['off', 'preview', 'ready_for_gate', 'active']);

const sampleConfigs = [
  {
    tenantId: 'tenant-demo',
    projectId: 'project-demo',
    displayName: 'Proyecto demo multi-cliente',
    country: 'GT',
    currency: 'GTQ',
    source: { type: 'google_sheet', refMode: 'masked_ref', writeBackGate: 'off' },
    questionnaire: { mode: 'external_visit_link', defaultLinkRef: null, perVisitLinkAllowed: true },
    evidence: { storageGate: 'off', requiredTypes: ['photo', 'video'] },
    certification: { required: true, academyRouteId: 'cert-demo', reviewMode: 'human_review' },
    scheduling: { enabled: true, rulesetId: 'default-window-rules', reprogrammingAllowed: true, cancellationAllowed: true },
    payments: { enabled: true, currency: 'GTQ', approvalGate: 'preview' },
    integrations: { makeGate: 'off', geminiGate: 'off', messagingGate: 'off', emailGate: 'off' },
    academy: { manualsRequired: true, roleRoutes: ['admin', 'shopper'], notificationsLinked: true }
  },
  {
    tenantId: 'tenant-demo-2',
    projectId: 'project-api',
    displayName: 'Proyecto API externo',
    country: 'CO',
    currency: 'COP',
    source: { type: 'api_external', refMode: 'opaque_ref', writeBackGate: 'ready_for_gate' },
    questionnaire: { mode: 'cxorbia', defaultLinkRef: null, perVisitLinkAllowed: false },
    evidence: { storageGate: 'preview', requiredTypes: ['photo'] },
    certification: { required: false, academyRouteId: null, reviewMode: 'not_required' },
    scheduling: { enabled: true, rulesetId: 'client-specific-rules', reprogrammingAllowed: true, cancellationAllowed: false },
    payments: { enabled: false, currency: 'COP', approvalGate: 'off' },
    integrations: { makeGate: 'preview', geminiGate: 'off', messagingGate: 'off', emailGate: 'preview' },
    academy: { manualsRequired: true, roleRoutes: ['admin'], notificationsLinked: false }
  }
];

function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateConfig(config) {
  const errors = [];
  const warnings = [];

  if (!isNonEmpty(config.tenantId)) errors.push('missing_tenantId');
  if (!isNonEmpty(config.projectId)) errors.push('missing_projectId');
  if (!isNonEmpty(config.displayName)) errors.push('missing_displayName');
  if (!isNonEmpty(config.country)) errors.push('missing_country');
  if (!isNonEmpty(config.currency)) errors.push('missing_currency');

  if (!config.source || !allowedSourceTypes.has(config.source.type)) errors.push('invalid_source_type');
  if (!config.source || !isNonEmpty(config.source.refMode)) errors.push('missing_source_refMode');
  if (!config.source || !allowedGateStates.has(config.source.writeBackGate)) errors.push('invalid_source_writeBackGate');

  if (!config.questionnaire || !allowedQuestionnaireModes.has(config.questionnaire.mode)) errors.push('invalid_questionnaire_mode');
  if (config.questionnaire?.mode === 'external_general_link' && !isNonEmpty(config.questionnaire.defaultLinkRef)) warnings.push('external_general_link_without_default_ref');

  if (!config.evidence || !allowedGateStates.has(config.evidence.storageGate)) errors.push('invalid_evidence_storageGate');
  if (!Array.isArray(config.evidence?.requiredTypes)) errors.push('invalid_evidence_requiredTypes');

  if (!config.certification || typeof config.certification.required !== 'boolean') errors.push('invalid_certification_required');
  if (config.certification?.required && !isNonEmpty(config.certification.academyRouteId)) errors.push('missing_academyRouteId_for_required_certification');

  if (!config.scheduling || typeof config.scheduling.enabled !== 'boolean') errors.push('invalid_scheduling_enabled');
  if (config.scheduling?.enabled && !isNonEmpty(config.scheduling.rulesetId)) errors.push('missing_scheduling_rulesetId');

  if (!config.payments || typeof config.payments.enabled !== 'boolean') errors.push('invalid_payments_enabled');
  if (config.payments?.enabled && config.payments.currency !== config.currency) errors.push('payments_currency_mismatch');
  if (!config.payments || !allowedGateStates.has(config.payments.approvalGate)) errors.push('invalid_payments_approvalGate');

  for (const key of ['makeGate', 'geminiGate', 'messagingGate', 'emailGate']) {
    if (!config.integrations || !allowedGateStates.has(config.integrations[key])) errors.push(`invalid_integration_${key}`);
  }

  if (!config.academy || typeof config.academy.manualsRequired !== 'boolean') errors.push('invalid_academy_manualsRequired');
  if (!Array.isArray(config.academy?.roleRoutes)) errors.push('invalid_academy_roleRoutes');

  return {
    tenantId: config.tenantId || null,
    projectId: config.projectId || null,
    ok: errors.length === 0,
    errors,
    warnings,
    gates: {
      sourceWriteBack: config.source?.writeBackGate || null,
      evidenceStorage: config.evidence?.storageGate || null,
      paymentsApproval: config.payments?.approvalGate || null,
      make: config.integrations?.makeGate || null,
      gemini: config.integrations?.geminiGate || null,
      messaging: config.integrations?.messagingGate || null,
      email: config.integrations?.emailGate || null
    }
  };
}

const results = sampleConfigs.map(validateConfig);
const failures = results.filter(r => !r.ok);
const report = {
  gate: 'cxorbia-project-config-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_PROJECT_CONFIG_CONTRACT' : 'GO_PROJECT_CONFIG_CONTRACT_PREVIEW_ONLY',
  configCount: sampleConfigs.length,
  failureCount: failures.length,
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providers: false, dbWrites: false, imports: false, production: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-project-config-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia project config contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Configs: ${report.configCount}`,
  `Failures: ${report.failureCount}`, '',
  '## Results',
  ...results.map(r => `- ${r.tenantId}/${r.projectId}: ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No providers', '- No DB writes', '- No imports', '- No production', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-project-config-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
