#!/usr/bin/env node
/* B7 exact missing UI edge. Existing DEV shopper/visit, disposable in-app
 * notice + its read receipt only. No real visit or HR mutation. */
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const E=process.env, str=x=>String(x??'').trim(), arr=x=>Array.isArray(x)?x:[];
const runId=str(E.GITHUB_RUN_ID), source=str(E.FOCAL_SOURCE), expectedHr=str(E.EXPECTED_HR_REVISION);
const host=str(E.HOSTING_URL||'').replace(/\/$/,''), out=str(E.B7_OUT||'.tmp/i3-b7-shopper-notice');
const tenantId='tya',projectId='cinepolis',periodId='cinepolis-2026-11';
const noticeId='qa-i3-b7-shopper-notice-'+runId;
if(!/^\d{6,}$/.test(runId)||!(/^[a-f0-9]{40}$/.test(source))||!(/^[a-f0-9]{64}$/.test(expectedHr))||
 host!=='https://cxorbia-backend-dev.web.app'||str(E.PROJECT)!=='cxorbia-backend-dev'||
 E.CXORBIA_I3_B7_NOTICE_QA_WRITE_GATE!=='PAULA_AUTHORIZED_IN_APP_SYNTHETIC_DEV_ONLY')
 throw Error('SOURCE_FAILURE:NOTICE_E2E_DEV_GATE_REQUIRED');
