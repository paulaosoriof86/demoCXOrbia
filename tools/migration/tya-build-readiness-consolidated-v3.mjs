import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = process.env.CXORBIA_TYA_READINESS_V3_OUT || path.join(repoRoot, 'tmp', 'tya-readiness-consolidated-v3');
fs.mkdirSync(outDir, { recursive: true });

function readJson(file){
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}
function exists(file){ return fs.existsSync(file); }

const inputs = {
  hrFlow: path.join(repoRoot, 'tmp', 'hr-source-private-full-flow', 'hrSourcePrivateFullFlow.json'),
  canonical: path.join(repoRoot, 'tmp', 'tya-canonical-staging', 'tyaCanonicalStagingPlan.json'),
  sanitized: path.join(repoRoot, 'tmp', 'tya-sanitized-dev-candidate', 'sanitizedDevCandidateManifest.json'),
  shopperIdentity: path.join(repoRoot, 'tmp', 'tya-shopper-identity-review', 'shopperIdentityReviewManifest.json'),
  shopperDecision: path.join(repoRoot, 'tmp', 'tya-shopper-review-dev-policy-decision', 'shopperReviewDevPolicyDecision.json'),
  legacyComms: path.join(repoRoot, 'tmp', 'tya-legacy-communications-review', 'legacyCommunicationReviewManifest.json'),
  candidates: path.join(repoRoot, 'tmp', 'tya-liq-candidate-review', 'liqCandidateReviewManifest.json'),
  dryRun: path.join(repoRoot, 'tmp', 'tya-dev-import-dry-run-package', 'tyaDevImportDryRunPackage.json')
};

const data = Object.fromEntries(Object.entries(inputs).map(([k, file]) => [k, readJson(file)]));
const checks = [];
function add(id, ok, status, detail, next){ checks.push({ id, ok, status, detail, next }); }

add('HR_MULTI_TAB', !!data.hrFlow && !data.hrFlow?.errors?.length, data.hrFlow ? 'available' : 'missing', 'HR private full flow report must exist and have no errors.', 'Run HR private full flow locally if missing.');
add('CANONICAL_PLAN', !!data.canonical, data.canonical ? 'available' : 'missing', 'Canonical period/tab classification must exist.', 'Run canonical staging plan builder.');
add('SANITIZED_CANDIDATE', !!data.sanitized, data.sanitized ? 'available' : 'missing', 'Sanitized candidate manifest must exist.', 'Run sanitized candidate builder.');
add('SHOPPER_IDENTITY', !!data.shopperIdentity, data.shopperIdentity ? 'available' : 'missing', 'Shopper identity review must exist.', 'Run shopper identity review builder.');
add('SHOPPER_DEV_POLICY', !!data.shopperDecision, data.shopperDecision ? 'available' : 'missing', 'Shopper DEV policy decision must exist.', 'Run shopper DEV policy decision builder.');
add('LEGACY_COMMS', !!data.legacyComms, data.legacyComms ? 'available' : 'missing', 'Legacy communications review must exist.', 'Run legacy communications review builder.');
add('OPERATIVE_CANDIDATES', !!data.candidates, data.candidates ? 'available' : 'missing', 'Operative candidate review must exist.', 'Run operative candidate review builder.');
add('DRY_RUN_PACKAGE', !!data.dryRun, data.dryRun ? 'available' : 'missing', 'Dry-run package must exist.', 'Run dry-run package builder.');

const blockers = [];
const notes = [];
for(const c of checks){ if(!c.ok) blockers.push({ id: c.id, severity: 'blocker', reason: c.detail, next: c.next }); }

if(data.sanitized?.counts?.sensitiveFieldOccurrencesRemoved > 0){
  blockers.push({ id: 'PII_REVIEW', severity: 'review', reason: 'Sanitized candidate removed protected fields; local audit must be reviewed.', next: 'Review removedSensitiveFields.audit.json locally.' });
}

const shopperDecision = data.shopperDecision?.decision || 'missing';
if(shopperDecision.startsWith('provisional_identity_allowed_for_dev_staging')){
  notes.push({ id: 'SHOPPER_REVIEW', status: 'dev_policy_provisional', reason: data.shopperDecision?.reason || 'Shopper review decision allows provisional DEV policy only.', next: 'Keep event references unlinked until a safe source map exists.' });
} else if(data.shopperIdentity?.policy?.writeRequiresManualReview || shopperDecision !== 'missing'){
  blockers.push({ id: 'SHOPPER_REVIEW', severity: 'review', reason: 'Shopper identity cases require review.', next: 'Review shopper DEV policy decision.' });
}

