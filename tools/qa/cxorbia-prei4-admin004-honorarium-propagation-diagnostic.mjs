#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PREI4_004_PROP_OUT||'.tmp/prei4-admin-004-propagation');
const ROOT=String(process.env.PREI4_004_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT='tya',PROJECT='cinepolis',PERIOD='cinepolis-2026-09';
const EXPECTED_HR=String(process.env.PREI4_004_HR_REVISION||'');
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex'),fp=v=>sha(v).slice(0,16);
const fail=m=>{throw new Error(m);};
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);

const ps=await project.get();if(!ps.exists)fail('PERSISTENCE_FAILURE:ADMIN004_PROJECT_MISSING');
const pc=ps.data()||{};
if(Number(pc?.honorario?.GT)!==60||Number(pc?.honorario?.HN)!==200||str(pc?.currency?.GT)!=='Q'||str(pc?.currency?.HN)!=='L')fail('PERSISTENCE_FAILURE:ADMIN004_DURABLE_CONFIG_DRIFT');

const hrRes=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=json&propagationDiagnostic='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!hrRes.ok)fail('PROVIDER_FAILURE:ADMIN004_HR_HTTP_'+hrRes.status);
const hb=await hrRes.json(),hr=hb?.snapshot||hb?.data||hb,rt=hb?._runtime||hr?._runtime||{};
const rev=str(rt.revision||hr.revision||hr.sourceRevision);
if(EXPECTED_HR&&rev!==EXPECTED_HR)fail('SOURCE_FAILURE:ADMIN004_HR_REVISION_DRIFT:'+rev);
const config=hr?.projectConfig||{};
if(Number(config?.honorario?.GT)!==60||Number(config?.honorario?.HN)!==200)fail('MAPPING_FAILURE:ADMIN004_RUNTIME_CONFIG_NOT_EXACT');

const september=arr(hr.visits).filter(v=>str(v.periodKey)==='2026-09');
const fallbackRaw=september.filter(v=>{
  const country=str(v.pais||v.country),explicit=finite(v.honorario),configured=finite(config?.honorario?.[country]);
  return !explicit&&configured;
});
if(!fallbackRaw.length)fail('MAPPING_FAILURE:ADMIN004_NO_FALLBACK_VISITS');

let target=null;
for(const hv of fallbackRaw){
  const keys=[...new Set([str(hv.hrRowId),str(hv.id||hv.visitId)].filter(Boolean))];
  for(const key of keys){
    const s=await project.collection('visits').doc(key).get();if(!s.exists)continue;
    const d=s.data()||{},country=str(d.pais||d.country||hv.pais||hv.country);
    if(!finite(pc?.honorario?.[country]))continue;
    target={hr:hv,docId:key,uiVisitId:str(hv.id||hv.visitId),hrRowId:str(hv.hrRowId),country,configured:Number(pc.honorario[country])};
    break;
  }
  if(target)break;
}
if(!target?.uiVisitId)fail('PERSISTENCE_FAILURE:ADMIN004_NO_FALLBACK_TARGET');

let admin=null,pageToken;
for(let p=0;p<10&&!admin;p++){
  const lu=await auth.listUsers(1000,pageToken);
  for(const u of lu.users){
    const c=u.customClaims||{},role=str(c.role).toLowerCase(),ns=str(c.authNamespace).toLowerCase(),projects=arr(c.projectIds).map(str);
    if(str(c.tenantId)===TENANT&&ns==='staff'&&['super','admin','ops','coordinador'].includes(role)&&(role==='super'||projects.includes(PROJECT))){admin={uid:u.uid,role};break;}
  }
  pageToken=lu.pageToken;if(!pageToken)break;
}
if(!admin)fail('AUTH_FAILURE:ADMIN004_ADMIN_MISSING');

