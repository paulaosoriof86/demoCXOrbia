#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const LEGACY_URL=process.env.TYA_LEGACY_DATABASE_URL||'https://tya-plataforma-default-rtdb.firebaseio.com';
const EXPECTED='cxorbia-backend-dev';
const EVIDENCE='app/docs/evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json';
const OUT='app/docs/evidence/LEGACY-EXISTING-PROFILE-FIELD-DIFF-READONLY-LATEST.json';
const OUT_MD='app/docs/evidence/LEGACY-EXISTING-PROFILE-FIELD-DIFF-READONLY-LATEST.md';
const cred=process.env.GOOGLE_APPLICATION_CREDENTIALS;
if(LEGACY_URL!=='https://tya-plataforma-default-rtdb.firebaseio.com')throw new Error('legacy_target_not_allowed');
if(!cred||!fs.existsSync(cred))throw new Error('credential_missing');
const sa=JSON.parse(fs.readFileSync(cred,'utf8'));if(sa.project_id!==EXPECTED)throw new Error('wrong_canonical_project');
admin.initializeApp({credential:admin.credential.cert(sa),projectId:EXPECTED});const db=admin.firestore();
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const norm=v=>String(v??'').trim();const lower=v=>norm(v).toLowerCase();const phone=v=>norm(v).replace(/\D/g,'');
const textNorm=v=>lower(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
const countryNorm=v=>{const s=textNorm(v);if(['gt','guatemala','guate'].includes(s))return'GT';if(['hn','honduras'].includes(s))return'HN';return s.toUpperCase();};
const cityNorm=v=>textNorm(v).replace(/\b(ciudad de|cd\.? de)\b/g,'').replace(/\s+/g,' ').trim();
const nonEmpty=v=>norm(v)!=='';
const getLegacyFields=(id,r)=>({legacyShopperId:id,code:norm(r?.codigo||r?.shopperCode||r?.username)||null,name:norm(r?.nombre||r?.name)||null,email:lower(r?.email)||null,phone:phone(r?.wa||r?.phone||r?.telefono)||null,country:norm(r?.pais||r?.country)||null,city:norm(r?.ciudad||r?.city)||null,active:r?.activo!==false,createdAt:norm(r?.createdAt||r?.fechaCreacion)||null,updatedAt:norm(r?.updatedAt||r?.fechaActualizacion)||null});
const richness=r=>Object.values(getLegacyFields(norm(r?.id),r)).filter(nonEmpty).length+(Array.isArray(r?.histCerts)?r.histCerts.length*3:0)+(Array.isArray(r?.certs)?r.certs.length:0);

async function getLegacy(){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),30000);try{const r=await fetch(`${LEGACY_URL}/tya_shoppers_extra.json`,{signal:ac.signal,headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`legacy_http_${r.status}`);const j=await r.json();if(j?.error)throw new Error(`legacy_error:${j.error}`);return j;}finally{clearTimeout(t);}}
const ev=JSON.parse(fs.readFileSync(EVIDENCE,'utf8'));if(ev.schemaVersion!=='tya.legacy.shoppers-certifications-refresh.safe.v4')throw new Error('legacy_evidence_v4_required');
const matched=(ev.shopperDiff||[]).filter(x=>['REUSE_OR_UPDATE_BY_STABLE_ID','REUSE_OR_UPDATE_BY_NORMALIZED_STABLE_ID','REUSE_OR_UPDATE_BY_STABLE_CODE'].includes(x.action));
if(matched.length!==22)throw new Error(`unexpected_matched_count:${matched.length}`);
const raw=await getLegacy();const entries=Array.isArray(raw)?raw.map((v,i)=>[String(i),v]):Object.entries(raw||{});const groups=new Map();
for(const[nodeKey,r]of entries){if(nodeKey==='_eliminados'||!r||typeof r!=='object')continue;const id=norm(r.id||nodeKey);if(!id)continue;if(!groups.has(id))groups.set(id,[]);groups.get(id).push({nodeKey,raw:r});}
function mergedLegacy(id){const g=groups.get(id)||[];if(!g.length)return null;const ordered=[...g].sort((a,b)=>{const ae=a.nodeKey===id?1:0,be=b.nodeKey===id?1:0;return ae!==be?be-ae:richness(b.raw)-richness(a.raw);});const m={...ordered[0].raw,id};for(const{raw:r}of ordered.slice(1)){for(const k of['codigo','shopperCode','username','nombre','name','email','wa','phone','telefono','pais','country','ciudad','city','createdAt','fechaCreacion','updatedAt','fechaActualizacion'])if(!nonEmpty(m[k])&&nonEmpty(r?.[k]))m[k]=r[k];if(m.activo===undefined&&r?.activo!==undefined)m.activo=r.activo;}return getLegacyFields(id,m);}
const fieldSpecs={
  code:{legacy:v=>norm(v.code),canonical:d=>norm(d.code||d.shopperCode||d.codigo||d.username),normalize:textNorm},
  name:{legacy:v=>norm(v.name),canonical:d=>norm(d.nombre||d.name||d.displayName||[d.firstName,d.lastName].filter(Boolean).join(' ')),normalize:textNorm},
  email:{legacy:v=>norm(v.email),canonical:d=>norm(d.email),normalize:lower},
  phone:{legacy:v=>norm(v.phone),canonical:d=>norm(d.phone||d.wa||d.telefono),normalize:phone},
  country:{legacy:v=>norm(v.country),canonical:d=>norm(d.pais||d.country),normalize:countryNorm},
  city:{legacy:v=>norm(v.city),canonical:d=>norm(d.ciudad||d.city),normalize:cityNorm}
};
const results=[];let sourceDrift=0;
for(const m of matched){const legacy=mergedLegacy(m.legacyShopperId);if(!legacy){results.push({legacyShopperId:m.legacyShopperId,canonicalDocId:m.canonicalDocId,action:'HOLD_SOURCE_DRIFT',reason:'legacy_record_missing'});sourceDrift++;continue;}const fingerprint=sha(JSON.stringify(legacy));if(fingerprint!==m.recordFingerprint){results.push({legacyShopperId:m.legacyShopperId,canonicalDocId:m.canonicalDocId,action:'HOLD_SOURCE_DRIFT',reason:'legacy_record_fingerprint_changed'});sourceDrift++;continue;}const snap=await db.collection('tenants').doc('tya').collection('shoppers').doc(m.canonicalDocId).get();if(!snap.exists){results.push({legacyShopperId:m.legacyShopperId,canonicalDocId:m.canonicalDocId,action:'HOLD_CANONICAL_DRIFT',reason:'canonical_doc_missing'});continue;}const d=snap.data()||{},fillMissing=[],conflicts=[],same=[];for(const[field,spec]of Object.entries(fieldSpecs)){const lv=spec.legacy(legacy),cv=spec.canonical(d);if(!lv)continue;if(!cv){fillMissing.push(field);continue;}if(spec.normalize(lv)===spec.normalize(cv))same.push(field);else conflicts.push(field);}let action='NOOP',reason='no_safe_delta';if(conflicts.length){action='HOLD_EXISTING_VALUE_CONFLICT';reason='nonempty_values_differ_no_overwrite';}else if(fillMissing.length){action='UPDATE_FILL_MISSING_ONLY';reason='stable_identity_and_only_empty_target_fields';}results.push({legacyShopperId:m.legacyShopperId,canonicalDocId:m.canonicalDocId,sourceBasis:m.basis,action,reason,fillMissingFields:fillMissing.sort(),conflictFields:conflicts.sort(),sameFields:same.sort(),legacyFingerprint:fingerprint});}
const counts={matchedProfiles:matched.length,updateFillMissingOnly:results.filter(x=>x.action==='UPDATE_FILL_MISSING_ONLY').length,noop:results.filter(x=>x.action==='NOOP').length,holdExistingValueConflict:results.filter(x=>x.action==='HOLD_EXISTING_VALUE_CONFLICT').length,holdSourceDrift:results.filter(x=>x.action==='HOLD_SOURCE_DRIFT').length,holdCanonicalDrift:results.filter(x=>x.action==='HOLD_CANONICAL_DRIFT').length};
const changedFieldCounts={};for(const r of results)for(const f of r.fillMissingFields||[])changedFieldCounts[f]=(changedFieldCounts[f]||0)+1;const conflictFieldCounts={};for(const r of results)for(const f of r.conflictFields||[])conflictFieldCounts[f]=(conflictFieldCounts[f]||0)+1;
const report={schemaVersion:'tya.legacy-existing-profile-field-diff.readonly.v1',generatedAt:new Date().toISOString(),authorizationScope:'READ_ONLY_LEGACY_TYA_SHOPPERS_CERTIFICATIONS_ONLY',legacySnapshotSha256:ev.source?.sourceSnapshotSha256,canonicalProjectId:EXPECTED,policy:{stableMatchedProfilesOnly:true,fillMissingOnly:true,overwriteNonEmpty:false,nameOnlyDedupe:false,fields:Object.keys(fieldSpecs),stateFieldsExcluded:true},counts,changedFieldCounts,conflictFieldCounts,results,safety:{legacyProviderWrites:0,canonicalProviderWrites:0,authWrites:0,storageWrites:0,deploys:0,production:false,merge:false,rawPiiExported:false}};
fs.mkdirSync('app/docs/evidence',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');fs.writeFileSync(OUT_MD,['# Legacy TyA — diff read-only de 22 perfiles ya enlazados','',`- Snapshot legacy: \`${report.legacySnapshotSha256}\`.`,`- Perfiles enlazados: ${counts.matchedProfiles}.`,`- UPDATE fill-missing-only: ${counts.updateFillMissingOnly}.`,`- NOOP: ${counts.noop}.`,`- HOLD por valor no vacío distinto: ${counts.holdExistingValueConflict}.`,`- HOLD source drift: ${counts.holdSourceDrift}; canonical drift: ${counts.holdCanonicalDrift}.`,`- Campos faltantes candidatos: ${JSON.stringify(changedFieldCounts)}.`,`- Campos en conflicto: ${JSON.stringify(conflictFieldCounts)}.`,'','Seguridad: provider writes 0; Auth 0; deploy 0; producción false; no PII cruda exportada.',''].join('\n'));
console.log(JSON.stringify({decision:'PASS_LEGACY_EXISTING_PROFILE_FIELD_DIFF_READONLY',counts,changedFieldCounts,conflictFieldCounts,safety:report.safety},null,2));
