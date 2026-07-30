import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const EXPECTED_PROJECT='cxorbia-backend-dev';
const LEGACY_URL='https://tya-plataforma-default-rtdb.firebaseio.com';
const SHEET_ID=process.env.CXORBIA_HR_LIVE_SHEET_ID||'1h307t37LxM1nZNh_9Odt6wHUQhROG6cYbsbMKr48vU4';
const SOURCE_FILE='app/docs/evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json';
const OUT_JSON='app/docs/evidence/REMAINING-SHOPPER-IDENTITY-RECONCILIATION-READONLY-LATEST.json';
const OUT_MD='app/docs/evidence/REMAINING-SHOPPER-IDENTITY-RECONCILIATION-READONLY-LATEST.md';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;

if(!credentialPath||!fs.existsSync(credentialPath))throw new Error('canonical_credential_missing');
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==EXPECTED_PROJECT)throw new Error(`wrong_canonical_project:${sa.project_id||'missing'}`);
if(!fs.existsSync(SOURCE_FILE))throw new Error('visit_identity_crosswalk_evidence_missing');
const prior=JSON.parse(fs.readFileSync(SOURCE_FILE,'utf8'));
const unresolved=(prior.crosswalk||[]).filter(r=>r.action==='UNRESOLVED_NO_EXACT_VISIT_IDENTITY');
if(unresolved.length!==9)throw new Error(`expected_9_unresolved_refs_got_${unresolved.length}`);
const unresolvedIds=new Set(unresolved.map(r=>r.plannedShopperId));

admin.initializeApp({credential:admin.credential.cert(sa),projectId:EXPECTED_PROJECT});
const db=admin.firestore();

