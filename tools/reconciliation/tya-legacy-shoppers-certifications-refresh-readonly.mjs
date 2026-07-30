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
const norm = v => String(v ?? '').trim();
const normLower = v => norm(v).toLowerCase();
const normPhone = v => norm(v).replace(/\D/g, '');
const cleanDate = v => norm(v) || null;
const nonEmpty = v => v !== null && v !== undefined && norm(v) !== '';

async function getLegacyNode(path) {
  const url = `${LEGACY_URL}/${path}.json`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 30000);
  try {
    const res = await fetch(url, { method: 'GET', signal: ac.signal, headers: { Accept: 'application/json' } });
    const text = await res.text();
    if (!res.ok) throw new Error(`legacy_read_http_${res.status}:${text.slice(0,120)}`);
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('legacy_read_invalid_json'); }
    if (data && typeof data === 'object' && data.error) throw new Error(`legacy_read_error:${data.error}`);
    return data;
  } finally { clearTimeout(timer); }
}

function toEntries(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((v,i)=>[String(i),v]).filter(([,v])=>v && typeof v === 'object');
  return Object.entries(raw).filter(([,v])=>v && typeof v === 'object');
}

function privateAllowed(stableId, raw) {
  return {
    legacyShopperId: stableId,
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
}

function richness(raw) {
  const p = privateAllowed(norm(raw?.id), raw);
  return Object.values(p).filter(nonEmpty).length + (Array.isArray(raw?.histCerts) ? raw.histCerts.length * 3 : 0) + (Array.isArray(raw?.certs) ? raw.certs.length : 0);
}

function reducedAttempt(legacyShopperId, h, index) {
  const certId = norm(h?.certId || h?.proyecto || h?.projectId || h?.certificationType);
  const presentedAt = cleanDate(h?.presentedAt || h?.fecha || h?.createdAt);
  const attemptId = norm(h?.id || h?.attemptId) || `derived:${legacyShopperId}:${certId || 'unknown'}:${presentedAt || 'nodate'}:${index}`;
  const approved = h?.aprobado === true || ['approved','aprobada'].includes(normLower(h?.status));
  const failed = h?.aprobado === false || ['failed','reprobada'].includes(normLower(h?.status));
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
    source: 'legacy_rtdb.tya_shoppers_extra.histCerts'
  };
}

function attemptSurface(a) {
  return JSON.stringify({ certificationKey:a.certificationKey, projectId:a.projectId, presentedAt:a.presentedAt, approvedAt:a.approvedAt, status:a.status, score:a.score, attemptNumber:a.attemptNumber, expiresAt:a.expiresAt });
}

const rawShoppers = await getLegacyNode('tya_shoppers_extra');
const entries = toEntries(rawShoppers);
const deletedNames = new Set();
const deletedMeta = rawShoppers && typeof rawShoppers === 'object' ? rawShoppers._eliminados : null;
if (Array.isArray(deletedMeta)) deletedMeta.forEach(x => deletedNames.add(normLower(x)));

let excludedDemo = 0, excludedDeleted = 0, excludedKnownBootstrap = 0;
const reviewRequired = [];
const rawGroups = new Map();
const knownBootstrapIds = new Set(['S001','S002']); // hardcoded fixture IDs in legacy public/index.html; never auto-migrate.

for (const [nodeKey, raw] of entries) {
  if (nodeKey === '_eliminados') continue;
  if (raw?.isDemo === true) { excludedDemo++; continue; }
  const stableId = norm(raw?.id || nodeKey);
  if (!stableId) { reviewRequired.push({ type:'SHOPPER_WITHOUT_STABLE_ID', nodeFingerprint:sha(nodeKey) }); continue; }
  if (knownBootstrapIds.has(stableId)) { excludedKnownBootstrap++; continue; }
  if (deletedNames.has(normLower(raw?.nombre))) { excludedDeleted++; continue; }
  if (!rawGroups.has(stableId)) rawGroups.set(stableId, []);
  rawGroups.get(stableId).push({ nodeKey, raw });
}

const shoppers = [];
const certifications = [];
let duplicateStorageRepresentationsCollapsed = 0;
let duplicateStableIds = 0;
let approvedMarkersWithoutAttempt = 0;
let stableIdCoreConflicts = 0;
let duplicateAttemptConflicts = 0;

