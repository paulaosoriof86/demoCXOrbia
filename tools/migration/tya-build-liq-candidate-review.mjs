import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const candidateDir = process.env.CXORBIA_TYA_SANITIZED_DEV_DIR || path.join(repoRoot, 'tmp', 'tya-sanitized-dev-candidate');
const outDir = process.env.CXORBIA_TYA_LIQ_REVIEW_OUT || path.join(repoRoot, 'tmp', 'tya-liq-candidate-review');
fs.mkdirSync(outDir, { recursive: true });

function readJsonl(file){ try { return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse); } catch { return []; } }
function writeJsonl(file, rows){ fs.writeFileSync(file, rows.map(r => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''), 'utf8'); }
function pick(row, keys){ for(const k of keys){ if(row?.[k] !== undefined && row?.[k] !== null && String(row[k]).trim()) return row[k]; } return ''; }

const liqRows = readJsonl(path.join(candidateDir, 'candidateLiquidationOnly.jsonl'));
const visits = readJsonl(path.join(candidateDir, 'candidateVisits.jsonl'));
const visitIds = new Set();
for(const v of visits){ for(const k of ['docId','visitId','sourceKey','hrKey']){ if(v[k]) visitIds.add(String(v[k])); } }

const review = liqRows.map((r, index) => {
  const link = pick(r, ['visitDocId','visitId','sourceKey','hrKey']);
  const linkedVisitFound = link ? visitIds.has(String(link)) : false;
  const period = pick(r, ['periodId','period','sourcePeriod','periodRaw']);
  const country = pick(r, ['country','pais']);
  const reasons = [];
  if(!linkedVisitFound) reasons.push('visit_link_review');
  if(!period) reasons.push('period_review');
  if(!country) reasons.push('country_review');
  reasons.push('external_sheet_crosscheck_required');
  return {
    sourceDocId: r.docId || '',
    sourceIndex: index,
    period,
    country,
    linkedVisitFound,
    reviewReasons: reasons,
    importPolicy: 'candidate_only',
    finalRecord: false,
    executeAllowed: false
  };
});

const blocked = review.filter(r => r.reviewReasons.length > 1 || !r.linkedVisitFound);
const byPeriodCountry = {};
for(const r of review){
  const key = `${r.period || 'sin_periodo'}|${r.country || 'sin_pais'}`;
  byPeriodCountry[key] = (byPeriodCountry[key] || 0) + 1;
}

writeJsonl(path.join(outDir, 'liqCandidateReview.jsonl'), review);
writeJsonl(path.join(outDir, 'liqCandidateNeedsReview.jsonl'), blocked);

const manifest = {
  generatedAt: new Date().toISOString(),
  mode: 'liq-candidate-review-only',
  safety: { firestoreWrites: 0, importsExecuted: 0, deploy: 0, production: 0, executeAllowed: false },
  counts: { candidates: review.length, linkedVisitFound: review.filter(r => r.linkedVisitFound).length, needsReview: blocked.length },
  byPeriodCountry,
  policy: { candidateOnly: true, externalSheetRequired: true, noFinalRecordFromHrOnly: true },
  next: ['Review external sheet crosscheck.', 'Confirm visit link and period/country.', 'Keep final state blocked until review is complete.']
};
fs.writeFileSync(path.join(outDir, 'liqCandidateReviewManifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
const md = ['# TyA liq candidate review','',`Generated at: ${manifest.generatedAt}`,'','## Safety','- Firestore writes: 0','- Imports executed: 0','- Deploy: 0','- Production: 0','- executeAllowed: false','','## Counts',`- Candidates: ${manifest.counts.candidates}`,`- Linked visit found: ${manifest.counts.linkedVisitFound}`,`- Needs review: ${manifest.counts.needsReview}`,'','## Policy','- Candidate only.','- External sheet review required.','- No final record from HR only.','','## Next',...manifest.next.map(v => `- ${v}`)].join('\n');
fs.writeFileSync(path.join(outDir, 'liqCandidateReviewReport.md'), md, 'utf8');
console.log(md);
console.log('');
console.log(`Report dir: ${outDir}`);