const browser=await chromium.launch({headless:true});
let browserState=null;
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
  const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  let signed=false,last='';
  for(let a=1;a<=5&&!signed;a++){
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const tok=await auth.createCustomToken(admin.uid);
    try{await page.evaluate(async t=>{const fb=window.firebase;if(!fb?.auth)throw new Error('FIREBASE_NOT_READY');await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},tok);}catch(e){last=String(e?.message||e);if(!/FIREBASE_NOT_READY|firebase is not defined|Execution context was destroyed|navigation|network|timeout|interrupted/i.test(last))throw e;}
    await page.waitForTimeout(700*a);
    signed=await page.evaluate(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,admin.uid).catch(()=>false);
  }
  if(!signed)fail('AUTH_FAILURE:ADMIN004_ADMIN_SIGNIN:'+last);
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({uid,rev})=>{
    const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},src=String(window.CX?.dataSource?.sourceRef||'');
    return String(window.firebase?.auth?.().currentUser?.uid||'')===uid&&c.authenticated===true&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&String(d.previewMeta?.sourceRevision||'')===rev&&src==='hr-live-all-periods+firestore-authenticated-exact-overlay';
  },{uid:admin.uid,rev},{timeout:150000});
  browserState=await page.evaluate(({id,rowId})=>{
    const d=window.CX?.data||{},visits=Array.isArray(d._visitas)?d._visitas:[],visit=visits.find(v=>String(v.id||v.visitId||'')===id||String(v.hrRowId||'')===rowId)||null;
    const liq=typeof window.CX?.liq?.forProject==='function'?window.CX.liq.forProject(d):[];
    const fin=liq.find(v=>String(v.visitaId||v.visitId||'')===id||String(v.hrRowId||'')===rowId)||null;
    const fallbackVisits=visits.filter(v=>v?.honorarioSource==='project_country_config');
    return {
      sourceRef:String(window.CX?.dataSource?.sourceRef||''),
      sourceRevision:String(d.previewMeta?.sourceRevision||''),
      visit:visit?{id:String(visit.id||visit.visitId||''),hrRowId:String(visit.hrRowId||''),country:String(visit.pais||visit.country||''),honorario:visit.honorario??null,honorarioSource:visit.honorarioSource??null,honorarioSourceKnown:visit.honorarioSourceKnown===true}:null,
      finance:fin?{honorario:fin.honorario??null,honorarioSource:fin.honorarioSource??null,honorarioSourceKnown:fin.honorarioSourceKnown===true,total:fin.total??null,financialSourceStatus:fin.financialSourceStatus??null,reviewRequired:fin.reviewRequired===true}:null,
      fallbackVisitCount:fallbackVisits.length,
      fallbackKnownCount:fallbackVisits.filter(v=>v.honorarioSourceKnown===true&&Number.isFinite(Number(v.honorario))).length
    };
  },{id:target.uiVisitId,rowId:target.hrRowId});
  await ctx.close();
}finally{await browser.close();}

if(!browserState?.visit)fail('FUNCTIONAL_DEFECT:ADMIN004_TARGET_VISIT_NOT_PRESENT_AFTER_COMPOSITION');
const composedKnown=browserState.visit.honorarioSourceKnown===true&&finite(browserState.visit.honorario);
const financeKnown=browserState.finance?.honorarioSourceKnown===true&&finite(browserState.finance?.honorario);
let classification;
if(!composedKnown)classification='VISIT_COMPOSITION_DROPS_CONFIGURED_HONORARIUM';
else if(!financeKnown)classification='FINANCE_READ_MODEL_DROPS_COMPOSED_HONORARIUM';
else if(browserState.finance?.reviewRequired===true||browserState.finance?.financialSourceStatus==='pending_or_review')classification='FINANCE_RECONCILIATION_UI_GATING_AFTER_KNOWN_HONORARIUM';
else classification='PROPAGATION_PRESENT_NO_DEFECT_REPRODUCED';

const result={
  schemaVersion:'cxorbia.prei4.admin004.honorarium-propagation-diagnostic.v1',
  decision:'PASS_PREI4_ADMIN_004_HONORARIUM_PROPAGATION_DIAGNOSTIC',
  classification,
  hrRevision:rev,
  durableProject:{version:Number(pc.version||0),honorario:{GT:Number(pc.honorario.GT),HN:Number(pc.honorario.HN)},currency:{GT:pc.currency.GT,HN:pc.currency.HN}},
  runtimeProjectConfig:{version:hr.projectConfigVersion??null,honorario:{GT:Number(config.honorario.GT),HN:Number(config.honorario.HN)}},
  raw:{fallbackVisitCount:fallbackRaw.length,target:{visitFp:fp(target.uiVisitId),hrRowFp:fp(target.hrRowId),country:target.country,rawHonorario:target.hr.honorario??null,configuredHonorario:target.configured}},
  composed:browserState.visit,
  finance:browserState.finance,
  aggregate:{composedFallbackVisitCount:browserState.fallbackVisitCount,composedFallbackKnownCount:browserState.fallbackKnownCount},
  sourceRef:browserState.sourceRef,
  writes:0,builds:0,deploys:0,production:false
};
fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
