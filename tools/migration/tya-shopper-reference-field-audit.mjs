import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const candidateDir = process.env.CXORBIA_TYA_SANITIZED_DEV_DIR || path.join(repoRoot, 'tmp', 'tya-sanitized-dev-candidate');
const identityDir = process.env.CXORBIA_TYA_SHOPPER_IDENTITY_OUT || path.join(repoRoot, 'tmp', 'tya-shopper-identity-review');
const outDir = path.join(repoRoot, 'tmp', 'tya-shopper-reference-field-audit');
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

function flattenKeys(row, prefix = '') {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return [];
  const keys = [];
  for (const [key, value] of Object.entries(row)) {
    const full = prefix ? `${prefix}.${key}` : key;
    keys.push(full);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, full));
    }
  }
  return keys;
}

function fieldPresence(rows) {
  const total = rows.length;
  const counts = {};
  for (const row of rows) {
    const keys = new Set(flattenKeys(row));
    for (const key of keys) counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([field, count]) => ({ field, count, pct: total ? Number(((count / total) * 100).toFixed(2)) : 0 }));
}

function countIdentitySignals(rows) {
  const signals = {
    explicitShopperId: 0,
    explicitShopperSourceId: 0,
    shopperEmailValue: 0,
    shopperPhoneValue: 0,
    shopperNameValue: 0,
    hasEmailFlag: 0,
    hasPhoneFlag: 0,
    hasNameFlag: 0,
    genericSourceId: 0,
    genericDocId: 0,
    sourceRefSourceKey: 0
  };
  for (const row of rows) {
    if (row?.shopperId || row?.shopper_id || row?.legacyShopperId) signals.explicitShopperId += 1;
    if (row?.shopperSourceId || row?.legacyShopperSourceId || row?.sourceShopperId) signals.explicitShopperSourceId += 1;
    if (row?.shopperEmail || row?.shopperEmailRaw || row?.emailRaw || row?.email) signals.shopperEmailValue += 1;
    if (row?.shopperPhone || row?.shopperPhoneRaw || row?.phoneRaw || row?.phone) signals.shopperPhoneValue += 1;
    if (row?.shopperName || row?.shopperNameRaw || row?.nameRaw || row?.name) signals.shopperNameValue += 1;
    if (row?.hasEmail === true || row?.hasEmail === 'true') signals.hasEmailFlag += 1;
    if (row?.hasPhone === true || row?.hasPhone === 'true') signals.hasPhoneFlag += 1;
    if (row?.hasName === true || row?.hasShopperName === true || row?.hasName === 'true' || row?.hasShopperName === 'true') signals.hasNameFlag += 1;
    if (row?.sourceId) signals.genericSourceId += 1;
    if (row?.docId) signals.genericDocId += 1;
    if (row?.sourceRef?.sourceKey) signals.sourceRefSourceKey += 1;
  }
  return signals;
}

function countBy(rows, keyOrFn) {
  const out = {};
  for (const row of rows) {
    const value = typeof keyOrFn === 'function' ? keyOrFn(row) : row?.[keyOrFn];
    const safeValue = String(value || 'missing');
    out[safeValue] = (out[safeValue] || 0) + 1;
  }
  return Object.entries(out).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function tableRows(entries) {
  return entries.length ? entries.map(([key, value]) => `| ${key} | ${value} |`) : ['| none | 0 |'];
}

function presenceRows(entries) {
  return entries.length ? entries.map((entry) => `| ${entry.field} | ${entry.count} | ${entry.pct.toFixed(2)}% |`) : ['| none | 0 | 0.00% |'];
}

function signalRows(signals) {
  return Object.entries(signals).map(([key, value]) => `| ${key} | ${value} |`);
}

const visits = readJsonl(path.join(candidateDir, 'candidateVisits.jsonl'));
const postulations = readJsonl(path.join(candidateDir, 'candidatePostulations.jsonl'));
const shoppers = readJsonl(path.join(candidateDir, 'candidateShoppersSanitized.jsonl'));
const referenceReview = readJsonl(path.join(identityDir, 'shopperReferenceReview.jsonl'));
const canonicalMap = readJsonl(path.join(identityDir, 'canonicalShopperMap.jsonl'));
const candidates = readJsonl(path.join(identityDir, 'shopperIdentityCandidates.jsonl'));

const visitSignals = countIdentitySignals(visits);
const postulationSignals = countIdentitySignals(postulations);
const shopperSignals = countIdentitySignals(shoppers);

function classifyReferenceAvailability(signals, total) {
  if (!total) return 'missing_rows';
  if (signals.explicitShopperId || signals.explicitShopperSourceId || signals.shopperEmailValue || signals.shopperPhoneValue || signals.shopperNameValue) {
    return 'explicit_identity_available';
  }
  if (signals.hasEmailFlag || signals.hasPhoneFlag || signals.hasNameFlag) {
    return 'only_identity_presence_flags_available';
  }
  if (signals.genericSourceId || signals.genericDocId || signals.sourceRefSourceKey) {
    return 'only_generic_event_or_source_keys_available';
  }
  return 'no_identity_signal_available';
}

const decision = {
  visits: classifyReferenceAvailability(visitSignals, visits.length),
  postulations: classifyReferenceAvailability(postulationSignals, postulations.length),
  shoppers: classifyReferenceAvailability(shopperSignals, shoppers.length)
};

const likelyCause = (decision.visits !== 'explicit_identity_available' || decision.postulations !== 'explicit_identity_available')
  ? 'shopper_reference_review_probably_uses_generic_event_keys_instead_of_shopper_identity'
  : 'explicit_identity_fields_present_review_mapping_logic_next';

const summary = {
  generatedAt: new Date().toISOString(),
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false,
    noValuesPrinted: true,
    fieldNamesAndCountsOnly: true
  },
  inputs: {
    candidateDir,
    identityDir,
    candidateVisits: exists(path.join(candidateDir, 'candidateVisits.jsonl')),
    candidatePostulations: exists(path.join(candidateDir, 'candidatePostulations.jsonl')),
    candidateShoppersSanitized: exists(path.join(candidateDir, 'candidateShoppersSanitized.jsonl')),
    shopperReferenceReview: exists(path.join(identityDir, 'shopperReferenceReview.jsonl')),
    canonicalShopperMap: exists(path.join(identityDir, 'canonicalShopperMap.jsonl')),
    shopperIdentityCandidates: exists(path.join(identityDir, 'shopperIdentityCandidates.jsonl'))
  },
  counts: {
    visits: visits.length,
    postulations: postulations.length,
    shoppers: shoppers.length,
    referenceReviewRows: referenceReview.length,
    canonicalRows: canonicalMap.length,
    candidateRows: candidates.length
  },
  decisions: decision,
  likelyCause,
  signals: {
    visits: visitSignals,
    postulations: postulationSignals,
    shoppers: shopperSignals
  },
  referenceReviewBySourceType: Object.fromEntries(countBy(referenceReview, 'sourceType')),
  referenceReviewByIdentityKind: Object.fromEntries(countBy(referenceReview, 'identityKind')),
  referenceReviewByConfidence: Object.fromEntries(countBy(referenceReview, 'confidence')),
  fields: {
    visits: fieldPresence(visits),
    postulations: fieldPresence(postulations),
    shoppers: fieldPresence(shoppers)
  }
};

