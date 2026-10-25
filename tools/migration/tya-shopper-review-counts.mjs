import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const sourceDir = path.join(repoRoot, 'tmp', 'tya-shopper-identity-review');
const outDir = path.join(repoRoot, 'tmp', 'tya-shopper-review-counts');
fs.mkdirSync(outDir, { recursive: true });

function readJsonl(file){
  try { return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse); }
  catch { return []; }
}
function countBy(rows, key){
  const out = {};
  for (const row of rows) {
    const value = row?.[key] || 'missing';
    out[value] = (out[value] || 0) + 1;
  }
  return out;
}
function linesFor(obj){
  const entries = Object.entries(obj);
  return entries.length ? entries.map(([k,v]) => `| ${k} | ${v} |`) : ['| none | 0 |'];
}

const candidates = readJsonl(path.join(sourceDir, 'shopperIdentityCandidates.jsonl'));
const canonical = readJsonl(path.join(sourceDir, 'canonicalShopperMap.jsonl'));
const duplicateReview = readJsonl(path.join(sourceDir, 'shopperDuplicateReview.jsonl'));
const referenceReview = readJsonl(path.join(sourceDir, 'shopperReferenceReview.jsonl'));

const summary = {
  generatedAt: new Date().toISOString(),
  counts: {
    candidates: candidates.length,
    canonicalRows: canonical.length,
    duplicateReviewRows: duplicateReview.length,
    referenceReviewRows: referenceReview.length
  },
  byIdentityKind: countBy(candidates, 'identityKind'),
  byConfidence: countBy(candidates, 'confidence'),
  byImportPolicy: countBy(candidates, 'importPolicy'),
  recommendation: duplicateReview.length || referenceReview.length ? 'review_required' : 'clear'
};
fs.writeFileSync(path.join(outDir, 'shopperReviewCounts.json'), JSON.stringify(summary, null, 2), 'utf8');

const md = [
  '# TyA shopper review counts', '',
  `Generated at: ${summary.generatedAt}`, '',
  '## Counts',
  `- Candidates: ${summary.counts.candidates}`,
  `- Canonical rows: ${summary.counts.canonicalRows}`,
  `- Duplicate review rows: ${summary.counts.duplicateReviewRows}`,
  `- Reference review rows: ${summary.counts.referenceReviewRows}`, '',
  '## Identity kinds', '| Kind | Count |', '|---|---:|', ...linesFor(summary.byIdentityKind), '',
  '## Confidence', '| Confidence | Count |', '|---|---:|', ...linesFor(summary.byConfidence), '',
  '## Import policy', '| Policy | Count |', '|---|---:|', ...linesFor(summary.byImportPolicy), '',
  '## Recommendation', `- ${summary.recommendation}`
].join('\n');
fs.writeFileSync(path.join(outDir, 'shopperReviewCounts.md'), md, 'utf8');
console.log(md);
