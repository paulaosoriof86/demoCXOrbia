import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const PROJECT='cxorbia-backend-dev';
const LEGACY_URL='https://tya-plataforma-default-rtdb.firebaseio.com';
const SHEET_ID='1h307t37LxM1nZNh_9Odt6wHUQhROG6cYbsbMKr48vU4';
const IN='app/docs/evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json';
const OUT='app/docs/evidence/REMAINING-SHOPPER-IDENTITY-RECONCILIATION-READONLY-LATEST.json';
const OUT_MD='app/docs/evidence/REMAINING-SHOPPER-IDENTITY-RECONCILIATION-READONLY-LATEST.md';
const cred=process.env.GOOGLE_APPLICATION_CREDENTIALS;
if(!cred||!fs.existsSync(cred)) throw new Error('canonical_credential_missing');
const sa=JSON.parse(fs.readFileSync(cred,'utf8'));
if(sa.project_id!==PROJECT) throw new Error('wrong_canonical_project');
const prior=JSON.parse(fs.readFileSync(IN,'utf8'));
const unresolved=(prior.crosswalk||[]).filter(x=>x.action==='UNRESOLVED_NO_EXACT_VISIT_IDENTITY');
if(unresolved.length!==9) throw new Error(`expected_9_unresolved_refs_got_${unresolved.length}`);
admin.initializeApp({credential:admin.credential.cert(sa),projectId:PROJECT});
const db=admin.firestore();

const norm=v=>String(v??'').trim().replace(/\s+/g,' ');
const lower=v=>norm(v).toLowerCase();
const fold=v=>lower(v).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const hash10=v=>norm(v)?sha(lower(v)).slice(0,10):null;
const phone=v=>norm(v).replace(/\D/g,'');
const email=v=>lower(v);
const country=v=>{const x=fold(v);if(['gt','guatemala'].includes(x))return'GT';if(['hn','honduras'].includes(x))return'HN';return norm(v).toUpperCase();};
const compat=(a,b)=>!a||!b||country(a)===country(b);
const entries=raw=>Array.isArray(raw)?raw.map((v,i)=>[String(i),v]).filter(([,v])=>v&&typeof v==='object'):Object.entries(raw||{}).filter(([,v])=>v&&typeof v==='object');
const uniq=(arr,key)=>[...new Map(arr.map(x=>[x[key],x])).values()];

