/* R23 focal, project-scoped QA successor to existing Gate14; independent external HR read + Admin browser KPI, same revision.
 * Uses authorized DEV Admin custom token solely to read KPIs. Does NOT replace ordinary Shopper password R20 proof.
 * All mutations forbidden. No production. Single existing I3 workflow only.
 */
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import {spawnSync} from 'node:child_process';
if(!process.env.R23_COUNTRY){
  const base=String(process.env.PHASEA_LIVE_OUT||'.tmp/phasea-representative-live'),rev=String(process.env.EXPECTED_HR_REVISION||'');
  if(!/^[0-9a-f]{64}$/.test(rev)){console.log(JSON.stringify({decision:'HOLD_R23_UNPINNED_REVISION'}));process.exit(1);}
  const results=[];
  for(const country of ['GT','HN']){
    const dir=base+'/r23/'+country;
    const child=spawnSync(process.execPath,[new URL(import.meta.url).pathname],{env:{...process.env,R23_COUNTRY:country,OUT:dir},encoding:'utf8',timeout:260000,maxBuffer:524288});
    let obj=null;try{obj=JSON.parse(fs.readFileSync(dir+'/r23-external-hr-kpis-same-revision.json','utf8'));}catch(_){}
    const pass=child.status===0&&obj?.decision==='PASS_R23_KPIS_SAME_EXTERNAL_HR_REVISION'&&obj?.country===country&&obj.externalRevision===rev&&obj.browserRevision===rev&&obj.readbackRevision===rev&&obj.sameRevision===true&&obj.kpisExact===true&&obj.comparisonIndependentFromBrowserReadModel===true&&obj.production===false&&obj.providerWrites===0&&obj.authWrites===0&&obj.firestoreWrites===0&&obj.hrWrites===0&&obj.financeWrites===0;
    results.push({country,decision:obj?.decision||'HOLD_NO_RECEIPT',pass,stage:child.signal?'TIMEOUT':'COMPLETED'});
    if(!pass)break;
  }
  const decision=results.length===2&&results.every(x=>x.pass)?'PASS_R23_GT_HN_SAME_EXTERNAL_HR_REVISION':'HOLD_R23_COUNTRY_EXACT_COMPARISON';
  fs.mkdirSync(base+'/r23',{recursive:true});
  fs.writeFileSync(base+'/r23/result.json',JSON.stringify({decision,results,sourceSha:process.env.FOCAL_SOURCE||null,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,financeWrites:0,production:false},null,2)+'\n');
  console.log(JSON.stringify({decision,results,production:false}));
  process.exit(decision.startsWith('PASS')?0:1);
}

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-r23';
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const COUNTRY=String(process.env.R23_COUNTRY||'').toUpperCase();
const EXPECTED_REVISION=String(process.env.EXPECTED_HR_REVISION||'');
const EXPECTED_SOURCE=String(process.env.FOCAL_SOURCE||'');
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex'),fp=v=>sha(v).slice(0,24),now=()=>new Date().toISOString();
const write=(name,value)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,name),JSON.stringify(value,null,2)+'\n');};
function finish(decision,extra={},code=1){const out={decision,scope:'R23_SAME_REVISION_ADMIN_KPI',country:COUNTRY,sourceSha:EXPECTED_SOURCE,generatedAt:now(),production:false,readOnly:true,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,financeWrites:0,localStorageTruth:false,...extra};write('r23-external-hr-kpis-same-revision.json',out);console.log(decision);process.exit(code);}
const ensure=(ok,decision,extra={})=>{if(!ok)finish(decision,extra);};
async function allDocs(ref){const s=await ref.get();return s.docs.map(d=>({id:d.id,...(d.data()||{})}));}
async function jsonFetch(url){const r=await fetch(url,{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});const b=await r.json().catch(()=>null);return {response:r,body:b};}
const state=v=>str(v?.estado||v?.status).toLowerCase();
const stats=vs=>({total:vs.length,realizadas:vs.filter(v=>['realizada','cuestionario','liquidada'].includes(state(v))).length,liquidadas:vs.filter(v=>state(v)==='liquidada'||v?.liquidada===true).length,enCurso:vs.filter(v=>['asignada','agendada','postulada'].includes(state(v))).length});

