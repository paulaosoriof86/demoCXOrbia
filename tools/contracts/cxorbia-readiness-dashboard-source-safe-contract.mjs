#!/usr/bin/env node
/**
 * CXOrbia readiness dashboard source-safe contract.
 *
 * Preview-only contract for aggregating backend contract/runner/readiness results
 * into honest dashboard states. It does not connect providers, read real sources,
 * write databases, import data, send notifications, process payments or deploy.
 */

export const CONTRACT_NAME = 'cxorbia-readiness-dashboard-source-safe-contract';
export const CONTRACT_VERSION = '2026-07-08.preview-only';

export const allowedAreas = Object.freeze([
  'admin_configurability',
  'conflict_review_import_readiness',
  'synthetic_input_pack_runner',
  'synthetic_expanded_coverage',
  'questionnaire_routing',
  'visit_lifecycle',
  'settlement_eligibility',
  'evidence_storage',
  'historical_import_clean',
  'assignment_sync_conflict',
  'notification_outbox',
  'project_tenant_rule_versioning',
  'rule_change_changelog_notification',
  'release_readiness_snapshot',
  'academy',
  'sensitive_data_policy',
]);

export const allowedStatuses = Object.freeze([
  'preview_ready',
  'diagnostic_executed',
  'warning',
  'fail',
  'pending_real_source',
  'pending_real_gate',
  'human_review_required',
  'production_not_authorized',
  'provider_not_active',
  'blocked_sensitive_data',
  'blocked_conflict',
  'docs_only',
]);

export const allowedDisplayLabels = Object.freeze([
  'preview listo',
  'diagnostico ejecutado',
  'fixture sintetico',
  'input sanitizado',
  'warning',
  'fail',
  'pendiente fuente real',
  'pendiente gate real',
  'pendiente revision humana',
  'produccion no autorizada',
  'proveedor no activo',
  'bloqueado por datos sensibles',
  'bloqueado por conflicto',
  'solo documental',
]);

export const prohibitedClaims = Object.freeze([
  'produccion lista',
  'production ready',
  'import real ejecutado',
  'sync real aplicado',
  'envio real realizado',
  'pago real confirmado',
  'provider activo',
  'deploy realizado',
  'Firestore conectado',
  'HR sincronizada',
  'Make activo',
  'Gemini activo',
  'Storage activo',
]);

const sensitiveKeyPatterns = [
  /dpi/i,
  /passport|pasaporte/i,
  /bank|banco/i,
  /account|cuenta/i,
  /iban|swift/i,
  /ndaSigned|signedNda|ndaFirmado/i,
  /signature|firma/i,
  /phone|telefono|tel[eé]fono|whatsapp/i,
  /email/i,
  /token|secret|clientSecret|oauth|credential|webhook/i,
  /raw(Payload|Secret|Credential|Document|File|Body|Attachment|Contact|Url|Link)?/i,
  /base64|attachment|adjunto|privateUrl|signedUrl/i,
];

const safeMetadataKeySuffixes = new Set([
  'sourceSafe',
  'containsRawSensitiveData',
  'isSyntheticOrSanitized',
  'sensitiveDataProtected',
  'rawOperationalDataAllowed',
  'realProviderCredentialsAllowed',
  'emailSendAllowed',
  'whatsappSendAllowed',
  'paymentProviderAllowed',
  'firestoreWritesAllowed',
  'storageWritesAllowed',
  'makeWriteAllowed',
  'geminiAllowed',
  'importRealDataAllowed',
  'productionAllowed',
  'deployAllowed',
  'mergeAllowed',
  'realActivationRequested',
  'deployRequested',
  'writeRequested',
]);

function flattenKeys(value, prefix = '') {
  if (!value || typeof value !== 'object') return [];
  const keys = [];
  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    if (child && typeof child === 'object' && !Array.isArray(child)) keys.push(...flattenKeys(child, fullKey));
  }
  return keys;
}

function isSafeMetadataKey(key) {
  const suffix = String(key).split('.').pop();
  return safeMetadataKeySuffixes.has(suffix);
}

function detectSensitiveKeys(payload) {
  const keys = flattenKeys(payload);
  return [...new Set(keys.filter((key) => !isSafeMetadataKey(key) && sensitiveKeyPatterns.some((pattern) => pattern.test(key))))];
}

