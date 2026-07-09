#!/usr/bin/env node
/* CXOrbia TyA - Level 2 sanitized operational generator from inputs
   Safe generator. No HR calls, no Firestore writes, no imports, no deploy.

   Purpose: combine a validated Level 1 visits payload with optional sanitized
   shopper/certification/liquidation outputs into a Level 2 operational preview payload.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
function arg(name) { const idx = args.indexOf(name); return idx >= 0 ? args[idx + 1] : null; }
const level1Path = arg('--level1');
const shoppersPath = arg('--shoppers');
const certificationsPath = arg('--certifications');
const liquidationsPath = arg('--liquidations');
const outDir = arg('--out') || '.tmp/tya-level2-sanitized-operational';

const contractPath = 'backend/contracts/tya-level2-sanitized-operational-phase-a-v1.json';
function abs(relOrAbs) { return path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs); }
function readJson(relOrAbs) { return JSON.parse(fs.readFileSync(abs(relOrAbs), 'utf8')); }
function writeJson(dir, name, obj) { fs.mkdirSync(abs(dir), { recursive: true }); fs.writeFileSync(path.join(abs(dir), name), JSON.stringify(obj, null, 2), 'utf8'); }
function normalize(value) { return String(value ?? '').trim(); }
function slug(...parts) { return parts.map(x => normalize(x).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown').join('-'); }
function first(obj, names, fallback = null) { for (const n of names) { if (obj?.[n] !== undefined && obj?.[n] !== null && obj?.[n] !== '') return obj[n]; } return fallback; }
function asArray(value) { if (Array.isArray(value)) return value; if (value && typeof value === 'object') { for (const key of ['rows', 'items', 'shoppers', 'certifications', 'certificationPreservation', 'liquidations', 'liquidationCandidates']) if (Array.isArray(value[key])) return value[key]; } return []; }

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }

let contract = null;
let level1 = null;
try { contract = readJson(contractPath); add(info, 'contract_loaded', { file: contractPath }); } catch (err) { add(hardFails, 'contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) }); }
if (!level1Path) add(hardFails, 'level1_input_required');
else {
  try { level1 = readJson(level1Path); add(info, 'level1_loaded', { level1Path }); } catch (err) { add(hardFails, 'level1_invalid_json', { level1Path, error: String(err.message || err) }); }
}

function inspectForbidden(label, obj) {
  const text = JSON.stringify(obj || {}).toLowerCase();
  for (const forbidden of contract?.forbiddenFieldsAnywhere || []) {
    if (text.includes(String(forbidden).toLowerCase())) add(hardFails, 'forbidden_field_or_marker_present', { label, forbidden });
  }
}

function loadOptional(label, p) {
  if (!p) { add(info, `${label}_not_provided`); return null; }
  try {
    const value = readJson(p);
    inspectForbidden(label, value);
    add(info, `${label}_loaded`, { path: p });
    return value;
  } catch (err) {
    add(hardFails, `${label}_invalid_json`, { path: p, error: String(err.message || err) });
    return null;
  }
}

const shoppersInput = loadOptional('shoppers', shoppersPath);
const certsInput = loadOptional('certifications', certificationsPath);
const liquidationsInput = loadOptional('liquidations', liquidationsPath);
if (level1) inspectForbidden('level1', level1);

const visits = Array.isArray(level1?.visits) ? level1.visits : [];
if (!visits.length && level1) add(warnings, 'level1_has_no_visits');

function buildShoppers() {
  const rows = asArray(shoppersInput);
  if (!rows.length) {
    const refs = [...new Set(visits.map(v => v.shopperRef).filter(ref => ref && ref !== 'shopper_ref_pending'))];
    return refs.map((ref, index) => ({
      shopperId: `shopper-${slug(ref)}`,
      shopperCode: `shopper_ref_${index + 1}`,
      country: first(visits.find(v => v.shopperRef === ref), ['country'], 'review_required'),
      cityRef: 'city_ref_pending',
      status: 'pending_review',
      certificationStatus: 'pending_mapping_review',
      sourceConfidence: 'unknown_or_review_required',
      reviewRequired: true,
      sourceRefs: [`visitRef:${ref}`]
    }));
  }
  return rows.map((row, index) => {
    const ref = first(row, ['shopperId', 'shopperRef', 'shopperCode', 'canonicalShopperId'], `shopper_ref_${index + 1}`);
    const status = normalize(first(row, ['status'], 'pending_review'));
    return {
      shopperId: `shopper-${slug(ref)}`,
      shopperCode: normalize(first(row, ['shopperCode', 'code'], `shopper_ref_${index + 1}`)),
      country: normalize(first(row, ['country', 'pais'], 'review_required')),
      cityRef: normalize(first(row, ['cityRef'], 'city_ref_pending')),
      status: contract?.shopperFields?.allowedStatuses?.includes(status) ? status : 'pending_review',
      certificationStatus: normalize(first(row, ['certificationStatus'], 'pending_mapping_review')),
      sourceConfidence: normalize(first(row, ['sourceConfidence'], 'unknown_or_review_required')),
      reviewRequired: row.reviewRequired !== false,
      sourceRefs: Array.isArray(row.sourceRefs) ? row.sourceRefs.map(String) : [`sanitizedShopperInput:${index + 1}`]
    };
  });
}

function buildCertificationPreservation(shoppers) {
  const rows = asArray(certsInput);
  if (!rows.length) {
    return shoppers.map((shopper) => ({
      shopperRef: shopper.shopperId,
      projectId: 'cinepolis',
      certificationId: 'cinepolis-certification-preservation-preview',
      status: 'pending_mapping_review',
      presentedAtRef: 'pending_mapping_review',
      sourceRef: 'legacy_or_hr_trace_pending_mapping',
      reviewRequired: true,
      preserveWithoutRetake: false
    }));
  }
  return rows.map((row, index) => {
    const shopperRef = first(row, ['shopperRef', 'shopperId'], `shopper-ref-${index + 1}`);
    const status = normalize(first(row, ['status'], 'pending_mapping_review'));
    const allowed = contract?.certificationPreservationFields?.allowedStatuses || [];
    return {
      shopperRef: `shopper-${slug(shopperRef)}`,
      projectId: normalize(first(row, ['projectId'], 'cinepolis')),
      certificationId: normalize(first(row, ['certificationId'], 'cinepolis-certification-preservation-preview')),
      status: allowed.includes(status) ? status : 'pending_mapping_review',
      presentedAtRef: normalize(first(row, ['presentedAtRef'], 'pending_mapping_review')),
      sourceRef: normalize(first(row, ['sourceRef'], `sanitizedCertificationInput:${index + 1}`)),
      reviewRequired: row.reviewRequired !== false,
      preserveWithoutRetake: Boolean(row.preserveWithoutRetake)
    };
  });
}

function buildLiquidationCandidates() {
  const rows = asArray(liquidationsInput);
  if (!rows.length) {
    return visits
      .filter(v => ['submitted_liquidation_candidate', 'liquidation_payment_control', 'questionnaire_pending_submit', 'review_required'].includes(v.status))
      .map((visit, index) => ({
        liquidationCandidateId: `liq-${slug(visit.visitId || index + 1)}`,
        visitId: visit.visitId,
        shopperRef: visit.shopperRef && visit.shopperRef !== 'shopper_ref_pending' ? `shopper-${slug(visit.shopperRef)}` : 'shopper_ref_pending',
        projectId: 'cinepolis',
        periodId: visit.periodId,
        country: visit.country,
        currency: visit.country === 'HN' ? 'HNL' : 'GTQ',
        honorariumAmount: 0,
        reimbursementAmount: 0,
        totalAmount: 0,
        status: visit.status === 'review_required' ? 'review_required' : 'payment_control_preview',
        requiresFinanceCrosscheck: true,
        auditRef: `liquidation-preview:${visit.visitId}`
      }));
  }
  return rows.map((row, index) => {
    const visitId = normalize(first(row, ['visitId'], `visit-ref-${index + 1}`));
    const status = normalize(first(row, ['status'], 'payment_control_preview'));
    const honorariumAmount = Number(first(row, ['honorariumAmount'], 0));
    const reimbursementAmount = Number(first(row, ['reimbursementAmount'], 0));
    const totalAmount = Number(first(row, ['totalAmount'], honorariumAmount + reimbursementAmount));
    const allowed = contract?.liquidationCandidateFields?.allowedStatuses || [];
    return {
      liquidationCandidateId: normalize(first(row, ['liquidationCandidateId'], `liq-${slug(visitId)}`)),
      visitId,
      shopperRef: normalize(first(row, ['shopperRef'], 'shopper_ref_pending')),
      projectId: normalize(first(row, ['projectId'], 'cinepolis')),
      periodId: normalize(first(row, ['periodId'], 'period_ref_pending')),
      country: normalize(first(row, ['country'], 'review_required')),
      currency: normalize(first(row, ['currency'], first(row, ['country']) === 'HN' ? 'HNL' : 'GTQ')),
      honorariumAmount,
      reimbursementAmount,
      totalAmount,
      status: allowed.includes(status) && status !== 'paid_requires_audit_evidence' ? status : 'review_required',
      requiresFinanceCrosscheck: true,
      auditRef: normalize(first(row, ['auditRef'], `sanitizedLiquidationInput:${index + 1}`))
    };
  });
}

const shoppers = buildShoppers();
const certificationPreservation = buildCertificationPreservation(shoppers);
const liquidationCandidates = buildLiquidationCandidates();
const baseIssues = Array.isArray(level1?.issues) ? level1.issues : [];
const issueCodes = new Set(baseIssues.map(i => i.code));
const issues = [...baseIssues];
if (!issueCodes.has('certification_preservation_mapping_required')) {
  issues.push({
    issueId: 'issue-certification-preservation-mapping-required',
    severity: 'warning',
    scope: 'certifications',
    code: 'certification_preservation_mapping_required',
    messageSafe: 'Certification preservation must be mapped to sanitized shopper refs before any import or retake decision.',
    blocksRuntime: false,
    blocksImport: true,
    blocksProduction: true
  });
}

const payload = {
  projectConfig: level1?.projectConfig || { tenantId: 'tya', projectId: 'cinepolis', projectName: 'Cinepolis', clientName: 'TyA' },
  periods: Array.isArray(level1?.periods) ? level1.periods : [],
  visits,
  shoppers,
  certificationPreservation,
  liquidationCandidates,
  issues,
  meta: {
    ...(level1?.meta || {}),
    generatedAt: new Date().toISOString(),
    previewLevel: 'level2_sanitizedOperationalPreview',
    sourceSafe: true,
    noRawPii: true,
    oldDatabaseConnected: false,
    importsExecuted: false,
    firestoreWrites: false,
    hrWrites: false,
    runtimeConnected: false,
    note: 'Level 2 contains sanitized operational preview only. It is not import, production or payment execution.'
  }
};

inspectForbidden('generatedPayload', payload);
const requiredIssues = new Set(contract?.requiredIssues || []);
const payloadIssueCodes = new Set(payload.issues.map(i => i.code));
for (const code of requiredIssues) if (!payloadIssueCodes.has(code)) add(hardFails, 'required_issue_missing', { code });

const report = {
  gate: 'cxorbia-tya-level2-sanitized-operational-from-inputs',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_LEVEL2_GENERATION' : 'GO_LEVEL2_OPERATIONAL_GENERATED_NO_RUNTIME',
  previewLevel: 'level2_sanitizedOperationalPreview',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_RUNTIME_SWITCH_SMOKE_AND_PAULA_GO',
  counts: {
    visits: visits.length,
    shoppers: shoppers.length,
    certificationPreservation: certificationPreservation.length,
    liquidationCandidates: liquidationCandidates.length,
    issues: issues.length,
    reviewRequiredShoppers: shoppers.filter(s => s.reviewRequired).length,
    reviewRequiredCertifications: certificationPreservation.filter(c => c.reviewRequired).length,
    financeCrosscheckRequired: liquidationCandidates.filter(l => l.requiresFinanceCrosscheck).length
  },
  safeState: {
    runtimeConnected: false,
    frontendModified: false,
    modulesModified: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    oldDatabaseConnected: false,
    deploy: false,
    production: false,
    rawPii: false
  },
  hardFails,
  warnings,
  info
};

writeJson(outDir, 'tya-minimal-sanitized-input-level2.json', payload);
writeJson(outDir, 'tya-level2-sanitized-operational-generation-report.json', report);
const md = [
  '# CXOrbia TyA Level 2 sanitized operational from inputs',
  '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Preview level: ${report.previewLevel}`,
  `Production decision: ${report.productionDecision}`,
  '',
  '## Counts',
  ...Object.entries(report.counts).map(([k, v]) => `- ${k}: ${v}`),
  '',
  '## Hard fails',
  ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.label ? ` · ${x.label}` : ''}${x.forbidden ? ` · ${x.forbidden}` : ''}${x.code ? ` · ${x.code}` : ''}`) : ['- none']),
  '',
  '## Meaning',
  '- Level 2 can support sanitized operational DEV preview.',
  '- It is not import, production, payment execution or legacy DB migration.',
  '- Runtime remains disconnected until explicit GO.',
  '',
  '## Safe state',
  '- Runtime not connected',
  '- Frontend not modified',
  '- Modules not modified',
  '- No Firestore writes',
  '- No imports',
  '- No HR writes',
  '- No old database connected',
  '- No deploy',
  '- No production',
  '- No raw PII',
  ''
].join('\n');
fs.writeFileSync(path.join(abs(outDir), 'tya-level2-sanitized-operational-generation-report.md'), md, 'utf8');

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
