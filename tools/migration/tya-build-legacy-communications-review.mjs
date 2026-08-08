import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const candidateDir = process.env.CXORBIA_TYA_SANITIZED_DEV_DIR || path.join(repoRoot, 'tmp', 'tya-sanitized-dev-candidate');
const shopperIdentityDir = process.env.CXORBIA_TYA_SHOPPER_IDENTITY_DIR || path.join(repoRoot, 'tmp', 'tya-shopper-identity-review');
const outDir = process.env.CXORBIA_TYA_LEGACY_COMM_REVIEW_OUT || path.join(repoRoot, 'tmp', 'tya-legacy-communications-review');
fs.mkdirSync(outDir, { recursive: true });

function readJsonl(file){ try { return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse); } catch { return []; } }
function writeJsonl(file, rows){ fs.writeFileSync(file, rows.map(r => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''), 'utf8'); }
function norm(v){ return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' '); }
function digits(v){ return String(v || '').replace(/\D+/g, ''); }
function hash(v){ return crypto.createHash('sha256').update(String(v || '')).digest('hex').slice(0, 16); }
function fp(v){ return v ? `sha256:${hash(v)}` : ''; }
function pick(row, keys){ for(const k of keys){ if(row?.[k] !== undefined && row?.[k] !== null && String(row[k]).trim()) return row[k]; } return ''; }

const communications = readJsonl(path.join(candidateDir, 'candidateNotificationsHistory.jsonl'));
const identityRows = readJsonl(path.join(shopperIdentityDir, 'shopperIdentityCandidates.jsonl'));
const canonicalMap = readJsonl(path.join(shopperIdentityDir, 'canonicalShopperMap.jsonl'));

const byEmail = new Map();
const byPhone = new Map();
const byName = new Map();
for(const r of identityRows){
  if(r.fingerprints?.email) byEmail.set(r.fingerprints.email, r.canonicalShopperId);
  if(r.fingerprints?.phone) byPhone.set(r.fingerprints.phone, r.canonicalShopperId);
  if(r.fingerprints?.name) byName.set(r.fingerprints.name, r.canonicalShopperId);
}

function parts(row){
  return {
    email: norm(pick(row, ['email','recipientEmail','toEmail','correo','mail','shopperEmail'])),
    phone: digits(pick(row, ['phone','recipientPhone','toPhone','telefono','celular','mobile'])),
    name: norm(pick(row, ['name','recipientName','toName','nombre','shopperName'])),
    role: norm(pick(row, ['role','recipientRole','perfil','targetRole','audience']))
  };
}
function resolve(p){
  const efp = fp(p.email), pfp = fp(p.phone), nfp = fp(p.name);
  if(efp && byEmail.has(efp)) return { status: 'matched_email', confidence: 'high', canonicalShopperId: byEmail.get(efp), via: 'email' };
  if(pfp && byPhone.has(pfp)) return { status: 'matched_phone', confidence: 'medium', canonicalShopperId: byPhone.get(pfp), via: 'phone' };
  if(nfp && byName.has(nfp)) return { status: 'name_match_review', confidence: 'low_review', canonicalShopperId: byName.get(nfp), via: 'name' };
  if(p.role) return { status: 'role_review', confidence: 'review', canonicalShopperId: '', via: 'role' };
  return { status: 'unresolved', confidence: 'review', canonicalShopperId: '', via: 'none' };
}

const rows = communications.map((c, index) => {
  const p = parts(c);
  const r = resolve(p);
  return {
    sourceDocId: c.docId || '',
    sourceIndex: index,
    legacyType: c.type || c.eventType || c.kind || '',
    legacyDate: c.createdAt || c.date || c.timestamp || '',
    fingerprints: { email: fp(p.email), phone: fp(p.phone), name: fp(p.name), role: fp(p.role) },
    resolutionStatus: r.status,
    confidence: r.confidence,
    canonicalShopperId: r.canonicalShopperId,
    matchedVia: r.via,
    importPolicy: 'history_only',
    activeFlow: false,
    executeAllowed: false
  };
});
const reviewRows = rows.filter(r => r.confidence !== 'high');
const unresolved = rows.filter(r => r.resolutionStatus === 'unresolved');

writeJsonl(path.join(outDir, 'legacyCommunicationReview.jsonl'), rows);
writeJsonl(path.join(outDir, 'legacyCommunicationReviewRequired.jsonl'), reviewRows);
writeJsonl(path.join(outDir, 'legacyCommunicationUnresolved.jsonl'), unresolved);

const manifest = {
  generatedAt: new Date().toISOString(),
  mode: 'legacy-communications-review-history-only',
  safety: { firestoreWrites: 0, importsExecuted: 0, deploy: 0, production: 0, activeFlow: false, executeAllowed: false },
  counts: {
    legacyCommunications: communications.length,
    matchedHigh: rows.filter(r => r.confidence === 'high').length,
    matchedMedium: rows.filter(r => r.confidence === 'medium').length,
    reviewRequired: reviewRows.length,
    unresolved: unresolved.length,
    canonicalShopperMap: canonicalMap.length
  },
  policy: {
    legacyOnly: true,
    noActivationFromHistory: true,
    fingerprintsOnly: true,
    futureActiveFlowsRequireBackendTenantRules: true
  }
};
fs.writeFileSync(path.join(outDir, 'legacyCommunicationReviewManifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
const md = [
  '# TyA legacy communications review', '',
  `Generated at: ${manifest.generatedAt}`, '',
  '## Safety', '- Firestore writes: 0', '- Imports executed: 0', '- Deploy: 0', '- Production: 0', '- activeFlow: false', '- executeAllowed: false', '- No plain PII in report; fingerprints only', '',
  '## Counts',
  `- Legacy communications: ${manifest.counts.legacyCommunications}`,
  `- Matched high confidence: ${manifest.counts.matchedHigh}`,
  `- Matched medium confidence: ${manifest.counts.matchedMedium}`,
  `- Review required: ${manifest.counts.reviewRequired}`,
  `- Unresolved: ${manifest.counts.unresolved}`,
  `- Canonical shopper map rows: ${manifest.counts.canonicalShopperMap}`,
  '',
  '## Policy', '- Keep legacy communications as history only.', '- Do not activate flows from migration history.', '- Future active flows require backend tenant rules.'
].join('\n');
fs.writeFileSync(path.join(outDir, 'legacyCommunicationReviewReport.md'), md, 'utf8');
console.log(md);
console.log('');
console.log(`Report dir: ${outDir}`);
