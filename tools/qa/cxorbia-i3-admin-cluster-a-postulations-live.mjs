#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.TENANT_ID||'tya').trim();
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim();
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'').trim();
const OUT=String(process.env.ADMIN_A_POST_OUT||'.tmp/i3-admin-cluster-a-postulations').trim();
const RUN=String(process.env.GITHUB_RUN_ID||Date.now()).replace(/\D/g,'');
const APP_ID='qa-i3-app-'+RUN,RSV_ID='qa-i3-rsv-'+RUN;
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
fs.mkdirSync(OUT,{recursive:true});
const result={schemaVersion:'cxorbia.i3.admin-cluster-a-postulations.v2',decision:'HOLD',tenantId:TENANT,projectId:PROGRAM,applicationId:APP_ID,reservationId:RSV_ID,create:{},standby:{},reject:{},delete:{},reservations:{},browser:{},cleanup:{},hrWrites:0,externalWrites:0,builds:0,deploys:0,production:false};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
const fail=(classification,code,extra={})=>{Object.assign(result,{decision:'FAIL_I3_ADMIN_CLUSTER_A_POSTULATIONS',classification,code,...extra});save();console.log(JSON.stringify(result,null,2));process.exitCode=2;};
const need=(ok,classification,code,extra={})=>{if(!ok){fail(classification,code,extra);throw new Error(code);}};
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
const docs=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
async function apiKey(){const r=await fetch(ROOT+'/__/firebase/init.json',{headers:{'cache-control':'no-store'}});need(r.ok,'ENVIRONMENT_FAILURE','POST_FIREBASE_INIT_'+r.status);const j=await r.json();need(str(j.apiKey),'ENVIRONMENT_FAILURE','POST_FIREBASE_API_KEY_MISSING');return str(j.apiKey);}
async function idTokenFor(uid){const custom=await auth.createCustomToken(uid);const key=await apiKey();const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});const j=await r.json().catch(()=>null);need(r.ok&&j?.idToken,'AUTH_FAILURE','POST_CUSTOM_TOKEN_EXCHANGE',{status:r.status,code:j?.error?.message||null});return j.idToken;}
async function send(token,command){const r=await fetch(ROOT+'/v1/cxorbia/commands',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(command)});const body=await r.json().catch(()=>null);return {httpStatus:r.status,ok:r.ok,body};}
const base=(type,entityId,periodId,key,expectedVersion,payload)=>({version:'cxorbia-command-adapter-v1',commandType:type,entityType:'application',entityId,tenantId:TENANT,projectId:PROGRAM,periodId,idempotencyKey:key,expectedVersion,authorization:{providerEnforcementRequired:true},payload});
const rbase=(type,entityId,periodId,key,expectedVersion,payload)=>({version:'cxorbia-command-adapter-v1',commandType:type,entityType:'reservation',entityId,tenantId:TENANT,projectId:PROGRAM,periodId,idempotencyKey:key,expectedVersion,authorization:{providerEnforcementRequired:true},payload});
const branchKey=v=>(str(v?.sucursal||v?.branchName||v?.branchId)+'|'+str(v?.ciudad||v?.city)).toLowerCase().replace(/\s+/g,'-');
function localToday(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Guatemala',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day;}
function nextMonthKey(){const [y,m]=localToday().slice(0,7).split('-').map(Number),nm=m===12?1:m+1,ny=m===12?y+1:y;return ny+'-'+String(nm).padStart(2,'0');}
function reservationFutureEligible(v,projectData={}){const mode=str(projectData?.reservationWindowMode||projectData?.reservationPolicy?.windowMode||'future_only').toLowerCase();if(mode==='all_available')return true;const timezone=str(projectData?.timeZone||projectData?.timezone||'America/Guatemala'),p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value])),today=p.year+'-'+p.month+'-'+p.day,month=today.slice(0,7),periodKey=str(v?.periodKey||v?.measurementPeriodId||v?.periodo),availableFrom=str(v?.disponibleDesde||v?.availableFrom);return (/^20\d{2}-[01]\d$/.test(periodKey)&&periodKey>month)||(/^20\d{2}-[01]\d-[0-3]\d$/.test(availableFrom)&&availableFrom>today);}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function browserAdminSignIn(page,uid){
  const attempts=[];
  for(let attempt=1;attempt<=4;attempt++){
    const custom=await auth.createCustomToken(uid);
    try{
      const state=await page.evaluate(async token=>{
        try{
          await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
          const credential=await firebase.auth().signInWithCustomToken(token);
          return {ok:true,uid:String(credential?.user?.uid||'')};
        }catch(error){
          return {ok:false,code:String(error?.code||''),message:String(error?.message||error)};
        }
      },custom);
      if(state?.ok===true)return {ok:true,attempt,attempts};
      attempts.push({attempt,code:str(state?.code),message:str(state?.message).slice(0,240)});
      const retryable=/network-request-failed|timeout|interrupted|unreachable/i.test(str(state?.code)+' '+str(state?.message));
      if(!retryable)throw new Error('POST_BROWSER_ADMIN_AUTH_NONRETRYABLE:'+str(state?.code)+':'+str(state?.message).slice(0,240));
    }catch(error){
      const message=str(error?.message||error);
      const retryable=/Execution context was destroyed|navigation|network-request-failed|timeout|interrupted|unreachable|ERR_NETWORK_CHANGED|ERR_INTERNET_DISCONNECTED/i.test(message);
      attempts.push({attempt,code:'PLAYWRIGHT_OR_AUTH',message:message.slice(0,240)});
      if(!retryable)throw error;
    }
    if(attempt<4){
      await page.waitForLoadState('domcontentloaded',{timeout:30000}).catch(()=>{});
      await sleep(1000*attempt);
      await page.reload({waitUntil:'domcontentloaded',timeout:90000}).catch(()=>{});
    }
  }
  const err=new Error('POST_BROWSER_ADMIN_AUTH_TRANSIENT_EXHAUSTED');
  err.vrm248Attempts=attempts;
  throw err;
}
/* Run1387 environment-only: avoid Playwright ERR_ABORTED post-auth reload races.
   Bounded navigation recovery does not assert functional success. */
