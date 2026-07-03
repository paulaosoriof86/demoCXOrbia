import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const canonicalPlanPath = process.env.CXORBIA_TYA_CANONICAL_PLAN || path.join(repoRoot, 'tmp', 'tya-canonical-staging', 'tyaCanonicalStagingPlan.json');
const writePlanManifestPath = process.env.CXORBIA_TYA_WRITE_PLAN_MANIFEST || path.join(repoRoot, 'tmp', 'tya-firestore-write-plan', 'writePlanManifest.json');
const writePlanGatePath = process.env.CXORBIA_TYA_WRITE_PLAN_GATE || path.join(repoRoot, 'tmp', 'tya-firestore-write-plan', 'importGate.json');
const outDir = process.env.CXORBIA_TYA_DEV_DRY_RUN_OUT || path.join(repoRoot, 'tmp', 'tya-dev-import-dry-run-package');

fs.mkdirSync(outDir, { recursive: true });

function readJson(file, fallback = null){
  try{ return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch{ return fallback; }
}

function exists(file){ return fs.existsSync(file); }

const canonicalPlan = readJson(canonicalPlanPath, null);
const writePlanManifest = readJson(writePlanManifestPath, null);
const importGate = readJson(writePlanGatePath, null);

const missingInputs = [];
if(!canonicalPlan) missingInputs.push(canonicalPlanPath);
if(!writePlanManifest) missingInputs.push(writePlanManifestPath);
if(!importGate) missingInputs.push(writePlanGatePath);

const blockers = [];
function addBlocker(id, severity, title, action){ blockers.push({ id, severity, title, action }); }

if(!canonicalPlan) addBlocker('DRY01', 'critical', 'Canonical staging plan missing', 'Run tya-build-canonical-staging-plan.mjs after HR private full flow.');
if(!writePlanManifest || !importGate) addBlocker('DRY02', 'critical', 'Firestore write plan missing', 'Run tools/migration/tya-build-firestore-write-plan.ps1 in plan-only mode.');

const canonicalBlockers = canonicalPlan?.blockers || [];
for(const b of canonicalBlockers){
  if(String(b.severity || '').toLowerCase() === 'critical') addBlocker(b.id || 'CANONICAL', 'critical', b.title || 'Canonical blocker', b.action || 'Resolve before DEV write.');
  else addBlocker(b.id || 'CANONICAL', b.severity || 'warning', b.title || 'Canonical warning', b.action || 'Review before DEV write.');
}

if(importGate){
  if(importGate.canWriteToFirestore !== false) addBlocker('DRY03', 'critical', 'Unsafe gate value', 'Import gate must remain canWriteToFirestore=false until explicit authorization and separate runner.');
  if(importGate.status !== 'review_required') addBlocker('DRY04', importGate.status === 'blocked' ? 'critical' : 'warning', `Import gate status: ${importGate.status}`, importGate.reason || 'Review gate before DEV write.');
}

const criticalCount = blockers.filter(b => b.severity === 'critical').length;
const warningCount = blockers.filter(b => b.severity === 'warning').length;

const readiness = {
  status: criticalCount > 0 ? 'blocked' : (warningCount > 0 ? 'review_required' : 'ready_for_manual_authorization_review'),
  canWriteToFirestore: false,
  executeAllowed: false,
  criticalBlockers: criticalCount,
  warnings: warningCount,
  authorizationRequired: true,
  requiredAuthorizationText: 'PAULA_AUTORIZA_DEV_STAGING_WRITE',
  note: 'This package is a dry-run/readiness artifact. It never writes Firestore.'
};

const pkg = {
  generatedAt: new Date().toISOString(),
  mode: 'dev-import-dry-run-package-no-firestore-writes',
  tenantId: 'tya',
  programId: 'cinepolis',
  inputs: {
    canonicalPlanPath,
    writePlanManifestPath,
    writePlanGatePath,
    canonicalPlanExists: exists(canonicalPlanPath),
    writePlanManifestExists: exists(writePlanManifestPath),
    writePlanGateExists: exists(writePlanGatePath),
    missingInputs
  },
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    canImport: false,
    canWriteToFirestore: false,
    executeAllowed: false
  },
  readiness,
  counts: {
    canonicalTabsDetected: canonicalPlan?.liveHr?.tabsDetected || 0,
    canonicalOperationalCandidates: canonicalPlan?.operationalCandidates?.length || 0,
    canonicalPreparationPeriods: canonicalPlan?.preparationPeriods?.length || 0,
    canonicalReviewRequired: canonicalPlan?.reviewRequired?.length || 0,
    writePlanRows: writePlanManifest?.counts?.planRows || 0,
    previewVisits: writePlanManifest?.counts?.previewVisits || 0,
    previewShoppers: writePlanManifest?.counts?.previewShoppers || 0,
    previewPostulations: writePlanManifest?.counts?.previewPostulations || 0,
    previewNotifications: writePlanManifest?.counts?.previewNotifications || 0,
    validationIssues: writePlanManifest?.counts?.validationIssues || 0
  },
  blockers,
  nextSteps: [
    'Review canonical period classification and exclude dashboard tabs.',
    'Resolve critical blockers: DPI/PII and duplicated questionnaire marks.',
    'Keep liquidations as candidates until finance Excel crosscheck.',
    'Keep notifications as history until recipients are canonical.',
    'After blockers are resolved, create a separate DEV write runner with explicit authorization phrase.',
    'Do not deploy or write Firestore from this dry-run package.'
  ]
};

fs.writeFileSync(path.join(outDir, 'tyaDevImportDryRunPackage.json'), JSON.stringify(pkg, null, 2), 'utf8');

const blockerRows = blockers.map(b => `| ${b.id} | ${b.severity} | ${b.title} | ${b.action} |`);
const md = [
  '# TyA DEV import dry-run package',
  '',
  `Generated at: ${pkg.generatedAt}`,
  '',
  '## Readiness',
  `- Status: ${readiness.status}`,
  `- Can write to Firestore: ${readiness.canWriteToFirestore}`,
  `- Execute allowed: ${readiness.executeAllowed}`,
  `- Critical blockers: ${readiness.criticalBlockers}`,
  `- Warnings: ${readiness.warnings}`,
  `- Required authorization text: ${readiness.requiredAuthorizationText}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- canImport: false',
  '',
  '## Counts',
  `- Canonical tabs detected: ${pkg.counts.canonicalTabsDetected}`,
  `- Operational candidates: ${pkg.counts.canonicalOperationalCandidates}`,
  `- Preparation periods: ${pkg.counts.canonicalPreparationPeriods}`,
  `- Review required: ${pkg.counts.canonicalReviewRequired}`,
  `- Write plan rows: ${pkg.counts.writePlanRows}`,
  `- Preview visits: ${pkg.counts.previewVisits}`,
  `- Preview shoppers: ${pkg.counts.previewShoppers}`,
  `- Preview postulations: ${pkg.counts.previewPostulations}`,
  `- Preview notifications: ${pkg.counts.previewNotifications}`,
  `- Validation issues: ${pkg.counts.validationIssues}`,
  '',
  '## Blockers',
  '| ID | Severity | Title | Action |',
  '|---|---|---|---|',
  ...(blockerRows.length ? blockerRows : ['| none | - | - | - |']),
  '',
  '## Next steps',
  ...pkg.nextSteps.map(s => `- ${s}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'tyaDevImportDryRunPackage.md'), md, 'utf8');
console.log(md);
console.log('');
console.log(`Report dir: ${outDir}`);