for (const [stableId, group] of [...rawGroups.entries()].sort((a,b)=>a[0].localeCompare(b[0]))) {
  if (group.length > 1) { duplicateStableIds++; duplicateStorageRepresentationsCollapsed += group.length - 1; }
  const ordered = [...group].sort((a,b)=>{
    const aExact = a.nodeKey === stableId ? 1 : 0, bExact = b.nodeKey === stableId ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;
    return richness(b.raw) - richness(a.raw);
  });
  const mergedRaw = { ...ordered[0].raw, id: stableId };
  const conflictFields = new Set();
  const core = [
    ['code', r=>norm(r?.codigo || r?.shopperCode || r?.username)],
    ['name', r=>normLower(r?.nombre || r?.name)],
    ['email', r=>normLower(r?.email)],
    ['phone', r=>normPhone(r?.wa || r?.phone || r?.telefono)],
    ['country', r=>normLower(r?.pais || r?.country)],
  ];
  for (const [field, pick] of core) {
    const vals = [...new Set(group.map(x=>pick(x.raw)).filter(Boolean))];
    if (vals.length > 1) conflictFields.add(field);
  }
  if (conflictFields.size) {
    stableIdCoreConflicts++;
    reviewRequired.push({ type:'LEGACY_STABLE_ID_FIELD_CONFLICT', legacyShopperId:stableId, fields:[...conflictFields].sort(), representations:group.length });
  }

  // Fill missing allowed fields from duplicate representations only; never overwrite a non-empty preferred value.
  for (const { raw } of ordered.slice(1)) {
    for (const key of ['codigo','shopperCode','username','nombre','name','email','wa','phone','telefono','pais','country','ciudad','city','createdAt','fechaCreacion','updatedAt','fechaActualizacion']) {
      if (!nonEmpty(mergedRaw[key]) && nonEmpty(raw?.[key])) mergedRaw[key] = raw[key];
    }
    if (mergedRaw.activo === undefined && raw?.activo !== undefined) mergedRaw.activo = raw.activo;
  }

  // Union attempts by exact attempt ID; duplicate storage copies collapse. Conflicting same-ID attempts go to review.
  const attemptMap = new Map();
  for (const { raw } of group) {
    const hist = Array.isArray(raw?.histCerts) ? raw.histCerts : [];
    hist.forEach((h,i)=>{
      const a = reducedAttempt(stableId,h,i);
      if (!attemptMap.has(a.attemptId)) attemptMap.set(a.attemptId,a);
      else if (attemptSurface(attemptMap.get(a.attemptId)) !== attemptSurface(a)) {
        duplicateAttemptConflicts++;
        reviewRequired.push({ type:'CERT_ATTEMPT_CONFLICT_SAME_ID', legacyShopperId:stableId, attemptId:a.attemptId, fields:['certificationKey','projectId','presentedAt','approvedAt','status','score','attemptNumber','expiresAt'] });
      }
    });
  }
  const attempts = [...attemptMap.values()].sort((a,b)=>String(a.presentedAt||'').localeCompare(String(b.presentedAt||'')) || a.attemptId.localeCompare(b.attemptId));
  for (const a of attempts) {
    if (!a.certificationKey) reviewRequired.push({ type:'CERT_ATTEMPT_WITHOUT_CERT_KEY', legacyShopperId:stableId, attemptId:a.attemptId });
    certifications.push(a);
  }

  const markerMap = new Map();
  for (const { raw } of group) for (const markerRaw of (Array.isArray(raw?.certs) ? raw.certs : [])) {
    const marker = norm(typeof markerRaw === 'string' ? markerRaw : (markerRaw?.proj || markerRaw?.certId || markerRaw?.projectId));
    if (marker) markerMap.set(marker.replace(/^proj_/,''), marker);
  }
  const approvedSet = new Set(attempts.filter(a=>a.status==='approved').map(a=>norm(a.certificationKey).replace(/^proj_/,'')));
  for (const [normalizedMarker, marker] of markerMap) {
    if (approvedSet.has(normalizedMarker)) continue;
    approvedMarkersWithoutAttempt++;
    certifications.push({
      attemptId:`marker:${stableId}:${normalizedMarker}`,
      legacyShopperId:stableId,
      projectId:normalizedMarker === 'general' ? null : normalizedMarker,
      certificationKey:marker,
      presentedAt:null, approvedAt:null, status:'approved_marker_only', score:null, attemptNumber:null, expiresAt:null,
      source:'legacy_rtdb.tya_shoppers_extra.certs'
    });
  }

  const p = privateAllowed(stableId, mergedRaw);
  shoppers.push({
    legacyShopperId:stableId,
    codeHash:p.code ? sha(normLower(p.code)) : null,
    emailHash:p.email ? sha(p.email) : null,
    phoneHash:p.phone ? sha(p.phone) : null,
    nameHash:p.name ? sha(normLower(p.name)) : null,
    country:p.country,
    cityPresent:!!p.city,
    active:p.active,
    createdAt:p.createdAt,
    updatedAt:p.updatedAt,
    certificationAttemptCount:attempts.length,
    approvedMarkerCount:markerMap.size,
    sourceRepresentationCount:group.length,
    recordFingerprint:sha(JSON.stringify(p))
  });
}

