import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-readiness-consolidated-v4');
fs.mkdirSync(outDir, { recursive: true });

function readJson(file){ try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } }
function exists(file){ return fs.existsSync(file); }

const files = {
  hrFlow: path.join(repoRoot, 'tmp', 'hr-source-private-full-flow', 'hrSourcePrivateFullFlow.json'),
  canonical: path.join(repoRoot, 'tmp', 'tya-canonical-staging', 'tyaCanonicalStagingPlan.json'),
  sanitized: path.join(repoRoot, 'tmp', 'tya-sanitized-dev-candidate', 'sanitizedDevCandidateManifest.json'),
  shopperIdentity: path.join(repoRoot, 'tmp', 'tya-shopper-identity-review', 'shopperIdentityReviewManifest.json'),
  shopperDecision: path.join(repoRoot, 'tmp', 'tya-shopper-review-dev-policy-decision', 'shopperReviewDevPolicyDecision.json'),
  legacyReview: path.join(repoRoot, 'tmp', 'tya-legacy-communications-review', 'legacyCommunicationReviewManifest.json'),
  legacyDecision: path.join(repoRoot, 'tmp', 'tya-legacy-communications-dev-policy-decision', 'legacyCommunicationsDevPolicyDecision.json'),
  candidates: path.join(repoRoot, 'tmp', 'tya-liq-candidate-review', 'liqCandidateReviewManifest.json'),
  dryRun: path.join(repoRoot, 'tmp', 'tya-dev-import-dry-run-package', 'tyaDevImportDryRunPackage.json')
};

const data = Object.fromEntries(Object.entries(files).map(([k, f]) => [k, readJson(f)]));
const checks = Object.entries(files).map(([id, file]) => ({ id, ok: exists(file), status: exists(file) ? 'available' : 'missing' }));

const blockers = [];
const notes = [];
for (const check of checks) {
  if (!check.ok) blockers.push({ id: check.id, severity: 'blocker', reason: 'Required local report is missing', next: 'Run the local builder.' });
}

const shopperDecision = data.shopperDecision?.decision || 'missing';
if (shopperDecision.startsWith('provisional_identity_allowed_for_dev_staging')) {
  notes.push({ id: 'SHOPPER_REVIEW', status: 'dev_policy_provisional', reason: data.shopperDecision?.reason || 'Provisional DEV policy only.', next: 'Keep event references without final link until a safe map exists.' });
} else if (shopperDecision !== 'missing') {
  blockers.push({ id: 'SHOPPER_REVIEW', severity: 'review', reason: 'Shopper review still needs review.', next: 'Review shopper decision.' });
}

const legacyDecision = data.legacyDecision?.decision || 'missing';
if (legacyDecision === 'history_only_allowed_for_dev_staging_no_active_flows') {
  notes.push({ id: 'COMM_REVIEW', status: 'history_only_dev_policy', reason: data.legacyDecision?.reason || 'History only policy.', next: 'Keep as inactive history.' });
} else if (legacyDecision !== 'missing') {
  blockers.push({ id: 'COMM_REVIEW', severity: 'review', reason: 'Legacy communications still need review.', next: 'Review legacy decision.' });
}

if (data.candidates?.counts?.needsReview > 0) {
  blockers.push({ id: 'CANDIDATE_REVIEW', severity: 'review', reason: 'Some operative candidates need review.', next: 'Review candidate file.' });
}

const readiness = {
  status: blockers.some(b => b.severity === 'blocker') ? 'blocked_missing_local_reports' : (blockers.length ? 'review_required' : 'ready_for_controlled_dev_authorization_review'),
  safeMode: true,
  firestoreWrites: 0,
  importsExecuted: 0,
  deploy: 0,
  production: 0,
  executeAllowed: false
};

const counts = {
  hrTabs: data.hrFlow?.coverage?.periodRows?.length || 0,
  sanitizedVisits: data.sanitized?.counts?.visits || 0,
  sanitizedShoppers: data.sanitized?.counts?.shoppersSanitized || 0,
  shopperCandidates: data.shopperIdentity?.counts?.canonicalShopperCandidates || 0,
  legacyCommunications: data.legacyReview?.counts?.legacyCommunications || 0,
  operativeCandidates: data.candidates?.counts?.candidates || 0
};

const report = { generatedAt: new Date().toISOString(), readiness, counts, checks, blockers, notes };
fs.writeFileSync(path.join(outDir, 'readinessConsolidatedV4.json'), JSON.stringify(report, null, 2), 'utf8');

const checkRows = checks.map(c => `| ${c.id} | ${c.ok ? 'OK' : 'MISSING'} | ${c.status} |`);
const blockerRows = blockers.map(b => `| ${b.id} | ${b.severity} | ${b.reason} | ${b.next} |`);
const noteRows = notes.map(n => `| ${n.id} | ${n.status} | ${n.reason} | ${n.next} |`);
const md = [
  '# TyA readiness consolidated V4', '',
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
  `- HR tabs: ${counts.hrTabs}`,
  `- Sanitized visits: ${counts.sanitizedVisits}`,
  `- Sanitized shoppers: ${counts.sanitizedShoppers}`,
  `- Shopper candidates: ${counts.shopperCandidates}`,
  `- Legacy communications: ${counts.legacyCommunications}`,
  `- Operative candidates: ${counts.operativeCandidates}`, '',
  '## Checks',
  '| Check | Result | Status |',
  '|---|---|---|',
  ...checkRows, '',
  '## Blockers / reviews',
  '| ID | Severity | Reason | Next |',
  '|---|---|---|---|',
  ...(blockerRows.length ? blockerRows : ['| none | - | - | - |']), '',
  '## Notes',
  '| ID | Status | Reason | Next |',
  '|---|---|---|---|',
  ...(noteRows.length ? noteRows : ['| none | - | - | - |'])
].join('\n');
fs.writeFileSync(path.join(outDir, 'readinessConsolidatedV4.md'), md, 'utf8');
console.log(md);
