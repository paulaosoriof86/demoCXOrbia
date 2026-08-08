#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const EXPECTED_PROJECT = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const TENANT_ID = 'tya';
const HR_FILE = process.env.CXORBIA_HR_SOURCE_SAFE || 'app/data/tya-hr-source-safe-periods.js';
const OUT_JSON = process.env.CXORBIA_VISIT_CROSSWALK_JSON || 'app/docs/evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json';
const OUT_MD = process.env.CXORBIA_VISIT_CROSSWALK_MD || 'app/docs/evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.md';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialPath || !fs.existsSync(credentialPath)) throw new Error('canonical_credential_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
if (sa.project_id !== EXPECTED_PROJECT) throw new Error(`wrong_canonical_project:${sa.project_id || 'missing'}`);

admin.initializeApp({ credential: admin.credential.cert(sa), projectId: EXPECTED_PROJECT });
const db = admin.firestore();

const sha = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const norm = value => String(value ?? '').trim();
const intOrNull = value => Number.isInteger(Number(value)) ? Number(value) : null;
const safeTechnicalId = value => {
  const s = norm(value);
  return s && s.length <= 160 && /^[A-Za-z0-9_.:!\/-]+$/.test(s) && !s.includes('@') ? s : null;
};
const safeSourceIdentity = value => {
  const s = norm(value);
  return s && s.length <= 160 && !s.includes('@') && !/[\r\n\t]/.test(s) ? s : null;
};

function readJsAssignment(file, globalName) {
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file, timeout: 5000 });
  const value = sandbox.window[globalName];
  if (!value || typeof value !== 'object') throw new Error(`missing_${globalName}`);
  return JSON.parse(JSON.stringify(value));
}

const hr = readJsAssignment(HR_FILE, 'CX_TYA_HR_SOURCE_SAFE');
if (hr.tenantId !== TENANT_ID || hr.sourceSafe !== true || hr.imported === true || hr.production === true) {
  throw new Error('hr_source_safe_contract_mismatch');
}

const canonicalShopperSnap = await db.collection('tenants').doc(TENANT_ID).collection('shoppers').get();
const canonicalShopperIds = new Set(canonicalShopperSnap.docs.map(d => d.id));

const projectRefs = await db.collection('tenants').doc(TENANT_ID).collection('projects').listDocuments();
const backendVisits = [];
for (const projectRef of projectRefs) {
  const snap = await projectRef.collection('visits').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    backendVisits.push({
      docId: doc.id,
      projectDocId: projectRef.id,
      visitId: safeTechnicalId(d.visitId || d.id || doc.id),
      hrRowId: safeSourceIdentity(d.hrRowId),
      sourceSheet: safeSourceIdentity(d.sourceSheet),
      sourceRow: intOrNull(d.sourceRow),
      shopperId: safeTechnicalId(d.shopperId),
      periodKey: safeTechnicalId(d.periodKey),
      country: safeTechnicalId(d.country || d.pais)
    });
  }
}

const visitIndex = new Map();
function addIndex(key, row) {
  if (!key) return;
  if (!visitIndex.has(key)) visitIndex.set(key, []);
  visitIndex.get(key).push(row);
}
for (const row of backendVisits) {
  addIndex(row.visitId ? `visit:${row.visitId}` : null, row);
  addIndex(row.hrRowId ? `hrrow:${row.hrRowId}` : null, row);
  addIndex(row.sourceSheet && row.sourceRow !== null ? `sheetrow:${row.sourceSheet}!${row.sourceRow}` : null, row);
}

const hrVisits = Array.isArray(hr.visits) ? hr.visits : [];
const evidenceRows = [];
const refToTargets = new Map();
const refVisitCounts = new Map();
let visitsWithShopperRef = 0;
let visitMatchesUniqueShopper = 0;
let visitMatchesNoBackendEvidence = 0;
let visitMatchesConflict = 0;
let visitMatchesTargetMissing = 0;

