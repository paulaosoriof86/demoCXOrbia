import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const manifestPath = path.join(repoRoot, 'tmp', 'tya-liq-candidate-review', 'liqCandidateReviewManifest.json');
const outDir = path.join(repoRoot, 'tmp', 'tya-operative-candidates-dev-policy-decision');
fs.mkdirSync(outDir, { recursive: true });

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}

const manifest = readJson(manifestPath);
const counts = {
  candidates: manifest?.counts?.candidates || 0,
  linkedVisitFound: manifest?.counts?.linkedVisitFound || 0,
  needsReview: manifest?.counts?.needsReview || 0
};

const safetyOk = manifest?.safety?.firestoreWrites === 0
  && manifest?.safety?.importsExecuted === 0
  && manifest?.safety?.deploy === 0
  && manifest?.safety?.production === 0
  && manifest?.safety?.executeAllowed === false;

const policyOk = manifest?.policy?.candidateOnly === true
  && manifest?.policy?.externalSheetRequired === true
  && manifest?.policy?.noFinalRecordFromHrOnly === true;

let decision = 'review_required';
let reason = 'Operative candidates still need review before DEV readiness can move forward.';
if (!manifest) {
  decision = 'missing_local_input';
  reason = 'Run operative candidate review first.';
} else if (safetyOk && policyOk) {
  decision = 'candidate_only_allowed_for_dev_staging_no_final_records';
  reason = 'Operative rows are classified as candidates only; they require external crosscheck and must not create final records.';
}

const report = {
  generatedAt: new Date().toISOString(),
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false,
    noFinalRecords: true
  },
  inputs: {
    liqCandidateReviewManifest: Boolean(manifest)
  },
  counts,
  decision,
  reason,
  policy: {
    devOnly: true,
    candidateOnlyIfLaterAuthorized: decision === 'candidate_only_allowed_for_dev_staging_no_final_records',
    doNotCreateFinalPayment: true,
    doNotCreateFinalDebt: true,
    doNotSettleFinancialState: true,
    externalCrosscheckRequiredBeforeProduction: true,
    doNotWriteDatabase: true,
    productionStillRequiresReview: true
  },
  next: [
    'Treat operative rows as candidates only for DEV readiness analysis.',
    'Do not create final payment or final debt records from this review.',
    'Use this decision only for controlled DEV authorization review.'
  ]
};

fs.writeFileSync(path.join(outDir, 'operativeCandidatesDevPolicyDecision.json'), JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# TyA operative candidates DEV policy decision',
  '',
  `Generated at: ${report.generatedAt}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '- No final records',
  '',
  '## Inputs',
  `- Operative candidate review manifest: ${report.inputs.liqCandidateReviewManifest ? 'found' : 'missing'}`,
  '',
  '## Counts',
  `- Candidates: ${counts.candidates}`,
  `- Linked visit found: ${counts.linkedVisitFound}`,
  `- Needs review: ${counts.needsReview}`,
  '',
  '## Decision',
  `- Decision: ${decision}`,
  `- Reason: ${reason}`,
  '',
  '## Policy',
  '- DEV only.',
  '- Candidate only if later authorized.',
  '- Do not create final payment records.',
  '- Do not create final debt records.',
  '- Do not settle financial state.',
  '- External crosscheck required before production.',
  '- Do not write database.',
  '- Production still requires review.',
  '',
  '## Next',
  ...report.next.map((item) => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'operativeCandidatesDevPolicyDecision.md'), md, 'utf8');
console.log(md);