async function safeProtectedReload(page,phase){
  for(let attempt=1;attempt<=3;attempt++){
    try{
      await page.reload({waitUntil:'domcontentloaded',timeout:90000});
      return attempt;
    }catch(error){
      const message=str(error?.message||error);
      if(!/ERR_ABORTED|frame was detached|Execution context was destroyed|navigation.*interrupted|ERR_NETWORK_CHANGED/i.test(message)||attempt===3)throw error;
      try{
        await page.waitForLoadState('domcontentloaded',{timeout:25000});
        const ok=await page.evaluate(()=>['interactive','complete'].includes(document.readyState)&&location.href.startsWith(location.origin+'/')).catch(()=>false);
        if(ok)return attempt;
      }catch(_){}
      await sleep(900*attempt);
    }
  }
  throw Error('ENVIRONMENT_FAILURE:'+phase+'_RELOAD_EXHAUSTED');
}
let adminToken='',shopperToken='',selected=null,created=false,browser=null;
try{
  need(/^[a-f0-9]{64}$/.test(EXPECTED_HR),'SOURCE_FAILURE','POST_EXPECTED_HR_REQUIRED');
  const hrRes=await fetch(ROOT+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&adminapost='+RUN,{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
  need(hrRes.ok,'PROVIDER_FAILURE','POST_HR_HTTP_'+hrRes.status);
  const hrBody=await hrRes.json(),hr=hrBody.snapshot||hrBody.data||hrBody,rev=str(hrBody.revision||hrBody._runtime?.revision||hr.sourceRevision);
  need(rev===EXPECTED_HR,'PROVIDER_FAILURE','POST_HR_REVISION_DRIFT',{observed:rev});
  const [members,profiles,visits,posts]=await Promise.all([docs(tenant.collection('users')),docs(tenant.collection('shoppers')),docs(project.collection('visits')),docs(project.collection('postulations'))]);
  const profileById=new Map(profiles.map(x=>[str(x.shopperId||x.id),x]));
  const staff=members.find(m=>m.active===true&&str(m.authNamespace).toLowerCase()==='staff'&&['super','admin'].includes(str(m.role).toLowerCase())&&(str(m.role).toLowerCase()==='super'||arr(m.projectIds).map(String).includes(PROGRAM)));
  need(staff,'AUTH_FAILURE','POST_ADMIN_MISSING');
  const candidates=members.filter(m=>m.active===true&&str(m.role).toLowerCase()==='shopper'&&str(m.authNamespace).toLowerCase()==='shopper'&&arr(m.projectIds).map(String).includes(PROGRAM)&&profileById.has(str(m.shopperId))&&str(profileById.get(str(m.shopperId))?.identityState)!=='superseded_exact_alias');
  const available=visits.filter(v=>['disponible','available'].includes(str(v.estado||v.status).toLowerCase())&&!str(v.shopperId)&&str(v.periodId));
  outer: for(const v of available){for(const m of candidates){const sid=str(m.shopperId);if(!posts.some(p=>str(p.visitId||p.visitaId)===str(v.visitId||v.id)&&str(p.shopperId)===sid)){selected={visit:v,member:m,shopperId:sid};break outer;}}}
  need(selected,'SOURCE_FAILURE','POST_NO_SAFE_AVAILABLE_PAIR',{available:available.length,candidates:candidates.length});
  const visitId=str(selected.visit.visitId||selected.visit.id),periodId=str(selected.visit.periodId),shopperId=selected.shopperId,proposedDate=localToday();
  adminToken=await idTokenFor(staff.id);shopperToken=await idTokenFor(selected.member.id);
  const create=base('application.create',APP_ID,periodId,'qa-post-create-'+RUN,'absent',{visitId,hrRowId:selected.visit.hrRowId||null,shopperId,proposedDate,note:'QA I3 Cluster A '+RUN});
  const c1=await send(shopperToken,create);need(c1.ok&&c1.body?.providerAck===true&&c1.body?.status==='committed','PERSISTENCE_FAILURE','POST_CREATE_ACK',{c1});created=true;
  const c2=await send(shopperToken,create);need(c2.ok&&c2.body?.providerAck===true&&c2.body?.idempotentReplay===true&&Number(c2.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE','POST_CREATE_REPLAY',{c2});
  let snap=await project.collection('postulations').doc(APP_ID).get();need(snap.exists,'PERSISTENCE_FAILURE','POST_CREATE_READBACK');let row=snap.data()||{};
  need(str(row.status||row.estado)==='pendiente'&&Number(row.version)===1,'PERSISTENCE_FAILURE','POST_CREATE_STATE',{row});
  result.create={providerAck:true,idempotentReplay:true,durableReadback:true,version:1};

  const standby=base('application.status.update',APP_ID,periodId,'qa-post-standby-'+RUN,1,{status:'standby',reason:'QA bounded lifecycle'});
  const s1=await send(adminToken,standby);need(s1.ok&&s1.body?.providerAck===true,'PERSISTENCE_FAILURE','POST_STANDBY_ACK',{s1});
  const s2=await send(adminToken,standby);need(s2.ok&&s2.body?.providerAck===true&&s2.body?.idempotentReplay===true&&Number(s2.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE','POST_STANDBY_REPLAY',{s2});
  snap=await project.collection('postulations').doc(APP_ID).get();row=snap.data()||{};need(snap.exists&&str(row.status||row.estado)==='standby'&&Number(row.version)===2,'PERSISTENCE_FAILURE','POST_STANDBY_READBACK',{row});
  result.standby={providerAck:true,idempotentReplay:true,durableReadback:true,version:2};

  const reject=base('application.status.update',APP_ID,periodId,'qa-post-reject-'+RUN,2,{status:'rechazada',reason:'QA bounded lifecycle'});
  const r1=await send(adminToken,reject);need(r1.ok&&r1.body?.providerAck===true,'PERSISTENCE_FAILURE','POST_REJECT_ACK',{r1});
  const r2=await send(adminToken,reject);need(r2.ok&&r2.body?.providerAck===true&&r2.body?.idempotentReplay===true&&Number(r2.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE','POST_REJECT_REPLAY',{r2});
  snap=await project.collection('postulations').doc(APP_ID).get();row=snap.data()||{};need(snap.exists&&str(row.status||row.estado)==='rechazada'&&Number(row.version)===3,'PERSISTENCE_FAILURE','POST_REJECT_READBACK',{row});
  result.reject={providerAck:true,idempotentReplay:true,durableReadback:true,version:3};

  browser=await chromium.launch({headless:true});const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();const pageErrors=[];page.on('pageerror',e=>pageErrors.push(str(e?.message||e)));
  await page.goto(ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+encodeURIComponent(PROGRAM)+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV',{waitUntil:'domcontentloaded',timeout:90000});
  const authObserver=await browserAdminSignIn(page,staff.id);
  result.browser.authObserver={pass:true,attempt:authObserver.attempt,retries:Math.max(0,authObserver.attempt-1)};
  result.browser.postAuthReloadAttempt=await safeProtectedReload(page,'post_auth');
  await page.waitForFunction(({TENANT,PROGRAM})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===TENANT&&['super','admin'].includes(String(c.role||''))&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(PROGRAM)))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{TENANT,PROGRAM},{timeout:120000});
  await page.evaluate(()=>window.CX?.router?.nav?.('postulaciones'));
  await page.waitForTimeout(1000);
  const beforeVisible=await page.evaluate(id=>Array.isArray(window.CX?.data?._posts)&&window.CX.data._posts.some(p=>String(p?.id||p?.applicationId||p?.postulationId||'')===id),APP_ID);
  need(beforeVisible,'FUNCTIONAL_DEFECT','POST_ADMIN_READ_MODEL_BEFORE_DELETE');
  result.browser.beforeDeleteVisible=true;

  const del=base('application.delete',APP_ID,periodId,'qa-post-delete-'+RUN,3,{reason:'QA bounded lifecycle cleanup'});
  const d1=await send(adminToken,del);need(d1.ok&&d1.body?.providerAck===true,'PERSISTENCE_FAILURE','POST_DELETE_ACK',{d1});created=false;
  const d2=await send(adminToken,del);need(d2.ok&&d2.body?.providerAck===true&&d2.body?.idempotentReplay===true&&Number(d2.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE','POST_DELETE_REPLAY',{d2});
  snap=await project.collection('postulations').doc(APP_ID).get();need(!snap.exists,'PERSISTENCE_FAILURE','POST_DELETE_READBACK');
  result.browser.postDeleteReloadAttempt=await safeProtectedReload(page,'post_delete');
  await page.waitForFunction(({TENANT})=>window.CX?.backendAuth?.context?.()?.authenticated===true&&window.CX?.backendAuth?.context?.()?.tenantId===TENANT&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,{TENANT},{timeout:120000});
  await page.evaluate(()=>window.CX?.router?.nav?.('postulaciones'));await page.waitForTimeout(1000);
  const afterVisible=await page.evaluate(id=>Array.isArray(window.CX?.data?._posts)&&window.CX.data._posts.some(p=>String(p?.id||p?.applicationId||p?.postulationId||'')===id),APP_ID);
  need(afterVisible===false,'FUNCTIONAL_DEFECT','POST_REAPPEARED_AFTER_DELETE');
  need(pageErrors.length===0,'FUNCTIONAL_DEFECT','POST_BROWSER_PAGE_ERRORS',{pageErrors});
  result.browser.afterDeleteVisible=false;result.browser.reloadNoReappearance=true;result.browser.pageErrors=0;
  result.delete={providerAck:true,idempotentReplay:true,durableReadback:true,noReappearance:true};
  const pairAfter=(await docs(project.collection('postulations'))).filter(p=>str(p.visitId||p.visitaId)===visitId&&str(p.shopperId)===shopperId&&str(p.id||p.applicationId||p.postulationId)===APP_ID);
  need(pairAfter.length===0,'PERSISTENCE_FAILURE','POST_QA_RESIDUE',{count:pairAfter.length});
  result.cleanup={providerDelete:true,fallbackDirectDelete:false,qaResidue:0};

  const secondMember=candidates.find(m=>str(m.shopperId)!==shopperId);
  need(secondMember,'SOURCE_FAILURE','RSV_SECOND_SHOPPER_REQUIRED',{candidates:candidates.length});
  const projectSnap=await project.get(),projectData=projectSnap.exists?(projectSnap.data()||{}):{},reservationRows=await docs(project.collection('reservations'));
  const liveHrVisits=arr(hr?.visits);
  const liveByHrRow=new Map(liveHrVisits.filter(v=>str(v.hrRowId)).map(v=>[str(v.hrRowId),v]));
  const liveByVisitId=new Map(liveHrVisits.filter(v=>str(v.visitId||v.id)).map(v=>[str(v.visitId||v.id),v]));
  const reservationAuthorityVisit=v=>liveByHrRow.get(str(v?.hrRowId))||liveByVisitId.get(str(v?.visitId||v?.id))||null;
  const eligibleForShopper=v=>!reservationRows.some(r=>str(r.visitId||r.visitaId)===str(v.visitId||v.id)&&str(r.shopperId)===shopperId);
  const liveFutureEligible=available.filter(v=>{const authority=reservationAuthorityVisit(v);return !!authority&&reservationFutureEligible(authority,projectData)&&eligibleForShopper(v);}).length;
  const futureVisit=available.find(v=>{const authority=reservationAuthorityVisit(v);return str(v.hrRowId)&&!!authority&&reservationFutureEligible(authority,projectData)&&eligibleForShopper(v);});
  let syntheticVisitCreated=false;
  let rVisit=futureVisit;
  let fixtureSafetyMode='future_hr_eligible';
  if(!rVisit){
    const periodKey=nextMonthKey(),periodId=PROGRAM+'-'+periodKey,id='QA_I3_FUTURE_VISIT_'+RUN,hrRowId='QA_I3_FUTURE_HR_'+RUN;
    rVisit={id,visitId:id,hrRowId,tenantId:TENANT,projectId:PROGRAM,periodId,periodKey,sucursal:'QA I3 Future '+RUN,ciudad:'Guatemala',pais:'GT',estado:'disponible',status:'disponible',shopperId:null,canonicalFacets:{available:true,assigned:false,cancelled:false},sourceRevision:'qa-dev-fixture-'+RUN,version:1,qaFixture:true};
    await project.collection('visits').doc(id).create({...rVisit,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
    syntheticVisitCreated=true;fixtureSafetyMode='synthetic_future_dev_visit';
  }
  need(reservationFutureEligible(rVisit,projectData),'SOURCE_FAILURE','RSV_FIXTURE_NOT_FUTURE_ELIGIBLE',{fixtureSafetyMode,liveFutureEligible});
  result.reservations={fixtureSafetyMode,liveFutureEligible,visitMutationAllowed:false,crossAllowed:false,syntheticVisitCreated};
  const rVisitId=str(rVisit.visitId||rVisit.id),rHrRowId=str(rVisit.hrRowId),rPeriodId=str(rVisit.periodId),rPeriodo=str(rVisit.periodKey||rVisit.periodo||rPeriodId.replace(new RegExp('^'+PROGRAM+'-'),'')),rBranch=branchKey(rVisit),shopperB=str(secondMember.shopperId);
  need(rBranch,'SOURCE_FAILURE','RSV_BRANCH_KEY_REQUIRED');
  const rVisitRef=project.collection('visits').doc(rVisit.id),rVisitBeforeSnap=await rVisitRef.get(),rVisitBefore=rVisitBeforeSnap.data()||{};
  const rCreate=rbase('reservation.create',RSV_ID,rPeriodId,'qa-rsv-create-'+RUN,'absent',{visitId:rVisitId,hrRowId:rHrRowId,branchId:rBranch,sucursalId:rBranch,shopperId,shopper:str(profileById.get(shopperId)?.nombre||'QA Shopper A'),sourceRevision:EXPECTED_HR,status:'solicitada',periodo:rPeriodo});
  const rc1=await send(shopperToken,rCreate);need(rc1.ok&&rc1.body?.providerAck===true&&rc1.body?.status==='committed','PERSISTENCE_FAILURE','RSV_CREATE_ACK',{rc1});
  const rc2=await send(shopperToken,rCreate);need(rc2.ok&&rc2.body?.providerAck===true&&rc2.body?.idempotentReplay===true&&Number(rc2.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE','RSV_CREATE_REPLAY',{rc2});
  let rsnap=await project.collection('reservations').doc(RSV_ID).get(),rrow=rsnap.data()||{};need(rsnap.exists&&str(rrow.status||rrow.estado)==='solicitada'&&Number(rrow.version)===1,'PERSISTENCE_FAILURE','RSV_CREATE_READBACK',{rrow});
  const rApprove=rbase('reservation.status.update',RSV_ID,rPeriodId,'qa-rsv-approve-'+RUN,1,{status:'aprobada',shopperId,shopper:str(profileById.get(shopperId)?.nombre||'QA Shopper A')});
  const ra1=await send(adminToken,rApprove);need(ra1.ok&&ra1.body?.providerAck===true,'PERSISTENCE_FAILURE','RSV_APPROVE_ACK',{ra1});const ra2=await send(adminToken,rApprove);need(ra2.ok&&ra2.body?.idempotentReplay===true&&Number(ra2.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE','RSV_APPROVE_REPLAY',{ra2});
  rsnap=await project.collection('reservations').doc(RSV_ID).get();rrow=rsnap.data()||{};need(rsnap.exists&&str(rrow.status||rrow.estado)==='aprobada'&&Number(rrow.version)===2,'PERSISTENCE_FAILURE','RSV_APPROVE_READBACK',{rrow});
  const rReassign=rbase('reservation.status.update',RSV_ID,rPeriodId,'qa-rsv-reassign-'+RUN,2,{status:'asignada',shopperId:shopperB,shopper:str(profileById.get(shopperB)?.nombre||'QA Shopper B')});
  const rr1=await send(adminToken,rReassign);need(rr1.ok&&rr1.body?.providerAck===true,'PERSISTENCE_FAILURE','RSV_REASSIGN_ACK',{rr1});const rr2=await send(adminToken,rReassign);need(rr2.ok&&rr2.body?.idempotentReplay===true&&Number(rr2.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE','RSV_REASSIGN_REPLAY',{rr2});
  rsnap=await project.collection('reservations').doc(RSV_ID).get();rrow=rsnap.data()||{};need(rsnap.exists&&str(rrow.status||rrow.estado)==='asignada'&&Number(rrow.version)===3&&str(rrow.shopperId)===shopperB,'PERSISTENCE_FAILURE','RSV_REASSIGN_READBACK',{rrow});
  const reservationLayer=async()=>page.evaluate(({id,periodId})=>{const has=a=>Array.isArray(a)&&a.some(r=>String(r?.id||r?.reservationId||'')===id),auth=window.CX_BACKEND_AUTHORIZED_STATE||{},prot=window.CX?.data?.__protectedReservations||[],list=typeof window.CX?.reservas?.list==='function'?window.CX.reservas.list(periodId):prot;return {requestedPeriodId:String(periodId||''),authorized:has(auth.reservations),authorizedCount:Array.isArray(auth.reservations)?auth.reservations.length:-1,authorizedRows:(Array.isArray(auth.reservations)?auth.reservations:[]).map(r=>({id:String(r?.id||r?.reservationId||''),periodId:String(r?.periodId||''),projectId:String(r?.projectId||'')})),protected:has(prot),protectedCount:Array.isArray(prot)?prot.length:-1,protectedRows:(Array.isArray(prot)?prot:[]).map(r=>({id:String(r?.id||r?.reservationId||''),periodId:String(r?.periodId||''),projectId:String(r?.projectId||''),periodo:String(r?.periodo||'')})),list:has(list),listCount:Array.isArray(list)?list.length:-1,currentProjectId:String(window.CX?.data?.currentProjectId||''),currentPeriodId:String(window.CX?.data?.currentPeriodId||''),authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,authorityProtectedReservations:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.protectedReservations??-1)};},{id:RSV_ID,periodId:rPeriodId});
  let finalLayer=null;
  if(!syntheticVisitCreated){
    await page.evaluate(()=>window.CX?.backend?.refresh?.()).catch(()=>{});
    const immediate=await reservationLayer();
    await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,{timeout:30000}).catch(()=>{});
    const reconciled=await reservationLayer();
    let explicit=null;
    if(!reconciled.list&&typeof await page.evaluate(()=>typeof window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY)==='string'){
      await page.evaluate(()=>window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('qa_reservation_layer_diagnostic')).catch(()=>{});
      explicit=await reservationLayer();
    }
    result.reservations.layerDiagnostic={immediate,reconciled,explicit};
    await page.evaluate(()=>window.CX?.router?.nav?.('reservas'));await page.waitForTimeout(350);
    finalLayer=explicit||reconciled;
    if(!finalLayer.protected)need(false,'MAPPING_FAILURE','RSV_PROTECTED_STATE_MISSING',{layerDiagnostic:result.reservations.layerDiagnostic});
    need(finalLayer.list,'MAPPING_FAILURE','RSV_MODULE_FILTER_MISS',{layerDiagnostic:result.reservations.layerDiagnostic});
  }else{
    result.reservations.layerDiagnostic={classification:'NOT_APPLICABLE_WITH_REASON',reason:'Synthetic future DEV fixture is intentionally outside active live-HR browser period; UI eligibility is proven separately by zero ineligible options.'};
  }
  const rDelete=rbase('reservation.delete',RSV_ID,rPeriodId,'qa-rsv-delete-'+RUN,3,{reason:'QA bounded lifecycle cleanup'});const rd1=await send(adminToken,rDelete);need(rd1.ok&&rd1.body?.providerAck===true,'PERSISTENCE_FAILURE','RSV_DELETE_ACK',{rd1});const rd2=await send(adminToken,rDelete);need(rd2.ok&&rd2.body?.idempotentReplay===true&&Number(rd2.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE','RSV_DELETE_REPLAY',{rd2});
  rsnap=await project.collection('reservations').doc(RSV_ID).get();need(!rsnap.exists,'PERSISTENCE_FAILURE','RSV_DELETE_READBACK');
  result.browser.reservationReloadAttempt=await safeProtectedReload(page,'reservation');await page.waitForFunction(({TENANT})=>window.CX?.backendAuth?.context?.()?.authenticated===true&&window.CX?.backendAuth?.context?.()?.tenantId===TENANT&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,{TENANT},{timeout:120000});await page.evaluate(()=>window.CX?.router?.nav?.('reservas'));await page.waitForTimeout(750);
  const rAfter=await page.evaluate(({id,periodId})=>{const rows=typeof window.CX?.reservas?.list==='function'?window.CX.reservas.list(periodId):(Array.isArray(window.CX?.data?.__protectedReservations)?window.CX.data.__protectedReservations:[]);return rows.some(r=>String(r?.id||r?.reservationId||'')===id);},{id:RSV_ID,periodId:rPeriodId});need(rAfter===false,'FUNCTIONAL_DEFECT','RSV_REAPPEARED_AFTER_DELETE');
  const rVisitAfterSnap=await rVisitRef.get(),rVisitAfter=rVisitAfterSnap.data()||{},visitUnchanged=str(rVisitAfter.shopperId)===str(rVisitBefore.shopperId)&&str(rVisitAfter.estado||rVisitAfter.status)===str(rVisitBefore.estado||rVisitBefore.status)&&Number(rVisitAfter.version||0)===Number(rVisitBefore.version||0);need(visitUnchanged,'PERSISTENCE_FAILURE','RSV_VISIT_MUTATED_WITHOUT_CROSS');
  const rResidue=(await docs(project.collection('reservations'))).filter(r=>str(r.id||r.reservationId)===RSV_ID).length;need(rResidue===0,'PERSISTENCE_FAILURE','RSV_QA_RESIDUE',{rResidue});
  if(syntheticVisitCreated){await rVisitRef.delete();const chk=await rVisitRef.get();need(!chk.exists,'PERSISTENCE_FAILURE','RSV_SYNTHETIC_VISIT_CLEANUP');}
  result.reservations={decision:'PASS_I3_ADMIN_CLUSTER_A_RESERVATIONS_LIFECYCLE',fixtureSafetyMode,liveFutureEligible,syntheticVisitCreated,create:{providerAck:true,idempotentReplay:true,durableReadback:true,version:1},approve:{providerAck:true,idempotentReplay:true,durableReadback:true,version:2},reassign:{providerAck:true,idempotentReplay:true,durableReadback:true,version:3,fromShopperId:shopperId,toShopperId:shopperB,visitWrite:false},delete:{providerAck:true,idempotentReplay:true,durableReadback:true,noReappearance:true},browser:syntheticVisitCreated?{classification:'NOT_APPLICABLE_WITH_REASON',reason:'synthetic future fixture outside active UI period'}:{beforeDeleteVisible:true,afterDeleteVisible:false,reloadNoReappearance:true},visitInvariant:{unchanged:true,noCrossWrite:true},cleanup:{providerDelete:true,fallbackDirectDelete:false,qaResidue:0,syntheticVisitDeleted:syntheticVisitCreated}};
  result.decision='PASS_I3_ADMIN_CLUSTER_A_POSTULATIONS_LIFECYCLE';
  save();console.log(JSON.stringify(result,null,2));
  await ctx.close();
}catch(error){
  if(!result.classification){
    const message=str(error?.message||error);
    if(/POST_BROWSER_ADMIN_AUTH_TRANSIENT_EXHAUSTED|network-request-failed|Execution context was destroyed|navigation|timeout|interrupted|unreachable|ERR_NETWORK_CHANGED|ERR_INTERNET_DISCONNECTED/i.test(message)){
      fail('ENVIRONMENT_FAILURE','POST_BROWSER_AUTH_OBSERVER_TRANSIENT',{error:message.slice(0,500),attempts:error?.vrm248Attempts||null,productChanged:false});
    }else{
      fail('FUNCTIONAL_DEFECT','POST_UNCLASSIFIED',{error:message});
    }
  }
}finally{
  try{if(browser)await browser.close();}catch(_){}
  try{
    const ref=project.collection('postulations').doc(APP_ID),snap=await ref.get();
    if(snap.exists){
      await ref.delete();
      result.cleanup={...(result.cleanup||{}),fallbackDirectDelete:true,exactQaId:APP_ID};
      save();
    }
    const rref=project.collection('reservations').doc(RSV_ID),rsnap=await rref.get();
    if(rsnap.exists){
      await rref.delete();
      result.reservations={...(result.reservations||{}),cleanup:{...((result.reservations||{}).cleanup||{}),fallbackDirectDelete:true,exactQaId:RSV_ID}};
      save();
    }
    const syntheticVisit=project.collection('visits').doc('QA_I3_FUTURE_VISIT_'+RUN),sv=await syntheticVisit.get();
    if(sv.exists){await syntheticVisit.delete();result.reservations={...(result.reservations||{}),cleanup:{...((result.reservations||{}).cleanup||{}),syntheticVisitFallbackDeleted:true}};save();}
  }catch(e){result.cleanup={...(result.cleanup||{}),cleanupError:str(e?.message||e)};save();}
  adminToken='';shopperToken='';
}
if(result.decision!=='PASS_I3_ADMIN_CLUSTER_A_POSTULATIONS_LIFECYCLE')process.exit(2);