for (const v of hrVisits) {
  const plannedShopperId = safeTechnicalId(v.shopperId);
  if (!plannedShopperId) continue;
  visitsWithShopperRef++;
  refVisitCounts.set(plannedShopperId, (refVisitCounts.get(plannedShopperId) || 0) + 1);

  const keys = [];
  const visitId = safeTechnicalId(v.id || v.visitId);
  const hrRowId = safeSourceIdentity(v.hrRowId);
  const sourceSheet = safeSourceIdentity(v.sourceTab || v.sourceSheet);
  const sourceRow = intOrNull(v.sourceRow);
  if (visitId) keys.push(`visit:${visitId}`);
  if (hrRowId) keys.push(`hrrow:${hrRowId}`);
  if (sourceSheet && sourceRow !== null) keys.push(`sheetrow:${sourceSheet}!${sourceRow}`);

  const candidates = [];
  const seen = new Set();
  for (const key of keys) {
    for (const row of visitIndex.get(key) || []) {
      const sig = `${row.projectDocId}/${row.docId}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      candidates.push(row);
    }
  }

  const targetIds = [...new Set(candidates.map(x => x.shopperId).filter(Boolean))];
  let state = 'UNRESOLVED_NO_BACKEND_VISIT_IDENTITY';
  let resolvedShopperId = null;
  if (!candidates.length || !targetIds.length) {
    visitMatchesNoBackendEvidence++;
  } else if (targetIds.length > 1) {
    state = 'HOLD_CONFLICTING_BACKEND_SHOPPER_IDS';
    visitMatchesConflict++;
  } else if (!canonicalShopperIds.has(targetIds[0])) {
    state = 'HOLD_TARGET_SHOPPER_PROFILE_MISSING';
    resolvedShopperId = targetIds[0];
    visitMatchesTargetMissing++;
  } else {
    state = 'RESOLVED_BY_EXACT_VISIT_IDENTITY';
    resolvedShopperId = targetIds[0];
    visitMatchesUniqueShopper++;
    if (!refToTargets.has(plannedShopperId)) refToTargets.set(plannedShopperId, new Set());
    refToTargets.get(plannedShopperId).add(resolvedShopperId);
  }

  evidenceRows.push({
    plannedShopperId,
    visitId,
    hrRowId,
    sourceSheet,
    sourceRow,
    matchedBackendVisitCount: candidates.length,
    matchedBackendShopperIds: targetIds,
    state,
    resolvedShopperId,
    evidenceKeys: keys
  });
}

const plannedRefs = [...new Set((Array.isArray(hr.shoppers) ? hr.shoppers : []).map(s => safeTechnicalId(s.id)).filter(Boolean))].sort();
const crosswalk = [];
let resolvedRefs = 0;
let conflictRefs = 0;
let unresolvedRefs = 0;
for (const plannedShopperId of plannedRefs) {
  const targets = [...(refToTargets.get(plannedShopperId) || new Set())].sort();
  let action;
  if (targets.length === 1) {
    action = 'REUSE_EXISTING_CANONICAL_SHOPPER';
    resolvedRefs++;
  } else if (targets.length > 1) {
    action = 'HOLD_MULTIPLE_CANONICAL_SHOPPERS';
    conflictRefs++;
  } else {
    action = 'UNRESOLVED_NO_EXACT_VISIT_IDENTITY';
    unresolvedRefs++;
  }
  crosswalk.push({
    plannedShopperId,
    action,
    canonicalShopperId: targets.length === 1 ? targets[0] : null,
    candidateCanonicalShopperIds: targets,
    hrVisitCount: refVisitCounts.get(plannedShopperId) || 0
  });
}

const mappingHash = sha(JSON.stringify(crosswalk));
const report = {
  schemaVersion: 'tya.visit-identity-crosswalk.readonly.v2',
  generatedAt: new Date().toISOString(),
  authorizationScope: 'READ_ONLY_HR_SOURCE_SAFE_PLUS_CANONICAL_EXISTING_VISITS_IDENTITY_ONLY',
  target: { projectId: EXPECTED_PROJECT, tenantId: TENANT_ID, readOnly: true },
  sources: {
    hr: { file: HR_FILE, sourceSafe: true, visits: hrVisits.length, shopperRefs: plannedRefs.length },
    canonical: { projectsScanned: projectRefs.length, visitsScanned: backendVisits.length, shoppersExisting: canonicalShopperSnap.size }
  },
  policy: {
    allowedIdentityEvidence: ['visitId', 'hrRowId', 'sourceSheet+sourceRow'],
    sourceIdentityMayContainSpaces: true,
    nameMatching: false,
    emailMatching: false,
    phoneMatching: false,
    automaticMergeOnName: false,
    requireExistingCanonicalShopperTarget: true,
    conflictPolicy: 'hold_and_review'
  },
  counts: {
    plannedShopperRefs: plannedRefs.length,
    resolvedRefs,
    conflictRefs,
    unresolvedRefs,
    visitsWithShopperRef,
    visitMatchesUniqueShopper,
    visitMatchesNoBackendEvidence,
    visitMatchesConflict,
    visitMatchesTargetMissing
  },
  mappingHashSha256: mappingHash,
  crosswalk,
  visitEvidence: evidenceRows,
  safety: {
    firestoreReadsOnly: true,
    firestoreWrites: 0,
    authWrites: 0,
    storageWrites: 0,
    hrWrites: 0,
    deploys: 0,
    production: false,
    merge: false,
    legacyVisitsRead: false,
    rawNamesExported: false,
    rawEmailsExported: false,
    rawPhonesExported: false,
    identityDocumentsExported: false,
    bankDataExported: false
  }
};

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(OUT_MD, [
  '# TyA — crosswalk read-only por identidad exacta de visita',
  '',
  `- Fecha: ${report.generatedAt}`,
  `- Firebase: \`${EXPECTED_PROJECT}\`, tenant \`${TENANT_ID}\`.` ,
  '- Fuentes: HR source-safe + visitas existentes del backend canónico.',
  '- Evidencia permitida: visitId, hrRowId o sourceSheet+sourceRow exactos.',
  '- Los nombres de pestaña/HR row conservan espacios porque forman parte de la identidad operacional, no son PII de shopper.',
  '- No se leen visitas del legacy.',
  '- No se usa nombre, email ni teléfono para enlazar.',
  '',
  `- Referencias HR: ${plannedRefs.length}.`,
  `- Resueltas a shopper canónico existente: ${resolvedRefs}.`,
  `- Conflicto multi-shopper: ${conflictRefs}.`,
  `- Sin evidencia exacta suficiente: ${unresolvedRefs}.`,
  `- Visitas HR con shopperRef: ${visitsWithShopperRef}.`,
  `- Visitas resueltas por identidad exacta: ${visitMatchesUniqueShopper}.`,
  `- Hash crosswalk: \`${mappingHash}\`.`,
  '',
  '## Seguridad',
  '- Firestore/Auth/Storage/HR writes: 0.',
  '- Deploy/producción/merge: 0/false/false.',
  '- PII cruda exportada: no.',
  ''
].join('\n'));

console.log(JSON.stringify({
  decision: 'PASS_VISIT_IDENTITY_CROSSWALK_READONLY_V2',
  counts: report.counts,
  mappingHashSha256: mappingHash,
  safety: report.safety
}, null, 2));
