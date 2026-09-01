import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const manifestPath = path.join(repoRoot, 'tmp', 'tya-legacy-communications-review', 'legacyCommunicationReviewManifest.json');
const outDir = path.join(repoRoot, 'tmp', 'tya-legacy-communications-dev-policy-decision');
fs.mkdirSync(outDir, { recursive: true });

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}

const manifest = readJson(manifestPath);
const counts = {
  legacyCommunications: manifest?.counts?.legacyCommunications || 0,
  matchedHigh: manifest?.counts?.matchedHigh || 0,
  matchedMedium: manifest?.counts?.matchedMedium || 0,
  reviewRequired: manifest?.counts?.reviewRequired || 0,
  unresolved: manifest?.counts?.unresolved || 0,
  canonicalShopperMap: manifest?.counts?.canonicalShopperMap || 0
};

const manifestSafetyOk = manifest?.safety?.firestoreWrites === 0
  && manifest?.safety?.importsExecuted === 0
  && manifest?.safety?.deploy === 0
  && manifest?.safety?.production === 0
  && manifest?.safety?.activeFlow === false
  && manifest?.safety?.executeAllowed === false;

const policyOk = manifest?.policy?.legacyOnly === true
  && manifest?.policy?.noActivationFromHistory === true
  && manifest?.policy?.fingerprintsOnly === true;

let decision = 'review_required';
let reason = 'Legacy communications still need review before DEV readiness can move forward.';
if (!manifest) {
  decision = 'missing_local_input';
  reason = 'Run legacy communications review first.';
} else if (manifestSafetyOk && policyOk) {
  decision = 'history_only_allowed_for_dev_staging_no_active_flows';
  reason = 'Legacy communications are classified as history only, with inactive flow policy and no runtime actions.';
}

const report = {
  generatedAt: new Date().toISOString(),
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    activeFlow: false,
    executeAllowed: false,
    noPlainPiiInReport: true
  },
  inputs: {
    legacyCommunicationReviewManifest: Boolean(manifest)
  },
  counts,
  decision,
  reason,
  policy: {
    devOnly: true,
    importAsHistoryOnlyIfLaterAuthorized: decision === 'history_only_allowed_for_dev_staging_no_active_flows',
    doNotTriggerExternalFlows: true,
    doNotUseRecipientsAsFinalIdentity: true,
    doNotWriteDatabase: true,
    productionStillRequiresReview: true
  },
  next: [
    'Treat legacy communications as inactive history only for DEV readiness analysis.',
    'Do not use unresolved recipients as final identity.',
    'Continue with CANDIDATE_REVIEW before any controlled DEV authorization.'
  ]
};

fs.writeFileSync(path.join(outDir, 'legacyCommunicationsDevPolicyDecision.json'), JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# TyA legacy communications DEV policy decision',
  '',
  `Generated at: ${report.generatedAt}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- activeFlow: false',
  '- executeAllowed: false',
  '- No plain PII in report',
  '',
  '## Inputs',
  `- Legacy communication review manifest: ${report.inputs.legacyCommunicationReviewManifest ? 'found' : 'missing'}`,
  '',
  '## Counts',
  `- Legacy communications: ${counts.legacyCommunications}`,
  `- Matched high confidence: ${counts.matchedHigh}`,
  `- Matched medium confidence: ${counts.matchedMedium}`,
  `- Review required: ${counts.reviewRequired}`,
  `- Unresolved: ${counts.unresolved}`,
  `- Canonical shopper map rows: ${counts.canonicalShopperMap}`,
  '',
  '## Decision',
  `- Decision: ${decision}`,
  `- Reason: ${reason}`,
  '',
  '## Policy',
  '- DEV only.',
  '- History only if later authorized.',
  '- Do not trigger external flows.',
  '- Do not use recipients as final identity.',
  '- Do not write database.',
  '- Production still requires review.',
  '',
  '## Next',
  ...report.next.map((item) => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'legacyCommunicationsDevPolicyDecision.md'), md, 'utf8');
console.log(md);
