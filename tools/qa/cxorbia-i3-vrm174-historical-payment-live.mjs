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
async function browserSignIn(page){
  const custom=await auth.createCustomToken(staff.id);
  await page.evaluate(async token=>{
    await window.firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
    await window.firebase.auth().signInWithCustomToken(token);
  },custom);
}
const baseUrl=HOST+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
const browser=await chromium.launch({headless:true});
const result={schemaVersion:'cxorbia.i3.vrm174.historical-payment-live.v1',decision:'HOLD',durableHistoricalPaid:historicalPaid.length,periods:[],writes:0,hrWrites:0,externalWrites:0,builds:0,deploys:0,production:false};
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
  await browserSignIn(page);
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({TENANT,PROJECT_ID})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===TENANT&&['super','admin'].includes(String(c.role||''))&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(PROJECT_ID)))&&window.CX_TYA_CANONICAL_FINANCE_READ_MODEL?.ready===true;},{TENANT,PROJECT_ID},{timeout:120000});

  for(const [periodId,rows] of [...byPeriod.entries()].sort()){
    const expected=rows.map(v=>({docId:str(v.__docId),id:str(v.id),visitId:str(v.visitId),hrRowId:str(v.hrRowId)}));
    const hasPeriod=await page.evaluate(periodId=>Array.isArray(window.CX?.data?.projects)&&window.CX.data.projects.some(p=>String(p?.id||'')===periodId),periodId);
    assert(hasPeriod,'MAPPING_FAILURE:VRM174_PERIOD_NOT_AVAILABLE:'+periodId);
    await page.evaluate(async periodId=>{
      if(!window.CX?.data?.setProject?.(periodId))throw new Error('SET_PERIOD_FAILED:'+periodId);
      await window.CX?.backend?.refresh?.();
      if(typeof window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY==='function')await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY('vrm174_historical_payment_reproof');
    },periodId);
    await page.waitForFunction(periodId=>window.CX?.data?.currentPeriodId===periodId&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,periodId,{timeout:120000});
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
      window.CX?.router?.nav?.('beneficios');
      return {periodId,liquidationCount:liqs.length,rows};
    },{periodId,expected});
    await page.waitForTimeout(350);
    const visible=await page.evaluate(()=>({text:String(document.body?.innerText||''),route:String(window.CX?.router?.current||'')}));
    const misses=observed.rows.filter(x=>!x.found||!x.paymentConfirmed||x.estado!=='pagada'||!x.benefitsPaid);
    assert(misses.length===0,'MAPPING_FAILURE:VRM174_HISTORICAL_PAID_PROJECTION:'+periodId+':'+JSON.stringify(misses.slice(0,5)));
    const paidLabel=/Pago confirmado|Pagado/i.test(visible.text);
    assert(paidLabel,'VISUAL_DEFECT:VRM174_BENEFITS_PAID_LABEL_MISSING:'+periodId);
    result.periods.push({periodId,expectedPaid:rows.length,projectedPaid:observed.rows.length,misses:0,paidLabelVisible:true,liquidationCount:observed.liquidationCount});
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