function arrayHasAnyText(values, textList) {
  const haystack = JSON.stringify(values || {}).toLowerCase();
  return textList.filter((text) => haystack.includes(String(text).toLowerCase()));
}

function validateDashboardItem(item, index) {
  const errors = [];
  const warnings = [];
  const prefix = `items[${index}]`;

  for (const key of ['itemId', 'area', 'status', 'displayLabel', 'sourceRef', 'gateState', 'humanReviewState']) {
    if (item?.[key] === undefined || item?.[key] === null || item?.[key] === '') errors.push(`${prefix}.${key} required`);
  }

  if (item?.area && !allowedAreas.includes(item.area)) errors.push(`${prefix}.area unsupported:${item.area}`);
  if (item?.status && !allowedStatuses.includes(item.status)) errors.push(`${prefix}.status unsupported:${item.status}`);
  if (item?.displayLabel && !allowedDisplayLabels.includes(item.displayLabel)) errors.push(`${prefix}.displayLabel unsupported:${item.displayLabel}`);
  if (item?.gateState && !['off', 'blocked', 'review_required', 'future_approval_required'].includes(item.gateState)) errors.push(`${prefix}.gateState must remain non-real`);
  if (item?.humanReviewState && !['not_required_preview', 'required', 'pending', 'completed_preview_only'].includes(item.humanReviewState)) errors.push(`${prefix}.humanReviewState unsupported`);
  if (item?.realActivationRequested === true || item?.writeRequested === true || item?.deployRequested === true) errors.push(`${prefix}.real_activation_not_allowed`);
  if (item?.status === 'fail' && !item.reason) errors.push(`${prefix}.fail_requires_reason`);
  if (['blocked_sensitive_data', 'blocked_conflict', 'human_review_required'].includes(item?.status) && !item.reason) errors.push(`${prefix}.blocking_status_requires_reason`);
  if (item?.sourceRef && !String(item.sourceRef).startsWith('ref://')) warnings.push(`${prefix}.sourceRef should be opaque ref://`);

  const prohibited = arrayHasAnyText(item, prohibitedClaims);
  if (prohibited.length) errors.push(`${prefix}.prohibited_claims:${prohibited.join('|')}`);

  return { errors, warnings };
}

export function sampleManifest() {
  return {
    manifestId: 'readiness_dashboard_demo_001',
    tenantId: 'tenant_demo',
    projectId: 'project_demo',
    mode: 'preview_only',
    sourceSafe: true,
    isSyntheticOrSanitized: true,
    containsRawSensitiveData: false,
    generatedFrom: 'synthetic_input_pack_report',
    safeState: {
      productionAllowed: false,
      deployAllowed: false,
      mergeAllowed: false,
      firestoreWritesAllowed: false,
      storageWritesAllowed: false,
      makeWriteAllowed: false,
      geminiAllowed: false,
      importRealDataAllowed: false,
      emailSendAllowed: false,
      whatsappSendAllowed: false,
      paymentProviderAllowed: false,
      realProviderCredentialsAllowed: false,
    },
    items: [
      {
        itemId: 'rd_item_admin_config_demo',
        area: 'admin_configurability',
        status: 'preview_ready',
        displayLabel: 'preview listo',
        sourceRef: 'ref://synthetic/admin-configurability',
        gateState: 'off',
        humanReviewState: 'not_required_preview',
        reason: 'Contract sample passes preview-only checks.',
        realActivationRequested: false,
        writeRequested: false,
        deployRequested: false,
      },
      {
        itemId: 'rd_item_conflict_demo',
        area: 'conflict_review_import_readiness',
        status: 'human_review_required',
        displayLabel: 'pendiente revision humana',
        sourceRef: 'ref://synthetic/conflict-review',
        gateState: 'review_required',
        humanReviewState: 'required',
        reason: 'Conflicts must not be auto-resolved or overwritten silently.',
        realActivationRequested: false,
        writeRequested: false,
        deployRequested: false,
      },
      {
        itemId: 'rd_item_release_demo',
        area: 'release_readiness_snapshot',
        status: 'production_not_authorized',
        displayLabel: 'produccion no autorizada',
        sourceRef: 'ref://synthetic/release-readiness',
        gateState: 'future_approval_required',
        humanReviewState: 'pending',
        reason: 'Preview status does not authorize deploy, merge, providers, import or production.',
        realActivationRequested: false,
        writeRequested: false,
        deployRequested: false,
      },
    ],
  };
}

