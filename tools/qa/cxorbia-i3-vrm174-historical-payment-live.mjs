#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const HOST=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const OUT=String(process.env.VRM174_OUT||'.tmp/i3-vrm174-historical-payment').trim();
const TENANT='tya',PROJECT_ID='cinepolis';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
fs.mkdirSync(OUT,{recursive:true});

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT_ID);
const visits=(await project.collection('visits').get()).docs.map(d=>({__docId:d.id,...(d.data()||{})}));
const historicalPaid=visits.filter(v=>v.paymentConfirmed===true||v.historicalReconciliationConfirmed===true||str(v.historicalPaymentStatus).toLowerCase()==='paid');
assert(historicalPaid.length>0,'SOURCE_FAILURE:VRM174_NO_DURABLE_HISTORICAL_PAID');

const byPeriod=new Map();
for(const v of historicalPaid){
  const periodId=str(v.periodId); if(!periodId) continue;
  if(!byPeriod.has(periodId))byPeriod.set(periodId,[]);
  byPeriod.get(periodId).push(v);
}
assert(byPeriod.size>0,'SOURCE_FAILURE:VRM174_NO_PAID_PERIODS');

const users=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const staff=users.find(x=>x.active===true&&str(x.authNamespace).toLowerCase()==='staff'&&['super','admin'].includes(str(x.role).toLowerCase())&&(str(x.role).toLowerCase()==='super'||arr(x.projectIds).map(String).includes(PROJECT_ID)));
assert(staff,'AUTH_FAILURE:VRM174_ADMIN_MISSING');

