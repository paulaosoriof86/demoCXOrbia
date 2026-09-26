import fs from 'node:fs';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';

const OUT=process.env.V41_OUT||'.tmp/i3-v41',ROOT=String(process.env.V41_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT='tya',PROJECT='cinepolis',PERIOD='cinepolis-2026-09',PERIOD_KEY='2026-09';
const INVALID='shopper_gt_018ca3e794',MILTON='shopper_gt_bd74ace936',PAULA_HIST='shopper_gt_1440137b73';
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],norm=v=>v==null?'':String(v).trim();
const evidence={schemaVersion:'cxorbia.i3.v41.second-review-live-reproof.v1',decision:'HOLD',production:false,deploys:0,builds:0,hrWrites:0,providerWrites:0};
const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
async function authExists(m){try{await auth.getUser(m.id);return true;}catch{return false;}}
let admin=null,shopper=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper'))if(await authExists(m)){admin=m;break;}
for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.visibleLogin).toLowerCase()==='paula.osorio'))if(await authExists(m)){shopper=m;break;}
if(!admin||!shopper)throw new Error('AUTH_FAILURE:V41_PRINCIPAL_MISSING');

const visits=project.collection('visits'),posts=project.collection('postulations'),reservations=project.collection('reservations');
const durable=(await visits.where('periodId','==',PERIOD).get()).docs.filter(d=>(d.data()||{}).excludedFromCanonicalReadModel!==true);
const durableKeys=durable.map(d=>str((d.data()||{}).hrRowId)).filter(Boolean);
const duplicateKeys=[...new Set(durableKeys.filter((x,i,a)=>a.indexOf(x)!==i))];
const invalidPosts=(await posts.where('shopperId','==',INVALID).get()).size;
const invalidReservations=(await reservations.where('shopperId','==',INVALID).get()).size;
const invalidActiveMembers=(await tenant.collection('users').where('shopperId','==',INVALID).get()).docs.filter(d=>(d.data()||{}).active===true).length;
const miltonSnap=await tenant.collection('shoppers').doc(MILTON).get(),milton=miltonSnap.exists?(miltonSnap.data()||{}):null;
evidence.durable={currentCount:durable.length,uniqueHrRows:new Set(durableKeys).size,duplicateKeys,invalidPosts,invalidReservations,invalidActiveMembers,miltonExists:!!milton,miltonName:str(milton?.nombre||[milton?.firstName,milton?.lastName].filter(Boolean).join(' '))};
if(durable.length!==44||new Set(durableKeys).size!==44||duplicateKeys.length)throw new Error('PERSISTENCE_FAILURE:V41_DURABLE_CURRENT_VISIT_PARITY');
if(invalidPosts||invalidReservations||invalidActiveMembers)throw new Error('MAPPING_FAILURE:V41_INVALID_IDENTITY_DURABLE_REFERENCE');
if(!milton||!/milton de paz/i.test(evidence.durable.miltonName))throw new Error('MAPPING_FAILURE:V41_CANONICAL_MILTON_MISSING');

