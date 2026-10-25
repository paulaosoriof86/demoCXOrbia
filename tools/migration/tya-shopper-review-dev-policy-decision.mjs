import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const fieldAuditPath = path.join(repoRoot, 'tmp', 'tya-shopper-reference-field-audit', 'shopperReferenceFieldAudit.json');
const reviewCountsPath = path.join(repoRoot, 'tmp', 'tya-shopper-review-counts', 'shopperReviewCounts.json');
const identityManifestPath = path.join(repoRoot, 'tmp', 'tya-shopper-identity-review', 'shopperIdentityReviewManifest.json');
const outDir = path.join(repoRoot, 'tmp', 'tya-shopper-review-dev-policy-decision');
fs.mkdirSync(outDir, { recursive: true });

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}

const fieldAudit = readJson(fieldAuditPath);
const reviewCounts = readJson(reviewCountsPath);
const identityManifest = readJson(identityManifestPath);

const safeMode = {
  firestoreWrites: 0,
  importsExecuted: 0,
  deploy: 0,
  production: 0,
  executeAllowed: false,
  noValuesPrinted: true
};

const counts = {
  visits: fieldAudit?.counts?.visits || 0,
  postulations: fieldAudit?.counts?.postulations || 0,
  shoppers: fieldAudit?.counts?.shoppers || 0,
  referenceRows: fieldAudit?.counts?.referenceReviewRows || reviewCounts?.counts?.referenceReviewRows || 0,
  candidateRows: fieldAudit?.counts?.candidateRows || reviewCounts?.counts?.candidates || 0,
  canonicalRows: fieldAudit?.counts?.canonicalRows || reviewCounts?.counts?.canonicalRows || 0,
  duplicateReviewRows: reviewCounts?.counts?.duplicateReviewRows || identityManifest?.counts?.duplicateOrLowConfidenceGroups || 0
};

const signals = {
  visits: fieldAudit?.decisions?.visits || 'missing',
  postulations: fieldAudit?.decisions?.postulations || 'missing',
  shoppers: fieldAudit?.decisions?.shoppers || 'missing',
  likelyCause: fieldAudit?.likelyCause || 'missing'
};

const allInputsAvailable = Boolean(fieldAudit && (reviewCounts || identityManifest));
const countsAligned = counts.shoppers === 276 && counts.candidateRows === 276 && counts.canonicalRows === 276;
const referencesAreNotExplicitIdentity = signals.visits === 'only_identity_presence_flags_available' && signals.postulations === 'only_generic_event_or_source_keys_available';
const likelyFalseStrictBlocker = signals.likelyCause === 'shopper_reference_review_probably_uses_generic_event_keys_instead_of_shopper_identity';

let decision = 'review_required';
let reason = 'Shopper review still needs review before DEV staging.';
if (!allInputsAvailable) {
  decision = 'missing_local_input';
  reason = 'Run shopper reference field audit and shopper review counts first.';
} else if (countsAligned && referencesAreNotExplicitIdentity && likelyFalseStrictBlocker) {
  decision = 'provisional_identity_allowed_for_dev_staging_with_unlinked_event_references';
  reason = 'Shopper candidates are aligned to the 276 canonical shopper rows; the 661 event references do not contain direct shopper identity values in the sanitized preview, so they should not be treated as 661 identity mismatches.';
}

const report = {
  generatedAt: new Date().toISOString(),
  safety: safeMode,
  inputs: {
    fieldAudit: Boolean(fieldAudit),
    reviewCounts: Boolean(reviewCounts),
    identityManifest: Boolean(identityManifest)
  },
  counts,
  signals,
  decision,
  reason,
  policy: {
    devOnly: true,
    keepEventReferencesUnlinkedUntilSafeMapExists: decision.startsWith('provisional_identity_allowed'),
    doNotMergePeople: true,
    doNotActivateRealAuth: true,
    doNotWriteDatabase: true,
    productionStillRequiresReview: true
  },
  next: [
    'Use this decision only to remove the false SHOPPER_REVIEW blocker for DEV readiness review.',
    'Keep visit and postulation references unlinked unless a safe source map is available.',
    'Continue with COMM_REVIEW and operative candidate review before any controlled DEV authorization.'
  ]
};

fs.writeFileSync(path.join(outDir, 'shopperReviewDevPolicyDecision.json'), JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# TyA shopper review DEV policy decision',
  '',
  `Generated at: ${report.generatedAt}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '- No values printed',
  '',
  '## Inputs',
  `- Field audit: ${report.inputs.fieldAudit ? 'found' : 'missing'}`,
  `- Review counts: ${report.inputs.reviewCounts ? 'found' : 'missing'}`,
  `- Identity manifest: ${report.inputs.identityManifest ? 'found' : 'missing'}`,
  '',
  '## Counts',
  `- Visits: ${counts.visits}`,
  `- Postulations: ${counts.postulations}`,
  `- Shoppers: ${counts.shoppers}`,
  `- Reference rows: ${counts.referenceRows}`,
  `- Candidate rows: ${counts.candidateRows}`,
  `- Canonical rows: ${counts.canonicalRows}`,
  `- Duplicate review rows: ${counts.duplicateReviewRows}`,
  '',
  '## Signals',
  `- Visits: ${signals.visits}`,
  `- Postulations: ${signals.postulations}`,
  `- Shoppers: ${signals.shoppers}`,
  `- Likely cause: ${signals.likelyCause}`,
  '',
  '## Decision',
  `- Decision: ${decision}`,
  `- Reason: ${reason}`,
  '',
  '## Policy',
  '- DEV only.',
  '- Keep event references unlinked until a safe source map exists.',
  '- Do not merge people definitively.',
  '- Do not activate real Auth.',
  '- Do not write database.',
  '- Production still requires review.',
  '',
  '## Next',
  ...report.next.map((item) => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'shopperReviewDevPolicyDecision.md'), md, 'utf8');
console.log(md);