if(data.legacyComms?.counts?.unresolved > 0 || data.legacyComms?.counts?.reviewRequired > 0){
  blockers.push({ id: 'COMM_REVIEW', severity: 'review', reason: 'Some legacy communication rows require review.', next: 'Keep communications as history only.' });
}
if(data.candidates?.counts?.needsReview > 0){
  blockers.push({ id: 'CANDIDATE_REVIEW', severity: 'review', reason: 'Some operative candidates need review.', next: 'Review candidate needs review file.' });
}

const readiness = {
  status: blockers.some(b => b.severity === 'blocker') ? 'blocked_missing_local_reports' : (blockers.length ? 'review_required' : 'ready_for_controlled_dev_authorization_review'),
  safeMode: true,
  executeAllowed: false,
  firestoreWrites: 0,
  importsExecuted: 0,
  deploy: 0,
  production: 0
};

const report = {
  generatedAt: new Date().toISOString(),
  mode: 'readiness-consolidated-v3-no-runtime-actions',
  inputs: Object.fromEntries(Object.entries(inputs).map(([k, file]) => [k, { file, exists: exists(file) }])),
  readiness,
  checks,
  blockers,
  notes,
  counts: {
    hrTabs: data.hrFlow?.coverage?.periodRows?.length || 0,
    sanitizedVisits: data.sanitized?.counts?.visits || 0,
    sanitizedShoppers: data.sanitized?.counts?.shoppersSanitized || 0,
    shopperCandidates: data.shopperIdentity?.counts?.canonicalShopperCandidates || 0,
    legacyComms: data.legacyComms?.counts?.legacyCommunications || 0,
    operativeCandidates: data.candidates?.counts?.candidates || 0
  },
  next: [
    'Run missing local reports in order if any are missing.',
    'Review protected-field audit locally.',
    'Keep legacy communications history-only.',
    'Review operative candidates before any controlled DEV action.',
    'Do not move to production from this report.'
  ]
};

fs.writeFileSync(path.join(outDir, 'readinessConsolidatedV3.json'), JSON.stringify(report, null, 2), 'utf8');
const checkRows = checks.map(c => `| ${c.id} | ${c.ok ? 'OK' : 'MISSING'} | ${c.status} | ${c.next} |`);
const blockerRows = blockers.map(b => `| ${b.id} | ${b.severity} | ${b.reason} | ${b.next} |`);
const noteRows = notes.map(n => `| ${n.id} | ${n.status} | ${n.reason} | ${n.next} |`);
const md = [
  '# TyA readiness consolidated V3', '',
  `Generated at: ${report.generatedAt}`, '',
  '## Status',
  `- Readiness: ${readiness.status}`,
  '- Safe mode: true',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false', '',
  '## Counts',
  `- HR tabs: ${report.counts.hrTabs}`,
  `- Sanitized visits: ${report.counts.sanitizedVisits}`,
  `- Sanitized shoppers: ${report.counts.sanitizedShoppers}`,
  `- Shopper candidates: ${report.counts.shopperCandidates}`,
  `- Legacy communications: ${report.counts.legacyComms}`,
  `- Operative candidates: ${report.counts.operativeCandidates}`, '',
  '## Checks',
  '| Check | Result | Status | Next |',
  '|---|---|---|---|',
  ...checkRows, '',
  '## Blockers / reviews',
  '| ID | Severity | Reason | Next |',
  '|---|---|---|---|',
  ...(blockerRows.length ? blockerRows : ['| none | - | - | - |']), '',
  '## Notes',
  '| ID | Status | Reason | Next |',
  '|---|---|---|---|',
  ...(noteRows.length ? noteRows : ['| none | - | - | - |']), '',
  '## Next',
  ...report.next.map(v => `- ${v}`)
].join('\n');
fs.writeFileSync(path.join(outDir, 'readinessConsolidatedV3.md'), md, 'utf8');
console.log(md);
console.log('');
console.log(`Report dir: ${outDir}`);