fs.writeFileSync(path.join(outDir, 'shopperReferenceFieldAudit.json'), JSON.stringify(summary, null, 2), 'utf8');

const md = [
  '# TyA shopper reference field audit',
  '',
  `Generated at: ${summary.generatedAt}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '- No values printed; field names and counts only',
  '',
  '## Inputs',
  `- candidateVisits.jsonl: ${summary.inputs.candidateVisits ? 'found' : 'missing'}`,
  `- candidatePostulations.jsonl: ${summary.inputs.candidatePostulations ? 'found' : 'missing'}`,
  `- candidateShoppersSanitized.jsonl: ${summary.inputs.candidateShoppersSanitized ? 'found' : 'missing'}`,
  `- shopperReferenceReview.jsonl: ${summary.inputs.shopperReferenceReview ? 'found' : 'missing'}`,
  `- canonicalShopperMap.jsonl: ${summary.inputs.canonicalShopperMap ? 'found' : 'missing'}`,
  `- shopperIdentityCandidates.jsonl: ${summary.inputs.shopperIdentityCandidates ? 'found' : 'missing'}`,
  '',
  '## Counts',
  `- Visits: ${summary.counts.visits}`,
  `- Postulations: ${summary.counts.postulations}`,
  `- Shoppers: ${summary.counts.shoppers}`,
  `- Reference review rows: ${summary.counts.referenceReviewRows}`,
  `- Canonical rows: ${summary.counts.canonicalRows}`,
  `- Candidate rows: ${summary.counts.candidateRows}`,
  '',
  '## Identity signal classification',
  `- Visits: ${summary.decisions.visits}`,
  `- Postulations: ${summary.decisions.postulations}`,
  `- Shoppers: ${summary.decisions.shoppers}`,
  `- Likely cause: ${summary.likelyCause}`,
  '',
  '## Visit identity signals',
  '| signal | count |',
  '|---|---:|',
  ...signalRows(summary.signals.visits),
  '',
  '## Postulation identity signals',
  '| signal | count |',
  '|---|---:|',
  ...signalRows(summary.signals.postulations),
  '',
  '## Shopper identity signals',
  '| signal | count |',
  '|---|---:|',
  ...signalRows(summary.signals.shoppers),
  '',
  '## Reference review by sourceType',
  '| sourceType | count |',
  '|---|---:|',
  ...tableRows(countBy(referenceReview, 'sourceType')),
  '',
  '## Reference review by identityKind',
  '| identityKind | count |',
  '|---|---:|',
  ...tableRows(countBy(referenceReview, 'identityKind')),
  '',
  '## Top visit fields',
  '| field | count | pct |',
  '|---|---:|---:|',
  ...presenceRows(summary.fields.visits.slice(0, 40)),
  '',
  '## Top postulation fields',
  '| field | count | pct |',
  '|---|---:|---:|',
  ...presenceRows(summary.fields.postulations.slice(0, 40)),
  '',
  '## Top shopper fields',
  '| field | count | pct |',
  '|---|---:|---:|',
  ...presenceRows(summary.fields.shoppers.slice(0, 40)),
  '',
  '## Interpretation guide',
  '- `explicit_identity_available` means there is a direct shopper identity field available in the sanitized candidate rows.',
  '- `only_identity_presence_flags_available` means the row only says whether identity exists, but does not include the identity value.',
  '- `only_generic_event_or_source_keys_available` means the current row can be identified as an event/source row, but cannot safely identify a shopper.',
  '- `shopper_reference_review_probably_uses_generic_event_keys_instead_of_shopper_identity` means the prior review likely produced false strict blockers from event IDs, not shopper IDs.',
  '',
  '## Next action',
  '- Use this report to decide whether to adjust the shopper identity review tool before rerunning readiness.'
].join('\n');

fs.writeFileSync(path.join(outDir, 'shopperReferenceFieldAudit.md'), md, 'utf8');
console.log(md);