// Canonical DEV read-only comparison. Identity values stay in memory; output contains only safe counts/hashes/internal IDs.
const canonicalSnap = await db.collection('tenants').doc('tya').collection('shoppers').get();
const canonicalFieldNames = new Set();
const migratedFromCategories = {};
const idPatternCounts = {};
const canonicalPresence = { email:0, phone:0, code:0, name:0, country:0, migratedFrom:0 };
function idPattern(id) {
  if (/^shopper_(gt|hn)_[a-f0-9]{10}$/i.test(id)) return 'hr_protected_hash';
  if (/^S(HR|_)|^HRSH_/i.test(id)) return 'legacy_like';
  if (/^sh_/i.test(id)) return 'sh_prefix';
  return 'other';
}
function migratedCategory(v) {
  const s=normLower(v);
  if (!s) return 'empty';
  if (s.includes('hr')) return 'hr';
  if (s.includes('legacy')||s.includes('shopper')) return 'legacy_or_shopper';
  if (s.includes('tya')) return 'tya';
  return 'other';
}
const canonical = canonicalSnap.docs.map(doc => {
  const d=doc.data()||{};
  Object.keys(d).forEach(k=>canonicalFieldNames.add(k));
  const migratedFrom=norm(d.migratedFrom);
  if (migratedFrom) canonicalPresence.migratedFrom++;
  const mc=migratedCategory(migratedFrom); migratedFromCategories[mc]=(migratedFromCategories[mc]||0)+1;
  const ip=idPattern(doc.id); idPatternCounts[ip]=(idPatternCounts[ip]||0)+1;
  const email=normLower(d.email), phone=normPhone(d.wa||d.phone||d.telefono), code=norm(d.code||d.shopperCode||d.codigo||d.username), name=norm(d.nombre||d.name||[d.firstName,d.lastName].filter(Boolean).join(' ')), country=norm(d.pais||d.country);
  if(email)canonicalPresence.email++; if(phone)canonicalPresence.phone++; if(code)canonicalPresence.code++; if(name)canonicalPresence.name++; if(country)canonicalPresence.country++;
  const ids=new Set([doc.id,d.id,d.shopperId,d.legacyShopperId,d.sourceKey,d.shopperCode,d.codigo,d.username,d.migratedFrom].map(norm).filter(Boolean));
  return { docId:doc.id, ids:[...ids], emailHash:email?sha(email):null, phoneHash:phone?sha(phone):null, codeHash:code?sha(normLower(code)):null, nameHash:name?sha(normLower(name)):null, country:country||null };
});
const multiMap = selector => {
  const m=new Map();
  for(const c of canonical){const v=selector(c);if(!v)continue;if(!m.has(v))m.set(v,[]);m.get(v).push(c);}
  return m;
};
const byId=new Map(); for(const c of canonical)for(const id of c.ids)if(!byId.has(id))byId.set(id,c);
const byEmail=multiMap(c=>c.emailHash), byPhone=multiMap(c=>c.phoneHash), byCode=multiMap(c=>c.codeHash), byName=multiMap(c=>c.nameHash);

