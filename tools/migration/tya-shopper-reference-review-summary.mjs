import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const sourceDir = process.env.CXORBIA_TYA_SHOPPER_IDENTITY_OUT || path.join(repoRoot, 'tmp', 'tya-shopper-identity-review');
const outDir = path.join(repoRoot, 'tmp', 'tya-shopper-reference-review-summary');
fs.mkdirSync(outDir, { recursive: true });

function readJsonl(file) {
  try {
    return fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

function exists(file) {
  try { return fs.existsSync(file); } catch { return false; }
}

function countBy(rows, keyOrFn) {
  const out = {};
  for (const row of rows) {
    const value = typeof keyOrFn === 'function' ? keyOrFn(row) : row?.[keyOrFn];
    const safeValue = String(value || 'missing');
    out[safeValue] = (out[safeValue] || 0) + 1;
  }
  return out;
}

function tableRows(obj) {
  const entries = Object.entries(obj).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return entries.length ? entries.map(([key, value]) => `| ${key} | ${value} |`) : ['| none | 0 |'];
}

function pct(part, total) {
  if (!total) return '0.00%';
  return `${((part / total) * 100).toFixed(2)}%`;
}

const referenceFile = path.join(sourceDir, 'shopperReferenceReview.jsonl');
const candidateFile = path.join(sourceDir, 'shopperIdentityCandidates.jsonl');
const canonicalFile = path.join(sourceDir, 'canonicalShopperMap.jsonl');
const duplicateFile = path.join(sourceDir, 'shopperDuplicateReview.jsonl');
const manifestFile = path.join(sourceDir, 'shopperIdentityReviewManifest.json');

const references = readJsonl(referenceFile);
const candidates = readJsonl(candidateFile);
const canonicalRows = readJsonl(canonicalFile);
const duplicateRows = readJsonl(duplicateFile);

const candidateIds = new Set(candidates.map((row) => row?.canonicalShopperId).filter(Boolean));
const canonicalIds = new Set(canonicalRows.map((row) => row?.canonicalShopperId).filter(Boolean));
const knownCanonicalIds = new Set([...candidateIds, ...canonicalIds]);

const total = references.length;
const withCanonicalId = references.filter((row) => Boolean(row?.canonicalShopperId));
const missingCanonicalId = references.filter((row) => !row?.canonicalShopperId);
const matchedKnownCanonical = references.filter((row) => row?.canonicalShopperId && knownCanonicalIds.has(row.canonicalShopperId));
const unmatchedCanonical = references.filter((row) => row?.canonicalShopperId && !knownCanonicalIds.has(row.canonicalShopperId));
const highConfidence = references.filter((row) => row?.confidence === 'high');
const mediumConfidence = references.filter((row) => row?.confidence === 'medium');
const lowOrReviewConfidence = references.filter((row) => row?.confidence && !['high', 'medium'].includes(row.confidence));
const missingIdentity = references.filter((row) => row?.identityKind === 'missing_identity' || !row?.identityKind);

const strictBlockers = missingCanonicalId.length + unmatchedCanonical.length + missingIdentity.length;
const prerequisiteStatus = {
  referenceReviewFile: exists(referenceFile),
  candidateFile: exists(candidateFile),
  canonicalFile: exists(canonicalFile),
  duplicateFile: exists(duplicateFile),
  manifestFile: exists(manifestFile)
};

let decision = 'review_required';
let decisionReason = 'Reference rows need additional review before DEV staging policy can be lowered.';
if (!prerequisiteStatus.referenceReviewFile) {
  decision = 'missing_local_input';
  decisionReason = 'Run tya-build-shopper-identity-review.mjs before this summary.';
} else if (total === 0 && duplicateRows.length === 0) {
  decision = 'clear';
  decisionReason = 'No reference rows and no duplicate/low-confidence groups were found in local review output.';
} else if (total > 0 && strictBlockers === 0 && duplicateRows.length === canonicalRows.length) {
  decision = 'provisional_identity_allowed_for_dev_staging';
  decisionReason = 'All reference review rows have canonicalShopperId values that match the known candidate universe; current review is policy-driven, not a hard identity mismatch. Keep it provisional only.';
} else if (total > 0 && strictBlockers === 0) {
  decision = 'provisional_identity_allowed_for_dev_staging';
  decisionReason = 'All reference review rows have canonicalShopperId values that match the known candidate universe; current review is policy-driven, not a hard identity mismatch. Keep it provisional only.';
}

const summary = {
  generatedAt: new Date().toISOString(),
  sourceDir,
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false,
    noPlainPiiInReport: true
  },
  prerequisites: prerequisiteStatus,
  counts: {
    referenceReviewRows: total,
    candidateRows: candidates.length,
    canonicalRows: canonicalRows.length,
    duplicateReviewRows: duplicateRows.length,
    withCanonicalId: withCanonicalId.length,
    missingCanonicalId: missingCanonicalId.length,
    matchedKnownCanonical: matchedKnownCanonical.length,
    unmatchedCanonical: unmatchedCanonical.length,
    highConfidence: highConfidence.length,
    mediumConfidence: mediumConfidence.length,
    lowOrReviewConfidence: lowOrReviewConfidence.length,
    missingIdentity: missingIdentity.length,
    strictBlockers
  },
  bySourceType: countBy(references, 'sourceType'),
  byIdentityKind: countBy(references, 'identityKind'),
  byConfidence: countBy(references, 'confidence'),
  byNeedsReview: countBy(references, (row) => row?.needsReview === true ? 'true' : row?.needsReview === false ? 'false' : 'missing'),
  byKnownCanonicalMatch: countBy(references, (row) => {
    if (!row?.canonicalShopperId) return 'missing_canonicalShopperId';
    return knownCanonicalIds.has(row.canonicalShopperId) ? 'matched_known_canonical' : 'unmatched_canonical';
  }),
  decision,
  decisionReason,
  policy: {
    provisionalOnly: decision === 'provisional_identity_allowed_for_dev_staging',
    noProductionApproval: true,
    noAutoMerge: true,
    noAuthActivation: true,
    noDpiOrBankUse: true,
    keepManualReviewBeforeProduction: true
  }
};

fs.writeFileSync(path.join(outDir, 'shopperReferenceReviewSummary.json'), JSON.stringify(summary, null, 2), 'utf8');

const md = [
  '# TyA shopper reference review summary',
  '',
  `Generated at: ${summary.generatedAt}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '- No plain PII in report',
  '',
  '## Prerequisites',
  `- shopperReferenceReview.jsonl: ${summary.prerequisites.referenceReviewFile ? 'found' : 'missing'}`,
  `- shopperIdentityCandidates.jsonl: ${summary.prerequisites.candidateFile ? 'found' : 'missing'}`,
  `- canonicalShopperMap.jsonl: ${summary.prerequisites.canonicalFile ? 'found' : 'missing'}`,
  `- shopperDuplicateReview.jsonl: ${summary.prerequisites.duplicateFile ? 'found' : 'missing'}`,
  `- shopperIdentityReviewManifest.json: ${summary.prerequisites.manifestFile ? 'found' : 'missing'}`,
  '',
  '## Counts',
  `- Reference review rows: ${summary.counts.referenceReviewRows}`,
  `- Candidate rows: ${summary.counts.candidateRows}`,
  `- Canonical rows: ${summary.counts.canonicalRows}`,
  `- Duplicate review rows: ${summary.counts.duplicateReviewRows}`,
  `- With canonicalShopperId: ${summary.counts.withCanonicalId} (${pct(summary.counts.withCanonicalId, total)})`,
  `- Missing canonicalShopperId: ${summary.counts.missingCanonicalId} (${pct(summary.counts.missingCanonicalId, total)})`,
  `- Matched known canonical: ${summary.counts.matchedKnownCanonical} (${pct(summary.counts.matchedKnownCanonical, total)})`,
  `- Unmatched canonical: ${summary.counts.unmatchedCanonical} (${pct(summary.counts.unmatchedCanonical, total)})`,
  `- Medium confidence: ${summary.counts.mediumConfidence} (${pct(summary.counts.mediumConfidence, total)})`,
  `- Low/review confidence: ${summary.counts.lowOrReviewConfidence} (${pct(summary.counts.lowOrReviewConfidence, total)})`,
  `- Missing identity: ${summary.counts.missingIdentity} (${pct(summary.counts.missingIdentity, total)})`,
  `- Strict blockers: ${summary.counts.strictBlockers}`,
  '',
  '## By sourceType',
  '| sourceType | count |',
  '|---|---:|',
  ...tableRows(summary.bySourceType),
  '',
  '## By identityKind',
  '| identityKind | count |',
  '|---|---:|',
  ...tableRows(summary.byIdentityKind),
  '',
  '## By confidence',
  '| confidence | count |',
  '|---|---:|',
  ...tableRows(summary.byConfidence),
  '',
  '## By canonical match',
  '| status | count |',
  '|---|---:|',
  ...tableRows(summary.byKnownCanonicalMatch),
  '',
  '## Technical decision',
  `- Decision: ${summary.decision}`,
  `- Reason: ${summary.decisionReason}`,
  '',
  '## Interpretation',
  '- Reference review rows are postulation/visit references that the previous identity review marked as needing review.',
  '- They are not additional shoppers by themselves.',
  '- For DEV staging only, a provisional policy can be considered only when the rows map back to known canonicalShopperId values and strict blockers are 0.',
  '- This does not approve production import, final identity merge, Auth activation, or use of DPI/bank fields.',
  '',
  '## Next gate',
  '- Continue with COMM_REVIEW after this summary is reviewed.'
].join('\n');

fs.writeFileSync(path.join(outDir, 'shopperReferenceReviewSummary.md'), md, 'utf8');
console.log(md);
