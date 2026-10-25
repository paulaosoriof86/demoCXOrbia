import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-dev-staging-target-validator');
fs.mkdirSync(outDir, { recursive: true });

const expected = {
  targetEnv: 'DEV',
  tenantId: 'tya',
  projectId: 'tya-migration-dev'
};

const received = {
  targetEnv: process.env.CXORBIA_TYA_TARGET_ENV || '',
  tenantId: process.env.CXORBIA_TYA_TENANT_ID || '',
  projectId: process.env.CXORBIA_TYA_PROJECT_ID || '',
  batchId: process.env.CXORBIA_TYA_BATCH_ID || '',
  enableFlag: process.env.CXORBIA_TYA_ENABLE_DEV_WRITE_RUNNER || ''
};

const checks = [
  { id: 'targetEnv', ok: received.targetEnv === expected.targetEnv, expected: expected.targetEnv, received: received.targetEnv || 'missing' },
  { id: 'tenantId', ok: received.tenantId === expected.tenantId, expected: expected.tenantId, received: received.tenantId || 'missing' },
  { id: 'projectId', ok: received.projectId === expected.projectId, expected: expected.projectId, received: received.projectId || 'missing' },
  { id: 'batchId', ok: /^tya-dev-import-\d{8}-\d{6}$/.test(received.batchId), expected: 'tya-dev-import-YYYYMMDD-HHMMSS', received: received.batchId || 'missing' },
  { id: 'enableFlag', ok: received.enableFlag === 'I_UNDERSTAND_DEV_ONLY', expected: 'I_UNDERSTAND_DEV_ONLY', received: received.enableFlag ? 'provided' : 'missing' }
];

const valid = checks.every(item => item.ok);
const report = {
  generatedAt: new Date().toISOString(),
  mode: 'dev-staging-target-validator-no-runtime-actions',
  validationStatus: valid ? 'target_valid_for_future_authorization_review' : 'target_not_valid',
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false
  },
  checks,
  next: valid
    ? ['Proceed only to human authorization review. Do not execute writes from this validator.']
    : ['Fix missing or mismatched target variables before any future enabled runner can exist.']
};

fs.writeFileSync(path.join(outDir, 'devStagingTargetValidator.json'), JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# TyA DEV staging target validator',
  '',
  `Generated at: ${report.generatedAt}`,
  '',
  '## Status',
  `- Validation status: ${report.validationStatus}`,
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '',
  '## Checks',
  '| Check | Result | Expected | Received |',
  '|---|---|---|---|',
  ...checks.map(item => `| ${item.id} | ${item.ok ? 'OK' : 'MISMATCH'} | ${item.expected} | ${item.received} |`),
  '',
  '## Next',
  ...report.next.map(item => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'devStagingTargetValidator.md'), md, 'utf8');
console.log(md);