const shopperDiff=[];
const stats={ exactStableMatch:0, exactCodeMatch:0, strongSecondaryReview:0, weakSecondaryReview:0, createCandidate:0, reviewRequired:0, nameOnlyDiagnosticOverlap:0 };
for(const s of shoppers){
  const exact=byId.get(s.legacyShopperId);
  const codeMatches=s.codeHash?(byCode.get(s.codeHash)||[]):[];
  const emailMatches=s.emailHash?(byEmail.get(s.emailHash)||[]):[];
  const phoneMatches=s.phoneHash?(byPhone.get(s.phoneHash)||[]):[];
  const nameMatches=s.nameHash?(byName.get(s.nameHash)||[]):[];
  if(nameMatches.length)stats.nameOnlyDiagnosticOverlap++; // diagnostic only; NEVER a matching basis.
  const codeUnique=codeMatches.length===1?codeMatches[0]:null;
  const emailUnique=emailMatches.length===1?emailMatches[0]:null;
  const phoneUnique=phoneMatches.length===1?phoneMatches[0]:null;
  let action,basis,canonicalDocId=null;
  if(exact){action='REUSE_OR_UPDATE_BY_STABLE_ID';basis='stable_id_or_migratedFrom';canonicalDocId=exact.docId;stats.exactStableMatch++;}
  else if(codeUnique){action='REUSE_OR_UPDATE_BY_STABLE_CODE';basis='stable_code';canonicalDocId=codeUnique.docId;stats.exactCodeMatch++;}
  else if(emailUnique&&phoneUnique&&emailUnique.docId===phoneUnique.docId){action='REVIEW_REQUIRED';basis='email_and_phone_same_doc';canonicalDocId=emailUnique.docId;stats.strongSecondaryReview++;stats.reviewRequired++;}
  else if((emailUnique&&phoneUnique&&emailUnique.docId!==phoneUnique.docId)||emailMatches.length>1||phoneMatches.length>1||codeMatches.length>1){action='REVIEW_REQUIRED';basis='identity_key_conflict_or_nonunique';stats.reviewRequired++;}
  else if(emailUnique||phoneUnique){const c=emailUnique||phoneUnique;action='REVIEW_REQUIRED';basis=emailUnique?'email_only_secondary':'phone_only_secondary';canonicalDocId=c.docId;stats.weakSecondaryReview++;stats.reviewRequired++;}
  else{action='CREATE_CANDIDATE';basis='no_stable_or_secondary_match';stats.createCandidate++;}
  shopperDiff.push({legacyShopperId:s.legacyShopperId,action,basis,canonicalDocId,recordFingerprint:s.recordFingerprint,certificationAttemptCount:s.certificationAttemptCount,approvedMarkerCount:s.approvedMarkerCount,sourceRepresentationCount:s.sourceRepresentationCount});
}

const certIdMap=new Map();
for(const c of certifications){if(!certIdMap.has(c.attemptId))certIdMap.set(c.attemptId,[]);certIdMap.get(c.attemptId).push(c);}
for(const [attemptId,arr] of certIdMap)if(arr.length>1)reviewRequired.push({type:'DUPLICATE_CERT_ATTEMPT_ID_AFTER_COLLAPSE',attemptId,count:arr.length});

const sourceSnapshotHash=sha(JSON.stringify({
  shoppers:shoppers.map(s=>({legacyShopperId:s.legacyShopperId,recordFingerprint:s.recordFingerprint,certificationAttemptCount:s.certificationAttemptCount,approvedMarkerCount:s.approvedMarkerCount})).sort((a,b)=>a.legacyShopperId.localeCompare(b.legacyShopperId)),
  certifications:certifications.map(c=>({attemptId:c.attemptId,legacyShopperId:c.legacyShopperId,projectId:c.projectId,certificationKey:c.certificationKey,presentedAt:c.presentedAt,status:c.status,score:c.score})).sort((a,b)=>a.attemptId.localeCompare(b.attemptId))
}));