const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const norm=v=>String(v??'').trim().replace(/\s+/g,' ');
const lower=v=>norm(v).toLowerCase();
const fold=v=>lower(v).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const phone=v=>norm(v).replace(/\D/g,'');
const email=v=>lower(v);
const nonEmpty=v=>v!==null&&v!==undefined&&norm(v)!=='';
const cell=(row,i)=>i>=0?norm(row?.[i]):'';
const headerKey=v=>fold(v);
const stableVariants=v=>{const raw=norm(v),lo=lower(v),slug=lo.replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');return[...new Set([raw,lo,lo.replace(/_/g,'-'),slug].filter(Boolean))];};
const countryCode=v=>{const x=fold(v);if(['gt','guatemala'].includes(x))return'GT';if(['hn','honduras'].includes(x))return'HN';return norm(v).toUpperCase();};
const compatibleCountry=(a,b)=>!a||!b||countryCode(a)===countryCode(b);

function b64url(input){return Buffer.from(input).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');}
function signJwt(service){const now=Math.floor(Date.now()/1000);const unsigned=`${b64url(JSON.stringify({alg:'RS256',typ:'JWT'}))}.${b64url(JSON.stringify({iss:service.client_email,scope:'https://www.googleapis.com/auth/spreadsheets.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}))}`;const signer=crypto.createSign('RSA-SHA256');signer.update(unsigned);signer.end();return `${unsigned}.${signer.sign(service.private_key).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}`;}
async function oauthToken(){const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:signJwt(sa)});const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Cache-Control':'no-store'},body});const j=await r.json();if(!r.ok)throw new Error(`google_oauth_failed_${r.status}`);return j.access_token;}
async function sheetsGet(path,token){const r=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${path}`,{headers:{Authorization:`Bearer ${token}`,'Cache-Control':'no-cache, no-store'}});const j=await r.json();if(!r.ok)throw new Error(`sheets_read_failed_${r.status}`);return j;}
function parseTab(title){const m=norm(title).toUpperCase().match(/^(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|SETIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\s+(\d{2})(?:\s+(HN))?$/);if(!m)return null;const months={ENERO:1,FEBRERO:2,MARZO:3,ABRIL:4,MAYO:5,JUNIO:6,JULIO:7,AGOSTO:8,SEPTIEMBRE:9,SETIEMBRE:9,OCTUBRE:10,NOVIEMBRE:11,DICIEMBRE:12};const year=2000+Number(m[2]),month=months[m[1]],key=`${year}-${String(month).padStart(2,'0')}`;return{title,country:m[3]==='HN'?'HN':'GT',key};}
function headerIndex(values){for(let i=0;i<Math.min(values.length,14);i++){const keys=(values[i]||[]).map(headerKey);if(keys.includes('shopper asignado')&&keys.includes('ciudad')&&keys.includes('shopping'))return i;}return-1;}
function indexOfHeader(row,names){const keys=(row||[]).map(headerKey);for(const name of names){const i=keys.indexOf(headerKey(name));if(i>=0)return i;}return-1;}
function isAssigned(v){const x=fold(v);if(!x)return false;return !['p x asignar','por asignar','pendiente','sin asignar','no asignado','n a','na','ninguno','0','false'].includes(x)&&!x.includes('p x asignar');}

async function readHrPrivateIdentity(){const token=await oauthToken();const meta=await sheetsGet('?fields=sheets(properties(title,index))',token);const tabs=(meta.sheets||[]).map(s=>parseTab(s.properties?.title)).filter(Boolean).filter(t=>t.key>='2025-06'&&t.key<='2026-07');const out=new Map();for(const tab of tabs){const range=encodeURIComponent(`'${tab.title.replace(/'/g,"''")}'!A1:AI140`);const data=await sheetsGet(`/values/${range}?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE`,token);const values=data.values||[],hi=headerIndex(values);if(hi<0)continue;const header=values[hi]||[],shopperIdx=indexOfHeader(header,['Shopper Asignado']),cityIdx=indexOfHeader(header,['CIUDAD']),shoppingIdx=indexOfHeader(header,['Shopping']);for(let ri=hi+1;ri<values.length;ri++){const row=values[ri]||[],rawShopper=cell(row,shopperIdx),shopping=cell(row,shoppingIdx),city=cell(row,cityIdx);if(!shopping||!city||!isAssigned(rawShopper))continue;const plannedId=`shopper_${tab.country.toLowerCase()}_${sha(lower(rawShopper)).slice(0,10)}`;if(!unresolvedIds.has(plannedId))continue;const rec=out.get(plannedId)||{plannedShopperId:plannedId,name:rawShopper,nameKey:fold(rawShopper),country:tab.country,cities:new Set(),rows:0,periods:new Set()};if(fold(rec.name)!==fold(rawShopper))throw new Error(`hr_identity_hash_collision_${plannedId}`);if(city)rec.cities.add(fold(city));rec.rows++;rec.periods.add(tab.key);out.set(plannedId,rec);}}
return out;}

