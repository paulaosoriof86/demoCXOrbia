import fs from 'node:fs';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId=process.env.CXORBIA_TENANT_ID||'tya';
const exportPath=process.env.CXORBIA_LEGACY_EXPORT_PATH;
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const out=process.env.CXORBIA_PROFILE_EXTRA_OUT||'app/docs/evidence/CORTE6-PROFILE-EXTRA-EXPORT-READONLY-LATEST.json';

function fail(m){throw new Error(m);}
function has(v){return v!==undefined&&v!==null&&String(v).trim()!=='';}
function arr(v){if(Array.isArray(v))return v; if(v&&typeof v==='object')return Object.values(v); return [];}
function readExport(path){const raw=JSON.parse(fs.readFileSync(path,'utf8'));return raw&&raw.tya_shoppers_extra!==undefined?arr(raw.tya_shoppers_extra):[];}
if(!exportPath||!fs.existsSync(exportPath))fail('legacy_export_missing');
if(!credentialPath||!fs.existsSync(credentialPath))fail('credential_missing');
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject)fail('wrong_project');
const source=readExport(exportPath);
if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const db=admin.firestore();
const snap=await db.collection('tenants').doc(tenantId).collection('shoppers').select(
  'legacyShopperId','username','user','login','phone','whatsapp','wa','telefono','email','correo','country','pais','city','ciudad','dpi','documentId','documento','idNumber','certs','certifications','visitas','activo','estado','status'
).get();
const byLegacy=new Map();
for(const d of snap.docs){const v=d.data()||{},legacy=String(v.legacyShopperId||'').trim();if(!legacy)continue;if(!byLegacy.has(legacy))byLegacy.set(legacy,[]);byLegacy.get(legacy).push({id:d.id,data:v});}

const fields={username:['username','user','login'],phone:['wa','whatsapp','phone','telefono'],email:['email','correo'],country:['pais','country'],city:['ciudad','city'],document:['dpi','documentId','documento','idNumber'],certifications:['certs','certifications'],visits:['visitas'],active:['activo','estado','status']};
const sourcePresence=Object.fromEntries(Object.keys(fields).map(k=>[k,0]));
const currentPresence=Object.fromEntries(Object.keys(fields).map(k=>[k,0]));
const plannedFillMissing=Object.fromEntries(Object.keys(fields).map(k=>[k,0]));
const alreadySame=Object.fromEntries(Object.keys(fields).map(k=>[k,0]));
const conflicts=Object.fromEntries(Object.keys(fields).map(k=>[k,0]));
const pick=(o,keys)=>{for(const k of keys)if(has(o?.[k]))return String(o[k]).trim();return '';};
const norm=(k,v)=>{const s=String(v||'').trim(); if(k==='username'||k==='email')return s.toLowerCase(); if(k==='phone')return s.replace(/[^0-9+]/g,''); return s;};
let exact=0,missing=0,ambiguous=0,sourceWithoutId=0,duplicateSourceIds=0;
const seen=new Set();
for(const r of source){
  if(!r||typeof r!=='object')continue;
  const legacyId=String(r.id||'').trim();
  if(!legacyId){sourceWithoutId++;continue;}
  if(seen.has(legacyId)){duplicateSourceIds++;continue;} seen.add(legacyId);
  for(const [name,keys] of Object.entries(fields))if(pick(r,keys))sourcePresence[name]++;
  const matches=byLegacy.get(legacyId)||[];
  if(matches.length===0){missing++;continue;} if(matches.length!==1){ambiguous++;continue;} exact++;
  const cur=matches[0].data;
  for(const [name,keys] of Object.entries(fields)){
    const src=pick(r,keys),dst=pick(cur,keys);
    if(dst)currentPresence[name]++;
    if(!src)continue;
    if(!dst){plannedFillMissing[name]++;continue;}
    if(norm(name,src)===norm(name,dst))alreadySame[name]++;else conflicts[name]++;
  }
}
const conflictTotal=Object.values(conflicts).reduce((a,b)=>a+b,0);
const result={schemaVersion:'cxorbia.corte6.profile-extra-export-readonly.v1',generatedAt:new Date().toISOString(),target:{projectId:expectedProject,tenantId},source:{records:source.length,sourceWithoutId,duplicateSourceIds},matching:{stableKey:'export.id -> Firestore legacyShopperId',nameMatchAllowed:false,phoneMatchAllowed:false,exact,missing,ambiguous},fieldCounts:{sourcePresence,currentPresence,plannedFillMissing,alreadySame,conflicts},decision:conflictTotal||ambiguous||duplicateSourceIds?'HOLD_PROFILE_EXTRA_CONFLICT_REVIEW':(exact?'READY_PROFILE_EXTRA_FILL_MISSING_EXACT_FOR_SEPARATE_FIRESTORE_AUTHORIZATION':'HOLD_NO_EXACT_PROFILE_EXTRA_MATCH'),policy:{fillMissingOnly:true,overwriteExisting:false,passwordExcluded:true,bankFieldsAbsentFromCurrentLegacySchemaUnlessExplicitlyPresent:false},safety:{providerReads:true,providerWrites:0,firestoreWrites:0,authWrites:0,passwordChanges:0,legacyWrites:0,hrWrites:0,hostingDeploys:0,rulesDeploys:0,production:false,merge:false,piiExported:false,sourceValuesExported:false,secretsExported:false}};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');console.log(JSON.stringify({decision:result.decision,sourceRecords:source.length,matching:result.matching,fieldCounts:result.fieldCounts,safety:result.safety}));
