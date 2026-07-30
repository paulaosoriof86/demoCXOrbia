import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const LEGACY_URL = process.env.TYA_LEGACY_DATABASE_URL || 'https://tya-plataforma-default-rtdb.firebaseio.com';
const EXPECTED_CANONICAL = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const OUT_JSON = process.env.TYA_LEGACY_REFRESH_JSON || 'app/docs/evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json';
const OUT_MD = process.env.TYA_LEGACY_REFRESH_MD || 'app/docs/evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.md';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (LEGACY_URL !== 'https://tya-plataforma-default-rtdb.firebaseio.com') throw new Error('legacy_target_not_allowed');
if (!credentialPath || !fs.existsSync(credentialPath)) throw new Error('canonical_credential_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
if (sa.project_id !== EXPECTED_CANONICAL) throw new Error(`wrong_canonical_project:${sa.project_id || 'missing'}`);

admin.initializeApp({ credential: admin.credential.cert(sa), projectId: EXPECTED_CANONICAL });
const db = admin.firestore();

const sha = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const stableJson = obj => JSON.stringify(obj, Object.keys(obj).sort());
const norm = v => String(v ?? '').trim();
const normLower = v => norm(v).toLowerCase();
const normPhone = v => norm(v).replace(/\D/g, '');
const cleanDate = v => norm(v) || null;

async function getLegacyNode(path) {
  const url = `${LEGACY_URL}/${path}.json`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 30000);
  try {
    const res = await fetch(url, { method: 'GET', signal: ac.signal, headers: { 'Accept': 'application/json' } });
    const text = await res.text();
    if (!res.ok) throw new Error(`legacy_read_http_${res.status}:${text.slice(0,120)}`);
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('legacy_read_invalid_json'); }
    if (data && typeof data === 'object' && data.error) throw new Error(`legacy_read_error:${data.error}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function toEntries(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((v,i)=>[String(i),v]).filter(([,v])=>v && typeof v === 'object');
  return Object.entries(raw).filter(([,v])=>v && typeof v === 'object');
}

function reducedAttempt(legacyShopperId, h, index) {
  const certId = norm(h?.certId || h?.proyecto || h?.projectId || h?.certificationType);
  const presentedAt = cleanDate(h?.presentedAt || h?.fecha || h?.createdAt);
  const attemptId = norm(h?.id || h?.attemptId) || `derived:${legacyShopperId}:${certId || 'unknown'}:${presentedAt || 'nodate'}:${index}`;
  const approved = h?.aprobado === true || normLower(h?.status) === 'approved' || normLower(h?.status) === 'aprobada';
  const failed = h?.aprobado === false || normLower(h?.status) === 'failed' || normLower(h?.status) === 'reprobada';
  return {
    attemptId,
    legacyShopperId,
    projectId: norm(h?.proyecto || h?.projectId) || null,
    certificationKey: certId || null,
    presentedAt,
    approvedAt: cleanDate(h?.approvedAt) || (approved ? presentedAt : null),
    status: approved ? 'approved' : failed ? 'failed' : (normLower(h?.status) || 'presented'),
    score: Number.isFinite(Number(h?.pct)) ? Number(h.pct) : (Number.isFinite(Number(h?.score)) ? Number(h.score) : null),
    attemptNumber: Number.isFinite(Number(h?.attemptNumber)) ? Number(h.attemptNumber) : null,
    expiresAt: cleanDate(h?.expiresAt || h?.expirationDate),
    source: 'legacy_rtdb.tya_shoppers_extra.histCerts',
  };
}

const rawShoppers = await getLegacyNode('tya_shoppers_extra');
const entries = toEntries(rawShoppers);
const deletedNames = new Set();
const deletedMeta = rawShoppers && typeof rawShoppers === 'object' ? rawShoppers._eliminados : null;
if (Array.isArray(deletedMeta)) deletedMeta.forEach(x => deletedNames.add(normLower(x)));

const seenIds = new Map();
const shoppers = [];
const certifications = [];
const reviewRequired = [];
let excludedDemo = 0;
let excludedDeleted = 0;
let approvedMarkersWithoutAttempt = 0;

for (const [nodeKey, raw] of entries) {
  if (nodeKey === '_eliminados') continue;
  if (raw?.isDemo === true) { excludedDemo++; continue; }
  if (deletedNames.has(normLower(raw?.nombre))) { excludedDeleted++; continue; }
  const legacyShopperId = norm(raw?.id || nodeKey);
  if (!legacyShopperId) {
    reviewRequired.push({ type: 'SHOPPER_WITHOUT_STABLE_ID', nodeFingerprint: sha(nodeKey) });
    continue;
  }
  if (seenIds.has(legacyShopperId)) {
    reviewRequired.push({ type: 'DUPLICATE_LEGACY_SHOPPER_ID', legacyShopperId, nodeFingerprints: [seenIds.get(legacyShopperId), sha(nodeKey)] });
    continue;
  }
  seenIds.set(legacyShopperId, sha(nodeKey));

  const privateAllowed = {
    legacyShopperId,
    code: norm(raw?.codigo || raw?.shopperCode || raw?.username) || null,
    name: norm(raw?.nombre || raw?.name) || null,
    email: normLower(raw?.email) || null,
    phone: normPhone(raw?.wa || raw?.phone || raw?.telefono) || null,
    country: norm(raw?.pais || raw?.country) || null,
    city: norm(raw?.ciudad || raw?.city) || null,
    active: raw?.activo !== false,
    createdAt: cleanDate(raw?.createdAt || raw?.fechaCreacion),
    updatedAt: cleanDate(raw?.updatedAt || raw?.fechaActualizacion),
  };
  const privateFingerprint = sha(JSON.stringify(privateAllowed));
  const emailHash = privateAllowed.email ? sha(privateAllowed.email) : null;
  const phoneHash = privateAllowed.phone ? sha(privateAllowed.phone) : null;
  const nameHash = privateAllowed.name ? sha(normLower(privateAllowed.name)) : null;

  const hist = Array.isArray(raw?.histCerts) ? raw.histCerts : [];
  const attempts = hist.map((h,i)=>reducedAttempt(legacyShopperId,h,i));
  for (const a of attempts) {
    if (!a.certificationKey) reviewRequired.push({ type: 'CERT_ATTEMPT_WITHOUT_CERT_KEY', legacyShopperId, attemptId: a.attemptId });
    certifications.push(a);
  }
  const approvedSet = new Set(attempts.filter(a=>a.status==='approved').map(a=>norm(a.certificationKey).replace(/^proj_/,'')));
  const markers = Array.isArray(raw?.certs) ? raw.certs : [];
  for (const markerRaw of markers) {
    const marker = norm(typeof markerRaw === 'string' ? markerRaw : (markerRaw?.proj || markerRaw?.certId || markerRaw?.projectId));
    if (!marker) continue;
    const normalizedMarker = marker.replace(/^proj_/, '');
    if (approvedSet.has(normalizedMarker)) continue;
    approvedMarkersWithoutAttempt++;
    certifications.push({
      attemptId: `marker:${legacyShopperId}:${normalizedMarker}`,
      legacyShopperId,
      projectId: normalizedMarker === 'general' ? null : normalizedMarker,
      certificationKey: marker,
      presentedAt: null,
      approvedAt: null,
      status: 'approved_marker_only',
      score: null,
      attemptNumber: null,
      expiresAt: null,
      source: 'legacy_rtdb.tya_shoppers_extra.certs',
    });
  }

  shoppers.push({
    legacyShopperId,
    codeHash: privateAllowed.code ? sha(normLower(privateAllowed.code)) : null,
    emailHash,
    phoneHash,
    nameHash,
    country: privateAllowed.country,
    cityPresent: !!privateAllowed.city,
    active: privateAllowed.active,
    createdAt: privateAllowed.createdAt,
    updatedAt: privateAllowed.updatedAt,
    certificationAttemptCount: attempts.length,
    approvedMarkerCount: markers.length,
    recordFingerprint: privateFingerprint,
  });
}

// Canonical DEV read-only comparison. No values are exported; PII is hashed in-memory only.
const canonicalSnap = await db.collection('tenants').doc('tya').collection('shoppers').get();
const canonical = canonicalSnap.docs.map(doc => {
  const d = doc.data() || {};
  const ids = new Set([doc.id, d.id, d.shopperId, d.legacyShopperId, d.sourceKey, d.shopperCode, d.codigo, d.username].map(norm).filter(Boolean));
  const email = normLower(d.email);
  const phone = normPhone(d.wa || d.phone || d.telefono);
  return {
    docId: doc.id,
    ids: [...ids],
    emailHash: email ? sha(email) : null,
    phoneHash: phone ? sha(phone) : null,
    fingerprints: {
      nameHash: (d.nombre || d.name) ? sha(normLower(d.nombre || d.name)) : null,
      country: norm(d.pais || d.country) || null,
      cityPresent: !!norm(d.ciudad || d.city),
      active: d.activo !== false && d.status !== 'inactive',
    }
  };
});
const byId = new Map();
for (const c of canonical) for (const id of c.ids) if (!byId.has(id)) byId.set(id,c);
const byEmail = new Map(canonical.filter(c=>c.emailHash).map(c=>[c.emailHash,c]));
const byPhone = new Map(canonical.filter(c=>c.phoneHash).map(c=>[c.phoneHash,c]));

const shopperDiff = [];
const stats = { exactStableMatch:0, secondaryReviewMatch:0, createCandidate:0, reviewRequired:0, unchangedFingerprintSurface:0 };
for (const s of shoppers) {
  const exact = byId.get(s.legacyShopperId);
  const emailMatch = s.emailHash ? byEmail.get(s.emailHash) : null;
  const phoneMatch = s.phoneHash ? byPhone.get(s.phoneHash) : null;
  let action, basis, canonicalDocId = null;
  if (exact) {
    action='REUSE_OR_UPDATE_BY_STABLE_ID'; basis='stable_id'; canonicalDocId=exact.docId; stats.exactStableMatch++;
  } else if (emailMatch && phoneMatch && emailMatch.docId !== phoneMatch.docId) {
    action='REVIEW_REQUIRED'; basis='email_phone_conflict'; stats.reviewRequired++;
  } else if (emailMatch || phoneMatch) {
    const c=emailMatch||phoneMatch; action='REVIEW_REQUIRED'; basis=emailMatch&&phoneMatch?'email_and_phone_secondary':'secondary_identity'; canonicalDocId=c.docId; stats.secondaryReviewMatch++; stats.reviewRequired++;
  } else {
    action='CREATE_CANDIDATE'; basis='no_stable_match'; stats.createCandidate++;
  }
  shopperDiff.push({ legacyShopperId:s.legacyShopperId, action, basis, canonicalDocId, recordFingerprint:s.recordFingerprint, certificationAttemptCount:s.certificationAttemptCount, approvedMarkerCount:s.approvedMarkerCount });
}

// Duplicate certification IDs are not silently collapsed.
const certIdMap = new Map();
for (const c of certifications) {
  if (!certIdMap.has(c.attemptId)) certIdMap.set(c.attemptId, []);
  certIdMap.get(c.attemptId).push(c);
}
for (const [attemptId, arr] of certIdMap) if (arr.length > 1) {
  reviewRequired.push({ type:'DUPLICATE_CERT_ATTEMPT_ID', attemptId, count:arr.length });
}

const sourceSnapshotHash = sha(JSON.stringify({
  shoppers: shoppers.map(s=>({legacyShopperId:s.legacyShopperId,recordFingerprint:s.recordFingerprint,certificationAttemptCount:s.certificationAttemptCount,approvedMarkerCount:s.approvedMarkerCount})).sort((a,b)=>a.legacyShopperId.localeCompare(b.legacyShopperId)),
  certifications: certifications.map(c=>({attemptId:c.attemptId,legacyShopperId:c.legacyShopperId,projectId:c.projectId,certificationKey:c.certificationKey,presentedAt:c.presentedAt,status:c.status,score:c.score})).sort((a,b)=>a.attemptId.localeCompare(b.attemptId)),
}));

const report = {
  schemaVersion:'tya.legacy.shoppers-certifications-refresh.safe.v1',
  generatedAt:new Date().toISOString(),
  authorizationScope:'READ_ONLY_LEGACY_TYA_SHOPPERS_CERTIFICATIONS_ONLY',
  source:{ system:'TyA Consultores legacy', projectId:'tya-plataforma', databaseType:'Firebase Realtime Database', node:'tya_shoppers_extra', readOnly:true, sourceSnapshotSha256:sourceSnapshotHash },
  canonicalTarget:{ projectId:EXPECTED_CANONICAL, path:'tenants/tya/shoppers', readOnly:true, shoppers:canonicalSnap.size },
  summary:{
    legacyShopperRecords:shoppers.length,
    excludedDemo,
    excludedDeleted,
    certificationRecords:certifications.length,
    historicalAttempts:certifications.filter(c=>c.source.endsWith('.histCerts')).length,
    approvedMarkersWithoutAttempt,
    reviewRequired:reviewRequired.length,
    shopperDiff:stats,
  },
  shopperDiff,
  certifications:certifications.map(c=>({ attemptId:c.attemptId, legacyShopperId:c.legacyShopperId, projectId:c.projectId, certificationKey:c.certificationKey, presentedAt:c.presentedAt, approvedAt:c.approvedAt, status:c.status, score:c.score, attemptNumber:c.attemptNumber, expiresAt:c.expiresAt, source:c.source })),
  reviewRequired,
  discardedFields:['pass','password','passwordHash','dpi','cedula','documentoIdentidad','bank','bankAccount','cuentaBancaria','nda','attachments','incorrectas','detalle','apiKey','token','secret'],
  safety:{
    legacyProviderWrites:0,
    canonicalProviderWrites:0,
    authWrites:0,
    storageWrites:0,
    hostingDeploys:0,
    production:false,
    merge:false,
    rawNamesExported:false,
    rawEmailsExported:false,
    rawPhonesExported:false,
    identityDocumentsExported:false,
    bankDataExported:false,
    questionByQuestionAnswersExported:false,
  }
};

fs.mkdirSync('app/docs/evidence',{recursive:true});
fs.writeFileSync(OUT_JSON, JSON.stringify(report,null,2)+'\n');
const md = [
  '# Legacy TyA — refresh read-only shoppers + certificaciones',
  '',
  `- Fecha: ${report.generatedAt}`,
  '- Fuente: Firebase RTDB `tya-plataforma`, nodo `tya_shoppers_extra` únicamente.',
  '- Alcance: shoppers + historial/marcadores de certificación embebidos. Visitas/finanzas/notificaciones no fueron leídos.',
  `- Snapshot hash: \`${sourceSnapshotHash}\``,
  `- Shoppers legacy útiles: ${report.summary.legacyShopperRecords}`,
  `- Shoppers canónicos existentes: ${canonicalSnap.size}`,
  `- Intentos históricos: ${report.summary.historicalAttempts}`,
  `- Marcadores aprobados sin intento histórico: ${approvedMarkersWithoutAttempt}`,
  `- Registros de certificación totales: ${report.summary.certificationRecords}`,
  `- Match estable: ${stats.exactStableMatch}`,
  `- Create candidates: ${stats.createCandidate}`,
  `- Review required: ${report.summary.reviewRequired}`,
  `- Demo excluidos: ${excludedDemo}; eliminados excluidos: ${excludedDeleted}`,
  '',
  '## Seguridad',
  '- Provider writes legacy/canónico: 0/0.',
  '- Auth/Storage/Hosting/producción/merge: 0/0/0/false/false.',
  '- No se exportaron nombres, emails, teléfonos, DPI, banco, NDA, contraseñas ni respuestas pregunta por pregunta.',
  '- El hash de snapshot permite exigir que una ejecución futura de write use exactamente la misma fuente o se vuelva a planificar.',
  ''
].join('\n');
fs.writeFileSync(OUT_MD, md);
console.log(JSON.stringify({decision:'PASS_LEGACY_SHOPPERS_CERTIFICATIONS_READONLY_REFRESH',sourceSnapshotSha256:sourceSnapshotHash,summary:report.summary,safety:report.safety}));