async function getLegacy(path){const r=await fetch(`${LEGACY_URL}/${path}.json`,{headers:{Accept:'application/json','Cache-Control':'no-store'}});const t=await r.text();if(!r.ok)throw new Error(`legacy_read_http_${r.status}`);const j=JSON.parse(t);if(j&&typeof j==='object'&&j.error)throw new Error('legacy_read_error');return j;}
function entries(raw){if(!raw)return[];if(Array.isArray(raw))return raw.map((v,i)=>[String(i),v]).filter(([,v])=>v&&typeof v==='object');return Object.entries(raw).filter(([,v])=>v&&typeof v==='object');}
function mergeLegacy(raw){const all=entries(raw),deleted=new Set();if(Array.isArray(raw?._eliminados))raw._eliminados.forEach(x=>deleted.add(fold(x)));const groups=new Map();for(const[nodeKey,r]of all){if(nodeKey==='_eliminados'||r?.isDemo===true)continue;const id=norm(r?.id||nodeKey);if(!id||['S001','S002'].includes(id)||deleted.has(fold(r?.nombre)))continue;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(r);}const result=[];for(const[id,arr]of groups){const score=r=>['codigo','shopperCode','username','nombre','name','email','wa','phone','telefono','pais','country','ciudad','city'].reduce((n,k)=>n+(nonEmpty(r?.[k])?1:0),0)+(Array.isArray(r?.histCerts)?r.histCerts.length*2:0);const ordered=[...arr].sort((a,b)=>score(b)-score(a)),m={...ordered[0]};for(const r of ordered.slice(1))for(const k of['codigo','shopperCode','username','nombre','name','email','wa','phone','telefono','pais','country','ciudad','city'])if(!nonEmpty(m[k])&&nonEmpty(r?.[k]))m[k]=r[k];const name=norm(m?.nombre||m?.name),country=countryCode(m?.pais||m?.country),city=norm(m?.ciudad||m?.city),em=email(m?.email),ph=phone(m?.wa||m?.phone||m?.telefono),certs=(Array.isArray(m?.histCerts)?m.histCerts.length:0)+(Array.isArray(m?.certs)?m.certs.length:0);result.push({legacyShopperId:id,name,nameKey:fold(name),country,cityKey:fold(city),email:em,phone:ph,certCount:certs});}return result;}

async function readCanonical(){const shoppersSnap=await db.collection('tenants').doc('tya').collection('shoppers').get();const shoppers=shoppersSnap.docs.map(doc=>{const d=doc.data()||{},name=norm(d.nombre||d.name||d.displayName||[d.firstName,d.lastName].filter(Boolean).join(' ')),em=email(d.email),ph=phone(d.wa||d.phone||d.telefono);return{docId:doc.id,ids:[doc.id,d.id,d.shopperId,d.legacyShopperId,d.sourceKey,d.shopperCode,d.codigo,d.username,d.migratedFrom].map(norm).filter(Boolean),name,nameKey:fold(name),country:countryCode(d.pais||d.country),cityKey:fold(d.ciudad||d.city),email:em,phone:ph};});const projectSnap=await db.collection('tenants').doc('tya').collection('projects').get();const visits=[];for(const project of projectSnap.docs){const snap=await project.ref.collection('visits').get();for(const doc of snap.docs){const d=doc.data()||{},shopperId=norm(d.shopperId);if(!shopperId)continue;const shopperName=norm(d.shopperName||d.shopper||d.nombreShopper);visits.push({shopperId,shopperName,shopperNameKey:fold(shopperName),country:countryCode(d.country||d.pais),cityKey:fold(d.ciudad||d.city),projectId:project.id});}}return{shoppers,visits,projects:projectSnap.size};}

function buildIndex(items,keyFn){const m=new Map();for(const item of items){const k=keyFn(item);if(!k)continue;if(!m.has(k))m.set(k,[]);m.get(k).push(item);}return m;}
function unique(items,key='docId'){return[...new Map(items.map(x=>[x[key],x])).values()];}

const hr=await readHrPrivateIdentity();
if(hr.size!==9)throw new Error(`hr_real_identity_found_${hr.size}_expected_9`);
const legacyRaw=await getLegacy('tya_shoppers_extra'),legacy=mergeLegacy(legacyRaw),canonical=await readCanonical();
const byCanonicalIdVariant=new Map();for(const c of canonical.shoppers){for(const raw of c.ids)for(const v of stableVariants(raw)){if(!byCanonicalIdVariant.has(v))byCanonicalIdVariant.set(v,[]);byCanonicalIdVariant.get(v).push(c);}}
const canonicalByEmail=buildIndex(canonical.shoppers,c=>c.email),canonicalByPhone=buildIndex(canonical.shoppers,c=>c.phone),canonicalByName=buildIndex(canonical.shoppers,c=>c.nameKey),visitsByName=buildIndex(canonical.visits,v=>v.shopperNameKey),legacyByName=buildIndex(legacy,l=>l.nameKey);

