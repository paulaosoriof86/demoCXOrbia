#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PREI4_CLEANUP_OUT||'.tmp/prei4-paula-pradera-cleanup');
const ROOT=String(process.env.PREI4_CLEANUP_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.PREI4_CLEANUP_HR_REVISION||'');
let ACTIVE_HR='';
const SOURCE=String(process.env.PREI4_CLEANUP_SOURCE||'');
const TENANT='tya',PROJECT='cinepolis',PERIOD='cinepolis-2026-09';
const TARGET_ROW='SEPTIEMBRE 26!35',TARGET_VISIT='hr_2026-09_gt_35_fb52f0860f',TARGET_POST='app-df8c7d971bb36c2f94aab35f';
const DEV_PROJECT='cxorbia-backend-dev';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex'),fp=v=>sha(v).slice(0,16);
fs.mkdirSync(OUT,{recursive:true});
const write=(n,v)=>fs.writeFileSync(OUT+'/'+n,JSON.stringify(v,null,2)+'\n');
if(!/^[a-f0-9]{40}$/.test(SOURCE)||(EXPECTED_HR&&!/^[a-f0-9]{64}$/.test(EXPECTED_HR)))throw new Error('ENVIRONMENT_FAILURE:CLEANUP_ENV_INVALID');
if(String(process.env.GOOGLE_CLOUD_PROJECT||process.env.GCLOUD_PROJECT||DEV_PROJECT)!==DEV_PROJECT)throw new Error('ENVIRONMENT_FAILURE:CLEANUP_DEV_PROJECT_REQUIRED');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:DEV_PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);

async function liveTarget(tag){
  const r=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?fresh=1&cleanup='+encodeURIComponent(tag)+'-'+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
  if(!r.ok)throw new Error('PROVIDER_FAILURE:CLEANUP_HR_HTTP_'+r.status);
  const body=await r.json(),snap=body.snapshot||body.data||body,rt=body._runtime||snap._runtime||{};
  const rev=str(body.revision||rt.revision||snap.sourceRevision||snap.revision);
  if(!ACTIVE_HR)ACTIVE_HR=rev;
  if(rev!==ACTIVE_HR)throw new Error('SOURCE_FAILURE:CLEANUP_HR_REVISION_DRIFT:'+ACTIVE_HR+'->'+rev);
  if((rt.refreshError??snap.refreshError??null)!==null)throw new Error('PROVIDER_FAILURE:CLEANUP_HR_REFRESH_ERROR');
  if(body.hrWrites===true||snap.hrWrites===true||Number(snap.firestoreWrites||0)!==0)throw new Error('PROVIDER_FAILURE:CLEANUP_HR_WRITE_SIGNAL');
  const visits=arr(snap.visits),v=visits.find(x=>str(x.hrRowId)===TARGET_ROW||str(x.id||x.visitId)===TARGET_VISIT);
  if(!v)throw new Error('MAPPING_FAILURE:CLEANUP_TARGET_HR_ROW_MISSING');
  const f=v.canonicalFacets||{},state=str(v.estado||v.status||v.state).toLowerCase(),shopper=str(v.shopperId);
  const available=typeof f.available==='boolean'?f.available:['disponible','available'].includes(state);
  const assigned=typeof f.assigned==='boolean'?f.assigned:!!shopper;
  if(available!==true||assigned===true||shopper)throw new Error('PROVIDER_FAILURE:CLEANUP_HR_TARGET_NOT_AVAILABLE_UNASSIGNED');
  return {revision:rev,target:{id:str(v.id||v.visitId),hrRowId:str(v.hrRowId),sucursal:str(v.sucursal||v.cinema||v.cine),pais:str(v.pais||v.country),estado:state,available,assigned,shopperId:null},snapshot:snap};
}

