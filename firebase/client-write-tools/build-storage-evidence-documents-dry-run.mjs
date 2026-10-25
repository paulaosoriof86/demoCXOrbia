import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const now = new Date().toISOString();
const tenantId = 'tya';
const projectId = 'cinepolis-plantilla';

const candidates = [
  {
    fileId: 'tya-logo-placeholder',
    scope: 'brand',
    storagePath: `tenants/${tenantId}/brand/logo/tya-logo-placeholder.webp`,
    contentType: 'image/webp',
    sizeBytes: 180000,
    status: 'draft',
    linkedTo: { tenantId }
  },
  {
    fileId: 'nda-tya-v1-placeholder',
    scope: 'nda',
    storagePath: `tenants/${tenantId}/documents/nda/nda-tya-v1-placeholder.pdf`,
    contentType: 'application/pdf',
    sizeBytes: 600000,
    status: 'draft',
    linkedTo: { tenantId, documentType: 'nda' }
  },
  {
    fileId: 'manual-admin-v1-placeholder',
    scope: 'manual',
    storagePath: `tenants/${tenantId}/manuals/admin/assets/manual-admin-v1-placeholder.pdf`,
    contentType: 'application/pdf',
    sizeBytes: 900000,
    status: 'draft',
    linkedTo: { tenantId, manualId: 'admin' }
  },
  {
    fileId: 'instructivo-cinepolis-v1-placeholder',
    scope: 'project',
    storagePath: `tenants/${tenantId}/projects/${projectId}/documents/instructivo/instructivo-cinepolis-v1-placeholder.pdf`,
    contentType: 'application/pdf',
    sizeBytes: 1200000,
    status: 'draft',
    linkedTo: { tenantId, projectId, documentType: 'instructivo' }
  },
  {
    fileId: 'evidence-photo-placeholder',
    scope: 'visit',
    storagePath: `tenants/${tenantId}/projects/${projectId}/visits/visit-placeholder/evidence/evidence-photo-placeholder.jpg`,
    contentType: 'image/jpeg',
    sizeBytes: 2500000,
    status: 'draft',
    linkedTo: { tenantId, projectId, visitId: 'visit-placeholder', evidenceType: 'photo' }
  },
  {
    fileId: 'evidence-video-placeholder',
    scope: 'visit',
    storagePath: `tenants/${tenantId}/projects/${projectId}/visits/visit-placeholder/evidence/evidence-video-placeholder.mp4`,
    contentType: 'video/mp4',
    sizeBytes: 65000000,
    status: 'draft',
    linkedTo: { tenantId, projectId, visitId: 'visit-placeholder', evidenceType: 'video' }
  },
  {
    fileId: 'shopper-document-placeholder',
    scope: 'shopper',
    storagePath: `tenants/${tenantId}/shoppers/shopper-placeholder/documents/profile/shopper-document-placeholder.pdf`,
    contentType: 'application/pdf',
    sizeBytes: 500000,
    status: 'draft',
    linkedTo: { tenantId, shopperId: 'shopper-placeholder', documentType: 'profile' }
  }
];

const fileAssets = candidates.map((item) => ({
  tenantId,
  fileId: item.fileId,
  storagePath: item.storagePath,
  contentType: item.contentType,
  sizeBytes: item.sizeBytes,
  scope: item.scope,
  status: item.status,
  linkedTo: item.linkedTo,
  publicUrl: null,
  createdAt: now,
  createdBy: 'dry-run',
  updatedAt: now,
  updatedBy: 'dry-run'
}));

const visitEvidence = candidates
  .filter((item) => item.scope === 'visit')
  .map((item) => ({
    tenantId,
    projectId,
    visitId: item.linkedTo.visitId,
    evidenceId: item.fileId,
    fileAssetId: item.fileId,
    type: item.linkedTo.evidenceType,
    status: 'uploaded',
    reviewStatus: 'pending',
    createdAt: now,
    createdBy: 'dry-run'
  }));

const documentVersions = candidates
  .filter((item) => ['nda', 'manual', 'project'].includes(item.scope))
  .map((item) => ({
    tenantId,
    documentId: item.fileId,
    documentType: item.linkedTo.documentType || item.linkedTo.manualId || 'manual',
    version: 'v1-dry-run',
    status: 'draft',
    fileAssetId: item.fileId,
    projectId: item.linkedTo.projectId || null,
    createdAt: now,
    createdBy: 'dry-run'
  }));

const output = {
  meta: {
    generatedAt: now,
    mode: 'storage-evidence-documents-dry-run-read-only',
    tenantId,
    projectId,
    note: 'No sube archivos a Storage. Solo genera metadata candidata.'
  },
  counts: {
    fileAssets: fileAssets.length,
    visitEvidence: visitEvidence.length,
    documentVersions: documentVersions.length
  },
  fileAssets,
  visitEvidence,
  documentVersions
};

const jsonPath = path.join(outDir, 'storage-evidence-documents-dry-run.json');
const mdPath = path.join(outDir, 'storage-evidence-documents-dry-run-summary.md');
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf8');

const md = [];
md.push('# Storage / Evidencias / Documentos — dry-run');
md.push('');
md.push('Modo: solo lectura. No sube archivos. No escribe Firestore.');
md.push('');
md.push(`Tenant: ${tenantId}`);
md.push(`Project: ${projectId}`);
md.push(`fileAssets: ${fileAssets.length}`);
md.push(`visitEvidence: ${visitEvidence.length}`);
md.push(`documentVersions: ${documentVersions.length}`);
md.push('');
md.push('## Tipos cubiertos');
md.push('- Logo tenant.');
md.push('- NDA.');
md.push('- Manual.');
md.push('- Instructivo de proyecto.');
md.push('- Evidencia foto.');
md.push('- Evidencia video.');
md.push('- Documento shopper.');
md.push('');
md.push('## Salidas');
md.push(`- ${jsonPath}`);
md.push(`- ${mdPath}`);
fs.writeFileSync(mdPath, md.join('\n'), 'utf8');

console.log(md.join('\n'));
