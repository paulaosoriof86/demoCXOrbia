import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
const filePath = path.join(outDir, 'storage-evidence-documents-dry-run.json');

if (!fs.existsSync(filePath)) {
  console.error('No existe dry-run storage:', filePath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const fail = [];
const review = [];

const allowedScopes = new Set(['tenant', 'project', 'visit', 'shopper', 'manual', 'nda', 'brand', 'finance', 'hr']);
const allowedStatus = new Set(['draft', 'uploaded', 'linked', 'reviewPending', 'approved', 'rejected', 'archived', 'deleted']);
const allowedEvidenceTypes = new Set(['photo', 'video', 'audio', 'document', 'receipt', 'screen', 'other']);

function checkPath(item) {
  const p = String(item.storagePath || '');
  if (!p) fail.push(`${item.fileId}:missing_storagePath`);
  if (!p.startsWith(`tenants/${item.tenantId}/`)) fail.push(`${item.fileId}:storagePath_not_tenant_scoped`);
  if (/\.\.|\/\//.test(p)) fail.push(`${item.fileId}:unsafe_storagePath`);
  if (/base64|data:/i.test(p)) fail.push(`${item.fileId}:storagePath_contains_inline_data`);
}

function checkContent(item) {
  if (!item.contentType) fail.push(`${item.fileId}:missing_contentType`);
  if (typeof item.sizeBytes !== 'number') fail.push(`${item.fileId}:size_not_number`);
  if (Number(item.sizeBytes || 0) <= 0) fail.push(`${item.fileId}:size_not_positive`);
  if (Number(item.sizeBytes || 0) > 250 * 1024 * 1024) review.push(`${item.fileId}:large_file_review`);
}

for (const item of data.fileAssets || []) {
  if (!item.tenantId) fail.push('fileAsset:missing_tenantId');
  if (!item.fileId) fail.push('fileAsset:missing_fileId');
  if (!allowedScopes.has(item.scope)) fail.push(`${item.fileId}:invalid_scope:${item.scope}`);
  if (!allowedStatus.has(item.status)) fail.push(`${item.fileId}:invalid_status:${item.status}`);
  checkPath(item);
  checkContent(item);
  if (item.publicUrl) review.push(`${item.fileId}:publicUrl_present_review`);
}

const assetIds = new Set((data.fileAssets || []).map((x) => x.fileId));
for (const ev of data.visitEvidence || []) {
  if (!assetIds.has(ev.fileAssetId)) fail.push(`${ev.evidenceId}:evidence_asset_missing:${ev.fileAssetId}`);
  if (!allowedEvidenceTypes.has(ev.type)) fail.push(`${ev.evidenceId}:invalid_evidence_type:${ev.type}`);
  if (!ev.projectId || !ev.visitId) fail.push(`${ev.evidenceId}:missing_project_or_visit`);
}

for (const doc of data.documentVersions || []) {
  if (!assetIds.has(doc.fileAssetId)) fail.push(`${doc.documentId}:document_asset_missing:${doc.fileAssetId}`);
  if (!doc.version) fail.push(`${doc.documentId}:missing_version`);
  if (!doc.documentType) fail.push(`${doc.documentId}:missing_documentType`);
}

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'storage-evidence-documents-validation-read-only',
  filePath,
  status: fail.length ? 'FAIL' : review.length ? 'REVIEW' : 'OK',
  counts: {
    fileAssets: (data.fileAssets || []).length,
    visitEvidence: (data.visitEvidence || []).length,
    documentVersions: (data.documentVersions || []).length,
    fail: fail.length,
    review: review.length
  },
  fail,
  review
};

const outJson = path.join(outDir, 'storage-evidence-documents-validation.json');
const outMd = path.join(outDir, 'storage-evidence-documents-validation-summary.md');
fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');

const md = [];
md.push('# Validación Storage / Evidencias / Documentos');
md.push('');
md.push('Modo: solo lectura. No sube archivos. No escribe Firestore.');
md.push('');
md.push(`Estado: ${result.status}`);
md.push(`fileAssets: ${result.counts.fileAssets}`);
md.push(`visitEvidence: ${result.counts.visitEvidence}`);
md.push(`documentVersions: ${result.counts.documentVersions}`);
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