async function apiKey(){
  const r=await fetch(HOST+'/__/firebase/init.json',{headers:{'cache-control':'no-store'}});
  assert(r.ok,'ENVIRONMENT_FAILURE:VRM174_FIREBASE_INIT_'+r.status);
  return str((await r.json()).apiKey);
}
const baseUrl=HOST+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function browserSignIn(page){
  const attempts=[];
  for(let attempt=1;attempt<=5;attempt++){
    const custom=await auth.createCustomToken(staff.id);
    try{
      await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:45000});
      const state=await page.evaluate(async token=>{
        try{
          const f=window.firebase;
          if(!f?.auth||!Array.isArray(f.apps)||!f.apps.length)return {ok:false,code:'FIREBASE_SDK_NOT_READY'};
          await f.auth().setPersistence(f.auth.Auth.Persistence.SESSION);
          const credential=await f.auth().signInWithCustomToken(token);
          return {ok:true,uid:String(credential?.user?.uid||'')};
        }catch(error){return {ok:false,code:String(error?.code||''),message:String(error?.message||error)};}
      },custom);
      if(state?.ok===true)return {ok:true,attempt,attempts};
      attempts.push({attempt,code:str(state?.code),message:str(state?.message).slice(0,200)});
    }catch(error){
      attempts.push({attempt,code:'PLAYWRIGHT_OR_AUTH',message:str(error?.message||error).slice(0,200)});
    }
    if(attempt<5){
      await sleep(800*attempt);
      await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000}).catch(()=>{});
    }
  }
  const err=new Error('ENVIRONMENT_FAILURE:VRM174_BROWSER_AUTH_TRANSIENT_EXHAUSTED');
  err.attempts=attempts;
  throw err;
}
async function stableHrState(page){
  try{
    await page.waitForFunction(()=>{
      const c=window.CX?.backendAuth?.context?.()||{},a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},d=window.CX?.data||{},ds=window.CX?.dataSource||{},periods=Array.isArray(d.projects)?d.projects:[],authorityPeriods=Number(a.periods||0),revision=String(d.previewMeta?.sourceRevision||'').trim();
      return c.authenticated===true&&a.applied===true&&ds.sourceRef==='hr-live-all-periods+firestore-authenticated-exact-overlay'&&periods.length>0&&(!authorityPeriods||periods.length===authorityPeriods)&&revision.length>0&&window.CX_TYA_CANONICAL_FINANCE_READ_MODEL?.ready===true;
    },null,{timeout:150000});
  }catch(error){
    const diag=await page.evaluate(()=>{
      const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},d=window.CX?.data||{},ds=window.CX?.dataSource||{},periods=Array.isArray(d.projects)?d.projects:[];
      return {authorityApplied:a.applied===true,authorityPeriods:Number(a.periods||0),periodCount:periods.length,periodIds:periods.map(p=>String(p?.id||p?.periodId||'')).filter(Boolean).slice(0,30),sourceRef:String(ds.sourceRef||''),sourceRevision:String(d.previewMeta?.sourceRevision||''),currentPeriodId:String(d.currentPeriodId||'')};
    }).catch(()=>({browserStateUnavailable:true}));
    throw new Error('ENVIRONMENT_FAILURE:VRM174_HR_COMPOSITION_NOT_STABLE:'+JSON.stringify(diag));
  }
  return page.evaluate(()=>{
    const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},d=window.CX?.data||{},ds=window.CX?.dataSource||{},periods=Array.isArray(d.projects)?d.projects:[];
    return {authorityPeriods:Number(a.periods||0),periodIds:periods.map(p=>String(p?.id||p?.periodId||'')).filter(Boolean),sourceRef:String(ds.sourceRef||''),sourceRevision:String(d.previewMeta?.sourceRevision||''),currentPeriodId:String(d.currentPeriodId||'')};
  });
}
const browser=await chromium.launch({headless:true});
const result={schemaVersion:'cxorbia.i3.vrm174.historical-payment-live.v1',decision:'HOLD',durableHistoricalPaid:historicalPaid.length,periods:[],writes:0,hrWrites:0,externalWrites:0,builds:0,deploys:0,production:false};
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
  await browserSignIn(page);
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({TENANT,PROJECT_ID})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===TENANT&&['super','admin'].includes(String(c.role||''))&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(PROJECT_ID)))&&window.CX_TYA_CANONICAL_FINANCE_READ_MODEL?.ready===true;},{TENANT,PROJECT_ID},{timeout:120000});
  const initialState=await stableHrState(page);
  result.hrRevision=initialState.sourceRevision;
  result.authorityPeriodCount=initialState.authorityPeriods;
  const expectedPeriodIds=[...byPeriod.keys()].sort(),missingPeriods=expectedPeriodIds.filter(id=>!initialState.periodIds.includes(id));
  assert(missingPeriods.length===0,'MAPPING_FAILURE:VRM174_STABLE_HR_PERIODS_MISSING:'+JSON.stringify({missingPeriods,periodIds:initialState.periodIds}));

  for(const [periodId,rows] of [...byPeriod.entries()].sort()){
    const expected=rows.map(v=>({docId:str(v.__docId),id:str(v.id),visitId:str(v.visitId),hrRowId:str(v.hrRowId)}));
    const before=await stableHrState(page);
    assert(before.sourceRevision===result.hrRevision,'SOURCE_FAILURE:VRM174_HR_REVISION_DRIFT_BEFORE_PERIOD:'+periodId);
    const selected=await page.evaluate(periodId=>window.CX?.data?.setProject?.(periodId)===true,periodId);
    assert(selected,'MAPPING_FAILURE:VRM174_SET_PERIOD_FAILED:'+periodId);
    await page.waitForFunction(periodId=>{
      const d=window.CX?.data||{},a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},ds=window.CX?.dataSource||{};
      return d.currentPeriodId===periodId&&a.applied===true&&ds.sourceRef==='hr-live-all-periods+firestore-authenticated-exact-overlay';
    },periodId,{timeout:60000});
    const after=await stableHrState(page);
    assert(after.sourceRevision===result.hrRevision,'SOURCE_FAILURE:VRM174_HR_REVISION_DRIFT_AFTER_PERIOD:'+periodId);
    const observed=await page.evaluate(({periodId,expected})=>{
      const liqs=window.CX?.liq?.forProject?.(window.CX.data)||[];
      const match=(l,e)=>{
        const keys=[l?.visitaId,l?.visitId,l?.hrRowId].map(x=>String(x||'')).filter(Boolean);
        return [e.docId,e.id,e.visitId,e.hrRowId].filter(Boolean).some(k=>keys.includes(String(k)));
      };
      const rows=expected.map(e=>{
        const l=liqs.find(x=>match(x,e));
        return {key:e.hrRowId||e.visitId||e.id||e.docId,found:!!l,estado:String(l?.estado||''),paymentConfirmed:l?.paymentConfirmed===true,paymentState:String(l?.paymentState||''),financialSourceStatus:String(l?.financialSourceStatus||''),historicalReconciliationConfirmed:l?.historicalReconciliationConfirmed===true,paymentSourceRef:String(l?.paymentSourceRef||l?.reconciliationSourceRef||''),benefitsPaid:!!(l&&l.paymentConfirmed===true&&((l.paymentSourceRef||l.reconciliationSourceRef)||l.historicalReconciliationConfirmed===true))};
      });
      return {periodId,liquidationCount:liqs.length,rows};
    },{periodId,expected});
    const misses=observed.rows.filter(x=>!x.found||!x.paymentConfirmed||x.estado!=='pagada'||!x.benefitsPaid);
    assert(misses.length===0,'MAPPING_FAILURE:VRM174_HISTORICAL_PAID_PROJECTION:'+periodId+':'+JSON.stringify(misses.slice(0,5)));
    result.periods.push({periodId,expectedPaid:rows.length,projectedPaid:observed.rows.length,misses:0,liquidationCount:observed.liquidationCount,sourceRevision:result.hrRevision});
  }
  result.decision='PASS_I3_VRM174_HISTORICAL_PAYMENT_LIVE';
  result.periodCount=result.periods.length;
  result.projectedHistoricalPaid=result.periods.reduce((n,p)=>n+p.projectedPaid,0);
  assert(result.projectedHistoricalPaid===historicalPaid.filter(v=>str(v.periodId)).length,'MAPPING_FAILURE:VRM174_TOTAL_COUNT_MISMATCH');
  await ctx.close();
}finally{
  await browser.close();
  fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
}
if(result.decision!=='PASS_I3_VRM174_HISTORICAL_PAYMENT_LIVE')process.exit(1);
