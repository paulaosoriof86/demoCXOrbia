import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-cx-data-backend-adapter-contract');
fs.mkdirSync(outDir, { recursive: true });

const contract = {
  generatedAt: new Date().toISOString(),
  mode: 'cx-data-backend-adapter-contract-no-frontend-change',
  visualBaseline: 'Prototype development request CXOrbia V78.zip',
  purpose: 'Define how the existing CX.data interface can be backed by the DEV data layer without changing app modules.',
  safety: {
    frontendFilesChanged: 0,
    databaseChanges: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false
  },
  protectedFrontendScope: [
    'app/modules/**',
    'app/core/** except the single future connection point when authorized'
  ],
  futureConnectionPoint: {
    status: 'not_implemented_in_this_block',
    allowedShape: 'one backend adapter file plus one explicit connection point only after review',
    mustPreserve: 'same CX.data method names and return shapes used by modules'
  },
  tenantScope: {
    tenantId: 'tya',
    projectId: 'tya-migration-dev',
    previewRoot: 'tenants/tya/projects/tya-migration-dev/migrationPreview/{batchId}'
  },
  interfaceMap: [
    {
      cxArea: 'visits',
      backendCollection: 'migrationPreview/{batchId}/visits',
      status: 'preview_only',
      allowedUse: 'read and compare migrated visit candidates in DEV review'
    },
    {
      cxArea: 'shoppers',
      backendCollection: 'migrationPreview/{batchId}/shoppers',
      status: 'preview_only',
      allowedUse: 'read provisional shopper identities for DEV review'
    },
    {
      cxArea: 'communicationsHistory',
      backendCollection: 'migrationPreview/{batchId}/communicationsHistory',
      status: 'history_only_inactive',
      allowedUse: 'read historical communications without triggering messages'
    },
    {
      cxArea: 'operativeCandidates',
      backendCollection: 'migrationPreview/{batchId}/operativeCandidates',
      status: 'candidate_only',
      allowedUse: 'read non-final operative candidates for review'
    },
    {
      cxArea: 'migrationBatches',
      backendCollection: 'tenants/tya/migrationBatches/{batchId}',
      status: 'metadata_only',
      allowedUse: 'show batch status and counts'
    }
  ],
  blockedUses: [
    'production data paths',
    'Auth users',
    'Storage evidence files',
    'Make notifications',
    'financial final records',
    'final operational records'
  ]
};

fs.writeFileSync(path.join(outDir, 'cxDataBackendAdapterContract.json'), JSON.stringify(contract, null, 2), 'utf8');

const md = [
  '# TyA CX.data backend adapter contract',
  '',
  `Generated at: ${contract.generatedAt}`,
  '',
  '## Status',
  `- Visual baseline: ${contract.visualBaseline}`,
  '- Frontend files changed: 0',
  '- Database changes: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '',
  '## Future connection point',
  `- Status: ${contract.futureConnectionPoint.status}`,
  `- Allowed shape: ${contract.futureConnectionPoint.allowedShape}`,
  `- Must preserve: ${contract.futureConnectionPoint.mustPreserve}`,
  '',
  '## Tenant scope',
  `- tenantId: ${contract.tenantScope.tenantId}`,
  `- projectId: ${contract.tenantScope.projectId}`,
  `- previewRoot: ${contract.tenantScope.previewRoot}`,
  '',
  '## Interface map',
  '| CX area | Backend collection | Status | Allowed use |',
  '|---|---|---|---|',
  ...contract.interfaceMap.map(item => `| ${item.cxArea} | ${item.backendCollection} | ${item.status} | ${item.allowedUse} |`),
  '',
  '## Blocked uses',
  ...contract.blockedUses.map(item => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'cxDataBackendAdapterContract.md'), md, 'utf8');
console.log(md);
