import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const candidateDir = process.env.CXORBIA_TYA_SANITIZED_DEV_DIR || path.join(repoRoot, 'tmp', 'tya-sanitized-dev-candidate');
const outDir = process.env.CXORBIA_TYA_SHOPPER_IDENTITY_OUT || path.join(repoRoot, 'tmp', 'tya-shopper-identity-review');
fs.mkdirSync(outDir, { recursive: true });

function readJsonl(file){
  try{ return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)); }
  catch{ return []; }
}
function writeJsonl(file, rows){ fs.writeFileSync(file, rows.map(r => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''), 'utf8'); }
function norm(v){ return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' '); }
function onlyDigits(v){ return String(v || '').replace(/\D+/g, ''); }
function shortHash(v){ return crypto.createHash('sha256').update(String(v || '')).digest('hex').slice(0, 16); }
function pick(row, names){
  for(const name of names){
    if(row && row[name] !== undefined && row[name] !== null && String(row[name]).trim()) return row[name];
  }
  return '';
}
function publicFingerprint(value){ return value ? `sha256:${shortHash(value)}` : ''; }

const shoppers = readJsonl(path.join(candidateDir, 'candidateShoppersSanitized.jsonl'));
const postulations = readJsonl(path.join(candidateDir, 'candidatePostulations.jsonl'));
const visits = readJsonl(path.join(candidateDir, 'candidateVisits.jsonl'));

function identityParts(row){
  const email = norm(pick(row, ['email','correo','mail','shopperEmail','shopper_email']));
  const phone = onlyDigits(pick(row, ['phone','telefono','tel','celular','whatsapp','mobile','shopperPhone']));
  const name = norm(pick(row, ['name','nombre','fullName','shopperName','shopper_nombre']));
  const sourceId = norm(pick(row, ['sourceId','shopperId','uid','id','docId','legacyId']));
  return { email, phone, name, sourceId };
}

function identityKey(parts){
  if(parts.email) return { kind: 'email', key: parts.email, confidence: 'high' };
  if(parts.phone && parts.phone.length >= 8) return { kind: 'phone', key: parts.phone, confidence: 'medium' };
  if(parts.sourceId) return { kind: 'legacy_source_id', key: parts.sourceId, confidence: 'medium' };
  if(parts.name) return { kind: 'name_only', key: parts.name, confidence: 'low_review_required' };
  return { kind: 'missing_identity', key: crypto.randomUUID(), confidence: 'review_required' };
}

const rows = shoppers.map((s, idx) => {
  const parts = identityParts(s);
  const key = identityKey(parts);
  const canonicalShopperId = `shopper_${shortHash(`${key.kind}:${key.key}`)}`;
  return {
    canonicalShopperId,
    sourceDocId: s.docId || '',
    sourceIndex: idx,
    identityKind: key.kind,
    confidence: key.confidence,
    fingerprints: {
      email: publicFingerprint(parts.email),
      phone: publicFingerprint(parts.phone),
      name: publicFingerprint(parts.name),
      sourceId: publicFingerprint(parts.sourceId)
    },
    importPolicy: key.confidence === 'high' ? 'candidate_auto_identity' : 'review_identity_before_write',
    executeAllowed: false
  };
});

const groups = new Map();
for(const row of rows){
  const key = row.canonicalShopperId;
  if(!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}

const duplicateReview = [];
const canonicalMap = [];
for(const [canonicalShopperId, members] of groups.entries()){
  const needsReview = members.length > 1 || members.some(m => m.importPolicy !== 'candidate_auto_identity');
  canonicalMap.push({
    canonicalShopperId,
    memberCount: members.length,
    confidence: members.every(m => m.confidence === 'high') ? 'high' : 'review_required',
    importPolicy: needsReview ? 'review_before_write' : 'candidate_for_dev_staging',
    memberSourceDocIds: members.map(m => m.sourceDocId).filter(Boolean),
    executeAllowed: false
  });
  if(needsReview){
    duplicateReview.push({
      canonicalShopperId,
      reason: members.length > 1 ? 'possible_duplicate_or_same_shopper_multiple_sources' : 'low_confidence_identity',
      memberCount: members.length,
      members,
      action: 'Do not merge automatically in DEV write; review or keep mapped with canonicalShopperId.',
      executeAllowed: false
    });
  }
}

const shopperRefs = [];
for(const row of [...postulations, ...visits]){
  const parts = identityParts(row);
  const key = identityKey(parts);
  const canonicalShopperId = key.kind === 'missing_identity' ? '' : `shopper_${shortHash(`${key.kind}:${key.key}`)}`;
  shopperRefs.push({
    sourceDocId: row.docId || '',
    sourceType: row.type || row.eventType || 'unknown_event_or_visit',
    canonicalShopperId,
    identityKind: key.kind,
    confidence: key.confidence,
    needsReview: !canonicalShopperId || key.confidence !== 'high',
    executeAllowed: false
  });
}

writeJsonl(path.join(outDir, 'shopperIdentityCandidates.jsonl'), rows);
writeJsonl(path.join(outDir, 'canonicalShopperMap.jsonl'), canonicalMap);
writeJsonl(path.join(outDir, 'shopperDuplicateReview.jsonl'), duplicateReview);
writeJsonl(path.join(outDir, 'shopperReferenceReview.jsonl'), shopperRefs.filter(r => r.needsReview));

const manifest = {
  generatedAt: new Date().toISOString(),
  mode: 'shopper-identity-review-no-firestore-writes',
  safety: { firestoreWrites: 0, importsExecuted: 0, deploy: 0, production: 0, executeAllowed: false },
  inputs: { candidateDir },
  counts: {
    shoppers: shoppers.length,
    canonicalShopperCandidates: canonicalMap.length,
    duplicateOrLowConfidenceGroups: duplicateReview.length,
    postulationsAndVisitsChecked: shopperRefs.length,
    eventRefsNeedingReview: shopperRefs.filter(r => r.needsReview).length
  },
  policy: {
    noAutoMerge: true,
    noPlainPiiInReport: true,
    fingerprintsOnly: true,
    writeRequiresManualReview: duplicateReview.length > 0 || shopperRefs.some(r => r.needsReview)
  }
};
fs.writeFileSync(path.join(outDir, 'shopperIdentityReviewManifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

const md = [
  '# TyA shopper identity review',
  '',
  `Generated at: ${manifest.generatedAt}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '- No plain PII in report; fingerprints only',
  '',
  '## Counts',
  `- Shoppers: ${manifest.counts.shoppers}`,
  `- Canonical shopper candidates: ${manifest.counts.canonicalShopperCandidates}`,
  `- Duplicate/low confidence groups: ${manifest.counts.duplicateOrLowConfidenceGroups}`,
  `- Postulation/visit references checked: ${manifest.counts.postulationsAndVisitsChecked}`,
  `- Event references needing review: ${manifest.counts.eventRefsNeedingReview}`,
  '',
  '## Policy',
  '- Do not auto-merge shoppers.',
  '- Use canonicalShopperId as mapping candidate only.',
  '- Keep low confidence identities under review before any DEV write.',
  '- Keep reports free of plain PII.'
].join('\n');
fs.writeFileSync(path.join(outDir, 'shopperIdentityReviewReport.md'), md, 'utf8');
console.log(md);
console.log('');
console.log(`Report dir: ${outDir}`);