export function validateReadinessDashboardSourceSafe(manifest = {}) {
  const errors = [];
  const warnings = [];

  for (const key of ['manifestId', 'tenantId', 'projectId', 'mode', 'generatedFrom']) {
    if (manifest?.[key] === undefined || manifest?.[key] === null || manifest?.[key] === '') errors.push(`${key} required`);
  }

  if (manifest.mode !== 'preview_only') errors.push('mode must be preview_only');
  if (manifest.sourceSafe !== true) errors.push('sourceSafe must be true');
  if (manifest.isSyntheticOrSanitized !== true) errors.push('isSyntheticOrSanitized must be true');
  if (manifest.containsRawSensitiveData !== false) errors.push('containsRawSensitiveData must be false');

  const safeState = manifest.safeState || {};
  for (const flag of ['productionAllowed', 'deployAllowed', 'mergeAllowed', 'firestoreWritesAllowed', 'storageWritesAllowed', 'makeWriteAllowed', 'geminiAllowed', 'importRealDataAllowed', 'emailSendAllowed', 'whatsappSendAllowed', 'paymentProviderAllowed', 'realProviderCredentialsAllowed']) {
    if (safeState[flag] !== false) errors.push(`safeState.${flag} must be false`);
  }

  const sensitiveKeys = detectSensitiveKeys(manifest);
  if (sensitiveKeys.length) errors.push(`sensitive_or_raw_field_keys_detected:${sensitiveKeys.join(',')}`);

  const prohibited = arrayHasAnyText(manifest, prohibitedClaims);
  if (prohibited.length) errors.push(`prohibited_claims_detected:${prohibited.join('|')}`);

  const items = Array.isArray(manifest.items) ? manifest.items : [];
  if (!Array.isArray(manifest.items)) errors.push('items must be an array');
  if (!items.length) warnings.push('items is empty; dashboard would be informational only');

  const rows = items.map((item, index) => {
    const result = validateDashboardItem(item, index);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    return {
      itemId: item.itemId || null,
      area: item.area || null,
      status: item.status || null,
      displayLabel: item.displayLabel || null,
      gateState: item.gateState || null,
      humanReviewState: item.humanReviewState || null,
      sourceRef: item.sourceRef || null,
      reason: item.reason || null,
      errors: result.errors,
      warnings: result.warnings,
    };
  });

  const counts = rows.reduce((acc, row) => {
    acc.byStatus[row.status || 'missing'] = (acc.byStatus[row.status || 'missing'] || 0) + 1;
    acc.byArea[row.area || 'missing'] = (acc.byArea[row.area || 'missing'] || 0) + 1;
    return acc;
  }, { byStatus: {}, byArea: {} });

  return {
    contract: CONTRACT_NAME,
    version: CONTRACT_VERSION,
    ok: errors.length === 0,
    verdict: errors.length ? 'NO_GO_READINESS_DASHBOARD_SOURCE_SAFE' : 'GO_READINESS_DASHBOARD_PREVIEW_ONLY',
    mode: 'preview_only',
    sourceSafe: true,
    itemCount: items.length,
    counts,
    rows,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
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
        'source-safe readiness dashboard aggregation',
        'honest preview/gate state model',
        'opaque source references and human-review blockers',
      ],
      exclusivoCliente: [
        'TyA/Phase A priorities can be represented as project-specific items, not hardcoded contract logic',
      ],
      claudePrototipo: [
        'show preview readiness without claiming production/import/sync/payment/provider activation',
      ],
      academia: [
        'teach preview vs real execution, dashboard statuses, gates and human review',
      ],
      sinImpactoClaude: [
        'contract has no runtime or UI mutation by itself',
      ],
    },
  };
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
  });
}

async function main() {
  const raw = await readStdin();
  const manifest = raw.trim() ? JSON.parse(raw) : sampleManifest();
  const result = validateReadinessDashboardSourceSafe(manifest);
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(JSON.stringify({ contract: CONTRACT_NAME, ok: false, verdict: 'ERROR', error: error.message }, null, 2));
    process.exitCode = 1;
  });
}