const browser=await chromium.launch({headless:true});
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
async function signed(member,kind){
  const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
  const token=await auth.createCustomToken(member.id);
  await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token);
  await page.goto('about:blank'); const t0=Date.now();
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,member.id,{timeout:90000}); const authRestoreMs=Date.now()-t0;
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(kind=>{const c=CX.backendAuth.context()||{},r=String(c.role||'').toLowerCase();return c.authenticated===true&&(kind==='shopper'?r==='shopper':r!=='shopper'&&r!=='cliente');},kind,{timeout:120000}); const contextReadyMs=Date.now()-t0;
  await page.waitForFunction(()=>document.getElementById('app')?.classList.contains('on')===true,null,{timeout:120000}); const shellVisibleMs=Date.now()-t0;
  await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX_C6_HR_AUTHORITY_GATE?.ready===true&&window.CX_C6_HR_AUTHORITY_GATE?.blocked!==true,null,{timeout:120000}); const hrReadyMs=Date.now()-t0;
  return {ctx,page,timing:{authRestoreMs,contextReadyMs,shellVisibleMs,hrReadyMs,totalReadyMs:hrReadyMs,shellVisibleBeforeHr:shellVisibleMs<hrReadyMs}};
}
async function waitReload(page,uid,kind){
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,uid,{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(kind=>{const c=CX.backendAuth.context()||{},r=String(c.role||'').toLowerCase();return c.authenticated===true&&(kind==='shopper'?r==='shopper':r!=='shopper'&&r!=='cliente');},kind,{timeout:120000});
  await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX_C6_HR_AUTHORITY_GATE?.ready===true,null,{timeout:120000});
}
try{
  const sp=await signed(shopper,'shopper'),p=sp.page;
  const before=await p.evaluate(({paulaHist})=>{
    const c=CX.backendAuth.context()||{},d=CX.data,profile=d.__sessionShopperProfile||d.getShopper?.(c.shopperId)||{};
    const key=String(profile.id||profile.shopperId||c.shopperId||''),period=String(d.currentPeriodId||'');
    const history=typeof d.shopperHistoryVisits==='function'?d.shopperHistoryVisits(key,false):(d.visitsForShopper?d.visitsForShopper(key,false):[]).filter(v=>v&&v.__pendingPlatformAssignmentOverlay!==true);
    const periodOf=v=>d.recordPeriodId?d.recordPeriodId(v):(v?.periodId||v?.projectId);
    const current=history.filter(v=>String(periodOf(v)||'')===period);
    const anchor=(d.shoppers||[]).find(s=>String(s.id||s.shopperId||'')===paulaHist||(Array.isArray(s.legacyLiveShopperIds)&&s.legacyLiveShopperIds.map(String).includes(paulaHist)))||null;
    return {key,period,historyCount:history.length,currentCount:current.length,sourceRevision:String(d.previewMeta?.sourceRevision||''),name:String(profile.nombre||''),depto:String(profile.depto||''),email:String(profile.email||''),paulaHistoricalAnchor:!!anchor};
  },{paulaHist:PAULA_HIST});
  if(before.historyCount!==7||before.currentCount!==0||!before.paulaHistoricalAnchor)throw new Error('MAPPING_FAILURE:V41_PAULA_HISTORY_SCOPE');
  const update=await p.evaluate(async()=>{
    const c=CX.backendAuth.context()||{},d=CX.data,profile=d.__sessionShopperProfile||d.getShopper?.(c.shopperId)||{},target=String(profile.id||profile.shopperId||c.shopperId||'');
    const patch={depto:String(profile.depto||''),__commandMeta:{ackAware:true,reason:'v41-profile-reload-readback'}};
    const result=await d.updateShopper(target,patch);
    return {target,ok:result?.ok,status:result?.status,providerAck:result?.providerAck,successUiAllowed:result?.successUiAllowed,entityId:result?.entityId};
  });
  if(!(update.ok===true&&update.status==='committed'&&update.providerAck===true&&update.successUiAllowed===true))throw new Error('FUNCTIONAL_DEFECT:V41_PROFILE_SAVE_NOT_COMMITTED');
  evidence.providerWrites=1;
  await waitReload(p,shopper.id,'shopper');
  const after=await p.evaluate(()=>{
    const c=CX.backendAuth.context()||{},d=CX.data,profile=d.__sessionShopperProfile||d.getShopper?.(c.shopperId)||{},key=String(profile.id||profile.shopperId||c.shopperId||''),period=String(d.currentPeriodId||'');
    const history=typeof d.shopperHistoryVisits==='function'?d.shopperHistoryVisits(key,false):(d.visitsForShopper?d.visitsForShopper(key,false):[]).filter(v=>v&&v.__pendingPlatformAssignmentOverlay!==true);
    const periodOf=v=>d.recordPeriodId?d.recordPeriodId(v):(v?.periodId||v?.projectId);
    return {key,period,historyCount:history.length,currentCount:history.filter(v=>String(periodOf(v)||'')===period).length,name:String(profile.nombre||''),depto:String(profile.depto||''),email:String(profile.email||''),sourceRevision:String(d.previewMeta?.sourceRevision||'')};
  });
  if(after.historyCount!==7||after.currentCount!==0||after.depto!==before.depto||after.name!==before.name)throw new Error('PERSISTENCE_FAILURE:V41_PROFILE_RELOAD_READBACK');
  await p.evaluate(()=>CX.router.nav('miperfil',{history:false})); await p.waitForTimeout(450);
  const profileText=await p.evaluate(()=>String(document.body?.innerText||''));
  if(!/Histórico de visitas\s*·\s*7/i.test(profileText))throw new Error('VISUAL_DEFECT:V41_PAULA_HISTORY_NOT_7');
  await p.evaluate(()=>CX.router.nav('mireportes',{history:false})); await p.waitForTimeout(450);
  const reportCard=await p.evaluate(()=>String(document.querySelector('[data-mr="misVisitas"]')?.innerText||''));
  if(/7\s+fila\(s\)/i.test(reportCard))throw new Error('FUNCTIONAL_DEFECT:V41_REPORT_HISTORY_AS_CURRENT');
  await p.evaluate(()=>CX.router.nav('midia',{history:false})); await p.waitForTimeout(350);
  const notif=await p.evaluate(()=>{
    const sid=String(CX.backendAuth.context()?.shopperId||''),approvals=(CX.notif?.for?.('shopper')||[]).filter(n=>n.tipo==='aprobada');
    const invalid=approvals.filter(n=>{const post=(CX.data._posts||[]).find(x=>String(x.shopperId||'')===sid&&String(x.estado||x.status||'').toLowerCase()==='aprobada'&&(!x.sucursal||String(n.txt||'').includes(String(x.sucursal))));if(!post)return true;const v=(CX.data._visitas||[]).find(x=>String(x.id||x.visitId||'')===String(post.visitaId||post.visitId||''));return !(v&&String(v.shopperId||'')===sid&&v.assignmentReviewRequired!==true&&v.assignmentSyncStatus!=='pending_hr');});
    return {approvalCount:approvals.length,invalidApprovalCount:invalid.length,text:String(document.body?.innerText||'')};
  });
  if(notif.invalidApprovalCount!==0)throw new Error('MAPPING_FAILURE:V41_STALE_APPROVAL_NOTIFICATION');
  evidence.shopper={timing:sp.timing,before,update,after,reportCard,notifications:{approvalCount:notif.approvalCount,invalidApprovalCount:notif.invalidApprovalCount}};
  await sp.ctx.close();

  const ap=await signed(admin,'admin'),a=ap.page;
  const parity=await a.evaluate(({invalid,milton,periodKey})=>{
    const d=CX.data,period=String(d.currentPeriodId||''),periodOf=v=>d.recordPeriodId?d.recordPeriodId(v):(v?.periodId||v?.projectId);
    const ui=(d._visitas||[]).filter(v=>String(periodOf(v)||'')===period),raw=(window.CX_TYA_HR_SOURCE_SAFE?.visits||[]).filter(v=>String(v.periodKey||'')===periodKey);
    const by=new Map(ui.map(v=>[String(v.hrRowId||''),v])),fields=['assignmentState','schedulingState','agendada','realizada','shopperId','estado'],mismatches=[];
    for(const src of raw){const row=by.get(String(src.hrRowId||''));if(!row){mismatches.push({hrRowId:src.hrRowId,field:'row',expected:'present',observed:'missing'});continue;}for(const f of fields){const e=src[f]==null?'':String(src[f]).trim(),o=row[f]==null?'':String(row[f]).trim();if(e!==o)mismatches.push({hrRowId:src.hrRowId,field:f,expected:e,observed:o});}}
    const miltonRow=(d.shoppers||[]).find(s=>String(s.id||s.shopperId||'')===milton||/milton de paz/i.test(String(s.nombre||'')));
    const invalidVisible=(d.shoppers||[]).some(s=>String(s.id||s.shopperId||'')===invalid||/mishael de paz/i.test(String(s.nombre||'')));
    return {period,sourceRevision:String(d.previewMeta?.sourceRevision||''),uiCount:ui.length,rawCount:raw.length,mismatches,invalidVisible,miltonPresent:!!miltonRow,miltonName:String(miltonRow?.nombre||'')};
  },{invalid:INVALID,milton:MILTON,periodKey:PERIOD_KEY});
  if(parity.uiCount!==44||parity.rawCount!==44||parity.mismatches.length)throw new Error('MAPPING_FAILURE:V41_ASSIGNMENT_ROW_PARITY:'+JSON.stringify(parity.mismatches.slice(0,12)));
  if(parity.invalidVisible||!parity.miltonPresent)throw new Error('MAPPING_FAILURE:V41_ADMIN_IDENTITY_PARITY');
  const routes=['dashboard','shoppers','postulaciones','visitas','historico','reservas','rutas'];
  const uiChecks=[];
  for(const id of routes){
    const exists=await a.evaluate(id=>!!CX.MODULES?.[id]&&typeof CX.modules?.[id]==='function',id);
    if(!exists)continue;
    await a.evaluate(id=>CX.router.nav(id,{history:false}),id); await a.waitForTimeout(450);
    const text=await a.evaluate(()=>String(document.body?.innerText||''));
    const invalidIdentity=/Mishael De Paz/i.test(text)||text.includes(INVALID);
    const rawIds=id==='postulaciones'&&/shopper_gt_[0-9a-f]+/i.test(text);
    uiChecks.push({id,invalidIdentity,rawIds,milton:/Milton De Paz/i.test(text)});
    if(invalidIdentity)throw new Error('MAPPING_FAILURE:V41_INVALID_IDENTITY_UI_'+id);
    if(rawIds)throw new Error('VISUAL_DEFECT:V41_RAW_SHOPPER_ID_UI_'+id);
  }
  evidence.admin={timing:ap.timing,parity,uiChecks};
  await ap.ctx.close();
  evidence.decision='PASS_I3_V41_SECOND_REVIEW_CUMULATIVE_REPROOF';
  evidence.hrRevision=after.sourceRevision||parity.sourceRevision;
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/second-review-live-reproof.json',JSON.stringify(evidence,null,2)+'\n');
}catch(error){
  evidence.decision='FAIL_I3_V41_SECOND_REVIEW_CUMULATIVE_REPROOF';evidence.error=String(error?.stack||error);
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/second-review-live-reproof.json',JSON.stringify(evidence,null,2)+'\n');
  throw error;
}finally{await browser.close();}
console.log(JSON.stringify(evidence,null,2));