function parseCsv(text){const rows=[];let row=[],f='',q=false;for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'&&text[i+1]==='"'){f+='"';i++;}else if(c==='"')q=false;else f+=c;}else if(c==='"')q=true;else if(c===','){row.push(f);f='';}else if(c==='\n'){row.push(f.replace(/\r$/,''));rows.push(row);row=[];f='';}else f+=c;}if(f||row.length){row.push(f.replace(/\r$/,''));rows.push(row);}return rows;}
function tabs(){const ms=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'],a=[];for(let y=2025;y<=2026;y++){for(let m=(y===2025?6:1);m<=(y===2026?7:12);m++){for(const c of ['GT','HN'])a.push({title:`${ms[m-1]} ${String(y).slice(-2)}${c==='HN'?' HN':''}`,country:c});}}return a;}
async function gviz(tab){const p=new URLSearchParams({tqx:'out:csv',sheet:tab.title,range:'A1:AI140',tq:'select *',_cxnonce:`${Date.now()}-${crypto.randomBytes(4).toString('hex')}`});const r=await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?${p}`,{redirect:'follow',headers:{'Cache-Control':'no-cache, no-store','User-Agent':'CXOrbia-Identity/1.0'}});const t=await r.text(),ct=r.headers.get('content-type')||'';return r.ok&&ct.includes('text/csv')&&!/^<!doctype html/i.test(t.trim())?parseCsv(t):null;}
async function liveHrIdentities(){const found=[];let tabsRead=0;for(const tab of tabs()){const rows=await gviz(tab);if(!rows)continue;tabsRead++;let h=-1;for(let i=0;i<Math.min(rows.length,14);i++){const k=rows[i].map(fold);if(k.includes('shopper asignado')&&k.includes('shopping')){h=i;break;}}if(h<0)continue;const hk=rows[h].map(fold),si=hk.indexOf('shopper asignado');for(let i=h+1;i<rows.length;i++){const name=norm(rows[i]?.[si]);if(!name)continue;found.push({name,nameHash10:hash10(name),country:tab.country,origin:'live_hr'});}}return{found,tabsRead};}
async function legacyRaw(){const r=await fetch(`${LEGACY_URL}/tya_shoppers_extra.json`,{headers:{Accept:'application/json','Cache-Control':'no-store'}});const t=await r.text();if(!r.ok)throw new Error(`legacy_read_http_${r.status}`);return JSON.parse(t);}
async function canonical(){const s=await db.collection('tenants').doc('tya').collection('shoppers').get();const shoppers=s.docs.map(doc=>{const d=doc.data()||{},name=norm(d.nombre||d.name||d.displayName||[d.firstName,d.lastName].filter(Boolean).join(' '));return{docId:doc.id,nameHash10:hash10(name),nameKey:fold(name),country:country(d.pais||d.country),email:email(d.email),phone:phone(d.wa||d.phone||d.telefono),ids:[doc.id,d.id,d.shopperId,d.legacyShopperId,d.sourceKey,d.shopperCode,d.codigo,d.username,d.migratedFrom].map(norm).filter(Boolean)};});const ps=await db.collection('tenants').doc('tya').collection('projects').get();const visits=[];for(const p of ps.docs){const vs=await p.ref.collection('visits').get();for(const doc of vs.docs){const d=doc.data()||{},sid=norm(d.shopperId),name=norm(d.shopperName||d.shopper||d.nombreShopper);if(sid)visits.push({shopperId:sid,nameHash10:hash10(name),nameKey:fold(name),country:country(d.country||d.pais)});}}return{shoppers,visits,projects:ps.size};}

const raw=await legacyRaw();
const activeLegacy=[];const allLegacyIdentity=[];
for(const [nodeKey,r] of entries(raw)){if(nodeKey==='_eliminados')continue;const name=norm(r?.nombre||r?.name);if(!name)continue;const item={legacyShopperId:norm(r?.id||nodeKey),nameHash10:hash10(name),nameKey:fold(name),country:country(r?.pais||r?.country),email:email(r?.email),phone:phone(r?.wa||r?.phone||r?.telefono),deleted:false,bootstrap:['S001','S002'].includes(norm(r?.id||nodeKey)),demo:r?.isDemo===true};allLegacyIdentity.push(item);if(!item.bootstrap&&!item.demo)activeLegacy.push(item);}
const deletedNames=Array.isArray(raw?._eliminados)?raw._eliminados.map(x=>({nameHash10:hash10(x),nameKey:fold(x),origin:'legacy_deleted_name_marker'})).filter(x=>x.nameHash10):[];
const hr=await liveHrIdentities();
const can=await canonical();
const byStableVariant=new Map();for(const c of can.shoppers)for(const id of c.ids)for(const v of [id,lower(id),lower(id).replace(/_/g,'-')]){if(!v)continue;if(!byStableVariant.has(v))byStableVariant.set(v,[]);byStableVariant.get(v).push(c);}
const decisions=[];
for(const ref of unresolved){const id=ref.plannedShopperId,c=id.startsWith('shopper_hn_')?'HN':'GT',suffix=id.split('_').at(-1);
  const hrM=hr.found.filter(x=>x.nameHash10===suffix&&compat(c,x.country));
  const legacyAll=allLegacyIdentity.filter(x=>x.nameHash10===suffix&&compat(c,x.country));
  const legacyActive=activeLegacy.filter(x=>x.nameHash10===suffix&&compat(c,x.country));
  const deleted=deletedNames.filter(x=>x.nameHash10===suffix);
  const cp=can.shoppers.filter(x=>x.nameHash10===suffix&&compat(c,x.country));
  const cv=can.visits.filter(x=>x.nameHash10===suffix&&compat(c,x.country));
  const identitySource=[hrM.length?'live_hr':null,legacyAll.length?'legacy_current_raw':null,deleted.length?'legacy_deleted_marker':null,cp.length?'canonical_profile':null,cv.length?'canonical_visit':null].filter(Boolean);
  const targetEvidence=new Map();const add=(sid,e)=>{if(!sid)return;if(!targetEvidence.has(sid))targetEvidence.set(sid,new Set());targetEvidence.get(sid).add(e);};
  for(const l of legacyActive){for(const variant of [l.legacyShopperId,lower(l.legacyShopperId),lower(l.legacyShopperId).replace(/_/g,'-')])for(const x of byStableVariant.get(variant)||[])add(x.docId,'legacy_stable_id');if(l.email)for(const x of can.shoppers.filter(s=>s.email&&s.email===l.email))add(x.docId,'legacy_email');if(l.phone)for(const x of can.shoppers.filter(s=>s.phone&&s.phone===l.phone))add(x.docId,'legacy_phone');}
  for(const x of cp)add(x.docId,'canonical_real_identity_surface');for(const x of cv)add(x.shopperId,'canonical_visit_real_identity_surface');
  const ranked=[...targetEvidence].map(([sid,set])=>({sid,evidence:[...set].sort(),strong:[...set].some(e=>e.startsWith('legacy_stable')||e==='legacy_email'||e==='legacy_phone'),surfaces:new Set([...set].map(e=>e.startsWith('canonical_visit')?'visit':e.startsWith('canonical_real')?'profile':'legacy')).size})).sort((a,b)=>Number(b.strong)-Number(a.strong)||b.surfaces-a.surfaces||a.sid.localeCompare(b.sid));
  let action='HOLD_IDENTITY_REVIEW',canonicalShopperId=null,legacyShopperId=null,evidence=[];
  if(ranked.length===1&&ranked[0].strong){action='REUSE_EXISTING_CANONICAL_SHOPPER';canonicalShopperId=ranked[0].sid;evidence=ranked[0].evidence;}
  else if(ranked.length===1&&ranked[0].surfaces>=2&&legacyActive.length===1){action='REUSE_EXISTING_CANONICAL_SHOPPER';canonicalShopperId=ranked[0].sid;evidence=ranked[0].evidence;}
  else if(legacyActive.length===1&&cp.length===0&&new Set(cv.map(x=>x.shopperId)).size===0){action='LINK_TO_LEGACY_PROFILE_CREATE_CANDIDATE';legacyShopperId=legacyActive[0].legacyShopperId;evidence=['exact_r20_identity_hash_to_current_legacy','country_compatible','no_existing_canonical_identity_target'];}
  decisions.push({plannedShopperId:id,action,canonicalShopperId,legacyShopperId,evidence,identitySource:identitySource.sort(),identitySourceFound:identitySource.length>0,liveHrMatches:hrM.length,legacyCurrentMatches:legacyAll.length,legacyActiveMatches:legacyActive.length,deletedMarkerMatches:deleted.length,canonicalProfileMatches:cp.length,canonicalVisitShopperMatches:new Set(cv.map(x=>x.shopperId)).size,hrVisitCount:ref.hrVisitCount,identityFingerprint:sha(`${suffix}|${c}`).slice(0,24)});
}
const counts={total:9,identitySourceFound:decisions.filter(x=>x.identitySourceFound).length,identitySourceNotFound:decisions.filter(x=>!x.identitySourceFound).length,reuseExisting:decisions.filter(x=>x.action==='REUSE_EXISTING_CANONICAL_SHOPPER').length,linkLegacyCreate:decisions.filter(x=>x.action==='LINK_TO_LEGACY_PROFILE_CREATE_CANDIDATE').length,holdReview:decisions.filter(x=>x.action==='HOLD_IDENTITY_REVIEW').length};
const output={schemaVersion:'tya.remaining-shopper-identity-reconciliation.readonly.v5',generatedAt:new Date().toISOString(),authorizationScope:'READ_ONLY_REAL_IDENTITY_RECONCILIATION_9_REFS',sources:{legacy:{projectId:'tya-plataforma',databaseType:'Firebase Realtime Database',node:'tya_shoppers_extra',readOnly:true,rawRepresentationsScanned:entries(raw).length},hr:{spreadsheetIdMasked:`${SHEET_ID.slice(0,6)}...${SHEET_ID.slice(-4)}`,readOnly:true,accessMode:'public_gviz_csv_cache_busted',tabsRead:hr.tabsRead,realIdentityUsedInMemoryOnly:true,rawIdentityPersisted:false},canonical:{projectId:PROJECT,tenantId:'tya',readOnly:true,projectsScanned:can.projects,shoppersScanned:can.shoppers.length,visitsScanned:can.visits.length}},policy:{realIdentityRequiredInOperationalPlatform:true,rawPiiInGitHub:false,nameOnlyAutoMerge:false,r20NameHashMayRecoverIdentitySurfaceButNeverSoleMerge:true,strongExistingReuseRequiresStableIdOrContactOrCorroboratedMultiSurface:true,unresolvedIdentityAllowedAsHold:true},counts,decisions,safety:{legacyWrites:0,firestoreWrites:0,authWrites:0,storageWrites:0,hrWrites:0,deploys:0,merge:false,production:false,rawNamesExported:false,rawEmailsExported:false,rawPhonesExported:false,identityDocumentsExported:false,bankDataExported:false}};
fs.mkdirSync('app/docs/evidence',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(output,null,2)+'\n','utf8');fs.writeFileSync(OUT_MD,`# Reconciliación read-only de 9 identidades shopper restantes\n\n- Fuentes de identidad encontradas: ${counts.identitySourceFound}/9.\n- Reuse existing: ${counts.reuseExisting}.\n- Link a perfil legacy create-candidate: ${counts.linkLegacyCreate}.\n- HOLD revisión: ${counts.holdReview}.\n- PII cruda en GitHub: 0.\n- Provider/data writes: 0.\n`,'utf8');
console.log(JSON.stringify({decision:counts.holdReview?'PASS_WITH_REVIEW_REAL_IDENTITY_RECONCILIATION_9':'PASS_REAL_IDENTITY_RECONCILIATION_9',counts,safety:output.safety},null,2));