const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const paulaRows=members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.visibleLogin).toLowerCase()==='paula.osorio');
if(paulaRows.length!==1)throw new Error('AUTH_FAILURE:CLEANUP_PAULA_MEMBER_COUNT_'+paulaRows.length);
const paula=paulaRows[0],paulaAuth=await auth.getUser(paula.id),claims=paulaAuth.customClaims||{};
const PAULA_SID=str(paula.shopperId||claims.shopperId||paula.id);
if(!PAULA_SID)throw new Error('AUTH_FAILURE:CLEANUP_PAULA_SHOPPER_ID_MISSING');
if(str(claims.shopperId)&&str(claims.shopperId)!==PAULA_SID)throw new Error('AUTH_FAILURE:CLEANUP_PAULA_SHOPPER_ID_CONFLICT');

let adminMember=null;
for(const m of members.filter(x=>x.active===true&&['super','admin','ops','coordinador'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper')){
  try{await auth.getUser(m.id);adminMember=m;break;}catch(error){if(str(error?.code)!=='auth/user-not-found')throw error;}
}
if(!adminMember)throw new Error('AUTH_FAILURE:CLEANUP_ADMIN_MISSING');

const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
const browser=await chromium.launch({headless:true});
async function signed(uid,kind){
  const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
  try{
    for(let attempt=1;attempt<=5;attempt++){
      await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
      const token=await auth.createCustomToken(uid);
      await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token).catch(()=>{});
      const ok=await page.waitForFunction(x=>String(firebase.auth().currentUser?.uid||'')===x,uid,{timeout:45000}).then(()=>true).catch(()=>false);
      if(ok)break;
      if(attempt===5)throw new Error('AUTH_FAILURE:CLEANUP_'+kind.toUpperCase()+'_CUSTOM_TOKEN');
    }
    await page.reload({waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(({uid,kind,rev})=>{
      const c=window.CX?.backendAuth?.context?.()||{},role=String(c.role||'').toLowerCase(),d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{};
      return String(firebase.auth().currentUser?.uid||'')===uid&&c.authenticated===true&&(kind==='shopper'?role==='shopper':role!=='shopper'&&role!=='cliente')&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(d.previewMeta?.sourceRevision||'')===rev;
    },{uid,kind,rev:ACTIVE_HR},{timeout:150000});
    return {ctx,page};
  }catch(error){await ctx.close().catch(()=>{});throw error;}
}
async function shopperReadback(){
  const s=await signed(paula.id,'shopper');
  try{
    return await s.page.evaluate(({sid,row,visit})=>{
      const d=window.CX?.data||{},hist=typeof d.shopperHistoryVisits==='function'?d.shopperHistoryVisits(sid,false):null;
      if(!Array.isArray(hist))throw new Error('SHOPPER_HISTORY_API_MISSING');
      const target=(d._visitas||[]).filter(v=>[String(v.hrRowId||''),String(v.id||v.visitId||'')].some(x=>x===row||x===visit));
      const active=target.filter(v=>{const f=d.visitFacets(v);return String(v.shopperId||'')===sid&&f.assigned===true&&f.cancelled!==true;});
      return {sourceRevision:String(d.previewMeta?.sourceRevision||''),historyCount:hist.length,targetActiveCount:active.length,targetRows:target.length};
    },{sid:PAULA_SID,row:TARGET_ROW,visit:TARGET_VISIT});
  }finally{await s.ctx.close();}
}
async function dashboardReadback(){
  const a=await signed(adminMember.id,'admin');
  try{
    await a.page.evaluate(()=>CX.router.nav('dashboard',{history:false}));
    await a.page.waitForTimeout(700);
    return await a.page.evaluate(()=>{
      const d=window.CX?.data||{},rows=Array.isArray(d.__liveHrVisits)?d.__liveHrVisits:[],period=String(d.currentPeriodId||'');
      const pool=rows.filter(v=>{const rp=String(d.recordPeriodId?d.recordPeriodId(v):(v.periodId||v.projectId)||'');return (!period||rp===period)&&d.inScope(v.pais)&&!v._archived;});
      const facets=v=>d.visitFacets(v),assigned=pool.filter(v=>{const f=facets(v);return f.assigned&&!f.cancelled;}).length;
      const unassigned=pool.filter(v=>{const f=facets(v);return !f.assigned&&!f.realized&&!f.cancelled;}).length;
      const n=id=>Number(document.querySelector('[data-kpi="'+id+'"] .k-v')?.textContent||NaN);
      return {sourceRevision:String(d.previewMeta?.sourceRevision||''),period,hrPool:pool.length,hrAssigned:assigned,hrUnassigned:unassigned,uiAssigned:n('asign'),uiUnassigned:n('sinasign')};
    });
  }finally{await a.ctx.close();}
}

const beforeHr=await liveTarget('before'),beforeShopper=await shopperReadback();
const postRef=project.collection('postulations').doc(TARGET_POST),postSnap=await postRef.get();
let postDeleted=0;
if(postSnap.exists){
  const p=postSnap.data()||{};
  if(str(p.periodId)!==PERIOD||str(p.hrRowId)!==TARGET_ROW||str(p.visitId||p.visitaId)!==TARGET_VISIT||str(p.shopperId)!==PAULA_SID)throw new Error('PERSISTENCE_FAILURE:CLEANUP_TARGET_POST_MISMATCH');
}

const visitDocs=(await project.collection('visits').get()).docs.map(d=>({ref:d.ref,id:d.id,data:d.data()||{}})).filter(x=>str(x.data.hrRowId)===TARGET_ROW||[str(x.id),str(x.data.id),str(x.data.visitId)].includes(TARGET_VISIT));
if(visitDocs.length>3)throw new Error('PERSISTENCE_FAILURE:CLEANUP_VISIT_BOUND_'+visitDocs.length);
let visitOverlayCleared=0;
for(const x of visitDocs){
  const v=x.data,platformOverlay=str(v.assignmentSource)==='platform'||str(v.shopperId)===PAULA_SID||str(v.approvedApplicationId)===TARGET_POST;
  if(platformOverlay){
    await x.ref.set({shopperId:null,shopper:null,estado:'disponible',status:'disponible',assignmentSource:null,assignmentSyncStatus:null,approvedApplicationId:null,proposedScheduleDate:null,lastSyncedAt:new Date().toISOString(),canonicalFacets:{...(v.canonicalFacets||{}),available:true,assigned:false,cancelled:false},updatedAt:new Date().toISOString(),version:Number(v.version||0)+1},{merge:true});
    visitOverlayCleared++;
  }
}

const reservationDocs=(await project.collection('reservations').get()).docs.map(d=>({ref:d.ref,id:d.id,data:d.data()||{}}));
const reservationTargets=reservationDocs.filter(x=>{
  const r=x.data;
  return str(r.periodId)===PERIOD&&str(r.shopperId)===PAULA_SID&&([str(r.hrRowId),str(r.visitId),str(r.visitaId)].some(y=>y===TARGET_ROW||y===TARGET_VISIT));
});
if(reservationTargets.length>10)throw new Error('PERSISTENCE_FAILURE:CLEANUP_RESERVATION_BOUND_'+reservationTargets.length);

const bulletins=(await tenant.collection('bulletins').get()).docs.map(d=>({ref:d.ref,id:d.id,data:d.data()||{}}));
const relatedEntityIds=new Set([TARGET_ROW,TARGET_VISIT,TARGET_POST,...reservationTargets.map(x=>x.id)]);
const bulletinTargets=bulletins.filter(x=>{
  const b=x.data,targets=arr(b.targetShopperIds).map(str),entity=str(b.entityId),key=str(b.idempotencyKey);
  const projectScoped=!arr(b.targetProjectIds).length||arr(b.targetProjectIds).map(str).includes(PROJECT);
  return projectScoped&&targets.includes(PAULA_SID)&&(relatedEntityIds.has(entity)||[TARGET_ROW,TARGET_VISIT,TARGET_POST].some(k=>key.includes(k)));
});
if(bulletinTargets.length>20)throw new Error('PERSISTENCE_FAILURE:CLEANUP_BULLETIN_BOUND_'+bulletinTargets.length);
const bulletinIds=new Set(bulletinTargets.map(x=>x.id));
const readDocs=(await tenant.collection('bulletinReads').get()).docs.map(d=>({ref:d.ref,id:d.id,data:d.data()||{}})).filter(x=>bulletinIds.has(str(x.data.bulletinId)));
if(readDocs.length>50)throw new Error('PERSISTENCE_FAILURE:CLEANUP_BULLETIN_READ_BOUND_'+readDocs.length);

for(const x of reservationTargets)await x.ref.delete();
for(const x of readDocs)await x.ref.delete();
for(const x of bulletinTargets)await x.ref.delete();
if(postSnap.exists){await postRef.delete();postDeleted=1;}

const afterHr=await liveTarget('after');
if(afterHr.revision!==beforeHr.revision)throw new Error('SOURCE_FAILURE:CLEANUP_HR_REVISION_DRIFT');
const postAfter=await postRef.get();
if(postAfter.exists)throw new Error('PERSISTENCE_FAILURE:CLEANUP_POST_READBACK');
const reservationsAfter=(await project.collection('reservations').get()).docs.map(d=>d.data()||{}).filter(r=>str(r.periodId)===PERIOD&&str(r.shopperId)===PAULA_SID&&([str(r.hrRowId),str(r.visitId),str(r.visitaId)].some(y=>y===TARGET_ROW||y===TARGET_VISIT)));
if(reservationsAfter.length)throw new Error('PERSISTENCE_FAILURE:CLEANUP_RESERVATION_READBACK');
const bulletinsAfter=(await tenant.collection('bulletins').get()).docs.map(d=>({id:d.id,...(d.data()||{})})).filter(b=>arr(b.targetShopperIds).map(str).includes(PAULA_SID)&&(relatedEntityIds.has(str(b.entityId))||[TARGET_ROW,TARGET_VISIT,TARGET_POST].some(k=>str(b.idempotencyKey).includes(k))));
if(bulletinsAfter.length)throw new Error('PERSISTENCE_FAILURE:CLEANUP_BULLETIN_READBACK');

const afterShopper=await shopperReadback();
if(afterShopper.sourceRevision!==ACTIVE_HR||afterShopper.targetActiveCount!==0)throw new Error('FUNCTIONAL_DEFECT:CLEANUP_PAULA_ACTIVE_READBACK:'+JSON.stringify(afterShopper));
if(afterShopper.historyCount!==beforeShopper.historyCount)throw new Error('PERSISTENCE_FAILURE:CLEANUP_PAULA_HISTORY_CHANGED:'+beforeShopper.historyCount+'->'+afterShopper.historyCount);
const dashboard=await dashboardReadback();
if(dashboard.sourceRevision!==ACTIVE_HR||dashboard.uiAssigned!==dashboard.hrAssigned||dashboard.uiUnassigned!==dashboard.hrUnassigned)throw new Error('FUNCTIONAL_DEFECT:CLEANUP_DASHBOARD_HR_PARITY:'+JSON.stringify(dashboard));

const result={
  schemaVersion:'cxorbia.prei4.paula-pradera-safe-cleanup.v1',
  decision:'PASS_PREI4_PAULA_PRADERA_SAFE_CLEANUP',
  sourceSha:SOURCE,initialExpectedHrRevision:EXPECTED_HR||null,hrRevision:ACTIVE_HR,hrRevisionChangedSinceRunStart:Boolean(EXPECTED_HR&&EXPECTED_HR!==ACTIVE_HR),target:{hrRowId:TARGET_ROW,visitId:TARGET_VISIT,postulationId:TARGET_POST,shopperFp:fp(PAULA_SID),branch:afterHr.target.sucursal},
  cleanup:{postDeleted,visitOverlayCleared,reservationsDeleted:reservationTargets.length,bulletinsDeleted:bulletinTargets.length,bulletinReadsDeleted:readDocs.length},
  readback:{hrAvailable:afterHr.target.available,hrAssigned:afterHr.target.assigned,paulaActiveTarget:afterShopper.targetActiveCount,paulaHistoryBefore:beforeShopper.historyCount,paulaHistoryAfter:afterShopper.historyCount,dashboard},
  hrWrites:0,production:false
};
write('result.json',result);
console.log(JSON.stringify({decision:result.decision,cleanup:result.cleanup,readback:result.readback},null,2));
await browser.close();