const report={
  schemaVersion:'tya.legacy.shoppers-certifications-refresh.safe.v2',
  generatedAt:new Date().toISOString(),
  authorizationScope:'READ_ONLY_LEGACY_TYA_SHOPPERS_CERTIFICATIONS_ONLY',
  source:{system:'TyA Consultores legacy',projectId:'tya-plataforma',databaseType:'Firebase Realtime Database',node:'tya_shoppers_extra',readOnly:true,sourceSnapshotSha256:sourceSnapshotHash},
  canonicalTarget:{projectId:EXPECTED_CANONICAL,path:'tenants/tya/shoppers',readOnly:true,shoppers:canonicalSnap.size,fieldNames:[...canonicalFieldNames].sort(),identitySurface:{presence:canonicalPresence,idPatternCounts,migratedFromCategories}},
  summary:{
    rawLegacyRepresentations:entries.filter(([k])=>k!=='_eliminados').length,
    uniqueLegacyShopperRecords:shoppers.length,
    duplicateStableIds,
    duplicateStorageRepresentationsCollapsed,
    stableIdCoreConflicts,
    duplicateAttemptConflicts,
    excludedDemo,excludedDeleted,excludedKnownBootstrap,
    certificationRecords:certifications.length,
    historicalAttempts:certifications.filter(c=>c.source.endsWith('.histCerts')).length,
    approvedMarkersWithoutAttempt,
    reviewRequired:reviewRequired.length,
    shopperDiff:stats
  },
  shopperDiff,
  certifications:certifications.map(c=>({attemptId:c.attemptId,legacyShopperId:c.legacyShopperId,projectId:c.projectId,certificationKey:c.certificationKey,presentedAt:c.presentedAt,approvedAt:c.approvedAt,status:c.status,score:c.score,attemptNumber:c.attemptNumber,expiresAt:c.expiresAt,source:c.source})),
  reviewRequired,
  discardedFields:['pass','password','passwordHash','dpi','cedula','documentoIdentidad','bank','bankAccount','cuentaBancaria','nda','attachments','incorrectas','detalle','apiKey','token','secret'],
  matchingPolicy:{nameOnlyMatchForbidden:true,automaticMergeOnSecondaryIdentityForbidden:true,stableIdAndStableCodeAccepted:true,secondaryEmailPhoneRequiresReview:true},
  safety:{legacyProviderWrites:0,canonicalProviderWrites:0,authWrites:0,storageWrites:0,hostingDeploys:0,production:false,merge:false,rawNamesExported:false,rawEmailsExported:false,rawPhonesExported:false,identityDocumentsExported:false,bankDataExported:false,questionByQuestionAnswersExported:false}
};

fs.mkdirSync('app/docs/evidence',{recursive:true});
fs.writeFileSync(OUT_JSON,JSON.stringify(report,null,2)+'\n');
const md=[
  '# Legacy TyA — refresh read-only shoppers + certificaciones',
  '',
  `- Fecha: ${report.generatedAt}`,
  '- Fuente: Firebase RTDB `tya-plataforma`, nodo `tya_shoppers_extra` únicamente.',
  '- Alcance: shoppers + `histCerts` + marcadores `certs`; visitas/finanzas/notificaciones no fueron leídos.',
  `- Snapshot hash: \`${sourceSnapshotHash}\``,
  `- Representaciones legacy crudas: ${report.summary.rawLegacyRepresentations}`,
  `- Shoppers legacy únicos por ID estable: ${report.summary.uniqueLegacyShopperRecords}`,
  `- Representaciones duplicadas colapsadas por el mismo ID estable: ${duplicateStorageRepresentationsCollapsed}`,
  `- Conflictos reales entre representaciones del mismo ID: ${stableIdCoreConflicts}`,
  `- Shoppers canónicos existentes: ${canonicalSnap.size}`,
  `- Intentos históricos: ${report.summary.historicalAttempts}`,
  `- Marcadores aprobados sin intento histórico: ${approvedMarkersWithoutAttempt}`,
  `- Registros de certificación totales: ${report.summary.certificationRecords}`,
  `- Match exacto ID/migratedFrom: ${stats.exactStableMatch}`,
  `- Match exacto código estable: ${stats.exactCodeMatch}`,
  `- Revisión identidad secundaria: ${stats.reviewRequired}`,
  `- Candidatos sin match estable: ${stats.createCandidate}`,
  `- Coincidencias solo por nombre (diagnóstico, NUNCA usadas para dedupe): ${stats.nameOnlyDiagnosticOverlap}`,
  `- Review de fuente/certificación: ${report.summary.reviewRequired}`,
  `- Bootstrap demo excluido: ${excludedKnownBootstrap}; isDemo excluidos: ${excludedDemo}; eliminados explícitos: ${excludedDeleted}`,
  '',
  '## Seguridad',
  '- Provider writes legacy/canónico: 0/0.',
  '- Auth/Storage/Hosting/producción/merge: 0/0/0/false/false.',
  '- No se exportaron nombres, emails, teléfonos, DPI, banco, NDA, contraseñas ni respuestas pregunta por pregunta.',
  '- El nombre nunca se usa como llave de deduplicación.',
  ''
].join('\n');
fs.writeFileSync(OUT_MD,md);
console.log(JSON.stringify({decision:'PASS_LEGACY_SHOPPERS_CERTIFICATIONS_READONLY_REFRESH_V2',sourceSnapshotSha256:sourceSnapshotHash,summary:report.summary,canonicalIdentitySurface:report.canonicalTarget.identitySurface,safety:report.safety}));