const decisions=[];
for(const source of [...hr.values()].sort((a,b)=>a.plannedShopperId.localeCompare(b.plannedShopperId))){
  const legacyMatches=(legacyByName.get(source.nameKey)||[]).filter(l=>compatibleCountry(source.country,l.country));
  const canonicalProfileMatches=(canonicalByName.get(source.nameKey)||[]).filter(c=>compatibleCountry(source.country,c.country));
  const canonicalVisitMatches=(visitsByName.get(source.nameKey)||[]).filter(v=>compatibleCountry(source.country,v.country));
  const targetEvidence=new Map();
  const add=(id,type)=>{if(!id)return;if(!targetEvidence.has(id))targetEvidence.set(id,new Set());targetEvidence.get(id).add(type);};
  for(const c of canonicalProfileMatches){add(c.docId,'canonical_profile_exact_real_identity');if(source.cities.size&&c.cityKey&&source.cities.has(c.cityKey))add(c.docId,'canonical_profile_city_corrob');}
  for(const v of canonicalVisitMatches){add(v.shopperId,'canonical_visit_exact_real_identity');if(source.cities.size&&v.cityKey&&source.cities.has(v.cityKey))add(v.shopperId,'canonical_visit_city_corrob');}
  for(const l of legacyMatches){const stableDocs=unique(stableVariants(l.legacyShopperId).flatMap(v=>byCanonicalIdVariant.get(v)||[]));for(const c of stableDocs)add(c.docId,'legacy_stable_id_to_canonical');if(l.email){for(const c of canonicalByEmail.get(l.email)||[])add(c.docId,'legacy_email_to_canonical');}if(l.phone){for(const c of canonicalByPhone.get(l.phone)||[])add(c.docId,'legacy_phone_to_canonical');}}
  const ranked=[...targetEvidence.entries()].map(([id,set])=>({id,evidence:[...set].sort(),strong:[...set].some(x=>x==='legacy_stable_id_to_canonical'||x==='legacy_email_to_canonical'||x==='legacy_phone_to_canonical'),multiSurface:[...set].includes('canonical_profile_exact_real_identity')&&[...set].includes('canonical_visit_exact_real_identity')&&legacyMatches.length===1,score:[...set].reduce((n,x)=>n+(x.startsWith('legacy_')?4:x.includes('city')?1:2),0)})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  const top=ranked[0],second=ranked[1];let action='HOLD_IDENTITY_REVIEW',targetType=null,canonicalShopperId=null,legacyShopperId=null,evidence=[];
  if(top&&(!second||top.score>second.score)&&(top.strong||top.multiSurface)&&top.score>=5){action='REUSE_EXISTING_CANONICAL_SHOPPER';targetType='existing_canonical';canonicalShopperId=top.id;evidence=top.evidence;}
  else if(legacyMatches.length===1){const l=legacyMatches[0],cityCorrob=Boolean(l.cityKey&&source.cities.size&&source.cities.has(l.cityKey)),canonicalContactConflict=(l.email&&(canonicalByEmail.get(l.email)||[]).length>0)||(l.phone&&(canonicalByPhone.get(l.phone)||[]).length>0),canonicalNameConflict=canonicalProfileMatches.length>0||new Set(canonicalVisitMatches.map(v=>v.shopperId)).size>0;if(cityCorrob&&!canonicalContactConflict&&!canonicalNameConflict){action='LINK_TO_LEGACY_PROFILE_CREATE_CANDIDATE';targetType='legacy_profile_create';legacyShopperId=l.legacyShopperId;evidence=['hr_legacy_exact_real_identity','country_compatible','city_corrob','no_existing_canonical_contact_or_name_target'];}}
  decisions.push({plannedShopperId:source.plannedShopperId,action,targetType,canonicalShopperId,legacyShopperId,evidence,hrVisitCount:source.rows,hrPeriods:source.periods.size,legacyCandidateCount:legacyMatches.length,canonicalProfileCandidateCount:canonicalProfileMatches.length,canonicalVisitShopperCandidateCount:new Set(canonicalVisitMatches.map(v=>v.shopperId)).size,identityFingerprint:sha(`${source.nameKey}|${source.country}`).slice(0,24)});
}

const counts={total:decisions.length,reuseExisting:decisions.filter(d=>d.action==='REUSE_EXISTING_CANONICAL_SHOPPER').length,linkLegacyCreate:decisions.filter(d=>d.action==='LINK_TO_LEGACY_PROFILE_CREATE_CANDIDATE').length,holdReview:decisions.filter(d=>d.action==='HOLD_IDENTITY_REVIEW').length};
const output={schemaVersion:'tya.remaining-shopper-identity-reconciliation.readonly.v2',generatedAt:new Date().toISOString(),authorizationScope:'READ_ONLY_REAL_IDENTITY_RECONCILIATION_9_REFS',sources:{legacy:{projectId:'tya-plataforma',databaseType:'Firebase Realtime Database',node:'tya_shoppers_extra',readOnly:true,uniqueProfiles:legacy.length},hr:{spreadsheetIdMasked:`${SHEET_ID.slice(0,6)}...${SHEET_ID.slice(-4)}`,readOnly:true,realIdentityUsedInMemoryOnly:true,rawIdentityPersisted:false,unresolvedRefsRead:hr.size,countryIdentitySource:'tab_name_same_as_R20_builder'},canonical:{projectId:EXPECTED_PROJECT,tenantId:'tya',readOnly:true,projectsScanned:canonical.projects,shoppersScanned:canonical.shoppers.length,visitsScanned:canonical.visits.length}},policy:{realIdentityRequiredInOperationalPlatform:true,rawPiiInGitHub:false,nameOnlyAutoMerge:false,exactNameMayBeEvidenceButNotSoleMergeKey:true,countryAndCityUsedAsCorroboration:true,stableIdOrContactOrMultiSurfaceEvidenceRequiredForExistingReuse:true,conflicts:'HOLD_REVIEW'},counts,decisions,safety:{legacyWrites:0,firestoreWrites:0,authWrites:0,storageWrites:0,hrWrites:0,deploys:0,merge:false,production:false,rawNamesExported:false,rawEmailsExported:false,rawPhonesExported:false,identityDocumentsExported:false,bankDataExported:false}};
fs.mkdirSync('app/docs/evidence',{recursive:true});fs.writeFileSync(OUT_JSON,JSON.stringify(output,null,2)+'\n','utf8');const md=[
'# TyA — reconciliación read-only de 9 identidades shopper restantes',
'',`Generado: ${output.generatedAt}`,'',
'## Resultado',
`- Total: ${counts.total}.`,`- Reuse existing: ${counts.reuseExisting}.`,`- Link a perfil legacy a crear: ${counts.linkLegacyCreate}.`,`- HOLD revisión: ${counts.holdReview}.`,'',
'## Política',
'- La identidad real se leyó en memoria desde HR viva y TyA legacy actual; no se guardó PII cruda en GitHub.',
'- El nombre exacto puede aportar evidencia pero nunca es la única llave de automerge.',
'- La plataforma operativa final debe mostrar identidad real a roles autorizados; los hashes son solo transporte/auditoría técnica.',
'- Cualquier conflicto o evidencia insuficiente queda HOLD.',
'',
'## Seguridad',
'- Legacy/Firestore/Auth/Storage/HR writes: 0.',
'- Deploy/merge/producción: 0.',
'- PII cruda persistida en GitHub: 0.'
].join('\n');fs.writeFileSync(OUT_MD,md+'\n','utf8');
console.log(JSON.stringify({decision:counts.holdReview===0?'PASS_REAL_IDENTITY_RECONCILIATION_9':'PASS_WITH_REVIEW_REAL_IDENTITY_RECONCILIATION_9',counts,safety:output.safety},null,2));
