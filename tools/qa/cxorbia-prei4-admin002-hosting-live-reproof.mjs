#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PREI4_002_LIVE_OUT||'.tmp/prei4-admin-002-live');
const ROOT=String(process.env.PREI4_002_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.PREI4_002_SOURCE||'');
const TREE=String(process.env.PREI4_002_TREE||'');
const EXPECTED_HR=String(process.env.PREI4_002_HR_REVISION||'');
const TENANT='tya',PROJECT='cinepolis',PERIOD='cinepolis-2026-09';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v);
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(stable(v))).digest('hex');
const fp=v=>sha(v).slice(0,16);
const write=(name,v)=>fs.writeFileSync(OUT+'/'+name,JSON.stringify(v,null,2)+'\n');
fs.mkdirSync(OUT,{recursive:true});
if(!/^[a-f0-9]{40}$/.test(SOURCE)||!/^[a-f0-9]{40}$/.test(TREE)||!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('ENVIRONMENT_FAILURE:PREI4_002_LIVE_ENV');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),project=db.collection('tenants').doc(TENANT).collection('projects').doc(PROJECT);

async function postSnapshot(){
  const docs=(await project.collection('postulations').get()).docs.map(d=>({docId:d.id,updateTime:d.updateTime?.toDate?.().toISOString?.()||'',data:d.data()||{}})).sort((a,b)=>a.docId.localeCompare(b.docId));
  return {count:docs.length,hash:sha(docs.map(x=>({docId:x.docId,updateTime:x.updateTime,data:x.data}))),current:docs.filter(x=>str(x.data.periodId)===PERIOD).length};
}
const durableBefore=await postSnapshot();
const currentPosts=(await project.collection('postulations').where('periodId','==',PERIOD).get()).docs.map(d=>({docId:d.id,...(d.data()||{})}));
/* Durable rows are audit facts. _archived is intentionally a composed HR-vs-platform lifecycle
   projection and must not be required as a persisted field. The live UI below is the authority
   for active-vs-historical visibility; this test only proves the durable graph is read-only. */
const durableSummary={
  total:currentPosts.length,
  statusCounts:Object.fromEntries([...new Set(currentPosts.map(x=>str(x.status||x.estado)||'unknown'))].sort().map(k=>[k,currentPosts.filter(x=>(str(x.status||x.estado)||'unknown')===k).length])),
  shopperIds:[...new Set(currentPosts.map(x=>str(x.shopperId)).filter(Boolean))].length,
  visitIds:[...new Set(currentPosts.map(x=>str(x.visitId||x.visitaId)).filter(Boolean))].length
};
write('durable-precondition.json',{period:PERIOD,...durableSummary,docIds:currentPosts.map(x=>x.docId).sort()});

let admin=null,shopper=null,pageToken=undefined;
const archivedShopperIds=new Set(currentPosts.map(x=>str(x.shopperId)).filter(Boolean));
for(let page=0;page<10&&(!admin||!shopper);page++){
  const listed=await auth.listUsers(1000,pageToken);
  for(const u of listed.users){
    const c=u.customClaims||{},role=str(c.role).toLowerCase(),namespace=str(c.authNamespace).toLowerCase(),tenant=str(c.tenantId),projects=arr(c.projectIds).map(str),sid=str(c.shopperId);
    if(!admin&&tenant===TENANT&&namespace==='staff'&&['super','admin','ops','coordinador'].includes(role)&&(role==='super'||projects.includes(PROJECT)))admin={uid:u.uid,role,namespace};
    if(!shopper&&tenant===TENANT&&namespace==='shopper'&&role==='shopper'&&projects.includes(PROJECT)&&sid&&archivedShopperIds.has(sid))shopper={uid:u.uid,role,namespace,shopperId:sid};
  }
  pageToken=listed.pageToken;if(!pageToken)break;
}
if(!admin)throw new Error('AUTH_FAILURE:PREI4_002_ADMIN_CLAIMS_MISSING');
if(!shopper)throw new Error('AUTH_FAILURE:PREI4_002_ARCHIVED_SHOPPER_CLAIMS_MISSING');

