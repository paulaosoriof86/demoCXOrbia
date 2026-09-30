import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const now = new Date().toISOString();
const tenantId = 'tya';

function hashDoc(text) {
  return crypto.createHash('sha256').update(String(text), 'utf8').digest('hex');
}

const documents = [
  {
    documentId: 'gt-client-portal-terms-v1',
    documentType: 'clientPortalTerms',
    country: 'GT',
    version: 'v1-dry-run',
    title: 'Condiciones portal cliente Guatemala',
    subjectTypes: ['clientUser'],
    blocks: ['portal', 'reports', 'dashboard']
  },
  {
    documentId: 'co-client-data-auth-v1',
    documentType: 'clientDataProcessingAuthorization',
    country: 'CO',
    version: 'v1-dry-run',
    title: 'Autorización tratamiento de datos Colombia',
    subjectTypes: ['clientUser'],
    blocks: ['portal', 'reports']
  },
  {
    documentId: 'global-client-prototype-nda-v1',
    documentType: 'clientPrototypeNda',
    country: 'GLOBAL',
    version: 'v1-dry-run',
    title: 'Confidencialidad cliente prototipo',
    subjectTypes: ['clientUser', 'prospect'],
    blocks: ['prototype', 'demo', 'proposal']
  },
  {
    documentId: 'global-client-ai-disclaimer-v1',
    documentType: 'clientAiUsageDisclaimer',
    country: 'GLOBAL',
    version: 'v1-dry-run',
    title: 'Uso responsable de IA para clientes',
    subjectTypes: ['clientUser'],
    blocks: ['aiModule']
  },
  {
    documentId: 'global-partner-software-protection-v1',
    documentType: 'partnerAgreementAddendum',
    country: 'GLOBAL',
    version: 'v1-dry-run',
    title: 'Condiciones reforzadas para aliados y socios',
    subjectTypes: ['strategicPartner', 'franchisee', 'businessPartner', 'aliado'],
    blocks: ['partnerPortal', 'prototype', 'demo']
  },
  {
    documentId: 'global-shopper-operational-nda-v1',
    documentType: 'shopperOperationalNda',
    country: 'GLOBAL',
    version: 'v1-dry-run',
    title: 'Confidencialidad operativa shopper',
    subjectTypes: ['shopper'],
    blocks: ['shopperPortal', 'visits']
  }
];

const legalDocuments = documents.map((d) => {
  const printableHtml = `<h1>${d.title}</h1><p>Plantilla legal pendiente de revisión local. Versión ${d.version}.</p>`;
  return {
    tenantId,
    documentId: d.documentId,
    templateId: null,
    documentType: d.documentType,
    country: d.country,
    version: d.version,
    title: d.title,
    status: 'draft',
    effectiveFrom: null,
    effectiveTo: null,
    documentHash: hashDoc(printableHtml),
    printableHtml,
    fileAssetId: null,
    requiresAcceptance: true,
    requiresReacceptanceOnChange: true,
    subjectTypes: d.subjectTypes,
    accessBlocks: d.blocks,
    createdAt: now,
    createdBy: 'dry-run'
  };
});

const requirements = legalDocuments.map((doc) => ({
  tenantId,
  requirementId: `req-${doc.documentId}`,
  documentType: doc.documentType,
  documentId: doc.documentId,
  country: doc.country,
  subjectTypes: doc.subjectTypes,
  roles: doc.subjectTypes,
  accessBlocks: doc.accessBlocks,
  projectScope: null,
  required: true,
  blocking: true,
  active: false,
  updatedAt: now,
  updatedBy: 'dry-run'
}));

const aiPolicy = {
  tenantId,
  policyId: 'default-ai-usage-policy-dry-run',
  country: 'GLOBAL',
  subjectTypes: ['clientUser', 'admin', 'ops', 'aliado', 'businessPartner'],
  allowedFeatures: ['summary', 'recommendation', 'classification', 'textGeneration', 'setupAssistant'],
  requiresDisclaimerAcceptance: true,
  requiresHumanReview: true,
  forbiddenUseNotes: ['No usar como decisión final sin revisión humana.'],
  active: false,
  updatedAt: now,
  updatedBy: 'dry-run'
};

const output = {
  meta: { generatedAt: now, mode: 'legal-consents-dry-run-read-only', tenantId },
  counts: { legalDocuments: legalDocuments.length, legalAcceptanceRequirements: requirements.length, aiUsagePolicies: 1 },
  legalDocuments,
  legalAcceptanceRequirements: requirements,
  aiUsagePolicies: [aiPolicy]
};

const jsonPath = path.join(outDir, 'legal-consents-dry-run.json');
const mdPath = path.join(outDir, 'legal-consents-dry-run-summary.md');
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf8');

const md = [];
md.push('# Legal / Consentimientos — dry-run');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Documentos legales: ${legalDocuments.length}`);
md.push(`Requisitos de aceptación: ${requirements.length}`);
md.push('Políticas IA: 1');
md.push('');
md.push('## Documentos');
for (const doc of legalDocuments) md.push(`- ${doc.documentId} · ${doc.country} · ${doc.documentType}`);
md.push('');
md.push('## Salidas');
md.push(`- ${jsonPath}`);
md.push(`- ${mdPath}`);
fs.writeFileSync(mdPath, md.join('\n'), 'utf8');
console.log(md.join('\n'));