const tenantId='tya',rootProjectId='cinepolis';
if(!['GT','HN'].includes(COUNTRY)||!/^[0-9a-f]{64}$/.test(EXPECTED_REVISION)||!/^[0-9a-f]{40}$/.test(EXPECTED_SOURCE)){
 finish('HOLD_R23_UNPINNED_COUNTRY_HR_SOURCE','SOURCE_FAILURE');
}
if(new URL(HOSTING_URL).origin!=='https://cxorbia-backend-dev.web.app'){
 finish('HOLD_R23_NONDEV_ORIGIN','ENVIRONMENT_FAILURE');
}

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const members=await allDocs(db.collection('tenants').doc(tenantId).collection('users'));
let staff=null;
for(const m of members.filter(m=>m.active===true&&str(m.authNamespace)==='staff'&&['super','admin'].includes(str(m.role))&&(str(m.role)==='super'||arr(m.projectIds).map(String).includes(rootProjectId)))){
  try{
    const user=await auth.getUser(m.id);
    const c=user.customClaims||{};
    if(!user.disabled&&c.tenantId===tenantId&&['super','admin'].includes(String(c.role||''))&&
       c.authNamespace==='staff'&&(c.role==='super'||arr(c.projectIds).includes(rootProjectId))){
      staff=m;break;
    }
  }catch(_){}
}
ensure(staff,'AUTH_FAILURE',{blocker:'R23_EXACT_AUTHORIZED_ADMIN_NOT_AVAILABLE'});
let browserToken=await auth.createCustomToken(staff.id);