const meta=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=meta&fresh=1&prei4002live='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)}).then(async r=>{if(!r.ok)throw new Error('PROVIDER_FAILURE:PREI4_002_META_HTTP_'+r.status);return r.json();});
const metaRevision=str(meta?.revision||meta?._runtime?.revision||meta?.sourceRevision);
if(metaRevision!==EXPECTED_HR)throw new Error('SOURCE_FAILURE:PREI4_002_HR_REVISION:'+metaRevision);

const browser=await chromium.launch({headless:true});
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';

async function signed(principal,kind){
  const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
  try{
    let ok=false;
    for(let attempt=1;attempt<=5&&!ok;attempt++){
      await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
      const token=await auth.createCustomToken(principal.uid);
      try{await page.evaluate(async t=>{const fb=window.firebase;if(!fb?.auth)throw new Error('FIREBASE_NOT_READY');await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},token);}catch(e){if(!/FIREBASE_NOT_READY|firebase is not defined|auth\/network-request-failed|Execution context was destroyed|navigation|network|timeout|interrupted/i.test(String(e?.message||e)))throw e;}
      await page.waitForTimeout(700*attempt);
      ok=await page.evaluate(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,principal.uid).catch(()=>false);
    }
    if(!ok)throw new Error('AUTH_FAILURE:PREI4_002_'+kind.toUpperCase()+'_CUSTOM_TOKEN');
    await page.reload({waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,principal.uid,{timeout:90000});
    await page.waitForFunction(({kind,rev})=>{
      const c=window.CX?.backendAuth?.context?.()||{},role=String(c.role||'').toLowerCase(),d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{};
      return c.authenticated===true&&(kind==='shopper'?role==='shopper':role!=='shopper'&&role!=='cliente')&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(d.previewMeta?.sourceRevision||'')===rev;
    },{kind,rev:EXPECTED_HR},{timeout:150000});
    return {ctx,page};
  }catch(e){await ctx.close().catch(()=>{});throw e;}
}

async function adminProof(page){
  await page.evaluate(()=>CX.router.nav('postulaciones',{history:false}));
  await page.waitForTimeout(900);
  const initial=await page.evaluate(()=>{
    const d=window.CX?.data||{},period=String(d.currentPeriodId||''),periodOf=x=>String(d.recordPeriodId?d.recordPeriodId(x):(x.periodId||x.projectId)||'');
    const rows=(d._posts||[]).filter(x=>periodOf(x)===period),isHistorical=x=>x?._archived===true||x?.active===false||String(x?.postulationLifecycle||'')==='transitioned_to_assignment';
    const active=rows.filter(x=>!isHistorical(x)),historical=rows.filter(isHistorical),hrArchived=rows.filter(x=>x?._archived===true),transitioned=rows.filter(x=>x?._archived!==true&&(x?.active===false||String(x?.postulationLifecycle||'')==='transitioned_to_assignment')),synthetic=rows.filter(x=>/^hr-post-/.test(String(x?.id||'')));
    const visible=[...document.querySelectorAll('[data-pid]')].filter(el=>el.offsetParent!==null).length;
    return {sourceRevision:String(d.previewMeta?.sourceRevision||''),period,rows:rows.length,active:active.length,historical:historical.length,hrArchived:hrArchived.length,transitioned:transitioned.length,synthetic:synthetic.length,dataPosts:typeof d.posts==='function'?d.posts().length:null,visible};
  });
  const hist=await page.evaluate(()=>{
    const d=window.CX?.data||{},period=String(d.currentPeriodId||''),periodOf=x=>String(d.recordPeriodId?d.recordPeriodId(x):(x.periodId||x.projectId)||''),isHistorical=x=>x?._archived===true||x?.active===false||String(x?.postulationLifecycle||'')==='transitioned_to_assignment';
    const currentHistoricalIds=new Set((d._posts||[]).filter(x=>periodOf(x)===period&&isHistorical(x)).map(x=>String(x.id||x.applicationId||x.postulationId||'')));
    const box=document.getElementById('pHist');if(!box)throw new Error('HIST_CONTROL_MISSING');box.checked=true;box.dispatchEvent(new Event('input',{bubbles:true}));box.dispatchEvent(new Event('change',{bubbles:true}));
    const cards=[...document.querySelectorAll('[data-pid]')].filter(el=>el.offsetParent!==null),currentCards=cards.filter(el=>currentHistoricalIds.has(String(el.getAttribute('data-pid')||'')));
    return {visibleAllPeriods:cards.length,currentVisible:currentCards.length,currentHistoricalLabels:currentCards.filter(el=>/HISTÓRICA/i.test(String(el.innerText||''))).length,currentTransitionedVisible:currentCards.filter(el=>String(el.getAttribute('data-post-lifecycle')||'')==='transitioned_to_assignment').length};
  });
  if(initial.sourceRevision!==EXPECTED_HR||initial.period!==PERIOD||initial.active!==0||initial.historical!==initial.rows||initial.synthetic!==0||initial.dataPosts!==0||initial.visible!==0)throw new Error('FUNCTIONAL_DEFECT:PREI4_002_ADMIN_ACTIVE_SURFACE:'+JSON.stringify(initial));
  if(hist.currentVisible!==initial.historical||hist.currentHistoricalLabels!==hist.currentVisible||hist.currentTransitionedVisible!==initial.transitioned||hist.visibleAllPeriods<hist.currentVisible)throw new Error('FUNCTIONAL_DEFECT:PREI4_002_ADMIN_HISTORY_SURFACE:'+JSON.stringify({initial,hist}));
  return {initial,historical:hist};
}

async function shopperProof(page,shopperId){
  await page.evaluate(()=>CX.router.nav('misvisitas',{history:false}));
  await page.waitForTimeout(900);
  const proof=await page.evaluate(({sid,period,rev})=>{
    const d=window.CX?.data||{},periodOf=x=>String(d.recordPeriodId?d.recordPeriodId(x):(x.periodId||x.projectId)||'');
    const own=(d._posts||[]).filter(x=>String(x.shopperId||'')===sid&&periodOf(x)===period),isHistorical=x=>x?._archived===true||x?.active===false||String(x?.postulationLifecycle||'')==='transitioned_to_assignment',active=own.filter(x=>!isHistorical(x)),historical=own.filter(isHistorical);
    const body=String(document.body?.innerText||'');
    return {sourceRevision:String(d.previewMeta?.sourceRevision||''),own:own.length,active:active.length,historical:historical.length,appRows:document.querySelectorAll('[data-app-state]').length,hasApplicationSection:body.includes('Estado de tus postulaciones')};
  },{sid:shopperId,period:PERIOD,rev:EXPECTED_HR});
  if(proof.sourceRevision!==EXPECTED_HR||proof.historical<1||proof.active!==0||proof.appRows!==0||proof.hasApplicationSection)throw new Error('FUNCTIONAL_DEFECT:PREI4_002_SHOPPER_ACTIVE_SURFACE:'+JSON.stringify(proof));
  return proof;
}

const evidence={schemaVersion:'cxorbia.prei4.admin002.hosting-live-reproof.v1',decision:'HOLD',sourceSha:SOURCE,sourceTree:TREE,hrRevision:EXPECTED_HR,admin:null,shopper:null,durableBefore,production:false,firestoreWrites:0,hrWrites:0,runtimeDeploys:0};
try{
  const a=await signed(admin,'admin');evidence.admin=await adminProof(a.page);await a.ctx.close();
  const s=await signed(shopper,'shopper');evidence.shopper={shopperFp:fp(shopper.shopperId),proof:await shopperProof(s.page,shopper.shopperId)};await s.ctx.close();
  const durableAfter=await postSnapshot();evidence.durableAfter=durableAfter;
  if(durableAfter.count!==durableBefore.count||durableAfter.hash!==durableBefore.hash)throw new Error('PERSISTENCE_FAILURE:PREI4_002_DURABLE_MUTATION');
  evidence.decision='PASS_PREI4_ADMIN_002_HOSTING_LIVE';
  write('result.json',evidence);
  console.log(JSON.stringify({decision:evidence.decision,admin:evidence.admin.initial,shopper:evidence.shopper.proof,durableUnchanged:true},null,2));
}catch(error){
  evidence.decision='FAIL_PREI4_ADMIN_002_HOSTING_LIVE';evidence.error=String(error?.stack||error);
  write('result.json',evidence);throw error;
}finally{await browser.close();}