fs.mkdirSync(out,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
const bulletin=tenant.collection('bulletins').doc(noticeId),reads=tenant.collection('bulletinReads');
const result={schemaVersion:'cxorbia.i3.b7.shopper-notice-unread-reload-route.dev.v1',decision:'HOLD',
 runId,sourceSha:source,projectId,periodId,noticeId,hrBefore:null,hrAfter:null,
 stages:{shopperAuth:false,noticeCreated:false,unreadVisible:false,unreadAfterReload:false,
   otherShopperExcluded:false,clickRoute:false,readAck:false,readAfterReload:false,cleaned:false},
 safety:{noticesCreated:0,noticesDeleted:0,readReceiptsCreated:0,readReceiptsDeleted:0,
   hrWrites:0,visitWrites:0,authWrites:0,financialWrites:0,deploys:0,production:false},errors:[]};
let browser=null,readRef=null,created=false;
const need=(ok,kind,msg)=>{if(!ok)throw Error(kind+':'+msg);};
const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');
async function revision(){
 const r=await fetch(host+'/api/tya/cinepolis/hr-live?format=meta&qa-b7='+runId+'-'+Date.now(),
  {headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(90000)});
 const j=await r.json();need(r.ok&&j.ok===true&&j.sourceSafe===true&&j.revisionStable===true&&j.hrWrites===false&&j.production===false,
  'PROVIDER_FAILURE','HR_META_UNSAFE');return str(j.revision);
}
const appUrl=host+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV';
async function signIn(member){
 const user=await auth.getUser(member.uid);need(!user.disabled,'AUTH_FAILURE','PRINCIPAL_DISABLED');
 const token=await auth.createCustomToken(member.uid,user.customClaims||{});
 const ctx=await browser.newContext({viewport:{width:1440,height:940}}),page=await ctx.newPage();
 let success=false;
 for(let n=0;n<3&&!success;n++){
  await page.goto(appUrl+'&b7-notice-boot='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:90000});
  await page.evaluate(async t=>{const fb=window.firebase;await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},token).catch(()=>{});
  success=await page.evaluate(uid=>window.firebase?.auth?.().currentUser?.uid===uid,member.uid).catch(()=>false);
 }
 need(success,'AUTH_FAILURE','SHOPPER_SIGN_IN_FAILED');
 await page.goto('about:blank');
 await page.goto(appUrl+'&b7-notice-auth='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(({uid,sid,revision})=>{
  const a=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{};
  return window.firebase?.auth?.().currentUser?.uid===uid&&a.authenticated===true&&a.role==='shopper'&&
   String(a.shopperId||'')===sid&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&
   String(d.currentProjectId||'')==='cinepolis'&&String(d.currentPeriodId||'')==='cinepolis-2026-11'&&
   String(d.previewMeta?.sourceRevision||'')===revision;
 },{uid:member.uid,sid:member.shopperId,revision:expectedHr},{timeout:120000});
 return {ctx,page};
}
async function feed(page){
 await page.evaluate(async()=>{await window.CX.backendBulletins.load();});
 return page.evaluate(async id=>{
  const cx=window.CX||{},raw=(cx.notif?._items||[]).find(x=>String(x.id)===id),
   n=(cx.notif?.for?.('shopper')||[]).find(x=>String(x.id)===id),
   sid=String(cx.backendAuth?.context?.()?.shopperId||'');
  let remoteGet='not_checked',remoteQuery='not_checked';
  try{const d=await firebase.firestore().collection('tenants').doc('tya').collection('bulletins').doc(id).get({source:'server'});
   remoteGet=d.exists?'present':'absent';}catch(e){remoteGet=String(e?.code||'error').slice(0,60);}
  try{const q=await firebase.firestore().collection('tenants').doc('tya').collection('bulletins').where('targetShopperIds','array-contains',sid).get();
   remoteQuery=q.docs.some(d=>d.id===id)?'included':'not_in_query';}catch(e){remoteQuery=String(e?.code||'error').slice(0,60);}
  return {present:!!n,unread:!!n&&!n.leida,read:!!n&&n.leida,route:n?.nav||'',
   visitId:String(n?.entityId||''),source:n?.source||'',role:String(cx.backendAuth?.context?.()?.role||''),
   authorityLoaded:window.CX_BACKEND_BULLETINS_STATUS?.source==='firestore',
   rawPresent:!!raw,rawRole:raw?.to||'',rawOperational:raw?.operational===true,
   validForRole:raw?cx.notif._validForRole(raw,'shopper'):null,
   activeForRole:raw?cx.notif._activeForRole(raw):null,
   exactVisitPresent:(cx.data?._visitas||[]).some(v=>[v?.id,v?.visitId,v?.hrRowId].map(String).includes(String(raw?.entityId||''))),
   feedCount:Number(window.CX_BACKEND_BULLETINS_STATUS?.count??-1),remoteGet,remoteQuery};
 },noticeId);
}
async function route(page,section){
 await page.evaluate(name=>window.CX.router.nav(name,{history:false}),section);
 await page.waitForFunction(name=>window.CX?.session?.view===name,section,{timeout:45000});
}
async function eligible(){
 const [vs,us]=await Promise.all([tenant.collection('projects').doc(projectId).collection('visits').get(),tenant.collection('users').get()]);
 const members=us.docs.map(d=>({uid:d.id,...d.data()})).filter(m=>m.active===true&&m.role==='shopper'&&
  m.authNamespace==='shopper'&&arr(m.projectIds).map(str).includes(projectId)&&str(m.shopperId));
 const visits=vs.docs.map(d=>({id:d.id,...d.data()})).filter(v=>
  str(v.periodId)===periodId&&str(v.shopperId)&&v.qaSynthetic!==true&&
  !['cancelada','cancelado','disponible'].includes(str(v.estado||v.status).toLowerCase()));
 for(const visit of visits){
  const matching=members.filter(m=>str(m.shopperId)===str(visit.shopperId));
  if(matching.length!==1)continue;
  try{const u=await auth.getUser(matching[0].uid);if(u.disabled)continue;}catch{continue;}
  let other=null;
  for(const m of members.filter(x=>str(x.shopperId)!==str(visit.shopperId))){
   try{const u=await auth.getUser(m.uid);if(!u.disabled){other=m;break;}}catch{continue;}
  }
  if(other)return {shopper:matching[0],other,visitId:str(visit.id||visit.visitId)};
 }
 throw Error('SOURCE_FAILURE:NO_EXISTING_NOV_VISIT_WITH_UNIQUE_ACTIVE_SHOPPER_PRINCIPAL');
}

try{
 result.hrBefore=await revision();need(result.hrBefore===expectedHr,'PROVIDER_FAILURE','HR_REVISION_DRIFT_BEFORE');
 need(!(await bulletin.get()).exists,'SOURCE_FAILURE','NOTICE_ID_COLLISION');
 const chosen=await eligible();readRef=reads.doc(chosen.shopper.uid+'_'+noticeId);
 need(!(await readRef.get()).exists,'SOURCE_FAILURE','READ_ID_COLLISION');
 const targetVisitId=chosen.visitId;
 await bulletin.create({id:noticeId,tenantId,projectId,periodId,status:'active',toRole:'shopper',
  targetRoles:['shopper'],targetProjectIds:[projectId],targetShopperIds:[str(chosen.shopper.shopperId)],
  entityType:'visit',entityId:targetVisitId,operational:true,eventKey:'qa_b7_notice_read_route',
  idempotencyKey:'qa-b7-notice-'+runId,type:'ajuste',title:'Aviso de prueba de lectura',
  body:'Consulta los detalles de tu visita en Mis Visitas.',priority:'normal',actionRoute:'misvisitas',
  createdAt:new Date().toISOString(),qaSynthetic:true,qaRunId:runId});
 created=true;result.safety.noticesCreated++;result.stages.noticeCreated=true;
 browser=await chromium.launch({headless:true});
 const s=await signIn(chosen.shopper),page=s.page;
 result.stages.shopperAuth=true;
 const initial=await feed(page);
 result.stages.unreadVisible=initial.present&&initial.unread&&initial.source==='firestore'&&
  initial.visitId===targetVisitId&&initial.route==='misvisitas'&&initial.authorityLoaded;
 need(result.stages.unreadVisible,'FUNCTIONAL_DEFECT','SHOPPER_UNREAD_NOT_VISIBLE:'+JSON.stringify(initial));
 await route(page,'tablon');
 need(await page.locator('[data-n="'+noticeId+'"]').count()===1,'VISUAL_DEFECT','NOTICE_NOT_IN_SHOPPER_TABLON');
 await page.screenshot({path:out+'/before-unread.png'});
 await page.reload({waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>window.CX_C6_HR_AUTHORITY_GATE?.ready===true,{timeout:120000});
 const reloaded=await feed(page);
 result.stages.unreadAfterReload=reloaded.present&&reloaded.unread&&reloaded.visitId===targetVisitId;
 need(result.stages.unreadAfterReload,'PERSISTENCE_FAILURE','UNREAD_LOST_ON_RELOAD:'+JSON.stringify(reloaded));
 const other=await signIn(chosen.other);
 const otherFeed=await feed(other.page);
 result.stages.otherShopperExcluded=!otherFeed.present;
 need(result.stages.otherShopperExcluded,'SECURITY_FAILURE','NOTICE_LEAKED_TO_OTHER_SHOPPER');
 await other.ctx.close();
 await route(page,'tablon');
 await page.locator('[data-go="'+noticeId+'"]').click();
 await page.waitForFunction(()=>window.CX?.session?.view==='misvisitas',{timeout:45000});
 result.stages.clickRoute=await page.evaluate(visitId=>{
  const v=(window.CX?.data?._visitas||[]).some(x=>[x?.id,x?.visitId,x?.hrRowId].map(String).includes(visitId));
  return window.CX?.session?.view==='misvisitas'&&v;
 },targetVisitId);
 await page.screenshot({path:out+'/after-click-misvisitas.png'});
 need(result.stages.clickRoute,'FUNCTIONAL_DEFECT','EXACT_VISIT_ROUTE_FAILED');
 for(let n=0;n<15;n++){if((await readRef.get()).exists)break;await new Promise(r=>setTimeout(r,400));}
 const rr=await readRef.get(),d=rr.data()||{};
 result.stages.readAck=rr.exists&&str(d.userId)===chosen.shopper.uid&&str(d.bulletinId)===noticeId;
 if(rr.exists)result.safety.readReceiptsCreated++;
 need(result.stages.readAck,'PERSISTENCE_FAILURE','READ_RECEIPT_SERVER_ACK_MISSING');
 await page.reload({waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>window.CX_C6_HR_AUTHORITY_GATE?.ready===true,{timeout:120000});
 const after=await feed(page);
 result.stages.readAfterReload=after.present&&after.read;
 need(result.stages.readAfterReload,'PERSISTENCE_FAILURE','READ_STATE_NOT_DURABLE:'+JSON.stringify(after));
 await route(page,'tablon');await page.screenshot({path:out+'/after-reload-read.png'});
 await s.ctx.close();
 result.hrAfter=await revision();need(result.hrAfter===expectedHr,'PROVIDER_FAILURE','HR_REVISION_DRIFT_AFTER');
}catch(e){result.errors.push(str(e?.message||e).slice(0,600));}
finally{
 if(browser)await browser.close().catch(()=>{});
 if(readRef){try{const r=await readRef.get();if(r.exists){await readRef.delete();result.safety.readReceiptsDeleted++;}}
  catch(e){result.errors.push('CLEANUP_READ_FAILURE:'+str(e?.message||e).slice(0,200));}}
 if(created){try{await bulletin.delete();result.safety.noticesDeleted++;}
  catch(e){result.errors.push('CLEANUP_NOTICE_FAILURE:'+str(e?.message||e).slice(0,200));}}
 const [b,r]=await Promise.all([bulletin.get(),readRef?readRef.get():Promise.resolve({exists:false})]);
 result.stages.cleaned=!b.exists&&!r.exists&&result.safety.noticesCreated===result.safety.noticesDeleted&&
  result.safety.readReceiptsCreated===result.safety.readReceiptsDeleted;
 if(!result.stages.cleaned)result.errors.push('CLEANUP_INVARIANT_FAILURE');
 result.decision=result.errors.length===0&&Object.values(result.stages).every(Boolean)&&
  result.hrBefore===expectedHr&&result.hrAfter===expectedHr?
  'PASS_I3_B7_SHOPPER_NOTICE_UNREAD_RELOAD_ROUTE_DEV':'HOLD_I3_B7_SHOPPER_NOTICE_UNREAD_RELOAD_ROUTE_DEV';
 save();console.log(JSON.stringify({decision:result.decision,stages:result.stages,hrStable:result.hrBefore===result.hrAfter,
  safety:result.safety,errors:result.errors}));
 if(result.decision!=='PASS_I3_B7_SHOPPER_NOTICE_UNREAD_RELOAD_ROUTE_DEV')process.exitCode=2;
}
