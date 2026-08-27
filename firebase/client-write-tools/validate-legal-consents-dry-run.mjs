import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
const inputPath = path.join(outDir, 'legal-consents-dry-run.json');

if (!fs.existsSync(inputPath)) {
  console.error('No existe dry-run legal:', inputPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const fail = [];
const review = [];

const allowedCountries = new Set(['CO', 'GT', 'GLOBAL']);
const allowedStatus = new Set(['draft', 'published', 'archived', 'replaced']);
const requiredDocs = [
  'clientPortalTerms',
  'clientDataProcessingAuthorization',
  'clientPrototypeNda',
  'clientAiUsageDisclaimer',
  'partnerAgreementAddendum',
  'shopperOperationalNda'
];

const docs = Array.isArray(data.legalDocuments) ? data.legalDocuments : [];
const reqs = Array.isArray(data.legalAcceptanceRequirements) ? data.legalAcceptanceRequirements : [];

if (!docs.length) fail.push('legalDocuments_empty');
if (!reqs.length) fail.push('legalAcceptanceRequirements_empty');

const docIds = new Set();
const docTypes = new Set();
for (const doc of docs) {
  if (!doc.tenantId) fail.push(`${doc.documentId}:missing_tenantId`);
  if (!doc.documentId) fail.push('document_missing_id');
  if (docIds.has(doc.documentId)) fail.push(`${doc.documentId}:duplicate_documentId`);
  docIds.add(doc.documentId);
  docTypes.add(doc.documentType);
  if (!doc.documentType) fail.push(`${doc.documentId}:missing_documentType`);
  if (!allowedCountries.has(doc.country)) fail.push(`${doc.documentId}:invalid_country:${doc.country}`);
  if (!allowedStatus.has(doc.status)) fail.push(`${doc.documentId}:invalid_status:${doc.status}`);
  if (!doc.version) fail.push(`${doc.documentId}:missing_version`);
  if (!doc.documentHash || String(doc.documentHash).length < 20) fail.push(`${doc.documentId}:invalid_hash`);
  if (!doc.printableHtml) review.push(`${doc.documentId}:missing_printable_html`);
  if (doc.status === 'published' && doc.requiresAcceptance && !doc.effectiveFrom) review.push(`${doc.documentId}:published_without_effectiveFrom`);
}

for (const type of requiredDocs) {
  if (!docTypes.has(type)) review.push(`missing_recommended_document_type:${type}`);
}

for (const req of reqs) {
  if (!req.requirementId) fail.push('requirement_missing_id');
  if (!docIds.has(req.documentId)) fail.push(`${req.requirementId}:document_not_found:${req.documentId}`);
  if (!Array.isArray(req.subjectTypes) || !req.subjectTypes.length) fail.push(`${req.requirementId}:missing_subjectTypes`);
  if (req.required !== true) review.push(`${req.requirementId}:not_required`);
  if (req.blocking !== true) review.push(`${req.requirementId}:not_blocking`);
  if (req.active !== false) review.push(`${req.requirementId}:dry_run_should_start_inactive`);
}

for (const policy of data.aiUsagePolicies || []) {
  if (!policy.requiresDisclaimerAcceptance) fail.push(`${policy.policyId}:ai_without_disclaimer_required`);
  if (!policy.requiresHumanReview) fail.push(`${policy.policyId}:ai_without_human_review_required`);
  if (policy.active !== false) review.push(`${policy.policyId}:dry_run_policy_should_start_inactive`);
}

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'legal-consents-validation-read-only',
  inputPath,
  status: fail.length ? 'FAIL' : review.length ? 'REVIEW' : 'OK',
  counts: {
    legalDocuments: docs.length,
    legalAcceptanceRequirements: reqs.length,
    aiUsagePolicies: (data.aiUsagePolicies || []).length,
    fail: fail.length,
    review: review.length
  },
  fail,
  review
};

const outJson = path.join(outDir, 'legal-consents-validation.json');
const outMd = path.join(outDir, 'legal-consents-validation-summary.md');
fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');

const md = [];
md.push('# Validación Legal / Consentimientos');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Estado: ${result.status}`);
md.push(`Documentos: ${docs.length}`);
md.push(`Requisitos: ${reqs.length}`);
md.push(`Políticas IA: ${(data.aiUsagePolicies || []).length}`);
md.push(`Fail: ${fail.length}`);
md.push(`Review: ${review.length}`);
md.push('');
if (fail.length) {
  md.push('## Fail');
  fail.forEach((x) => md.push(`- ${x}`));
  md.push('');
}
if (review.length) {
  md.push('## Review');
  review.forEach((x) => md.push(`- ${x}`));
  md.push('');
}
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');
console.log(md.join('\n'));
process.exit(fail.length ? 2 : review.length ? 1 : 0);