let chromium;try{({chromium}=await import('playwright'));}catch{finish('ENVIRONMENT_FAILURE',{blocker:'R23_PLAYWRIGHT_UNAVAILABLE'});}
const browser=await chromium.launch({headless:true});
const baseUrl=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(rootProjectId)}&cxProtectedRuntime=${PROTECTED}&cxTechnicalAuthE2E=${TECH}`;
let result=null;const pageErrors=[];
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
  page.on('pageerror',e=>pageErrors.push(str(e?.message||e).slice(0,400)));
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async token=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(token);},browserToken);browserToken='';
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({tenantId,rootProjectId})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===tenantId&&['super','admin'].includes(String(c.role||''))&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(rootProjectId)))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{tenantId,rootProjectId},{timeout:120000});

  result=await page.evaluate(({rootProjectId})=>{const C=window.CX,D=C?.data,auth=C?.backendAuth?.context?.()||{};if(!C||!D)return {ok:false,blocker:'R23_CX_DATA_UNAVAILABLE'};if(!(auth.authenticated===true&&auth.provider==='firebase'&&['super','admin'].includes(String(auth.role||''))))return {ok:false,blocker:'R23_FIREBASE_ADMIN_CONTEXT_INVALID'};const browserRevision=String(D.previewMeta?.sourceRevision||'');if(!/^[a-f0-9]{64}$/.test(browserRevision))return {ok:false,blocker:'R23_BROWSER_HR_REVISION_INVALID',browserRevision};const root=String(D.currentProjectId||rootProjectId||''),projects=Array.isArray(D.projects)?D.projects:[];const rootForVisit=v=>{if(String(v?.rootProjectId||''))return String(v.rootProjectId);const pid=String(v?.projectId||v?.periodId||''),p=projects.find(x=>String(x?.id||'')===pid)||null;return String(p?.rootProjectId||p?.program||p?.programKey||((pid&&pid===root)?root:'')||'');};const scopedVisits=id=>(Array.isArray(D._visitas)?D._visitas:[]).filter(v=>String(v?.shopperId||'')===String(id)&&rootForVisit(v)===root);const level=s=>C.data_shopperDataLevel?.(s)||'protected_reference',shoppers=Array.isArray(D.shoppers)?D.shoppers:[];const target=shoppers.find(s=>{
  const country=String(s?.pais||s?.country||'').trim().toLowerCase();
  const countryMatch=COUNTRY==='GT'?['gt','guatemala'].includes(country):['hn','honduras'].includes(country);
  return s&&s.__canonicalIdentityOverlay===true&&level(s)!=='protected_reference'&&
    countryMatch&&String(s.nombre||'').trim()&&scopedVisits(s.id).length>0;
})||null;if(!target)return {ok:false,blocker:'R23_EXACT_PROFILE_WITH_HISTORY_MISSING_'+COUNTRY};const identityMap=D.__identityMap&&typeof D.__identityMap==='object'?D.__identityMap:{};const sourceShopperIds=[...new Set([String(target.id),...Object.entries(identityMap).filter(([,canonical])=>String(canonical)===String(target.id)).map(([live])=>String(live))].filter(Boolean))];C.router?.nav?.('shoppers');return {ok:true,targetId:String(target.id),browserRevision,root,browserScopedCount:scopedVisits(target.id).length,sourceShopperIds,identityMapSize:Object.keys(identityMap).length};},{rootProjectId});
  ensure(result?.ok,result?.blocker==='R23_BROWSER_HR_REVISION_INVALID'?'ENVIRONMENT_FAILURE':'PROVIDER_FAILURE',{blocker:result?.blocker||'R23_BROWSER_TARGET_SELECTION_FAILED',browserRevision:result?.browserRevision||null});

  const external=await jsonFetch(`${HOSTING_URL}/api/tya/cinepolis/hr-live?format=json&r23_cache=${Date.now()}`);
  ensure(external.response.ok&&external.body,'ENVIRONMENT_FAILURE',{blocker:`R23_EXTERNAL_HR_HTTP_${external.response.status}`});
  const snapshot=external.body?.snapshot||external.body?.data||external.body,runtime={...(external.body?._runtime||{}),...(snapshot?._runtime||{})};
  ensure(snapshot?.sourceSafe===true&&arr(snapshot?.visits).length>0,'SOURCE_FAILURE',{blocker:'R23_EXTERNAL_HR_SNAPSHOT_INVALID'});
  const externalRevision=str(runtime.revision);
  ensure(externalRevision===EXPECTED_REVISION,'ENVIRONMENT_FAILURE',{blocker:'R23_HR_REVISION_CHANGED_FROM_PREFLIGHT',expectedRevision:EXPECTED_REVISION,observedRevision:externalRevision});
  ensure(/^[a-f0-9]{64}$/.test(externalRevision),'SOURCE_FAILURE',{blocker:'R23_EXTERNAL_HR_REVISION_INVALID'});
  ensure(externalRevision===result.browserRevision,'ENVIRONMENT_FAILURE',{blocker:'R23_PROVIDER_CACHE_NOT_BROWSER_REVISION',browserRevision:result.browserRevision,externalRevision});

  const rawVisits=arr(snapshot.visits),rawShopperIds=new Set(rawVisits.map(v=>str(v.shopperId)).filter(Boolean));
  const exactSourceIds=new Set(arr(result.sourceShopperIds).map(str).filter(id=>rawShopperIds.has(id)));
  ensure(exactSourceIds.size>0,'MAPPING_FAILURE',{blocker:'R23_NO_EXTERNAL_HR_IDS_FOR_CANONICAL_TARGET',shopperFingerprint:fp(result.targetId),externalRevision,identityMapSize:result.identityMapSize});
  const externalVisits=rawVisits.filter(v=>exactSourceIds.has(str(v.shopperId))),expected=stats(externalVisits);
  ensure(expected.total>0,'SOURCE_FAILURE',{blocker:'R23_EXTERNAL_HR_TARGET_HAS_NO_VISITS',shopperFingerprint:fp(result.targetId),externalRevision});
  const pendingOverlayVisibility=Math.max(0,Number(result.browserScopedCount)-Number(expected.total));

  await page.waitForSelector('#shBody [data-sid]',{timeout:30000});
  const clicked=await page.evaluate(id=>{const row=[...document.querySelectorAll('#shBody [data-sid]')].find(x=>String(x.dataset.sid)===String(id));if(!row)return false;row.click();return true;},result.targetId);
  ensure(clicked,'FUNCTIONAL_DEFECT',{blocker:'R23_SHOPPER_ROW_NOT_RENDERED',shopperFingerprint:fp(result.targetId)});
  await page.waitForSelector('#shKpis [data-k="all"]',{timeout:30000});
  const actual=await page.evaluate(()=>{const numberOf=key=>{const el=document.querySelector(`#shKpis [data-k="${key}"]`),m=String(el?.innerText||el?.textContent||'').match(/\b(\d+)\b/);return m?Number(m[1]):null;};return {total:numberOf('all'),realizadas:numberOf('done'),liquidadas:numberOf('liq'),enCurso:numberOf('curso'),browserRevision:String(window.CX?.data?.previewMeta?.sourceRevision||''),authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true};});
  const kpisExact=Object.keys(expected).every(k=>Number(actual[k])===Number(expected[k]));
  ensure(actual.browserRevision===externalRevision,'ENVIRONMENT_FAILURE',{blocker:'R23_BROWSER_REVISION_CHANGED_DURING_ASSERTION',externalRevision,browserRevision:actual.browserRevision});
  ensure(kpisExact,'FUNCTIONAL_DEFECT',{blocker:'R23_KPIS_DO_NOT_MATCH_SAME_EXTERNAL_HR_REVISION',externalRevision,expected,actual,shopperFingerprint:fp(result.targetId),exactSourceIdCount:exactSourceIds.size,browserHistoryCount:result.browserScopedCount,pendingOverlayVisibility});
  ensure(actual.authorityApplied===true,'AUTH_FAILURE',{blocker:'R23_HR_AUTHORITY_NOT_APPLIED'});

  const external2=await jsonFetch(`${HOSTING_URL}/api/tya/cinepolis/hr-live?format=json&r23_readback=${Date.now()}`),snapshot2=external2.body?.snapshot||external2.body?.data||external2.body,runtime2={...(external2.body?._runtime||{}),...(snapshot2?._runtime||{})},readbackRevision=str(runtime2.revision);
  ensure(external2.response.ok&&readbackRevision===externalRevision,'ENVIRONMENT_FAILURE',{blocker:'R23_PROVIDER_CACHE_CHANGED_DURING_CERTIFICATION',startRevision:externalRevision,endRevision:readbackRevision||null});
  result={shopperFingerprint:fp(result.targetId),externalRevision,browserRevision:actual.browserRevision,readbackRevision,expected,actual:{total:actual.total,realizadas:actual.realizadas,liquidadas:actual.liquidadas,enCurso:actual.enCurso},kpisExact:true,authorityApplied:true,externalVisitCount:externalVisits.length,exactSourceIdCount:exactSourceIds.size,exactSourceIdFingerprints:[...exactSourceIds].sort().map(fp),browserHistoryCount:Number(result.browserScopedCount),pendingOverlayVisibility};
  await ctx.close();
}finally{browserToken='';await browser.close();}
finish('PASS_R23_KPIS_SAME_EXTERNAL_HR_REVISION',{tenantId,projectId:rootProjectId,shopperFingerprint:result.shopperFingerprint,externalRevision:result.externalRevision,browserRevision:result.browserRevision,readbackRevision:result.readbackRevision,sameRevision:true,externalVisitCount:result.externalVisitCount,exactSourceIdCount:result.exactSourceIdCount,exactSourceIdFingerprints:result.exactSourceIdFingerprints,browserHistoryCount:result.browserHistoryCount,pendingOverlayVisibility:result.pendingOverlayVisibility,kpiExpected:result.expected,kpiActual:result.actual,kpisExact:result.kpisExact,authorityApplied:result.authorityApplied,externalAuthority:'hr-live-runtime',identityResolution:'exact_technical_crosswalk_only',comparisonIndependentFromBrowserReadModel:true,pageErrors},0);
